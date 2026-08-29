"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { FinishActions } from "@/components/learn/finish-actions";
import { Card, CardContent } from "@/components/ui/card";
import { GroupsPicture, SwapCompare } from "@/components/times/groups-picture";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  TIMES_PROBLEM_COUNT,
  TIMES_STORAGE_KEY,
  generateTimesPlans,
} from "@/lib/times/generate";
import { asAddition, type TimesPlan } from "@/lib/times/plan";
import {
  TIMES_ADVICE_PRIORITY,
  TIMES_STEP_KINDS,
  TIMES_STEP_LABEL,
  TIMES_STEP_SHORT,
  diagnose,
  timesAdviceFor,
  timesPrompt,
  type TimesStepKind,
} from "@/lib/times/steps";
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
 * かけ算の意味（1つ分の数 × いくつ分）。
 *
 * 九九は言えるのに文章題で式が立てられない、を正面から扱う。
 * **答えを最後に置く。** 先に「ぜんぶでいくつ」を聞くと、
 * 数えて出せてしまい、かけ算を使わずに終わってしまう。
 *
 * 式は、子どもが埋めた2つの数から組み立てて見せる。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

export function TimesMeaningGame() {
  const [problems, setProblems] = useState<TimesPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(TIMES_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(TIMES_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateTimesPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const step: TimesStepKind | undefined = TIMES_STEP_KINDS[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(TIMES_STORAGE_KEY, TIMES_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      TIMES_STEP_KINDS
    );
    saveRecord(TIMES_STORAGE_KEY, next);
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
    setProblems(generateTimesPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(TIMES_STEP_KINDS));
    setAttempts(emptyTally(TIMES_STEP_KINDS));
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
    if (stepIndex + 1 >= TIMES_STEP_KINDS.length) {
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
  const { itemUnit, containerUnit } = problem.scene;

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

          <StepGuide current={done ? null : (step ?? null)} />

          <div className="my-4 rounded-xl bg-muted px-4 py-3">
            <p className="text-sm leading-relaxed">{problem.story}</p>
          </div>

          <div className="mb-4">
            <GroupsPicture
              plan={problem}
              highlightFirst={step === "per"}
              highlightAll={step === "groups"}
            />
          </div>

          {/* 式は、埋めた数から組み立てて見せる。答えを先に見せない */}
          <p className="mb-4 text-center text-2xl font-bold tabular-nums">
            <Slot value={stepIndex >= 1 || done ? problem.per : null} label="1つ分" />
            <span className="mx-1.5 text-muted-foreground">×</span>
            <Slot value={stepIndex >= 2 || done ? problem.groups : null} label="いくつ分" />
            <span className="mx-1.5 text-muted-foreground">=</span>
            <Slot value={done ? problem.answer : null} label="ぜんぶ" />
          </p>

          {done ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
              <p className="mb-4 text-sm text-muted-foreground">
                {problem.per}
                {itemUnit}ずつ {problem.groups}
                {containerUnit}分。たし算で 書くと {asAddition(problem)}
              </p>
              {problem.showsSwap && (
                <div className="mb-5">
                  <SwapCompare plan={problem} />
                </div>
              )}
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
                {step ? timesPrompt(problem, step) : ""}
              </p>
              {phase === "retry" && hint && (
                <p className="mb-3 text-center text-sm font-medium text-muted-foreground">{hint}</p>
              )}
              <p className="mb-3 text-center text-3xl font-bold tabular-nums">
                {digits === "" ? "␣" : digits}
              </p>
              <NumberPad
                onDigit={(digit) => setInput((c) => appendDigit(c, digit, 3))}
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

/** 式の1マス。埋まる前は何を入れるところなのかを小さく出す。 */
function Slot({ value, label }: { value: number | null; label: string }) {
  return (
    <span className="inline-flex flex-col items-center align-middle">
      <span
        className={cn(
          "min-w-[2.2rem] rounded-lg border-2 px-1",
          value === null ? "border-dashed border-border text-muted-foreground" : "border-primary text-primary"
        )}
      >
        {value ?? "?"}
      </span>
      <span className="text-[9px] font-normal text-muted-foreground">{label}</span>
    </span>
  );
}

function StepGuide({ current }: { current: TimesStepKind | null }) {
  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {TIMES_STEP_KINDS.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {TIMES_STEP_SHORT[kind]}
          </span>
          {i < TIMES_STEP_KINDS.length - 1 && <span className="text-muted-foreground/50">→</span>}
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
  const stumbles = TIMES_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, TIMES_STEP_KINDS, TIMES_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as TimesStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? timesAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">かけ算の意味・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {TIMES_PROBLEM_COUNT} もん</span>
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
                  <span>{TIMES_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{TIMES_STEP_LABEL[history.kind as TimesStepKind]}</span> で
              とまることが いちばん 多いよ
            </p>
          </div>
        )}

        {tip && <p className="mb-6 text-sm">{tip.text}</p>}

        <FinishActions onRestart={onRestart} />

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          きろくはこの端末のブラウザにだけ保存されます。
        </p>
      </CardContent>
    </Card>
  );
}
