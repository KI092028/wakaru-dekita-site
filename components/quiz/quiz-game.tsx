"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnswerSlot, valueLabel } from "@/components/quiz/answer-slot";
import { NumberPad } from "@/components/quiz/number-pad";
import { TimesTableGrid } from "@/components/quiz/times-table-grid";
import { ValueDisplay } from "@/components/quiz/value-display";
import { cn } from "@/lib/utils";
import {
  appendDigit,
  backspace,
  emptyInput,
  matchesAnswer,
  primaryAction,
  selectSlot,
  toValue,
  type AnswerInput,
  type Slot,
} from "@/lib/quiz/answer-input";
import { QUESTION_COUNT, buildQuestions, usesProgress } from "@/lib/quiz/build-questions";
import { diagnose } from "@/lib/quiz/diagnose";
import { isFraction } from "@/lib/quiz/fraction";
import {
  TOTAL_CELLS,
  loadProgress,
  masteredCount,
  recordAnswer,
  saveProgress,
  type Progress,
} from "@/lib/quiz/progress";
import type { Question, UnitSlug } from "@/lib/quiz/types";

/**
 * 3単元で共通の出題UI。
 *
 * 単元ごとに変わるのは「問題の作り方」と「九九マップを出すかどうか」だけで、
 * 入力・判定・言い回し・進み方はすべてここに集約している。
 *
 * 答えは選ばせず打たせる。選択肢から選ぶ再認より、自分で思い出す想起のほうが
 * 定着に効くという調査結果（docs/concept-review.md）にもとづく。
 */

/** 正解したあと、次の問題へ自動で進むまでの待ち時間。 */
const ADVANCE_DELAY_MS = 550;

/**
 * 解答の段階。
 * 間違えたときは正答を見せて終わりにせず、もう一度自分で入力させる（訂正的検索）。
 * 「答えを見て分かったつもり」で終わらせないため。
 */
type Phase = "answering" | "correct" | "wrong" | "retry";

type Props = {
  title: string;
  unit: UnitSlug;
};

export function QuizGame({ title, unit }: Props) {
  const showMap = usesProgress(unit);

  // localStorage は描画後にしか読めないため、読み込み前は null にしておく
  const [progress, setProgress] = useState<Progress | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [masteredAtStart, setMasteredAtStart] = useState(0);

  const [input, setInput] = useState<AnswerInput>({ kind: "number", digits: "" });
  const [phase, setPhase] = useState<Phase>("answering");
  const [hint, setHint] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimer.current !== null) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const saved = loadProgress();
    setProgress(saved);
    setQuestions(buildQuestions(unit, QUESTION_COUNT, saved));
    setMasteredAtStart(masteredCount(saved));
  }, [unit]);

  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  // 問題が変わったら入力欄を作り直す（整数なら1枠、分数なら2枠）
  useEffect(() => {
    const current = questions[index];
    if (current) setInput(emptyInput(current.answer));
  }, [index, questions]);

  const goNext = useCallback(() => {
    clearAdvanceTimer();
    setPhase("answering");
    setHint(null);
    setIndex((i) => i + 1);
  }, [clearAdvanceTimer]);

  const restart = useCallback(() => {
    clearAdvanceTimer();
    const current = progress ?? {};
    setQuestions(buildQuestions(unit, QUESTION_COUNT, current));
    setMasteredAtStart(masteredCount(current));
    setIndex(0);
    setScore(0);
    setPhase("answering");
    setHint(null);
  }, [clearAdvanceTimer, progress, unit]);

  if (progress === null || questions.length === 0) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">もんだいを準備しています…</CardContent>
      </Card>
    );
  }

  const mastered = masteredCount(progress);
  const isFinished = index >= questions.length;
  const question = questions[index];

  function record(current: Question, correct: boolean) {
    if (!showMap) return;
    if (isFraction(current.a) || isFraction(current.b)) return;
    const a = current.a;
    const b = current.b;
    setProgress((prev) => {
      const next = recordAnswer(prev ?? {}, a, b, correct);
      saveProgress(next);
      return next;
    });
  }

  function submit() {
    const typed = toValue(input);
    const correct = matchesAnswer(question.answer, typed);

    if (phase === "retry") {
      // 正答を見たあとの入力直し。得点や記録には影響させない
      if (correct) {
        setPhase("correct");
        advanceTimer.current = setTimeout(goNext, ADVANCE_DELAY_MS);
      } else {
        setShake((n) => n + 1);
        setInput(emptyInput(question.answer));
      }
      return;
    }

    if (correct) {
      setScore((s) => s + 1);
      setPhase("correct");
      advanceTimer.current = setTimeout(goNext, ADVANCE_DELAY_MS);
    } else {
      setHint(diagnose(question, typed));
      setPhase("wrong");
    }

    record(question, correct);
  }

  function handlePrimary() {
    const action = primaryAction(input);
    if (action === "advance") {
      setInput(selectSlot(input, "denominator"));
      return;
    }
    if (action === "submit") submit();
  }

  function handleSelectSlot(slot: Slot) {
    if (phase !== "answering" && phase !== "retry") return;
    setInput((current) => selectSlot(current, slot));
  }

  const action = primaryAction(input);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {showMap && (
        <Card>
          <CardContent className="py-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-sm font-bold">九九マップ</h2>
              <p className="text-sm text-muted-foreground">
                マスター <span className="text-base font-bold text-foreground">{mastered}</span> / {TOTAL_CELLS}
              </p>
            </div>

            <TimesTableGrid progress={progress} />

            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              きろくはこの端末のブラウザにだけ保存されます。
              <br />
              ほかの端末には引きつがれません。
            </p>
          </CardContent>
        </Card>
      )}

      {isFinished ? (
        <Card className="border-primary/30">
          <CardContent className="py-12 text-center">
            <p className="mb-2 text-sm font-medium text-muted-foreground">{title}・けっか</p>
            <p className="mb-4 text-5xl font-bold text-primary">
              {score} <span className="text-2xl text-foreground">/ {questions.length} もん</span>
            </p>
            {showMap && (
              <p className="mb-6 text-sm text-muted-foreground">
                {mastered > masteredAtStart
                  ? `あたらしく ${mastered - masteredAtStart} マス マスターしました`
                  : "マスターまであと少しです"}
                <br />
                のこり {TOTAL_CELLS - mastered} マス
              </p>
            )}
            <Button size="lg" onClick={restart}>
              もういちど挑戦する
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {index + 1} / {questions.length} もん目
              </span>
              <span>とくてん: {score}</span>
            </div>

            <p
              key={shake}
              className={cn(
                "mb-6 flex items-center justify-center gap-3 text-center text-4xl font-bold tracking-wide",
                shake > 0 && phase === "retry" && "wd-shake"
              )}
            >
              <ValueDisplay value={question.a} />
              <span>{question.op}</span>
              <ValueDisplay value={question.b} />
              <span>=</span>
              <AnswerSlot input={input} phase={phase} onSelectSlot={handleSelectSlot} />
            </p>

            {phase === "wrong" ? (
              <div className="text-center">
                <p className="mb-1 text-lg font-bold text-danger">ざんねん…</p>
                {hint && <p className="mb-2 text-sm font-medium text-foreground">{hint}</p>}
                <p className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  こたえは
                  <span className="text-lg font-bold text-foreground">
                    <ValueDisplay value={question.answer} />
                  </span>
                  です
                </p>
                <div>
                  <Button
                    size="lg"
                    onClick={() => {
                      setInput(emptyInput(question.answer));
                      setPhase("retry");
                    }}
                  >
                    もういちど うってみる
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {phase === "retry" && (
                  <p className="mb-4 inline-flex w-full items-center justify-center gap-1 text-center text-sm text-muted-foreground">
                    こたえは
                    <span className="font-bold text-foreground">
                      <ValueDisplay value={question.answer} />
                    </span>
                    。じぶんで うってみよう
                  </p>
                )}
                {phase === "correct" && (
                  <p className="wd-pop-in mb-4 text-center text-lg font-bold text-success">
                    せいかい！
                    <span className="sr-only">{valueLabel(question.answer)}</span>
                  </p>
                )}
                <NumberPad
                  onDigit={(digit) => setInput((current) => appendDigit(current, digit))}
                  onBackspace={() => setInput((current) => backspace(current))}
                  onPrimary={handlePrimary}
                  primaryLabel={action === "advance" ? "ぶんぼへ" : "けってい"}
                  primaryEnabled={action !== "none"}
                  disabled={phase === "correct"}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
