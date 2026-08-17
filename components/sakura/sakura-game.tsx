"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cherry, TenFrame } from "@/components/sakura/cherry";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  SAKURA_PROBLEM_COUNT,
  SAKURA_STORAGE_KEY,
  generateSakuraPlans,
} from "@/lib/sakura/generate";
import { expression, type SakuraPlan } from "@/lib/sakura/plan";
import {
  SAKURA_ADVICE_PRIORITY,
  SAKURA_STEP_KINDS,
  SAKURA_STEP_LABEL,
  SAKURA_STEP_SHORT,
  answerOf,
  diagnose,
  sakuraAdviceFor,
  sakuraPrompt,
  stepsFor,
  type SakuraStepKind,
} from "@/lib/sakura/steps";
import { appendDigit, backspace, type AnswerInput } from "@/lib/quiz/answer-input";
import {
  addSet,
  emptyTally,
  loadRecord,
  saveRecord,
  weakness,
  type PracticeRecord,
  type Tally,
} from "@/lib/practice/record";

/**
 * くり上がり・くり下がり（さくらんぼ計算）。
 *
 * **算数が苦手になる子の、いちばん下の段。**
 * 答えを先に聞かず、10のまとまりを作る手を1つずつ埋めさせる。
 * どちらの数を分けるのかが見えるように、式の中で分ける数を囲んでいる。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

export function SakuraGame() {
  const [problems, setProblems] = useState<SakuraPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(SAKURA_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(SAKURA_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateSakuraPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const steps = problem ? stepsFor(problem) : [];
  const step: SakuraStepKind | undefined = steps[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(SAKURA_STORAGE_KEY, SAKURA_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      SAKURA_STEP_KINDS
    );
    saveRecord(SAKURA_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  function resetProblemState() {
    setStepIndex(0);
    setInput({ kind: "number", digits: "" });
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateSakuraPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(SAKURA_STEP_KINDS));
    setAttempts(emptyTally(SAKURA_STEP_KINDS));
    setPerfectCount(0);
    setSaved(false);
  }

  if (finished) {
    return <Result errors={errors} perfect={perfectCount} record={record} onRestart={restart} />;
  }

  if (problems === null || problem === null) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">
          もんだいを じゅんびしています…
        </CardContent>
      </Card>
    );
  }

  function advance() {
    if (step === undefined) return;
    setHint(null);
    setInput({ kind: "number", digits: "" });
    setAttempts((prev) => ({ ...prev, [step]: prev[step] + 1 }));
    if (stepIndex + 1 >= steps.length) {
      setPhase("problemDone");
      if (mistakesInProblem === 0) setPerfectCount((n) => n + 1);
    } else {
      setPhase("answering");
    }
    setStepIndex((i) => i + 1);
  }

  function commit() {
    if (problem === null || step === undefined || digits === "") return;
    const message = diagnose(problem, step, Number(digits));
    if (message === null) advance();
    else if (phase !== "retry") {
      setHint(message);
      setPhase("wrong");
      setErrors((prev) => ({ ...prev, [step]: prev[step] + 1 }));
      setMistakesInProblem((n) => n + 1);
      setInput({ kind: "number", digits: "" });
    }
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    resetProblemState();
  }

  const digits = input.kind === "number" ? input.digits : "";
  const done = phase === "problemDone";

  // 埋まったふさ。まだ答えていないところは「?」のまま
  const isAdd = problem.kind === "add";
  const leftFilled = stepIndex >= 1 || done ? problem.left : null;
  const rightFilled = stepIndex >= 2 || done ? problem.right : null;
  const active: "left" | "right" | null =
    step === "need" || step === "ones" ? "left" : step === "rest" ? "right" : null;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {problemIndex + 1} / {problems.length} もん目
            </span>
            <span>{problem.stage}</span>
          </div>

          <StepGuide steps={steps} current={done ? null : (step ?? null)} />

          <div className="my-5">
            <Cherry
              plan={problem}
              left={isAdd ? leftFilled : 10}
              right={isAdd ? rightFilled : leftFilled === null ? null : problem.right}
              active={active}
            />
          </div>

          {/* 10のまとまり。10を作る手のあいだだけ出す */}
          {(step === "need" || step === "fromTen") && (
            <div className="mb-4 flex justify-center">
              {step === "need" ? (
                <TenFrame filled={problem.a} label={`${problem.a}こ ある。あと いくつで 10？`} />
              ) : (
                <TenFrame filled={10} removed={problem.b} label={`10こ から ${problem.b}こ とると？`} />
              )}
            </div>
          )}

          {done ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
              <p className="mb-6 text-3xl font-bold tabular-nums">
                {expression(problem)} = {problem.answer}
              </p>
              <Button size="lg" onClick={nextProblem}>
                {problemIndex + 1 >= problems.length ? "けっかを見る" : "つぎの もんだいへ"}
              </Button>
            </div>
          ) : phase === "wrong" ? (
            <div className="text-center">
              <p className="mb-1 text-lg font-bold text-danger">ざんねん…</p>
              {hint && <p className="mb-3 text-sm font-medium text-foreground">{hint}</p>}
              <Button size="lg" onClick={() => setPhase("retry")}>
                もういちど やってみる
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-center text-base font-medium">
                {step ? sakuraPrompt(problem, step) : ""}
              </p>
              {phase === "retry" && hint && (
                <p className="mb-3 text-center text-sm font-medium text-muted-foreground">{hint}</p>
              )}
              <p className="mb-3 text-center text-3xl font-bold tabular-nums">
                {digits === "" ? "␣" : digits}
              </p>
              <NumberPad
                onDigit={(digit) => setInput((c) => appendDigit(c, digit, 2))}
                onBackspace={() => setInput((c) => backspace(c))}
                onPrimary={commit}
                primaryLabel="けってい"
                primaryEnabled={digits !== ""}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StepGuide({
  steps,
  current,
}: {
  steps: SakuraStepKind[];
  current: SakuraStepKind | null;
}) {
  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {steps.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {SAKURA_STEP_SHORT[kind]}
          </span>
          {i < steps.length - 1 && <span className="text-muted-foreground/50">→</span>}
        </li>
      ))}
    </ol>
  );
}

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
  const stumbles = SAKURA_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, SAKURA_STEP_KINDS, SAKURA_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as SakuraStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? sakuraAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          くり上がり・くり下がり・けっか
        </p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {SAKURA_PROBLEM_COUNT} もん</span>
        </p>
        <p className="mb-6 text-sm text-muted-foreground">1回で さいごまで できた もんだい</p>

        {stumbles.length > 0 ? (
          <div className="mb-6 rounded-xl bg-muted/60 px-4 py-3 text-left">
            <p className="mb-2 text-center text-xs font-bold text-muted-foreground">
              とまった ところ
            </p>
            <ul className="space-y-1 text-sm">
              {stumbles.map((kind) => (
                <li key={kind} className="flex justify-between gap-3">
                  <span>{SAKURA_STEP_LABEL[kind]}</span>
                  <span className="font-bold tabular-nums">{errors[kind]} 回</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">ひとつも とまらずに できました</p>
        )}

        {history && (
          <div className="mb-6 rounded-xl border border-primary/30 px-4 py-3">
            <p className="mb-1 text-xs font-bold text-muted-foreground">
              これまで {record?.sets} 回 やってみて
            </p>
            <p className="text-sm">
              <span className="font-bold">{SAKURA_STEP_LABEL[history.kind as SakuraStepKind]}</span>{" "}
              で とまることが いちばん 多いよ
            </p>
          </div>
        )}

        {tip && <p className="mb-6 text-sm">{tip.text}</p>}

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
