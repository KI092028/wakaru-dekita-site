"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GridFigure } from "@/components/area/grid-figure";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  AREA_PROBLEM_COUNT,
  AREA_STORAGE_KEY,
  comparison,
  generateAreaPlans,
} from "@/lib/area/generate";
import {
  EDGES,
  areaOf,
  edgeLength,
  goalShape,
  movingLabelOf,
  movingUnitOf,
  movingValueOf,
  perimeterOf,
  shapeOptions,
  sizeLabel,
  sumOfEdges,
  type AreaPlan,
  type Edge,
} from "@/lib/area/plan";
import {
  AREA_ADVICE_PRIORITY,
  AREA_STEP_KINDS,
  AREA_STEP_LABEL,
  AREA_STEP_SHORT,
  areaAdviceFor,
  areaPrompt,
  diagnoseArea,
  diagnoseShape,
  diagnoseTrace,
  shapeConclusion,
  stepsFor,
  type AreaStepKind,
} from "@/lib/area/steps";
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
 * 面積と周りの長さ。
 *
 * **まわりの長さは なぞる、面積は 数える。**
 * 手の動きを分けることで、式を思い出せなくても取りちがえないようにする。
 *
 * 後半2問は、片方を止めたまま もう片方を 動かす。
 * 同じまわりの長さでも面積が変わることが、動かして見える。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

export function AreaGame() {
  const [problems, setProblems] = useState<AreaPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [traced, setTraced] = useState<Edge[]>([]);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(AREA_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(AREA_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateAreaPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const steps = problem ? stepsFor(problem) : [];
  const step: AreaStepKind | undefined = steps[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  // 形を変える問題に入ったら、動かしはじめの形に合わせる
  useEffect(() => {
    if (problem === null || problem.kind === "count") return;
    const options = shapeOptions(problem);
    const at = options.findIndex((o) => o.rows === problem.rows);
    setShapeIndex(at < 0 ? 0 : at);
  }, [problem]);

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(AREA_STORAGE_KEY, AREA_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      AREA_STEP_KINDS
    );
    saveRecord(AREA_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  function resetProblemState() {
    setStepIndex(0);
    setInput({ kind: "number", digits: "" });
    setTraced([]);
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateAreaPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(AREA_STEP_KINDS));
    setAttempts(emptyTally(AREA_STEP_KINDS));
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

  const options = shapeOptions(problem);
  const shown =
    problem.kind === "count"
      ? { rows: problem.rows, cols: problem.cols }
      : (options[shapeIndex] ?? { rows: problem.rows, cols: problem.cols });

  const done = phase === "problemDone";

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

  function commit() {
    if (problem === null || step === undefined) return;
    const message =
      step === "trace"
        ? diagnoseTrace(problem, traced)
        : step === "area"
          ? diagnoseArea(problem, Number(digits))
          : diagnoseShape(problem, shown.rows, shown.cols);

    if (message === null) advance();
    else if (phase !== "retry") fail(message);
    else {
      // やり直し中も まちがえたら、言葉を出し直す。
      // 何も起きないと「ボタンがきかない」に見える。回数は数え直さない
      setHint(message);
      setInput({ kind: "number", digits: "" });
      if (step === "trace") setTraced([]);
    }
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    resetProblemState();
  }

  const digits = input.kind === "number" ? input.digits : "";
  const traceSum = sumOfEdges(shown.rows, shown.cols, traced);
  const compare = comparison(problem);

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

          <div className="mb-4">
            <GridFigure
              plan={problem}
              rows={shown.rows}
              cols={shown.cols}
              traceable={problem.kind === "count"}
              traced={traced}
              onTrace={
                step === "trace" && phase !== "wrong"
                  ? (edge) => setTraced((prev) => (prev.includes(edge) ? prev : [...prev, edge]))
                  : undefined
              }
              showCells={step === "area" || (problem.kind === "count" && done)}
            />
          </div>

          {problem.kind === "count" ? (
            <Readouts
              perimeter={stepIndex >= 1 || done ? perimeterOf(shown.rows, shown.cols) : null}
              area={done ? areaOf(shown.rows, shown.cols) : null}
            />
          ) : (
            <Readouts
              perimeter={perimeterOf(shown.rows, shown.cols)}
              area={areaOf(shown.rows, shown.cols)}
              lock={problem.kind === "keepArea" ? "area" : "perimeter"}
            />
          )}

          {done ? (
            <div className="mt-4 text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>

              {problem.compareWith && compare && (
                <p className="mb-4 text-sm text-muted-foreground">
                  1もん目の {sizeLabel(problem.compareWith.rows, problem.compareWith.cols)} と くらべると、
                  <span className="font-bold text-foreground">{compare.perimeter}</span>。
                  <span className="font-bold text-foreground">{compare.area}</span>。
                  <br />
                  まわりの長さと 面積は、べつべつに 変わるんだね。
                </p>
              )}

              {problem.kind !== "count" && (
                <>
                  <p className="mb-4 text-sm text-muted-foreground">{shapeConclusion(problem)}</p>
                  <ShapeTable plan={problem} chosen={shown} />
                </>
              )}

              <Button size="lg" onClick={nextProblem}>
                {problemIndex + 1 >= problems.length ? "けっかを見る" : "つぎの もんだいへ"}
              </Button>
            </div>
          ) : phase === "wrong" ? (
            <div className="mt-4 text-center">
              <p className="mb-1 text-lg font-bold text-danger">おしい…</p>
              {hint && <p className="mb-3 text-sm font-medium text-foreground">{hint}</p>}
              <Button
                size="lg"
                onClick={() => {
                  setPhase("retry");
                  if (step === "trace") setTraced([]);
                }}
              >
                もういちど やってみる
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="mb-3 text-balance text-center text-base font-medium">
                {step ? areaPrompt(problem, step) : ""}
              </p>
              {phase === "retry" && hint && (
                <p className="mb-3 text-center text-sm font-medium text-muted-foreground">{hint}</p>
              )}

              {step === "trace" && (
                <>
                  <p className="mb-3 text-center text-2xl font-bold tabular-nums">
                    {traced.length === 0
                      ? "␣"
                      : traced
                          .map((edge) => edgeLength(shown.rows, shown.cols, edge))
                          .join(" + ")}
                    {traced.length === EDGES.length && (
                      <span className="text-primary"> = {traceSum}cm</span>
                    )}
                  </p>
                  <div className="flex justify-center">
                    <Button size="lg" onClick={commit}>
                      なぞれた
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
                    onPrimary={commit}
                    primaryLabel="けってい"
                    primaryEnabled={digits !== ""}
                  />
                </>
              )}

              {step === "shape" && (
                <ShapeControl
                  plan={problem}
                  options={options}
                  index={shapeIndex}
                  onChange={setShapeIndex}
                  onCommit={commit}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * まわりの長さと面積を、いつも**並べて**出す。
 *
 * 別々の場面で片方ずつ見せると、2つが別の量だということが伝わらない。
 * 止めているほうには かぎを付けて、動かないことを 見せる。
 */
function Readouts({
  perimeter,
  area,
  lock,
}: {
  perimeter: number | null;
  area: number | null;
  lock?: "perimeter" | "area";
}) {
  const cell = (label: string, value: number | null, unit: string, locked: boolean) => (
    <div
      className={cn(
        "flex-1 rounded-xl border-2 px-3 py-2 text-center",
        locked ? "border-border bg-muted" : "border-primary/40"
      )}
    >
      <p className="text-[11px] font-bold text-muted-foreground">
        {locked && "🔒 "}
        {label}
      </p>
      <p className={cn("text-xl font-bold tabular-nums", value === null && "text-muted-foreground")}>
        {value === null ? "?" : value}
        <span className="text-xs font-normal"> {unit}</span>
      </p>
    </div>
  );

  return (
    <div className="flex gap-2">
      {cell("まわりの長さ", perimeter, "cm", lock === "perimeter")}
      {cell("面積", area, "cm²", lock === "area")}
    </div>
  );
}

/** たてを 1つずつ 変える。よこは いっしょに 決まる。 */
function ShapeControl({
  plan,
  options,
  index,
  onChange,
  onCommit,
}: {
  plan: AreaPlan;
  options: { rows: number; cols: number }[];
  index: number;
  onChange: (index: number) => void;
  onCommit: () => void;
}) {
  const now = options[index] ?? options[0];
  return (
    <div>
      <p className="mb-2 text-center text-xl font-bold tabular-nums">
        {sizeLabel(now.rows, now.cols)}
      </p>
      <div className="mb-2 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          disabled={index <= 0}
          onClick={() => onChange(index - 1)}
          aria-label="たてを へらす"
        >
          − たて
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={index >= options.length - 1}
          onClick={() => onChange(index + 1)}
          aria-label="たてを ふやす"
        >
          たて ＋
        </Button>
      </div>
      <p className="mb-4 text-center text-xs text-muted-foreground">
        たてを 変えると、{movingLabelOf(plan)}が 変わるよ
      </p>
      <div className="flex justify-center">
        <Button size="lg" onClick={onCommit}>
          この形に きめる
        </Button>
      </div>
    </div>
  );
}

/** 選べた形をぜんぶ並べた表。**この表がこの問題のごほうび。** */
function ShapeTable({ plan, chosen }: { plan: AreaPlan; chosen: { rows: number; cols: number } }) {
  const options = shapeOptions(plan);
  const goal = goalShape(plan);
  const label = movingLabelOf(plan);
  const unit = movingUnitOf(plan);

  // 止めているほうも 列に する。**同じ数が たてに ならぶ**ことが、
  // 「まわりが 同じでも 面積は ちがう」を いちばん はやく 見せる
  const heldUnit = plan.kind === "keepArea" ? "cm²" : "cm";
  const heldLabel = plan.kind === "keepArea" ? "面積" : "まわりの長さ";

  return (
    <div className="mb-5 overflow-x-auto">
      <table className="mx-auto text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="px-3 py-1 text-left font-medium">形</th>
            <th className="px-2 py-1 text-right font-medium">🔒 {heldLabel}</th>
            <th className="px-3 py-1 text-right font-medium">{label}</th>
          </tr>
        </thead>
        <tbody>
          {options.map((o) => {
            const isGoal = o.rows === goal.rows && o.cols === goal.cols;
            return (
              <tr
                key={`${o.rows}-${o.cols}`}
                className={cn(
                  "border-t border-border",
                  isGoal && "font-bold text-primary",
                  o.rows === chosen.rows && !isGoal && "text-foreground"
                )}
              >
                <td className="px-3 py-1 text-left tabular-nums">
                  {o.rows} × {o.cols}
                </td>
                <td className="px-2 py-1 text-right tabular-nums text-muted-foreground">
                  {plan.fixed} {heldUnit}
                </td>
                <td className="px-3 py-1 text-right tabular-nums">
                  {movingValueOf(plan, o.rows, o.cols)} {unit}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StepGuide({ steps, current }: { steps: AreaStepKind[]; current: AreaStepKind | null }) {
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
            {AREA_STEP_SHORT[kind]}
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
  const stumbles = AREA_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, AREA_STEP_KINDS, AREA_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as AreaStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? areaAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">面積と周りの長さ・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {AREA_PROBLEM_COUNT} もん</span>
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
                  <span>{AREA_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{AREA_STEP_LABEL[history.kind as AreaStepKind]}</span> で
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
        </p>
      </CardContent>
    </Card>
  );
}
