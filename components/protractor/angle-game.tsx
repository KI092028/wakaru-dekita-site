"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtractorBoard } from "@/components/protractor/protractor-board";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  ANGLE_PROBLEM_COUNT,
  ANGLE_STORAGE_KEY,
  generateAngleProblems,
  type AngleProblem,
} from "@/lib/protractor/generate";
import { nearestAlignment, type Pose } from "@/lib/protractor/plan";
import {
  PROTRACTOR_ADVICE_PRIORITY,
  PROTRACTOR_STEP_KINDS,
  PROTRACTOR_STEP_LABEL,
  PROTRACTOR_STEP_SHORT,
  diagnoseProtractorStep,
  isStepDone,
  protractorAdviceFor,
  protractorStepPrompt,
  type ProtractorStepKind,
} from "@/lib/protractor/steps";
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
 * 角の大きさ（分度器）。
 *
 * 他の手順型の単元と同じく1手ずつ進め、「どの手で止まったか」を分けて数える。
 * 違うのは、手の中身が数の計算ではなく**道具の当て方**であること。
 */

/** 角の大きさは3けたまで（180度）。 */
const MAX_DIGITS = 3;

type Phase = "answering" | "wrong" | "retry" | "problemDone";

const EMPTY: AnswerInput = { kind: "number", digits: "" };

export function AngleGame() {
  const [problems, setProblems] = useState<AngleProblem[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [pose, setPose] = useState<Pose>({ x: 0, y: 0, rotation: 0 });
  const [input, setInput] = useState<AnswerInput>(EMPTY);
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(PROTRACTOR_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(PROTRACTOR_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  // 出題は乱数を使うため、描画後に行う（サーバー側の出力と食い違わせない）
  useEffect(() => {
    const next = generateAngleProblems();
    setProblems(next);
    setPose(next[0].start);
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const step: ProtractorStepKind | undefined = PROTRACTOR_STEP_KINDS[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(ANGLE_STORAGE_KEY, PROTRACTOR_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      PROTRACTOR_STEP_KINDS
    );
    saveRecord(ANGLE_STORAGE_KEY, next);
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

  const digits = input.kind === "number" ? input.digits : "";

  function advanceStep(nextPose: Pose) {
    if (problem === null || step === undefined) return;
    setPose(nextPose);
    setInput(EMPTY);
    setHint(null);
    setAttempts((prev) => ({ ...prev, [step]: prev[step] + 1 }));

    if (stepIndex + 1 >= PROTRACTOR_STEP_KINDS.length) {
      setPhase("problemDone");
      if (mistakesInProblem === 0) setPerfectCount((n) => n + 1);
    } else {
      setPhase("answering");
    }
    setStepIndex((i) => i + 1);
  }

  function fail(typed: number) {
    if (problem === null || step === undefined) return;
    setHint(diagnoseProtractorStep(step, problem, pose, typed));
    setPhase("wrong");
    setErrors((prev) => ({ ...prev, [step]: prev[step] + 1 }));
    setMistakesInProblem((n) => n + 1);
  }

  /**
   * 手を確かめる。
   * 合っていたら、ぴったりの位置・向きに寄せてから次へ進む。
   * わずかなずれを残したまま目もりを読ませても、読み方の練習にならないため。
   */
  function commit() {
    if (problem === null || step === undefined) return;
    const retry = phase === "retry";

    if (step === "read") {
      if (digits === "") return;
      const typed = Number(digits);
      if (typed === problem.angle) advanceStep(pose);
      else if (retry) setInput(EMPTY);
      else fail(typed);
      return;
    }

    if (!isStepDone(step, problem, pose)) {
      if (retry) return;
      fail(0);
      return;
    }

    advanceStep(
      step === "place"
        ? { ...pose, x: problem.vertex.x, y: problem.vertex.y }
        : { ...pose, rotation: nearestAlignment(problem, pose) }
    );
  }

  function nextProblem() {
    const next = problems?.[problemIndex + 1];
    if (next) setPose(next.start);
    setProblemIndex((i) => i + 1);
    setStepIndex(0);
    setInput(EMPTY);
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    const next = generateAngleProblems();
    setProblems(next);
    setPose(next[0].start);
    setProblemIndex(0);
    setStepIndex(0);
    setInput(EMPTY);
    setPhase("answering");
    setHint(null);
    setErrors(emptyTally(PROTRACTOR_STEP_KINDS));
    setAttempts(emptyTally(PROTRACTOR_STEP_KINDS));
    setMistakesInProblem(0);
    setPerfectCount(0);
    setSaved(false);
  }

  const done = phase === "problemDone";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {problemIndex + 1} / {problems.length} もん目
            </span>
            <span>分度器を 動かして はかろう</span>
          </div>

          <StepGuide current={done ? null : step ?? null} />

          <div className="my-4">
            <ProtractorBoard
              plan={problem}
              pose={pose}
              step={step ?? "read"}
              interactive={phase === "answering" || phase === "retry"}
              onPoseChange={setPose}
              reveal={done}
            />
          </div>

          {done ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">はかれた！</p>
              <p className="mb-6 text-2xl font-bold tabular-nums">{problem.angle}°</p>
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
                {step ? protractorStepPrompt(step) : ""}
              </p>
              {step === "read" ? (
                <NumberPad
                  onDigit={(digit) => setInput((c) => appendDigit(c, digit, MAX_DIGITS))}
                  onBackspace={() => setInput((c) => backspace(c))}
                  onPrimary={commit}
                  primaryLabel="けってい"
                  primaryEnabled={digits !== ""}
                />
              ) : (
                <div className="text-center">
                  {phase === "retry" && hint && (
                    <p className="mb-3 text-sm font-medium text-muted-foreground">{hint}</p>
                  )}
                  <Button size="lg" onClick={commit}>
                    これで いい
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** いまどの手かを常に画面に出す。手順を思い出すことに気を取られると操作が崩れるため。 */
function StepGuide({ current }: { current: ProtractorStepKind | null }) {
  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {PROTRACTOR_STEP_KINDS.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {PROTRACTOR_STEP_SHORT[kind]}
          </span>
          {i < PROTRACTOR_STEP_KINDS.length - 1 && (
            <span className="text-muted-foreground/50">→</span>
          )}
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
  const stumbles = PROTRACTOR_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, PROTRACTOR_STEP_KINDS, PROTRACTOR_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as ProtractorStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? protractorAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">角の大きさ・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {ANGLE_PROBLEM_COUNT} もん</span>
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
                  <span>{PROTRACTOR_STEP_LABEL[kind]}</span>
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
                {PROTRACTOR_STEP_LABEL[history.kind as ProtractorStepKind]}
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
