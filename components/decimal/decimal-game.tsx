"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RuleTable, SizeLine } from "@/components/decimal/size-line";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  DECIMAL_PROBLEM_COUNT,
  DECIMAL_STORAGE_KEY,
  generateDecimalPlans,
} from "@/lib/decimal/generate";
import { expressionOf, meaningOf, ruleOf, type DecimalPlan } from "@/lib/decimal/plan";
import {
  DECIMAL_ADVICE_PRIORITY,
  DECIMAL_STEP_KINDS,
  DECIMAL_STEP_LABEL,
  DECIMAL_STEP_SHORT,
  decimalAdviceFor,
  decimalPrompt,
  diagnoseCompute,
  diagnoseDirection,
  type DecimalStepKind,
} from "@/lib/decimal/steps";
import { appendDigit, backspace, isComplete, type AnswerInput } from "@/lib/quiz/answer-input";
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
 * 小数のかけ算・わり算。**大きくなるのか、小さくなるのか。**
 *
 * 計算より先に向きを決めさせる。先に計算させると、
 * 「かけたら大きくなる」という思い込みが表に出てこないまま素通りする。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

export function DecimalGame() {
  const [problems, setProblems] = useState<DecimalPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(DECIMAL_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(DECIMAL_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateDecimalPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const step: DecimalStepKind | undefined = DECIMAL_STEP_KINDS[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(DECIMAL_STORAGE_KEY, DECIMAL_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      DECIMAL_STEP_KINDS
    );
    saveRecord(DECIMAL_STORAGE_KEY, next);
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
    setProblems(generateDecimalPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(DECIMAL_STEP_KINDS));
    setAttempts(emptyTally(DECIMAL_STEP_KINDS));
    setPerfectCount(0);
    setSaved(false);
  }

  if (finished) {
    return (
      <Result
        problems={problems ?? []}
        errors={errors}
        perfect={perfectCount}
        record={record}
        onRestart={restart}
      />
    );
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

  const done = phase === "problemDone";
  const digits = input.kind === "number" ? input.digits : "";

  function advance() {
    if (step === undefined) return;
    setHint(null);
    setInput({ kind: "number", digits: "" });
    setAttempts((prev) => ({ ...prev, [step]: prev[step] + 1 }));
    if (stepIndex + 1 >= DECIMAL_STEP_KINDS.length) {
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

  function submit(message: string | null) {
    if (message === null) advance();
    else if (phase !== "retry") fail(message);
    else {
      setHint(message);
      setInput({ kind: "number", digits: "" });
    }
  }

  function chooseDirection(bigger: boolean) {
    if (problem === null) return;
    setPicked(bigger);
    submit(diagnoseDirection(problem, bigger));
  }

  function commitCompute() {
    if (problem === null || !isComplete(input)) return;
    submit(diagnoseCompute(problem, Number(digits)));
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    resetProblemState();
  }

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

          <p className="mb-2 text-center text-3xl font-bold tabular-nums">
            {expressionOf(problem)}
            <span className="mx-2 text-muted-foreground">=</span>
            <span className={done ? "text-primary" : "text-muted-foreground/40"}>
              {done ? problem.answer : "?"}
            </span>
          </p>

          <div className="mb-3">
            <SizeLine
              plan={problem}
              showAnswer={done}
              showSides={!done}
              picked={stepIndex >= 1 || done ? problem.bigger : picked}
            />
          </div>

          {done ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
              <p className="mb-3 inline-block rounded-xl border-2 border-primary/40 px-4 py-2 text-sm font-bold">
                {ruleOf(problem)}
              </p>
              <p className="mb-4 text-balance text-sm text-muted-foreground">
                {meaningOf(problem)}
              </p>
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
                {step ? decimalPrompt(problem, step) : ""}
              </p>
              {phase === "retry" && hint && (
                <p className="mb-3 text-balance text-center text-sm font-medium text-muted-foreground">
                  {hint}
                </p>
              )}

              {step === "direction" && (
                <div className="grid grid-cols-2 gap-3">
                  <Button size="lg" variant="outline" onClick={() => chooseDirection(false)}>
                    {problem.base} より 小さい
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => chooseDirection(true)}>
                    {problem.base} より 大きい
                  </Button>
                </div>
              )}

              {step === "compute" && (
                <>
                  <p className="mb-3 text-center text-3xl font-bold tabular-nums">
                    {digits === "" ? "␣" : digits}
                  </p>
                  <NumberPad
                    decimal
                    onDigit={(digit) => setInput((c) => appendDigit(c, digit, 3))}
                    onBackspace={() => setInput((c) => backspace(c))}
                    onPrimary={commitCompute}
                    primaryLabel="けってい"
                    primaryEnabled={isComplete(input)}
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

function StepGuide({ current }: { current: DecimalStepKind | null }) {
  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {DECIMAL_STEP_KINDS.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {DECIMAL_STEP_SHORT[kind]}
          </span>
          {i < DECIMAL_STEP_KINDS.length - 1 && <span className="text-muted-foreground/50">→</span>}
        </li>
      ))}
    </ol>
  );
}

function Result({
  problems,
  errors,
  perfect,
  record,
  onRestart,
}: {
  problems: DecimalPlan[];
  errors: Tally;
  perfect: number;
  record: PracticeRecord | null;
  onRestart: () => void;
}) {
  const stumbles = DECIMAL_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, DECIMAL_STEP_KINDS, DECIMAL_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as DecimalStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? decimalAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          小数のかけ算・わり算・けっか
        </p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {DECIMAL_PROBLEM_COUNT} もん</span>
        </p>
        <p className="mb-6 text-sm text-muted-foreground">1回で さいごまで できた もんだい</p>

        {/* 4行そろってはじめて意味がある。1行だけ覚えると、こんどは
            1より大きい小数で また まちがえる */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold text-muted-foreground">きょう 分かった きまり</p>
          <RuleTable plans={problems} solved={problems.length} />
        </div>

        {stumbles.length > 0 ? (
          <div className="mb-6 rounded-xl bg-muted/60 px-4 py-3 text-left">
            <p className="mb-2 text-center text-xs font-bold text-muted-foreground">
              とまった ところ
            </p>
            <ul className="space-y-1 text-sm">
              {stumbles.map((kind) => (
                <li key={kind} className="flex justify-between gap-3">
                  <span>{DECIMAL_STEP_LABEL[kind]}</span>
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
              <span className="font-bold">
                {DECIMAL_STEP_LABEL[history.kind as DecimalStepKind]}
              </span>{" "}
              で とまることが いちばん 多いよ
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
