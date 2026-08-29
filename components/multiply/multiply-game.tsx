"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FinishActions } from "@/components/learn/finish-actions";
import { Card, CardContent } from "@/components/ui/card";
import { MultiplyBoard } from "@/components/multiply/multiply-board";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  MULTIPLY_PROBLEM_COUNT,
  MULTIPLY_STORAGE_KEY,
  generateMultiplyProblems,
  type MultiplyProblem,
} from "@/lib/multiply/generate";
import { buildMultiplyPlan } from "@/lib/multiply/plan";
import {
  MULTIPLY_ADVICE_PRIORITY,
  MULTIPLY_STEP_KINDS,
  MULTIPLY_STEP_LABEL,
  buildMultiplySteps,
  diagnoseMultiplyStep,
  multiplyAdviceFor,
  multiplyStepPrompt,
  multiplyWholeValue,
  type MultiplyStepKind,
} from "@/lib/multiply/steps";
import {
  addSet,
  emptyTally,
  loadRecord,
  saveRecord,
  weakness,
  type PracticeRecord,
  type Tally,
} from "@/lib/practice/record";
import { appendDigit, backspace, type AnswerInput } from "@/lib/quiz/answer-input";

/**
 * かけ算のひっ算。
 *
 * 他の手続き単元と同じく1手ずつ進め、「どの手で止まったか」を分けて数える。
 * 入力・誤答時の流れ・言い回しはそろえてある。
 */

/** 打てる桁数。答えは1けただが、九九の答えを丸ごと書いてしまう誤りを拾うため2けた許す。 */
const MAX_DIGITS = 2;

type Phase = "answering" | "wrong" | "retry" | "problemDone";

const EMPTY: AnswerInput = { kind: "number", digits: "" };

export function MultiplyGame() {
  const [problems, setProblems] = useState<MultiplyProblem[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>(EMPTY);
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [errors, setErrors] = useState<Tally>(emptyTally(MULTIPLY_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(MULTIPLY_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  // 出題は乱数を使うため、描画後に行う（サーバー側の出力と食い違わせない）
  useEffect(() => {
    setProblems(generateMultiplyProblems());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const plan = useMemo(
    () => (problem ? buildMultiplyPlan(problem.a, problem.b) : null),
    [problem]
  );
  const steps = useMemo(() => (plan ? buildMultiplySteps(plan) : []), [plan]);
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(MULTIPLY_STORAGE_KEY, MULTIPLY_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      MULTIPLY_STEP_KINDS
    );
    saveRecord(MULTIPLY_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  if (finished) {
    return <Result errors={errors} perfect={perfectCount} record={record} onRestart={restart} />;
  }

  if (problems === null || plan === null || problem === null) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">
          もんだいを準備しています…
        </CardContent>
      </Card>
    );
  }

  const step = steps[stepIndex];
  const digits = input.kind === "number" ? input.digits : "";

  function advanceStep() {
    setInput(EMPTY);
    setHint(null);
    if (step !== undefined) {
      setAttempts((prev) => ({ ...prev, [step.kind]: prev[step.kind] + 1 }));
    }
    if (stepIndex + 1 >= steps.length) {
      setPhase("problemDone");
      if (mistakesInProblem === 0) setPerfectCount((n) => n + 1);
    } else {
      setPhase("answering");
    }
    setStepIndex((i) => i + 1);
  }

  function resolve(value: number) {
    if (step === undefined) return;
    // 42 のように 九九の答えをまとめて打った値も正解にする（→ steps.ts multiplyWholeValue）
    const correct = value === step.answer || value === multiplyWholeValue(plan!, step);

    if (phase === "retry") {
      if (correct) advanceStep();
      else {
        setShake((n) => n + 1);
        setInput(EMPTY);
      }
      return;
    }

    if (correct) {
      advanceStep();
    } else {
      setHint(diagnoseMultiplyStep(plan!, step, value));
      setPhase("wrong");
      setErrors((prev) => ({ ...prev, [step.kind]: prev[step.kind] + 1 }));
      setMistakesInProblem((n) => n + 1);
    }
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    setStepIndex(0);
    setInput(EMPTY);
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateMultiplyProblems());
    setProblemIndex(0);
    setStepIndex(0);
    setInput(EMPTY);
    setPhase("answering");
    setHint(null);
    setErrors(emptyTally(MULTIPLY_STEP_KINDS));
    setAttempts(emptyTally(MULTIPLY_STEP_KINDS));
    setMistakesInProblem(0);
    setPerfectCount(0);
    setSaved(false);
  }

  const wrongValue = phase === "wrong" ? digits : "";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {problemIndex + 1} / {problems.length} もん目
            </span>
            <span className="tabular-nums">
              {problem.a} × {problem.b}
            </span>
          </div>

          <StepGuide current={step?.kind ?? null} twoRows={plan.partials.length > 1} />

          <div key={shake} className={cn("my-6", shake > 0 && phase === "retry" && "wd-shake")}>
            <MultiplyBoard
              plan={plan}
              steps={steps}
              stepIndex={stepIndex}
              input={phase === "wrong" ? wrongValue : digits}
              wrong={phase === "wrong"}
              onColumnTap={(column) => {
                if (phase === "wrong" || phase === "problemDone") return;
                resolve(column);
              }}
            />
          </div>

          {phase === "problemDone" ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">できた！</p>
              <p className="mb-6 text-2xl font-bold tabular-nums">
                {problem.a} × {problem.b} = {plan.total}
              </p>
              <Button size="lg" onClick={nextProblem}>
                {problemIndex + 1 >= problems.length ? "けっかを見る" : "つぎの もんだいへ"}
              </Button>
            </div>
          ) : phase === "wrong" ? (
            <div className="text-center">
              <p className="mb-1 text-lg font-bold text-danger">ざんねん…</p>
              {hint && <p className="mb-3 text-sm font-medium text-foreground">{hint}</p>}
              <Button
                size="lg"
                onClick={() => {
                  setInput(EMPTY);
                  setPhase("retry");
                }}
              >
                もういちど やってみる
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-sm font-medium">
                {step ? multiplyStepPrompt(plan, step) : ""}
              </p>
              {step?.input === "number" ? (
                <NumberPad
                  onDigit={(digit) => setInput((c) => appendDigit(c, digit, MAX_DIGITS))}
                  onBackspace={() => setInput((c) => backspace(c))}
                  onPrimary={() => digits !== "" && resolve(Number(digits))}
                  primaryLabel="けってい"
                  primaryEnabled={digits !== ""}
                />
              ) : (
                <p className="rounded-xl bg-muted/60 py-4 text-center text-sm text-muted-foreground">
                  ますを タップしてね
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** いまどの手かを常に画面に出す。手順を思い出すことに気を取られると計算が崩れるため。 */
function StepGuide({ current, twoRows }: { current: MultiplyStepKind | null; twoRows: boolean }) {
  const cycle: MultiplyStepKind[] = twoRows
    ? ["product", "carry", "shift", "add"]
    : ["product", "carry"];

  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {cycle.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {MULTIPLY_STEP_LABEL[kind]}
          </span>
          {i < cycle.length - 1 && <span className="text-muted-foreground/50">→</span>}
        </li>
      ))}
    </ol>
  );
}

const UNIT_TITLE: Record<string, string> = {
  "times-table": "九九",
  "column-add-sub": "たし算・ひき算のひっ算",
};

function Result({
  errors,
  perfect,
  record,
  onRestart,
}: {
  errors: Tally;
  perfect: number;
  record: PracticeRecord | null;
  onRestart: () => void;
}) {
  const stumbles = MULTIPLY_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, MULTIPLY_STEP_KINDS, MULTIPLY_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as MultiplyStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? multiplyAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">かけ算のひっ算・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {MULTIPLY_PROBLEM_COUNT} もん</span>
        </p>
        <p className="mb-6 text-sm text-muted-foreground">1回で さいごまで できた もんだい</p>

        {stumbles.length > 0 ? (
          <div className="mb-6 rounded-xl bg-muted/60 px-4 py-3 text-left">
            <p className="mb-2 text-center text-xs font-bold text-muted-foreground">
              まよった ところ
            </p>
            <ul className="space-y-1 text-sm">
              {stumbles.map((kind) => (
                <li key={kind} className="flex justify-between">
                  <span>{MULTIPLY_STEP_LABEL[kind]}</span>
                  <span className="font-bold tabular-nums">{errors[kind]} 回</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">ひとつも まよわずに できました</p>
        )}

        {history && (
          <div className="mb-6 rounded-xl border border-primary/30 px-4 py-3">
            <p className="mb-1 text-xs font-bold text-muted-foreground">
              これまで {record?.sets} 回 やってみて
            </p>
            <p className="text-sm">
              <span className="font-bold">
                {MULTIPLY_STEP_LABEL[history.kind as MultiplyStepKind]}
              </span>{" "}
              で とまることが いちばん 多いよ
              {history.ofSets >= 2 && history.sets >= 2 && (
                <>
                  <br />
                  <span className="text-muted-foreground">
                    さいきんの {history.ofSets} 回のうち {history.sets} 回
                  </span>
                </>
              )}
            </p>
          </div>
        )}

        {tip && (
          <p className="mb-6 text-sm">
            {tip.text}
            {tip.unit && (
              <>
                <br />
                <Link href={`/learn/${tip.unit}`} className="font-bold text-primary underline">
                  {UNIT_TITLE[tip.unit]}のれんしゅうへ
                </Link>
              </>
            )}
          </p>
        )}

        <FinishActions onRestart={onRestart} />

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          きろくはこの端末のブラウザにだけ保存されます。
          <br />
          ほかの端末には引きつがれません。
        </p>
      </CardContent>
    </Card>
  );
}
