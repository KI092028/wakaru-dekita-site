"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { FinishActions } from "@/components/learn/finish-actions";
import { Card, CardContent } from "@/components/ui/card";
import { NumberPad } from "@/components/quiz/number-pad";
import { TenFrame } from "@/components/sakura/cherry";
import { cn } from "@/lib/utils";

import { TENS_QUESTION_COUNT, generateTensQuestions } from "@/lib/tens/generate";
import { PARTNERS, diagnoseTens, promptOf, type TensQuestion } from "@/lib/tens/plan";
import {
  TOTAL_PAIR_KEYS,
  loadTensProgress,
  masteredPairs,
  recordTensAnswer,
  saveTensProgress,
  tensStatus,
  type TensProgress,
} from "@/lib/tens/progress";
import { appendDigit, backspace, type AnswerInput } from "@/lib/quiz/answer-input";

/**
 * 10のなかま。
 *
 * さくらんぼ計算でいちばん止まる手を、単独で速く回す。
 * **9つしかないので、全部うまるところまで行ける。**
 * 九九の81マスとちがって終わりが見えることは、苦手な子には大きい。
 *
 * わくの点は、数えれば答えが出るように置いてある。
 * ここで練習させたいのは思い出すことではなく、
 * 「10 のまとまりで考える」という見方そのものだから。
 */

type Phase = "asking" | "wrong" | "retry" | "finished";

export function TensGame() {
  const [progress, setProgress] = useState<TensProgress | null>(null);
  const [questions, setQuestions] = useState<TensQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [phase, setPhase] = useState<Phase>("asking");
  const [hint, setHint] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [missedHere, setMissedHere] = useState(false);
  const [masteredAtStart, setMasteredAtStart] = useState(0);

  // 記録の読み出しは描画後（静的書き出しなので初回描画と食い違わせない）
  useEffect(() => {
    const loaded = loadTensProgress();
    setProgress(loaded);
    setQuestions(generateTensQuestions(loaded));
    setMasteredAtStart(masteredPairs(loaded));
  }, []);

  if (progress === null || questions === null) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">
          じゅんびしています…
        </CardContent>
      </Card>
    );
  }

  const question = questions[index] ?? null;
  const digits = input.kind === "number" ? input.digits : "";

  function commit() {
    if (question === null || progress === null || digits === "") return;
    const message = diagnoseTens(question, Number(digits));

    if (message === null) {
      if (!missedHere) {
        setScore((s) => s + 1);
        const next = recordTensAnswer(progress, question.given, true);
        saveTensProgress(next);
        setProgress(next);
      }
      goNext();
      return;
    }

    if (phase === "retry") return;
    if (!missedHere) {
      const next = recordTensAnswer(progress, question.given, false);
      saveTensProgress(next);
      setProgress(next);
    }
    setHint(message);
    setMissedHere(true);
    setPhase("wrong");
    setInput({ kind: "number", digits: "" });
  }

  function goNext() {
    setInput({ kind: "number", digits: "" });
    setHint(null);
    setMissedHere(false);
    if (index + 1 >= questions!.length) setPhase("finished");
    else {
      setIndex((i) => i + 1);
      setPhase("asking");
    }
  }

  function restart() {
    const loaded = progress ?? {};
    setQuestions(generateTensQuestions(loaded));
    setIndex(0);
    setScore(0);
    setInput({ kind: "number", digits: "" });
    setHint(null);
    setMissedHere(false);
    setMasteredAtStart(masteredPairs(loaded));
    setPhase("asking");
  }

  if (phase === "finished") {
    const mastered = masteredPairs(progress);
    const gained = mastered - masteredAtStart;
    return (
      <Card className="mx-auto max-w-lg border-primary/30">
        <CardContent className="py-12 text-center">
          <p className="mb-2 text-sm font-medium text-muted-foreground">10のなかま・けっか</p>
          <p className="mb-1 text-5xl font-bold text-primary">
            {score} <span className="text-2xl text-foreground">/ {TENS_QUESTION_COUNT} もん</span>
          </p>
          <p className="mb-6 text-sm text-muted-foreground">1回で こたえられた もんだい</p>

          <div className="mb-6 rounded-xl bg-muted/60 px-4 py-3 text-sm">
            {gained > 0 ? (
              <p>
                あたらしく <span className="text-base font-bold text-primary">{gained}</span> こ
                おぼえた！
              </p>
            ) : (
              <p>もう一度 まわすと、おぼえた なかまが ふえていくよ</p>
            )}
            <p className="mt-1 text-muted-foreground">
              10のなかま：{mastered} / {TOTAL_PAIR_KEYS} こ
            </p>
          </div>

          <div className="mb-6">
            <PairMap progress={progress} />
          </div>

          <FinishActions onRestart={restart} />
          <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
            きろくはこの端末のブラウザにだけ保存されます。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {index + 1} / {questions.length} もん目
            </span>
            <span>
              おぼえた {masteredPairs(progress)} / {TOTAL_PAIR_KEYS} こ
            </span>
          </div>

          <p className="mb-4 text-center text-3xl font-bold">{question && promptOf(question)}</p>

          {question && (
            <div className="mb-4 flex justify-center">
              <TenFrame
                filled={question.given}
                label={`${question.given}こ ある。あと いくつ？`}
              />
            </div>
          )}

          {phase === "wrong" ? (
            <div className="text-center">
              <p className="mb-1 text-lg font-bold text-danger">ざんねん…</p>
              {hint && <p className="mb-3 text-sm font-medium text-foreground">{hint}</p>}
              <Button size="lg" onClick={() => setPhase("retry")}>
                もういちど うってみる
              </Button>
            </div>
          ) : (
            <>
              {phase === "retry" && hint && (
                <p className="mb-3 text-center text-sm font-medium text-muted-foreground">{hint}</p>
              )}
              <p className="mb-3 text-center text-3xl font-bold tabular-nums">
                {digits === "" ? "␣" : digits}
              </p>
              <NumberPad
                onDigit={(digit) => setInput((c) => appendDigit(c, digit, 2))}
                onBackspace={() => setInput((c) => backspace(c))}
                onPrimary={commit}
                primaryLabel="けってい"
                primaryEnabled={digits !== ""}
              />
            </>
          )}
        </CardContent>
      </Card>

      <PairMap progress={progress} />
    </div>
  );
}

/** 9つの なかま。**全部うまるのが見える**ようにいつも出しておく。 */
function PairMap({ progress }: { progress: TensProgress }) {
  return (
    <div className="rounded-2xl border p-3">
      <p className="mb-2 text-center text-xs font-bold text-muted-foreground">10の なかま</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {PARTNERS.map((n) => {
          const status = tensStatus(progress, n);
          return (
            <span
              key={n}
              className={cn(
                "rounded-lg border px-2 py-1 text-xs font-bold tabular-nums",
                status === "mastered"
                  ? "border-primary bg-primary/70 text-white"
                  : status === "learning"
                    ? "border-primary bg-primary/20 text-primary"
                    : status === "weak"
                      ? "border-danger bg-danger/10 text-danger"
                      : "border-border text-muted-foreground"
              )}
            >
              {n}と{10 - n}
            </span>
          );
        })}
      </div>
    </div>
  );
}
