"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FractionBars } from "@/components/mixed/fraction-bars";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  MIXED_PROBLEM_COUNT,
  MIXED_STORAGE_KEY,
  generateMixedPlans,
} from "@/lib/mixed/generate";
import { improperText, mixedText, type MixedPlan } from "@/lib/mixed/plan";
import {
  MIXED_ADVICE_PRIORITY,
  MIXED_STEP_KINDS,
  MIXED_STEP_LABEL,
  MIXED_STEP_SHORT,
  answerText,
  diagnose,
  mixedAdviceFor,
  mixedStepPrompt,
  stepsFor,
  type MixedStepKind,
} from "@/lib/mixed/steps";
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
 * 仮分数と帯分数。
 *
 * 手順を覚えるのは難しくない。難しいのは**その手順が何をしているのかが
 * 見えないこと**なので、帯の絵をいつも横に置いておく。
 * 絵は向きが変わっても同じにしてある。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

export function MixedGame() {
  const [problems, setProblems] = useState<MixedPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(MIXED_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(MIXED_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateMixedPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const steps = problem ? stepsFor(problem.kind) : [];
  const step: MixedStepKind | undefined = steps[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(MIXED_STORAGE_KEY, MIXED_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      MIXED_STEP_KINDS
    );
    saveRecord(MIXED_STORAGE_KEY, next);
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
    setProblems(generateMixedPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(MIXED_STEP_KINDS));
    setAttempts(emptyTally(MIXED_STEP_KINDS));
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
          もんだいを準備しています…
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

          <div className="my-4 rounded-xl bg-muted px-4 py-3 text-center">
            <p className="text-lg font-bold">{problem.question}</p>
          </div>

          <FractionBars
            plan={problem}
            highlightWholes={step === "whole" || step === "wholeParts"}
            highlightRest={step === "rest"}
          />

          <div className="mt-5">
            {done ? (
              <div className="text-center">
                <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
                <p className="mb-1 text-2xl font-bold">{answerText(problem)}</p>
                <p className="mb-6 text-xs text-muted-foreground">
                  {improperText(problem)} と {mixedText(problem)} は 同じ 大きさ
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
                <p className="mb-3 text-center text-sm font-medium">
                  {step ? mixedStepPrompt(problem, step) : ""}
                </p>
                {phase === "retry" && hint && (
                  <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                    {hint}
                  </p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepGuide({
  steps,
  current,
}: {
  steps: MixedStepKind[];
  current: MixedStepKind | null;
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
            {MIXED_STEP_SHORT[kind]}
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
  const stumbles = MIXED_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, MIXED_STEP_KINDS, MIXED_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as MixedStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? mixedAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">仮分数・帯分数・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {MIXED_PROBLEM_COUNT} もん</span>
        </p>
        <p className="mb-6 text-sm text-muted-foreground">1回で さいごまで できた もんだい</p>

        {stumbles.length > 0 ? (
          <div className="mb-6 rounded-xl bg-muted/60 px-4 py-3 text-left">
            <p className="mb-2 text-center text-xs font-bold text-muted-foreground">
              とまった ところ
            </p>
            <ul className="space-y-1 text-sm">
              {stumbles.map((kind) => (
                <li key={kind} className="flex justify-between">
                  <span>{MIXED_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{MIXED_STEP_LABEL[history.kind as MixedStepKind]}</span> で
              とまることが いちばん 多いよ
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
