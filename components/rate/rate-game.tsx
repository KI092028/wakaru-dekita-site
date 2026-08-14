"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompareBars, NumberLine } from "@/components/rate/number-line";
import { cn } from "@/lib/utils";

import {
  RATE_PROBLEM_COUNT,
  RATE_STORAGE_KEY,
  generateRateProblems,
} from "@/lib/rate/generate";
import {
  correctSide,
  quantityOf,
  situation,
  unitPhrase,
  type Base,
  type RatePlan,
  type Side,
} from "@/lib/rate/plan";
import {
  RATE_ADVICE_PRIORITY,
  RATE_STEPS,
  RATE_STEP_KINDS,
  RATE_STEP_LABEL,
  RATE_STEP_SHORT,
  diagnoseRateStep,
  rateAdviceFor,
  rateStepPrompt,
  type RateStepKind,
} from "@/lib/rate/steps";
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
 * 単位量あたりの大きさ。
 *
 * 他の単元と同じく1手ずつ進めるが、**数を打たせる場面がない。**
 * ここで練習するのは計算ではなく「どちらの量を 1 にそろえるか」と
 * 「そろえた数が何を表すか」なので、答えを当てさせる形にすると壊れる。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

export function RateGame() {
  const [problems, setProblems] = useState<RatePlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [base, setBase] = useState<Base | null>(null);
  const [markers, setMarkers] = useState<{ left: number; right: number }>({ left: 0, right: 0 });
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(RATE_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(RATE_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  // 出題は乱数を使うため、描画後に行う（サーバー側の出力と食い違わせない）
  useEffect(() => {
    setProblems(generateRateProblems());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const step = RATE_STEPS[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(RATE_STORAGE_KEY, RATE_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      RATE_STEP_KINDS
    );
    saveRecord(RATE_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

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
    setAttempts((prev) => ({ ...prev, [step.kind]: prev[step.kind] + 1 }));
    if (stepIndex + 1 >= RATE_STEPS.length) {
      setPhase("problemDone");
      if (mistakesInProblem === 0) setPerfectCount((n) => n + 1);
    } else {
      setPhase("answering");
    }
    setStepIndex((i) => i + 1);
  }

  function fail(value: number | Side) {
    if (step === undefined || problem === null || base === null) return;
    setHint(diagnoseRateStep(problem, step, base, value));
    setPhase("wrong");
    setErrors((prev) => ({ ...prev, [step.kind]: prev[step.kind] + 1 }));
    setMistakesInProblem((n) => n + 1);
  }

  /**
   * どちらの量を 1 にそろえるかを決める。ここに誤りはない。
   *
   * しるしは**まるごとの量のところ**から始める。
   * 「たたみ6まいに子ども8人」という、そろえる前の言い方がそのまま出るので、
   * そこから 1 まで動かす操作が「そろえる」だと分かりやすい。
   */
  function chooseBase(next: Base) {
    if (problem === null) return;
    setBase(next);
    setMarkers({ left: problem.left[next], right: problem.right[next] });
    advance();
  }

  /** マーカーを確かめる。1 でなければ、いまどこにいるかを言って戻す。 */
  function commitMarker(side: Side) {
    const value = markers[side];
    if (value === 1) advance();
    else if (phase !== "retry") fail(value);
  }

  function commitCompare(picked: Side) {
    if (problem === null || base === null) return;
    if (picked === correctSide(problem, base)) advance();
    else if (phase !== "retry") fail(picked);
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    setStepIndex(0);
    setBase(null);
    setMarkers({ left: 0, right: 0 });
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateRateProblems());
    setProblemIndex(0);
    setStepIndex(0);
    setBase(null);
    setMarkers({ left: 0, right: 0 });
    setPhase("answering");
    setHint(null);
    setErrors(emptyTally(RATE_STEP_KINDS));
    setAttempts(emptyTally(RATE_STEP_KINDS));
    setMistakesInProblem(0);
    setPerfectCount(0);
    setSaved(false);
  }

  const done = phase === "problemDone";
  const active = phase === "answering" || phase === "retry";
  const answer = base !== null ? correctSide(problem, base) : null;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {problemIndex + 1} / {problems.length} もん目
            </span>
            <span>{problem.question}</span>
          </div>

          <StepGuide current={done ? null : step?.kind ?? null} />

          <div className="my-4 space-y-3">
            {base === null ? (
              <Facts plan={problem} />
            ) : (
              (["left", "right"] as Side[]).map((side) => (
                <NumberLine
                  key={side}
                  plan={problem}
                  side={side}
                  base={base}
                  marker={markers[side]}
                  interactive={
                    active && step?.kind === "align" && step.side === side
                  }
                  onMarkerChange={(value) => setMarkers((m) => ({ ...m, [side]: value }))}
                  settled={markers[side] === 1}
                />
              ))
            )}
          </div>

          {done && base !== null && (
            <div className="mb-4">
              <CompareBars plan={problem} base={base} />
            </div>
          )}

          {done ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
              <p className="mb-6 text-lg font-bold">
                {situation(problem, answer!).label}の ほうが {problem.moreWord}
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
                  setPhase("retry");
                }}
              >
                もういちど やってみる
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-sm font-medium">
                {step ? rateStepPrompt(problem, step, base) : ""}
              </p>
              {step?.kind === "base" && (
                <div className="grid grid-cols-2 gap-3">
                  {(["b", "a"] as Base[]).map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      size="lg"
                      className="h-auto whitespace-normal py-3 leading-snug"
                      onClick={() => chooseBase(option)}
                    >
                      {unitPhrase(quantityOf(problem, option))}
                      <br />
                      あたり
                    </Button>
                  ))}
                </div>
              )}
              {step?.kind === "align" && (
                <div className="text-center">
                  {phase === "retry" && hint && (
                    <p className="mb-3 text-sm font-medium text-muted-foreground">{hint}</p>
                  )}
                  <Button size="lg" onClick={() => commitMarker(step.side)}>
                    これで いい
                  </Button>
                </div>
              )}
              {step?.kind === "compare" && (
                <>
                  {phase === "retry" && hint && (
                    <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                      {hint}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {(["left", "right"] as Side[]).map((side) => (
                      <Button
                        key={side}
                        variant="outline"
                        size="lg"
                        onClick={() => commitCompare(side)}
                      >
                        {situation(problem, side).label}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** そろえる前の数。ここを見ただけでは決められない、という状態を作る。 */
function Facts({ plan }: { plan: RatePlan }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(["left", "right"] as Side[]).map((side) => {
        const s = situation(plan, side);
        return (
          <div key={side} className="rounded-xl border border-border px-3 py-3 text-center">
            <p className="mb-2 text-xs font-bold text-muted-foreground">{s.label}</p>
            <p className="text-sm">
              {plan.quantityA.name} <span className="text-lg font-bold">{s.a}</span>
              {plan.quantityA.unit}
            </p>
            <p className="text-sm">
              {plan.quantityB.name} <span className="text-lg font-bold">{s.b}</span>
              {plan.quantityB.unit}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function StepGuide({ current }: { current: RateStepKind | null }) {
  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {RATE_STEP_KINDS.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {RATE_STEP_SHORT[kind]}
          </span>
          {i < RATE_STEP_KINDS.length - 1 && <span className="text-muted-foreground/50">→</span>}
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
  const stumbles = RATE_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, RATE_STEP_KINDS, RATE_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as RateStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? rateAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">単位量あたり・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {RATE_PROBLEM_COUNT} もん</span>
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
                  <span>{RATE_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{RATE_STEP_LABEL[history.kind as RateStepKind]}</span> で
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
