"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { FinishActions } from "@/components/learn/finish-actions";
import { Card, CardContent } from "@/components/ui/card";
import { ClockFace } from "@/components/clock/clock-face";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  CLOCK_PROBLEM_COUNT,
  CLOCK_STORAGE_KEY,
  generateClockPlans,
} from "@/lib/clock/generate";
import {
  clockText,
  hourOf,
  isAtTime,
  isMoved,
  minuteOf,
  type ClockPlan,
} from "@/lib/clock/plan";
import {
  CLOCK_ADVICE_PRIORITY,
  CLOCK_STEP_KINDS,
  CLOCK_STEP_LABEL,
  CLOCK_STEP_SHORT,
  clockAdviceFor,
  clockStepPrompt,
  diagnoseAdvance,
  diagnoseRead,
  diagnoseSet,
  type ClockStepKind,
} from "@/lib/clock/steps";
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
 * 時こく・時間。
 *
 * 針を自分で回して、**12をまたぐところを自分で通る。**
 * 「10時40分の30分後は10時70分」という誤りは、
 * 通ってみせないと直らない種類のものなので、
 * 答えを見せて終わりにはしない。
 *
 * 時計は出発の時こくにセットして渡さない。
 * 合わせる操作そのものが「時こくを読む」の裏返しの練習になる。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

/** 時計は 12時ちょうど から始める。どの問題も同じ場所から動かす */
const HOME = 12 * 60;

export function ClockGame() {
  const [problems, setProblems] = useState<ClockPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [minutes, setMinutes] = useState(HOME);
  /** すすめる手に入ったときの時こく。ここからの差が「動かした量」 */
  const [movedFrom, setMovedFrom] = useState<number | null>(null);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [slot, setSlot] = useState<"hour" | "minute">("hour");
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(CLOCK_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(CLOCK_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateClockPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const step: ClockStepKind | undefined = CLOCK_STEP_KINDS[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(CLOCK_STORAGE_KEY, CLOCK_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      CLOCK_STEP_KINDS
    );
    saveRecord(CLOCK_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  function resetProblemState() {
    setStepIndex(0);
    setMinutes(HOME);
    setMovedFrom(null);
    setHour("");
    setMinute("");
    setSlot("hour");
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateClockPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(CLOCK_STEP_KINDS));
    setAttempts(emptyTally(CLOCK_STEP_KINDS));
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
    // すすめる手に入るところで、動かしはじめの位置を覚える
    if (step === "set") setMovedFrom(minutes);
    if (stepIndex + 1 >= CLOCK_STEP_KINDS.length) {
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

  function commitSet() {
    if (problem === null) return;
    if (isAtTime(minutes, problem.start)) advance();
    else if (phase !== "retry") fail(diagnoseSet(problem, minutes));
  }

  function commitAdvance() {
    if (problem === null || movedFrom === null) return;
    const moved = minutes - movedFrom;
    if (isMoved(moved, problem.delta)) advance();
    else if (phase !== "retry") fail(diagnoseAdvance(problem, moved));
  }

  function commitRead() {
    if (problem === null || hour === "" || minute === "") return;
    const message = diagnoseRead(problem, Number(hour), Number(minute));
    if (message === null) advance();
    else if (phase !== "retry") {
      fail(message);
      setHour("");
      setMinute("");
      setSlot("hour");
    }
  }

  function pushDigit(digit: string) {
    if (slot === "hour") {
      const next = hour === "" ? digit : hour + digit;
      // 時は1〜12。2けた目で13以上になるなら、それは分の入力の始まり
      if (Number(next) >= 1 && Number(next) <= 12 && next.length <= 2) {
        setHour(next);
        if (Number(next) > 1 || next.length === 2) setSlot("minute");
      } else if (hour !== "") {
        setSlot("minute");
        setMinute(digit);
      }
    } else {
      const next = minute === "" ? digit : minute + digit;
      if (Number(next) <= 59 && next.length <= 2) setMinute(next);
    }
  }

  function back() {
    if (slot === "minute" && minute !== "") setMinute(minute.slice(0, -1));
    else if (slot === "minute") setSlot("hour");
    else setHour(hour.slice(0, -1));
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    resetProblemState();
  }

  const done = phase === "problemDone";
  const active = phase === "answering" || phase === "retry";
  const moved = movedFrom === null ? 0 : minutes - movedFrom;

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

          <ClockFace
            minutes={minutes}
            onChange={setMinutes}
            interactive={active && (step === "set" || step === "advance")}
            settled={done || (step === "advance" && isAtTime(minutes, problem.start) && moved === 0)}
          />

          {/* 動かした量。すすめる手のあいだだけ出す */}
          {step === "advance" && (
            <p className="mt-2 text-center text-sm">
              <span className="text-muted-foreground">動かした ぶん </span>
              <span
                className={cn(
                  "text-lg font-bold tabular-nums",
                  moved === problem.delta ? "text-success" : "text-foreground"
                )}
              >
                {moved > 0 ? `+${moved}` : moved}
              </span>
              <span className="text-muted-foreground"> 分</span>
            </p>
          )}

          <div className="mt-4">
            {done ? (
              <div className="text-center">
                <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
                <p className="mb-6 text-2xl font-bold">{clockText(problem.end)}</p>
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
                  {step ? clockStepPrompt(problem, step) : ""}
                </p>
                {phase === "retry" && hint && (
                  <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                    {hint}
                  </p>
                )}

                {step === "set" && (
                  <div className="text-center">
                    <Button size="lg" onClick={commitSet}>
                      これで いい
                    </Button>
                  </div>
                )}

                {step === "advance" && (
                  <div className="text-center">
                    <Button size="lg" onClick={commitAdvance}>
                      これで いい
                    </Button>
                  </div>
                )}

                {step === "read" && (
                  <div>
                    <p className="mb-3 text-center text-3xl font-bold tabular-nums">
                      <span className={cn(slot === "hour" && "text-primary")}>
                        {hour === "" ? "␣" : hour}
                      </span>
                      <span className="mx-0.5 text-lg font-medium">時</span>
                      <span className={cn(slot === "minute" && "text-primary")}>
                        {minute === "" ? "␣" : minute}
                      </span>
                      <span className="ml-0.5 text-lg font-medium">分</span>
                    </p>
                    <NumberPad
                      onDigit={pushDigit}
                      onBackspace={back}
                      onPrimary={commitRead}
                      primaryLabel={slot === "hour" ? "分へ" : "けってい"}
                      primaryEnabled={
                        slot === "hour" ? hour !== "" : hour !== "" && minute !== ""
                      }
                    />
                    {slot === "hour" && hour !== "" && (
                      <button
                        type="button"
                        onClick={() => setSlot("minute")}
                        className="mt-2 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
                      >
                        分の 入力へ
                      </button>
                    )}
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

function StepGuide({ current }: { current: ClockStepKind | null }) {
  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {CLOCK_STEP_KINDS.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {CLOCK_STEP_SHORT[kind]}
          </span>
          {i < CLOCK_STEP_KINDS.length - 1 && <span className="text-muted-foreground/50">→</span>}
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
  const stumbles = CLOCK_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, CLOCK_STEP_KINDS, CLOCK_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as ClockStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? clockAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">時こく・時間・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {CLOCK_PROBLEM_COUNT} もん</span>
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
                  <span>{CLOCK_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{CLOCK_STEP_LABEL[history.kind as ClockStepKind]}</span> で
              とまることが いちばん 多いよ
            </p>
          </div>
        )}

        {tip && <p className="mb-6 text-sm">{tip.text}</p>}

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

export { hourOf, minuteOf };
