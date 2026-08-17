"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NumberPad } from "@/components/quiz/number-pad";
import { NumberPlaces } from "@/components/round/number-places";
import { cn } from "@/lib/utils";

import {
  ROUND_PROBLEM_COUNT,
  ROUND_STORAGE_KEY,
  generateRoundPlans,
} from "@/lib/round/generate";
import { digitCount, targetText, type RoundPlan } from "@/lib/round/plan";
import {
  ROUND_ADVICE_PRIORITY,
  ROUND_STEP_KINDS,
  ROUND_STEP_LABEL,
  ROUND_STEP_SHORT,
  diagnoseLook,
  diagnoseUpDown,
  diagnoseWrite,
  roundAdviceFor,
  roundStepPrompt,
  type RoundStepKind,
} from "@/lib/round/steps";
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
 * がい数（四捨五入）。
 *
 * **見る位を自分でタップさせる手を、いちばん最初に置いている。**
 * 「百の位までのがい数」で百の位を四捨五入してしまう誤りは、
 * 答えだけを見ていると計算ミスと区別がつかない。
 * 位を指す手を独立させれば、そこで止まったことが記録に残る。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

export function RoundGame() {
  const [problems, setProblems] = useState<RoundPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(ROUND_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(ROUND_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateRoundPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const step: RoundStepKind | undefined = ROUND_STEP_KINDS[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(ROUND_STORAGE_KEY, ROUND_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      ROUND_STEP_KINDS
    );
    saveRecord(ROUND_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  function resetProblemState() {
    setStepIndex(0);
    setPicked(null);
    setInput({ kind: "number", digits: "" });
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateRoundPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(ROUND_STEP_KINDS));
    setAttempts(emptyTally(ROUND_STEP_KINDS));
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
    setAttempts((prev) => ({ ...prev, [step]: prev[step] + 1 }));
    if (stepIndex + 1 >= ROUND_STEP_KINDS.length) {
      setPhase("problemDone");
      if (mistakesInProblem === 0) setPerfectCount((n) => n + 1);
    } else {
      setPhase("answering");
    }
    setStepIndex((i) => i + 1);
  }

  function fail(message: string) {
    if (step === undefined) return;
    setHint(message);
    setPhase("wrong");
    setErrors((prev) => ({ ...prev, [step]: prev[step] + 1 }));
    setMistakesInProblem((n) => n + 1);
  }

  function pickPlace(exp: number) {
    if (problem === null || step !== "look") return;
    setPicked(exp);
    const message = diagnoseLook(problem, exp);
    if (message === null) advance();
    else if (phase !== "retry") fail(message);
  }

  function pickUpDown(up: boolean) {
    if (problem === null) return;
    const message = diagnoseUpDown(problem, up);
    if (message === null) advance();
    else if (phase !== "retry") fail(message);
  }

  function commitWrite() {
    if (problem === null || digits === "") return;
    const message = diagnoseWrite(problem, Number(digits));
    if (message === null) advance();
    else if (phase !== "retry") {
      fail(message);
      setInput({ kind: "number", digits: "" });
    }
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    resetProblemState();
  }

  const digits = input.kind === "number" ? input.digits : "";
  const done = phase === "problemDone";
  const active = phase === "answering" || phase === "retry";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="mb-4 text-sm text-muted-foreground">
            {problemIndex + 1} / {problems.length} もん目
          </div>

          <StepGuide current={done ? null : (step ?? null)} />

          <div className="my-4 rounded-xl bg-muted px-4 py-3 text-center">
            <p className="text-base font-bold">{problem.question}</p>
          </div>

          <NumberPlaces
            plan={problem}
            interactive={active && step === "look"}
            onPick={pickPlace}
            picked={phase === "wrong" || phase === "retry" ? picked : null}
            reveal={done || stepIndex > 0}
            showKeep={stepIndex > 0}
          />

          {stepIndex > 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              オレンジが 答えに のこる位、みどりが 四捨五入で 見る位
            </p>
          )}

          <div className="mt-5">
            {done ? (
              <div className="text-center">
                <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
                <p className="mb-1 text-2xl font-bold tabular-nums">{problem.answer}</p>
                <p className="mb-6 text-xs text-muted-foreground">
                  {problem.value} → {targetText(problem)}
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
                  {step ? roundStepPrompt(problem, step) : ""}
                </p>
                {phase === "retry" && hint && (
                  <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                    {hint}
                  </p>
                )}

                {step === "updown" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="lg" onClick={() => pickUpDown(false)}>
                      切り捨て
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => pickUpDown(true)}>
                      切り上げ
                    </Button>
                  </div>
                )}

                {step === "write" && (
                  <div>
                    <p className="mb-3 text-center text-3xl font-bold tabular-nums">
                      {digits === "" ? "␣" : digits}
                    </p>
                    <NumberPad
                      onDigit={(digit) =>
                        setInput((c) => appendDigit(c, digit, digitCount(problem.value) + 1))
                      }
                      onBackspace={() => setInput((c) => backspace(c))}
                      onPrimary={commitWrite}
                      primaryLabel="けってい"
                      primaryEnabled={digits !== ""}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepGuide({ current }: { current: RoundStepKind | null }) {
  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {ROUND_STEP_KINDS.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {ROUND_STEP_SHORT[kind]}
          </span>
          {i < ROUND_STEP_KINDS.length - 1 && <span className="text-muted-foreground/50">→</span>}
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
  const stumbles = ROUND_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, ROUND_STEP_KINDS, ROUND_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as RoundStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? roundAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">がい数・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {ROUND_PROBLEM_COUNT} もん</span>
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
                  <span>{ROUND_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{ROUND_STEP_LABEL[history.kind as RoundStepKind]}</span> で
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
