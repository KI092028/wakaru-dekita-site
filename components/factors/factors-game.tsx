"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { FinishActions } from "@/components/learn/finish-actions";
import { Card, CardContent } from "@/components/ui/card";
import { BoardLegend, NumberBoard } from "@/components/factors/number-board";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  FACTOR_PROBLEM_COUNT,
  FACTOR_STORAGE_KEY,
  generateFactorPlans,
} from "@/lib/factors/generate";
import {
  COMMON_LABEL,
  TARGET_LABEL,
  commonOf,
  setOf,
  showFraction,
  type FactorPlan,
} from "@/lib/factors/plan";
import {
  FACTOR_ADVICE_PRIORITY,
  FACTOR_STEP_KINDS,
  FACTOR_STEP_LABEL,
  FACTOR_STEP_SHORT,
  diagnoseDenominator,
  diagnoseMark,
  diagnoseMarkDone,
  diagnosePick,
  diagnoseReduce,
  factorAdviceFor,
  factorPrompt,
  type FactorStepKind,
} from "@/lib/factors/steps";
import {
  appendDigit,
  backspace,
  isComplete,
  primaryAction,
  selectSlot,
  type AnswerInput,
} from "@/lib/quiz/answer-input";
import { AnswerSlot } from "@/components/quiz/answer-slot";
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
 * 公倍数・公約数。
 *
 * 1つの盤に2つのしるしを重ね、**重なりを目で見つける。**
 * 後半2問は、見つけた数をそのまま通分・約分に使う——
 * この単元は、それ自体が目的ではないので。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

/** その手で使う、からっぽの入力。約分だけ分数の2枠になる。 */
function blankInput(plan: FactorPlan, kind: FactorStepKind): AnswerInput {
  return kind === "use" && plan.use?.mode === "reduce"
    ? { kind: "fraction", numerator: "", denominator: "", active: "numerator" }
    : { kind: "number", digits: "" };
}

export function FactorsGame() {
  const [problems, setProblems] = useState<FactorPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [markedA, setMarkedA] = useState<number[]>([]);
  const [markedB, setMarkedB] = useState<number[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(FACTOR_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(FACTOR_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateFactorPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const step = problem?.steps[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  // 約分の答えだけ分数で打つ。それ以外は整数
  useEffect(() => {
    if (problem === null || step === undefined) return;
    setInput(blankInput(problem, step.kind));
  }, [problem, step]);

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(FACTOR_STORAGE_KEY, FACTOR_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      FACTOR_STEP_KINDS
    );
    saveRecord(FACTOR_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  function resetProblemState() {
    setStepIndex(0);
    setMarkedA([]);
    setMarkedB([]);
    setChosen(null);
    setInput({ kind: "number", digits: "" });
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateFactorPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(FACTOR_STEP_KINDS));
    setAttempts(emptyTally(FACTOR_STEP_KINDS));
    setPerfectCount(0);
    setSaved(false);
  }

  if (finished) {
    return <Result errors={errors} perfect={perfectCount} record={record} onRestart={restart} />;
  }

  // step は最後の手を終えたあと undefined になる。
  // **ここで返してしまうと、できたときの画面が出ない**（実際にそうなっていた）
  if (problems === null || problem === null) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">
          もんだいを じゅんびしています…
        </CardContent>
      </Card>
    );
  }

  const done = phase === "problemDone";
  const markingFirst = step?.kind === "mark" && stepIndex === 0;
  const currentMarks = markingFirst ? markedA : markedB;
  const common = commonOf(problem.kind, problem.a, problem.b, problem.max);

  function advance() {
    if (step === undefined) return;
    setHint(null);
    setAttempts((prev) => ({ ...prev, [step.kind]: prev[step.kind] + 1 }));
    if (stepIndex + 1 >= problem!.steps.length) {
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
    setErrors((prev) => ({ ...prev, [step.kind]: prev[step.kind] + 1 }));
    setMistakesInProblem((n) => n + 1);
    // 打った数を消しておく。残したままだと、やり直しで数字を足そうとしても
    // 桁数の上限に当たって、同じ答えをもう一度出すことになる
    setInput(blankInput(problem!, step.kind));
  }

  /** 盤を押したとき。並べる手と、えらぶ手で意味が変わる */
  function tap(n: number) {
    if (problem === null || step === undefined) return;

    if (step.kind === "mark") {
      if (currentMarks.includes(n)) return;
      const message = diagnoseMark(problem, step.n, n);
      if (message !== null) {
        // まちがった数を押しても、それまでのしるしは消さない。
        // 6つ押し直させるのは、直しではなくただの罰になる
        if (phase !== "retry") fail(message);
        else setHint(message);
        return;
      }
      const next = [...currentMarks, n].sort((x, y) => x - y);
      if (markingFirst) setMarkedA(next);
      else setMarkedB(next);
      return;
    }

    if (step.kind === "pick") {
      setChosen(n);
      const message = diagnosePick(problem, n);
      if (message === null) advance();
      else if (phase !== "retry") fail(message);
      else setHint(message);
    }
  }

  function commitMarks() {
    if (problem === null || step === undefined || step.kind !== "mark") return;
    const message = diagnoseMarkDone(problem, step.n, currentMarks);
    if (message === null) advance();
    else if (phase !== "retry") fail(message);
    else setHint(message);
  }

  function commitUse() {
    if (problem === null || step === undefined || !isComplete(input)) return;
    const message =
      input.kind === "number"
        ? diagnoseDenominator(problem, Number(input.digits))
        : diagnoseReduce(problem, {
            numerator: Number(input.numerator),
            denominator: Number(input.denominator),
          });
    if (message === null) advance();
    else if (phase !== "retry") fail(message);
    else {
      setHint(message);
      setInput(blankInput(problem, step.kind));
    }
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    resetProblemState();
  }

  const remaining =
    step?.kind === "mark"
      ? setOf(problem.kind, step.n, problem.max).filter((n) => !currentMarks.includes(n)).length
      : 0;

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

          <StepGuide plan={problem} current={done ? -1 : stepIndex} />

          <div className="my-4 rounded-xl bg-muted px-4 py-3">
            <p className="text-sm leading-relaxed">{problem.story}</p>
          </div>

          <BoardLegend
            a={problem.a}
            b={problem.b}
            kind={problem.kind}
            showBoth={stepIndex >= 2 || done}
          />

          <div className="mb-4">
            <NumberBoard
              max={problem.max}
              markedA={markedA}
              markedB={markedB}
              kind={problem.kind}
              onTap={
                (step?.kind === "mark" || step?.kind === "pick") && phase !== "wrong"
                  ? tap
                  : undefined
              }
              highlight={stepIndex >= 3 || done ? problem.target : chosen}
            />
          </div>

          {done ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
              <p className="mb-2 text-base font-bold">
                {problem.a} と {problem.b} の {COMMON_LABEL[problem.kind]}は {common.join(", ")}。
                <br />
                {TARGET_LABEL[problem.kind]}は{" "}
                <span className="text-primary">{problem.target}</span>
              </p>
              {problem.use && (
                <p className="mb-4 text-balance text-sm text-muted-foreground">
                  {problem.use.mode === "denominator"
                    ? `${showFraction(problem.use.left)} + ${showFraction(problem.use.right)} は、分母を ${problem.use.answer} に そろえて 計算する。最小公倍数が そのまま 分母に なるよ`
                    : `${showFraction(problem.use.from)} の 分子と 分母を、最大公約数の ${problem.target} で わると ${showFraction(problem.use.answer)}。1回で いちばん かんたんな 形に なるよ`}
                </p>
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
                  setChosen(null);
                }}
              >
                もういちど やってみる
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-balance text-center text-base font-medium">
                {step ? factorPrompt(problem, step) : ""}
              </p>
              {phase === "retry" && hint && (
                <p className="mb-3 text-balance text-center text-sm font-medium text-muted-foreground">
                  {hint}
                </p>
              )}

              {step?.kind === "mark" && (
                <div className="flex justify-center">
                  <Button size="lg" onClick={commitMarks} disabled={remaining > 0}>
                    {remaining === 0 ? "ならべた" : `あと ${remaining}こ`}
                  </Button>
                </div>
              )}

              {step?.kind === "use" && problem.use && (
                <>
                  <p className="mb-3 text-center text-2xl font-bold">
                    {problem.use.mode === "denominator" ? (
                      <>
                        {showFraction(problem.use.left)} + {showFraction(problem.use.right)}
                        <span className="mx-2 text-muted-foreground">→ 分母は</span>
                      </>
                    ) : (
                      <>
                        {showFraction(problem.use.from)}
                        <span className="mx-2 text-muted-foreground">=</span>
                      </>
                    )}
                    <AnswerSlot
                      input={input}
                      phase="answering"
                      onSelectSlot={(slot) => setInput((c) => selectSlot(c, slot))}
                    />
                  </p>
                  <NumberPad
                    onDigit={(digit) => setInput((c) => appendDigit(c, digit))}
                    onBackspace={() => setInput((c) => backspace(c))}
                    onPrimary={() => {
                      if (primaryAction(input) === "advance") {
                        setInput((c) => selectSlot(c, "denominator"));
                      } else {
                        commitUse();
                      }
                    }}
                    primaryLabel={primaryAction(input) === "advance" ? "ぶんぼへ" : "けってい"}
                    primaryEnabled={primaryAction(input) !== "none"}
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

function StepGuide({ plan, current }: { plan: FactorPlan; current: number }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
      {plan.steps.map((step, i) => (
        <li key={i} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              i === current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {step.kind === "mark" ? `${step.n}の` : FACTOR_STEP_SHORT[step.kind]}
          </span>
          {i < plan.steps.length - 1 && <span className="text-muted-foreground/50">→</span>}
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
  const stumbles = FACTOR_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, FACTOR_STEP_KINDS, FACTOR_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as FactorStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? factorAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">公倍数・公約数・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {FACTOR_PROBLEM_COUNT} もん</span>
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
                  <span>{FACTOR_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">{FACTOR_STEP_LABEL[history.kind as FactorStepKind]}</span>{" "}
              で とまることが いちばん 多いよ
            </p>
          </div>
        )}

        {tip && <p className="mb-6 text-balance text-sm">{tip.text}</p>}

        <FinishActions onRestart={onRestart} />

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          きろくはこの端末のブラウザにだけ保存されます。
        </p>
      </CardContent>
    </Card>
  );
}
