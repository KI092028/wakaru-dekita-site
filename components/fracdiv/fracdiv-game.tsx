"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { FinishActions } from "@/components/learn/finish-actions";
import { Card, CardContent } from "@/components/ui/card";
import { DoubleLine } from "@/components/fracdiv/double-line";
import { AnswerSlot } from "@/components/quiz/answer-slot";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";

import {
  FRACDIV_PROBLEM_COUNT,
  FRACDIV_STORAGE_KEY,
  generateFracDivPlans,
} from "@/lib/fracdiv/generate";
import { expressionOf, ruleOf, show, stepWords, type FracDivPlan } from "@/lib/fracdiv/plan";
import {
  FRACDIV_ADVICE_PRIORITY,
  FRACDIV_STEP_KINDS,
  FRACDIV_STEP_LABEL,
  FRACDIV_STEP_SHORT,
  conclusionOf,
  diagnoseGather,
  diagnoseRule,
  diagnoseSplit,
  fracDivAdviceFor,
  fracDivPrompt,
  ruleChoices,
  type FracDivStepKind,
  type RuleChoice,
} from "@/lib/fracdiv/steps";
import {
  appendDigit,
  backspace,
  isComplete,
  primaryAction,
  selectSlot,
  type AnswerInput,
} from "@/lib/quiz/answer-input";
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
 * 分数のわり算。**なぜ ひっくり返して かけるのか。**
 *
 * 手順だけなら覚えられる。理由が分からないまま覚えた手順は、
 * かけ算のときにも ひっくり返す、わられる数のほうを ひっくり返す、
 * という形でこわれる。
 *
 * 2手（分ける・集める）に分けると、理由がそのまま見える。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

const blankFraction = (): AnswerInput => ({
  kind: "fraction",
  numerator: "",
  denominator: "",
  active: "numerator",
});

export function FracDivGame() {
  const [problems, setProblems] = useState<FracDivPlan[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>(blankFraction);
  const [choices, setChoices] = useState<RuleChoice[]>([]);
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Tally>(emptyTally(FRACDIV_STEP_KINDS));
  const [attempts, setAttempts] = useState<Tally>(emptyTally(FRACDIV_STEP_KINDS));
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblems(generateFracDivPlans());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const step: FracDivStepKind | undefined = FRACDIV_STEP_KINDS[stepIndex];
  const finished = problems !== null && problemIndex >= problems.length;

  // 選択肢は問題ごとに1回だけ並べかえる（描き直すたびに動くと押しまちがえる）
  useEffect(() => {
    if (problem !== null) setChoices(ruleChoices(problem));
  }, [problem]);

  useEffect(() => {
    if (!finished || saved || problems === null) return;
    const next = addSet(
      loadRecord(FRACDIV_STORAGE_KEY, FRACDIV_STEP_KINDS),
      { errors, attempts, perfect: perfectCount, problems: problems.length },
      FRACDIV_STEP_KINDS
    );
    saveRecord(FRACDIV_STORAGE_KEY, next);
    setRecord(next);
    setSaved(true);
  }, [finished, saved, problems, errors, attempts, perfectCount]);

  function resetProblemState() {
    setStepIndex(0);
    setInput(blankFraction());
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateFracDivPlans());
    setProblemIndex(0);
    resetProblemState();
    setErrors(emptyTally(FRACDIV_STEP_KINDS));
    setAttempts(emptyTally(FRACDIV_STEP_KINDS));
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

  const done = phase === "problemDone";
  const words = stepWords(problem);

  function advance() {
    if (step === undefined) return;
    setHint(null);
    setInput(blankFraction());
    setAttempts((prev) => ({ ...prev, [step]: prev[step] + 1 }));
    if (stepIndex + 1 >= FRACDIV_STEP_KINDS.length) {
      setPhase("problemDone");
      if (mistakesInProblem === 0) setPerfectCount((n) => n + 1);
    } else {
      setPhase("answering");
    }
    setStepIndex((i) => i + 1);
  }

  function submit(message: string | null) {
    if (step === undefined) return;
    if (message === null) advance();
    else if (phase !== "retry") {
      setHint(message);
      setPhase("wrong");
      setErrors((prev) => ({ ...prev, [step]: prev[step] + 1 }));
      setMistakesInProblem((n) => n + 1);
      setInput(blankFraction());
    } else {
      setHint(message);
      setInput(blankFraction());
    }
  }

  function commitFraction() {
    if (problem === null || step === undefined || !isComplete(input)) return;
    if (input.kind !== "fraction") return;
    const typed = { numerator: Number(input.numerator), denominator: Number(input.denominator) };
    submit(step === "split" ? diagnoseSplit(problem, typed) : diagnoseGather(problem, typed));
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

          <p className="mb-3 text-center text-2xl font-bold tabular-nums">
            {expressionOf(problem)}
            <span className="mx-2 text-muted-foreground">=</span>
            <span className={done ? "text-primary" : "text-muted-foreground/40"}>
              {done ? show(problem.answer) : "?"}
            </span>
          </p>

          <div className="mb-3 -mx-2 sm:mx-0">
            <DoubleLine
              plan={problem}
              showUnitPart={stepIndex >= 1 || done}
              showAnswer={stepIndex >= 2 || done}
            />
          </div>

          {/* いまやっている2手を、いつも文で出しておく */}
          <ol className="mb-4 space-y-1 rounded-xl bg-muted/60 px-3 py-2 text-xs">
            <li className={cn(step === "split" ? "font-bold text-foreground" : "text-muted-foreground")}>
              1. {words.split}
            </li>
            <li className={cn(step === "gather" ? "font-bold text-foreground" : "text-muted-foreground")}>
              2. {words.gather}
            </li>
          </ol>

          {done ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">そのとおり！</p>
              <p className="mb-3 inline-block rounded-xl border-2 border-primary/40 px-4 py-2 text-base font-bold">
                {expressionOf(problem)} = {show(problem.total)} {ruleOf(problem)}
              </p>
              <p className="mb-4 text-balance text-sm text-muted-foreground">
                {conclusionOf(problem)}
              </p>
              <Button size="lg" onClick={nextProblem}>
                {problemIndex + 1 >= problems.length ? "けっかを見る" : "つぎの もんだいへ"}
              </Button>
            </div>
          ) : phase === "wrong" ? (
            <div className="text-center">
              <p className="mb-1 text-lg font-bold text-danger">おしい…</p>
              {hint && <p className="mb-3 text-balance text-sm font-medium text-foreground">{hint}</p>}
              <Button size="lg" onClick={() => setPhase("retry")}>
                もういちど やってみる
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-balance text-center text-base font-medium">
                {step ? fracDivPrompt(problem, step) : ""}
              </p>
              {phase === "retry" && hint && (
                <p className="mb-3 text-balance text-center text-sm font-medium text-muted-foreground">
                  {hint}
                </p>
              )}

              {step === "rule" ? (
                <div className="space-y-2">
                  <p className="mb-2 text-center text-lg font-bold">
                    {expressionOf(problem)} <span className="text-muted-foreground">=</span>{" "}
                    {show(problem.total)} …?
                  </p>
                  {choices.map((choice) => (
                    <Button
                      key={choice.id}
                      variant="outline"
                      size="lg"
                      className="w-full text-lg"
                      onClick={() => submit(diagnoseRule(problem, choice.id))}
                    >
                      {choice.label}
                    </Button>
                  ))}
                </div>
              ) : (
                <>
                  <p className="mb-3 text-center text-3xl font-bold">
                    <AnswerSlot
                      input={input}
                      phase="answering"
                      onSelectSlot={(slot) => setInput((c) => selectSlot(c, slot))}
                    />
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                      {problem.unit}
                    </span>
                  </p>
                  <NumberPad
                    onDigit={(digit) => setInput((c) => appendDigit(c, digit))}
                    onBackspace={() => setInput((c) => backspace(c))}
                    onPrimary={() => {
                      if (primaryAction(input) === "advance") {
                        setInput((c) => selectSlot(c, "denominator"));
                      } else {
                        commitFraction();
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

function StepGuide({ current }: { current: FracDivStepKind | null }) {
  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {FRACDIV_STEP_KINDS.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {FRACDIV_STEP_SHORT[kind]}
          </span>
          {i < FRACDIV_STEP_KINDS.length - 1 && <span className="text-muted-foreground/50">→</span>}
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
  const stumbles = FRACDIV_STEP_KINDS.filter((kind) => errors[kind] > 0);
  const history =
    record !== null && record.sets >= 2
      ? weakness(record, FRACDIV_STEP_KINDS, FRACDIV_ADVICE_PRIORITY)
      : null;

  const worst = history
    ? (history.kind as FracDivStepKind)
    : [...stumbles].sort((a, b) => errors[b] - errors[a])[0];
  const tip = worst ? fracDivAdviceFor(worst) : null;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">分数のわり算・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {FRACDIV_PROBLEM_COUNT} もん</span>
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
                  <span>{FRACDIV_STEP_LABEL[kind]}</span>
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
                {FRACDIV_STEP_LABEL[history.kind as FracDivStepKind]}
              </span>{" "}
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
