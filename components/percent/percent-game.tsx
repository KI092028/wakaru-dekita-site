"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NumberPad } from "@/components/quiz/number-pad";
import { PercentLine } from "@/components/percent/percent-line";
import { cn } from "@/lib/utils";

import {
  PERCENT_PROBLEM_COUNT,
  PERCENT_STORAGE_KEY,
  generatePercentPlans,
} from "@/lib/percent/generate";
import {
  isBasePlaced,
  isMarkerOnTarget,
  show,
  type PercentPlan,
  type Which,
} from "@/lib/percent/plan";
import {
  PERCENT_ADVICE_PRIORITY,
  PERCENT_STEP_KINDS,
  PERCENT_STEP_LABEL,
  PERCENT_STEP_SHORT,
  diagnoseBase,
  diagnoseMark,
  diagnosePlace,
  diagnoseRead,
  percentAdviceFor,
  percentStepPrompt,
  readingHint,
  type PercentStepKind,
} from "@/lib/percent/steps";
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
 * 割合・百分率。
 *
 * 4つの手を1つずつ進める。**もとにする量をえらぶ手に、はじめて誤りがある。**
 * 単位量あたりではどちらを選んでも正しかったが、割合ではもとは1つに決まる。
 *
 * 数を打たせるのは最後の1手だけ。式は一度も書かせない。
 * 公式（くらべる量÷もとにする量）を覚えても解けないことが
 * この単元のつまずきそのものだから。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

const MAX_DIGITS = 4;

export function PercentGame() {
  const [problems, setProblems] = useState<PercentPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [placedAt, setPlacedAt] = useState<number | null>(null);
  const [marker, setMarker] = useState<number | null>(null);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(PERCENT_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(PERCENT_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  // 出題は乱数を使うので描画後に行う（静的書き出しと食い違わせない）
  useEffect(() => {
    setProblems(generatePercentPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const step: PercentStepKind | undefined = PERCENT_STEP_KINDS[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(PERCENT_STORAGE_KEY, PERCENT_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      PERCENT_STEP_KINDS
    );
    saveRecord(PERCENT_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  function resetProblemState() {
    setStepIndex(0);
    setPlacedAt(null);
    setMarker(null);
    setInput({ kind: "number", digits: "" });
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generatePercentPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(PERCENT_STEP_KINDS));
    setAttempts(emptyTally(PERCENT_STEP_KINDS));
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
    if (stepIndex + 1 >= PERCENT_STEP_KINDS.length) {
      setPhase("problemDone");
      if (mistakesInProblem === 0) setPerfectCount((n) => n + 1);
    } else {
      setPhase("answering");
    }
    setStepIndex((i) => i + 1);
  }

  function fail(message: string | null) {
    if (step === undefined) return;
    setHint(message);
    setPhase("wrong");
    setErrors((prev) => ({ ...prev, [step]: prev[step] + 1 }));
    setMistakesInProblem((n) => n + 1);
  }

  function chooseBase(picked: Which) {
    if (problem === null) return;
    const message = diagnoseBase(problem, picked);
    if (message === null) advance();
    else if (phase !== "retry") fail(message);
  }

  function commitPlace() {
    if (problem === null || placedAt === null) return;
    if (isBasePlaced(problem, placedAt)) advance();
    else if (phase !== "retry") fail(diagnosePlace(problem, placedAt));
  }

  function commitMark() {
    if (problem === null || marker === null) return;
    if (isMarkerOnTarget(problem, marker)) advance();
    else if (phase !== "retry") fail(diagnoseMark(problem, marker));
  }

  function commitRead() {
    if (problem === null || digits === "") return;
    const typed = Number(digits);
    const message = diagnoseRead(problem, typed);
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
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {problemIndex + 1} / {problems.length} もん目
            </span>
          </div>

          <StepGuide current={done ? null : (step ?? null)} />

          <div className="my-4 rounded-xl bg-muted px-4 py-3">
            <p className="text-sm">{problem.story}</p>
            <p className="mt-1 text-base font-bold">{problem.question}</p>
          </div>

          {/* もとにする量をえらぶ前は、線を出さない。
              線を先に見せると、どちらが「もと」かを考えずに置いてしまう */}
          {stepIndex > 0 && (
            <div className="my-4">
              <PercentLine
                plan={problem}
                placedAt={placedAt}
                marker={marker}
                active={
                  active && step === "place" ? "place" : active && step === "mark" ? "mark" : null
                }
                onPlace={setPlacedAt}
                onMark={setMarker}
                reveal={done}
              />
              {(step === "read" || done) && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {readingHint(problem)}
                </p>
              )}
            </div>
          )}

          {done ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
              <p className="mb-6 text-2xl font-bold">
                {show(problem.answer)}
                {problem.answerUnit}
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
              <p className="mb-4 text-center text-sm font-medium">
                {step ? percentStepPrompt(problem, step) : ""}
              </p>
              {phase === "retry" && hint && (
                <p className="mb-3 text-center text-sm font-medium text-muted-foreground">{hint}</p>
              )}

              {step === "base" && (
                <div className="grid grid-cols-2 gap-3">
                  {(["other", "base"] as Which[]).map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      size="lg"
                      className="h-auto whitespace-normal py-3 leading-snug"
                      onClick={() => chooseBase(option)}
                    >
                      {option === "base" ? problem.baseLabel : problem.otherLabel}
                    </Button>
                  ))}
                </div>
              )}

              {step === "place" && (
                <div className="text-center">
                  <Button size="lg" onClick={commitPlace} disabled={placedAt === null}>
                    ここに 100% を 置く
                  </Button>
                </div>
              )}

              {step === "mark" && (
                <div className="text-center">
                  <Button size="lg" onClick={commitMark} disabled={marker === null}>
                    これで いい
                  </Button>
                </div>
              )}

              {step === "read" && (
                <div>
                  <p className="mb-3 text-center text-3xl font-bold tabular-nums">
                    {digits === "" ? "␣" : digits}
                    <span className="ml-1 text-lg font-medium text-muted-foreground">
                      {problem.answerUnit}
                    </span>
                  </p>
                  <NumberPad
                    onDigit={(digit) => setInput((c) => appendDigit(c, digit, MAX_DIGITS))}
                    onBackspace={() => setInput((c) => backspace(c))}
                    onPrimary={commitRead}
                    primaryLabel="けってい"
                    primaryEnabled={digits !== ""}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StepGuide({ current }: { current: PercentStepKind | null }) {
  return (
    <ol className="flex items-center justify-center gap-1 text-[11px]">
      {PERCENT_STEP_KINDS.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1">
          <span
            className={cn(
              "rounded-full px-2 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {PERCENT_STEP_SHORT[kind]}
          </span>
          {i < PERCENT_STEP_KINDS.length - 1 && <span className="text-muted-foreground/50">→</span>}
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
  const stumbles = PERCENT_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, PERCENT_STEP_KINDS, PERCENT_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as PercentStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? percentAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">割合・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {PERCENT_PROBLEM_COUNT} もん</span>
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
                  <span>{PERCENT_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{PERCENT_STEP_LABEL[history.kind as PercentStepKind]}</span>{" "}
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
