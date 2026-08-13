"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ColumnBoard } from "@/components/column/column-board";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";
import { buildColumnPlan } from "@/lib/column/plan";
import {
  COLUMN_ADVICE_PRIORITY,
  COLUMN_STEP_KINDS,
  COLUMN_STEP_LABEL,
  buildColumnSteps,
  columnAdviceFor,
  columnStepPrompt,
  diagnoseColumnStep,
  type ColumnStepKind,
} from "@/lib/column/steps";
import {
  COLUMN_PROBLEM_COUNT,
  generateColumnProblems,
  type ColumnProblem,
} from "@/lib/column/generate";
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
 * たし算・ひき算のひっ算。
 *
 * わり算のひっ算と同じ考え方で、1手ずつ進めて「どの手で止まったか」を分けて数える。
 * 入力・誤答時の流れ・言い回しは他の単元とそろえてある。
 */

const STORAGE_KEY = "wakaru-dekita:column-add-sub:v1";

/** 打てる桁数。位ごとの答えは1けた、借りたあとの数も1けた。 */
const MAX_DIGITS = 2;

type Phase = "answering" | "wrong" | "retry" | "problemDone";

const EMPTY: AnswerInput = { kind: "number", digits: "" };

export function ColumnGame() {
  const [problems, setProblems] = useState<ColumnProblem[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>(EMPTY);
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [errors, setErrors] = useState<Tally>(emptyTally(COLUMN_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(COLUMN_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  // 出題は乱数を使うため、描画後に行う（サーバー側の出力と食い違わせない）
  useEffect(() => {
    setProblems(generateColumnProblems());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const plan = useMemo(
    () => (problem ? buildColumnPlan(problem.a, problem.b, problem.op) : null),
    [problem]
  );
  const steps = useMemo(() => (plan ? buildColumnSteps(plan) : []), [plan]);
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(STORAGE_KEY, COLUMN_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      COLUMN_STEP_KINDS
    );
    saveRecord(STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  if (finished) {
    return <Result errors={errors} perfect={perfectCount} record={record} onRestart={restart} />;
  }

  if (problems === null || plan === null || problem === null) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">もんだいを準備しています…</CardContent>
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
    // 1手ごとに間を置かない。書き足された数字が盤面に現れること自体を手ごたえにする
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
    const correct = value === step.answer;

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
      setHint(diagnoseColumnStep(plan!, step, value));
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
    setProblems(generateColumnProblems());
    setProblemIndex(0);
    setStepIndex(0);
    setInput(EMPTY);
    setPhase("answering");
    setHint(null);
    setErrors(emptyTally(COLUMN_STEP_KINDS));
    setAttempts(emptyTally(COLUMN_STEP_KINDS));
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
              {problem.a} {problem.op} {problem.b}
            </span>
          </div>

          <StepGuide current={step?.kind ?? null} op={problem.op} />

          <div key={shake} className={cn("my-6", shake > 0 && phase === "retry" && "wd-shake")}>
            <ColumnBoard
              plan={plan}
              steps={steps}
              stepIndex={stepIndex}
              input={phase === "wrong" ? wrongValue : digits}
              wrong={phase === "wrong"}
              onColumnTap={(index) => {
                if (phase === "wrong" || phase === "problemDone") return;
                resolve(index);
              }}
            />
          </div>

          {phase === "problemDone" ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">できた！</p>
              <p className="mb-6 text-2xl font-bold tabular-nums">
                {plan.a} {plan.op} {plan.b} = {plan.answer}
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
                {step ? columnStepPrompt(plan, step) : ""}
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
                  上の わくを タップしてね
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
function StepGuide({ current, op }: { current: ColumnStepKind | null; op: "+" | "−" }) {
  const cycle: ColumnStepKind[] = op === "+" ? ["write", "carry"] : ["borrow", "write"];

  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {cycle.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {COLUMN_STEP_LABEL[kind]}
          </span>
          {i < cycle.length - 1 && <span className="text-muted-foreground/50">→</span>}
        </li>
      ))}
    </ol>
  );
}

const UNIT_TITLE: Record<string, string> = { "add-sub": "たし算・ひき算" };

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
  const stumbles = COLUMN_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history = record !== null && record.sets >= 2
    ? weakness(record, COLUMN_STEP_KINDS, COLUMN_ADVICE_PRIORITY)
    : null;

  const worst = history
    ? (history.kind as ColumnStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? columnAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">たし算・ひき算のひっ算・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {COLUMN_PROBLEM_COUNT} もん</span>
        </p>
        <p className="mb-6 text-sm text-muted-foreground">1回で さいごまで できた もんだい</p>

        {stumbles.length > 0 ? (
          <div className="mb-6 rounded-xl bg-muted/60 px-4 py-3 text-left">
            <p className="mb-2 text-center text-xs font-bold text-muted-foreground">まよった ところ</p>
            <ul className="space-y-1 text-sm">
              {stumbles.map((kind) => (
                <li key={kind} className="flex justify-between">
                  <span>{COLUMN_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{COLUMN_STEP_LABEL[history.kind as ColumnStepKind]}</span>{" "}
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

        <Button size="lg" onClick={onRestart}>
          もういちど挑戦する
        </Button>

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          きろくはこの端末のブラウザにだけ保存されます。
          <br />
          ほかの端末には引きつがれません。
        </p>
      </CardContent>
    </Card>
  );
}
