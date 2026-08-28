"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FigureBoard } from "@/components/tri/figure-board";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  TRI_PROBLEM_COUNT,
  TRI_STORAGE_KEY,
  generateTriPlans,
  type TriPlan,
} from "@/lib/tri/generate";
import { areaOf, leftSideLength, type Figure, type SegmentName } from "@/lib/tri/plan";
import {
  TRI_ADVICE_PRIORITY,
  TRI_STEP_KINDS,
  TRI_STEP_LABEL,
  TRI_STEP_SHORT,
  diagnoseArea,
  diagnoseHeight,
  formula,
  movedNote,
  triAdviceFor,
  triPrompt,
  type TriStepKind,
} from "@/lib/tri/steps";
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
 * 三角形・平行四辺形の面積。
 *
 * 公式を先に出さない。**動かした結果として公式が出てくる**順にする。
 * 平行四辺形 → 三角形の順は入れかえられない
 * （三角形の ÷2 は、平行四辺形が 底辺×高さ だと分かってはじめて意味を持つ）。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

export function TriGame() {
  const [problems, setProblems] = useState<TriPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [picked, setPicked] = useState<SegmentName | null>(null);
  const [progress, setProgress] = useState(0);
  const [apex, setApex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(TRI_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(TRI_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateTriPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const steps = problem?.steps ?? [];
  const step: TriStepKind | undefined = steps[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (problem === null) return;
    setApex(problem.figure.kind === "triangle" ? problem.figure.apex : null);
  }, [problem]);

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(TRI_STORAGE_KEY, TRI_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      TRI_STEP_KINDS
    );
    saveRecord(TRI_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  function resetProblemState() {
    setStepIndex(0);
    setInput({ kind: "number", digits: "" });
    setPicked(null);
    setProgress(0);
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateTriPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(TRI_STEP_KINDS));
    setAttempts(emptyTally(TRI_STEP_KINDS));
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

  // 頂点を動かす問題では、いま置いている場所で描く
  const shown: Figure =
    problem.motion === "apex" && problem.figure.kind === "triangle" && apex !== null
      ? { ...problem.figure, apex }
      : problem.figure;

  const done = phase === "problemDone";
  const digits = input.kind === "number" ? input.digits : "";
  const movedFully = problem.motion === "apex" ? true : progress >= 1;

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

  function fail(message: string) {
    if (step === undefined) return;
    setHint(message);
    setPhase("wrong");
    setErrors((prev) => ({ ...prev, [step]: prev[step] + 1 }));
    setMistakesInProblem((n) => n + 1);
    setInput({ kind: "number", digits: "" });
  }

  function commit(pickedNow?: SegmentName) {
    if (problem === null || step === undefined) return;
    // 動かす手は、動かしきるまでボタンが押せない。押せた時点で通す
    const message =
      step === "height"
        ? diagnoseHeight(problem.figure, pickedNow ?? picked ?? "base")
        : step === "move"
          ? null
          : diagnoseArea(shown, Number(digits));

    if (message === null) advance();
    else if (phase !== "retry") fail(message);
    else {
      // やり直し中も、まちがえたら言葉を出し直す。回数は数え直さない
      setHint(message);
      setInput({ kind: "number", digits: "" });
    }
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    resetProblemState();
  }

  const heightFound = stepIndex > steps.indexOf("height") && steps.includes("height");

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

          <div className="my-4 rounded-xl bg-muted px-4 py-3">
            <p className="text-sm leading-relaxed">{problem.story}</p>
          </div>

          <div className="mb-4 -mx-2 sm:mx-0">
            <FigureBoard
              figure={shown}
              motion={problem.motion}
              gridCols={problem.frameCols}
              gridRows={problem.frameRows}
              progress={problem.motion === "apex" ? 1 : progress}
              pickable={step === "height" && phase !== "wrong"}
              picked={picked}
              onPick={
                step === "height" && phase !== "wrong"
                  ? (name) => {
                      setPicked(name);
                      commit(name);
                    }
                  : undefined
              }
              showHeight={heightFound || done || problem.motion === "apex"}
            />
          </div>

          {/* 頂点を動かす問題の目もり。
              **面積はここに出さない。** 出すと、このあと聞く答えを
              先に見せてしまう。動いているのは「ななめの辺」のほうで、
              そこが のびても 面積が 変わらないことは、
              答えたあとの 表で 見せる。 */}
          {problem.motion === "apex" && (
            <div className="mb-4 flex gap-2">
              <Readout label="底辺" value={shown.base} unit="cm" locked />
              <Readout label="高さ" value={shown.height} unit="cm" locked />
              <Readout label="左の ななめの辺" value={leftSideLength(shown)} unit="cm" />
            </div>
          )}

          {done ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
              <p className="mb-2 text-center text-xl font-bold tabular-nums">
                {formula(shown)} = {areaOf(shown)} cm²
              </p>
              <p className="mb-4 text-balance text-sm text-muted-foreground">
                {movedNote(shown, problem.motion)}
              </p>
              {problem.motion === "apex" && problem.apexRange && (
                <ApexTable plan={problem} chosen={shown} />
              )}
              <Button size="lg" onClick={nextProblem}>
                {problemIndex + 1 >= problems.length ? "けっかを見る" : "つぎの もんだいへ"}
              </Button>
            </div>
          ) : phase === "wrong" ? (
            <div className="text-center">
              <p className="mb-1 text-lg font-bold text-danger">おしい…</p>
              {hint && <p className="mb-3 text-balance text-sm font-medium text-foreground">{hint}</p>}
              <Button
                size="lg"
                onClick={() => {
                  setPhase("retry");
                  setPicked(null);
                }}
              >
                もういちど やってみる
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-balance text-center text-base font-medium">
                {step ? triPrompt(shown, problem.motion, step) : ""}
              </p>
              {phase === "retry" && hint && (
                <p className="mb-3 text-balance text-center text-sm font-medium text-muted-foreground">
                  {hint}
                </p>
              )}

              {step === "height" && (
                <p className="text-center text-xs text-muted-foreground">
                  3本の 太い 線から えらんでね
                </p>
              )}

              {step === "move" && problem.motion !== "apex" && (
                <>
                  <Slider
                    value={progress}
                    onChange={setProgress}
                    label={problem.motion === "slide" ? "うつす" : "つける"}
                  />
                  <div className="mt-3 flex justify-center">
                    <Button size="lg" onClick={() => commit()} disabled={!movedFully}>
                      {movedFully ? "できた" : "さいごまで 動かそう"}
                    </Button>
                  </div>
                </>
              )}

              {step === "move" && problem.motion === "apex" && problem.apexRange && (
                <>
                  <Slider
                    value={
                      ((apex ?? 0) - problem.apexRange.min) /
                      (problem.apexRange.max - problem.apexRange.min)
                    }
                    onChange={(t) =>
                      setApex(
                        Math.round(
                          problem.apexRange!.min +
                            t * (problem.apexRange!.max - problem.apexRange!.min)
                        )
                      )
                    }
                    label="頂点"
                  />
                  <p className="mt-2 text-balance text-center text-xs text-muted-foreground">
                    底辺と 高さは 🔒 のまま。ななめの 辺だけが のびるよ
                  </p>
                  <div className="mt-3 flex justify-center">
                    <Button size="lg" onClick={() => commit()}>
                      たしかめた
                    </Button>
                  </div>
                </>
              )}

              {step === "area" && (
                <>
                  <p className="mb-3 text-center text-3xl font-bold tabular-nums">
                    {digits === "" ? "␣" : digits}
                  </p>
                  <NumberPad
                    onDigit={(digit) => setInput((c) => appendDigit(c, digit, 3))}
                    onBackspace={() => setInput((c) => backspace(c))}
                    onPrimary={() => commit()}
                    primaryLabel="けってい"
                    primaryEnabled={digits !== ""}
                  />
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 動かすためのつまみ。
 *
 * 指でつかむものなので、`<input type="range">` をそのまま使う。
 * 自作のドラッグより、端末の作法にそのまま乗るほうが確実に動く。
 */
function Slider({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="px-2">
      <label className="mb-1 block text-center text-xs font-bold text-muted-foreground">
        {label}
      </label>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        aria-label={label}
        className="h-8 w-full cursor-pointer accent-primary"
      />
    </div>
  );
}

function Readout({
  label,
  value,
  unit,
  locked,
}: {
  label: string;
  value: number;
  unit: string;
  locked?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 rounded-xl border-2 px-2 py-2 text-center",
        locked ? "border-border bg-muted" : "border-primary/40"
      )}
    >
      <p className="text-[11px] font-bold text-muted-foreground">
        {locked && "🔒 "}
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums">
        {value}
        <span className="text-[10px] font-normal"> {unit}</span>
      </p>
    </div>
  );
}

/**
 * 頂点を いくつかの 場所に 置いたときの、ななめの辺と 面積。
 *
 * **面積の列に 同じ数が たてに ならぶ**のが、この問題の答え。
 * 1か所だけ計算しても「たまたま」に見えるので、並べて見せる。
 */
function ApexTable({ plan, chosen }: { plan: TriPlan; chosen: Figure }) {
  if (plan.figure.kind !== "triangle" || !plan.apexRange) return null;
  const { min, max } = plan.apexRange;
  const step = Math.max(1, Math.round((max - min) / 4));
  const spots: number[] = [];
  for (let a = min; a <= max; a += step) spots.push(a);
  if (spots[spots.length - 1] !== max) spots.push(max);

  return (
    <div className="mb-5 overflow-x-auto">
      <table className="mx-auto text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="px-3 py-1 text-left font-medium">頂点の いち</th>
            <th className="px-2 py-1 text-right font-medium">ななめの辺</th>
            <th className="px-3 py-1 text-right font-medium">🔒 面積</th>
          </tr>
        </thead>
        <tbody>
          {spots.map((a) => {
            const figure: Figure = { ...(plan.figure as Figure & { kind: "triangle" }), apex: a };
            const here = chosen.kind === "triangle" && chosen.apex === a;
            return (
              <tr key={a} className={cn("border-t border-border", here && "font-bold text-primary")}>
                <td className="px-3 py-1 text-left tabular-nums">{a} cm</td>
                <td className="px-2 py-1 text-right tabular-nums text-muted-foreground">
                  {leftSideLength(figure)} cm
                </td>
                <td className="px-3 py-1 text-right tabular-nums">{areaOf(figure)} cm²</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StepGuide({ steps, current }: { steps: TriStepKind[]; current: TriStepKind | null }) {
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
            {TRI_STEP_SHORT[kind]}
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
  const stumbles = TRI_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, TRI_STEP_KINDS, TRI_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as TriStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? triAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          三角形・平行四辺形の面積・けっか
        </p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {TRI_PROBLEM_COUNT} もん</span>
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
                  <span>{TRI_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{TRI_STEP_LABEL[history.kind as TriStepKind]}</span> で
              とまることが いちばん 多いよ
            </p>
          </div>
        )}

        {tip && <p className="mb-6 text-balance text-sm">{tip.text}</p>}

        <Button size="lg" onClick={onRestart}>
          もういちど挑戦する
        </Button>

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          きろくはこの端末のブラウザにだけ保存されます。
        </p>
      </CardContent>
    </Card>
  );
}
