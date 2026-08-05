"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DivisionBoard } from "@/components/division/division-board";
import { TimesTableAid } from "@/components/division/times-table-aid";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";
import { buildPlan } from "@/lib/division/plan";
import {
  PROBLEM_COUNT,
  generateDivisionProblems,
  type DivisionProblem,
} from "@/lib/division/generate";
import {
  NO_ERRORS,
  STEP_CYCLE,
  STEP_LABEL,
  advice,
  buildSteps,
  diagnoseStep,
  stepPrompt,
  type StepErrors,
  type StepKind,
} from "@/lib/division/steps";
import { appendDigit, backspace, type AnswerInput } from "@/lib/quiz/answer-input";

/**
 * わり算のひっ算。
 *
 * 3単元のドリル（QuizGame）と違い、1問1答ではなく手続きの練習なので UI を分けている。
 * ただし入力・誤答時の流れ・言い回しはドリルとそろえてある。
 *
 * 設計の中心は「つまずきを4つに分けて別々に扱う」こと。
 * 商の位置・商の見当・九九・ひき算はどれも別の力なので、
 * まとめて不正解にすると何ができていないのか本人にも分からない。
 */

type Phase = "answering" | "wrong" | "retry" | "problemDone";

const EMPTY: AnswerInput = { kind: "number", digits: "" };

export function LongDivisionGame() {
  const [problems, setProblems] = useState<DivisionProblem[] | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>(EMPTY);
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [errors, setErrors] = useState<StepErrors>(NO_ERRORS);
  const [mistakesInProblem, setMistakesInProblem] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);

  // 問題の生成は乱数を使うため、描画後に行う（サーバー側の出力と食い違わせない）
  useEffect(() => {
    setProblems(generateDivisionProblems());
  }, []);

  const problem = problems?.[problemIndex] ?? null;
  const plan = useMemo(
    () => (problem ? buildPlan(problem.dividend, problem.divisor) : null),
    [problem]
  );
  const steps = useMemo(() => (plan ? buildSteps(plan) : []), [plan]);

  // 最後の1問を終えたあとは problems[problemIndex] が無くなるため、
  // 「準備中」の判定より先に結果画面へ抜ける
  if (problems !== null && problemIndex >= problems.length) {
    return <Result errors={errors} perfect={perfectCount} onRestart={restart} />;
  }

  if (problems === null || plan === null || problem === null) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">もんだいを準備しています…</CardContent>
      </Card>
    );
  }

  const step = steps[stepIndex];
  const digits = input.kind === "number" ? input.digits : "";

  function countError(kind: StepKind) {
    setErrors((prev) => ({ ...prev, [kind]: prev[kind] + 1 }));
    setMistakesInProblem((n) => n + 1);
  }

  function advanceStep() {
    setInput(EMPTY);
    setHint(null);
    // ひっ算は1問が長いので、1手ごとに間を置かない。
    // 書き足された数字が盤面に現れること自体を手ごたえにしている
    if (stepIndex + 1 >= steps.length) {
      setPhase("problemDone");
      if (mistakesInProblem === 0) setPerfectCount((n) => n + 1);
    } else {
      setPhase("answering");
    }
    setStepIndex((i) => i + 1);
  }

  function resolve(value: number) {
    if (step === undefined) return;
    const correct = value === step.answer;

    if (phase === "retry") {
      if (correct) advanceStep();
      else {
        setShake((n) => n + 1);
        setInput(EMPTY);
      }
      return;
    }

    if (correct) {
      advanceStep();
    } else {
      setHint(diagnoseStep(plan!, step, value));
      setPhase("wrong");
      countError(step.kind);
    }
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1);
    setStepIndex(0);
    setInput(EMPTY);
    setPhase("answering");
    setHint(null);
    setMistakesInProblem(0);
  }

  function restart() {
    setProblems(generateDivisionProblems());
    setProblemIndex(0);
    setStepIndex(0);
    setInput(EMPTY);
    setPhase("answering");
    setHint(null);
    setErrors(NO_ERRORS);
    setMistakesInProblem(0);
    setPerfectCount(0);
  }

  const wrongValue = phase === "wrong" ? digits : "";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {problemIndex + 1} / {problems.length} もん目
            </span>
            <span className="tabular-nums">
              {problem.dividend} ÷ {problem.divisor}
            </span>
          </div>

          <StepGuide current={step?.kind ?? null} />

          <div key={shake} className={cn("my-6", shake > 0 && phase === "retry" && "wd-shake")}>
            <DivisionBoard
              plan={plan}
              steps={steps}
              stepIndex={stepIndex}
              input={phase === "wrong" ? wrongValue : digits}
              wrong={phase === "wrong"}
              onColumnTap={(col) => {
                if (phase === "wrong" || phase === "problemDone") return;
                resolve(col);
              }}
            />
          </div>

          {phase === "problemDone" ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-lg font-bold text-success">できた！</p>
              <p className="mb-6 text-2xl font-bold tabular-nums">
                {plan.dividend} ÷ {plan.divisor} = {plan.quotient}
                {plan.remainder > 0 && <span className="text-lg"> あまり {plan.remainder}</span>}
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
                {step ? stepPrompt(plan, step) : ""}
              </p>
              {step?.input === "number" ? (
                <NumberPad
                  onDigit={(digit) => setInput((current) => appendDigit(current, digit))}
                  onBackspace={() => setInput((current) => backspace(current))}
                  onPrimary={() => digits !== "" && resolve(Number(digits))}
                  primaryLabel="けってい"
                  primaryEnabled={digits !== ""}
                />
              ) : (
                <p className="rounded-xl bg-muted/60 py-4 text-center text-sm text-muted-foreground">
                  上の わくを タップしてね
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <TimesTableAid divisor={plan.divisor} />
    </div>
  );
}

/**
 * たてる→かける→ひく→おろす を常に画面に出しておく。
 *
 * 手順を覚えていないことと、計算ができないことは別のつまずき。
 * 手順を思い出すのに気を取られると計算のほうが崩れるため、順番は見せてしまう。
 */
function StepGuide({ current }: { current: StepKind | null }) {
  if (current === "start") {
    return (
      <p className="rounded-xl bg-primary/10 py-2 text-center text-sm font-bold text-primary">
        まず、商を どこに 立てるか きめよう
      </p>
    );
  }

  return (
    <ol className="flex items-center justify-center gap-1.5 text-xs">
      {STEP_CYCLE.map((kind, i) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-bold transition-colors",
              kind === current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {STEP_LABEL[kind]}
          </span>
          {i < STEP_CYCLE.length - 1 && <span className="text-muted-foreground/50">→</span>}
        </li>
      ))}
    </ol>
  );
}

const UNIT_TITLE: Record<string, string> = {
  "times-table": "九九",
  "add-sub": "たし算・ひき算",
};

function Result({
  errors,
  perfect,
  onRestart,
}: {
  errors: StepErrors;
  perfect: number;
  onRestart: () => void;
}) {
  const stumbles = (Object.keys(errors) as StepKind[]).filter((kind) => errors[kind] > 0);
  const tip = advice(errors);

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-12 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">わり算のひっ算・けっか</p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {perfect} <span className="text-2xl text-foreground">/ {PROBLEM_COUNT} もん</span>
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
                  <span>{STEP_LABEL[kind]}</span>
                  <span className="font-bold tabular-nums">{errors[kind]} 回</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">ひとつも まよわずに できました</p>
        )}

        {tip && (
          <p className="mb-6 text-sm">
            {tip.text}
            {tip.unit && (
              <>
                <br />
                <Link href={`/learn/${tip.unit}`} className="font-bold text-primary underline">
                  {UNIT_TITLE[tip.unit]}のれんしゅうへ
                </Link>
              </>
            )}
          </p>
        )}

        <Button size="lg" onClick={onRestart}>
          もういちど挑戦する
        </Button>
      </CardContent>
    </Card>
  );
}
