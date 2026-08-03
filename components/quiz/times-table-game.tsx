"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TimesTableGrid } from "@/components/quiz/times-table-grid";
import { ValueDisplay } from "@/components/quiz/value-display";
import { cn } from "@/lib/utils";
import { buildTimesTableQuestion } from "@/lib/quiz/generate-times-table";
import { valueKey } from "@/lib/quiz/fraction";
import {
  TOTAL_CELLS,
  loadProgress,
  masteredCount,
  pickCells,
  recordAnswer,
  saveProgress,
  type Progress,
} from "@/lib/quiz/progress";
import type { Question } from "@/lib/quiz/types";

const QUESTION_COUNT = 10;

/** 正解したあと、次の問題へ自動で進むまでの待ち時間。長くするとテンポが落ちる。 */
const ADVANCE_DELAY_MS = 500;

/** これ以上つながったら「◯れんぞく」を出す。 */
const COMBO_THRESHOLD = 2;

/** 出題した問題と、その元になったマス。解答時に進捗へ記録するため対で持つ。 */
type Round = { question: Question; a: number; b: number };

function buildRounds(progress: Progress): Round[] {
  return pickCells(progress, QUESTION_COUNT).map(([a, b], i) => ({
    a,
    b,
    question: buildTimesTableQuestion(a, b, `times-table-${i}`),
  }));
}

export function TimesTableGame() {
  // localStorage は描画後にしか読めないため、読み込み前は null にしておく
  const [progress, setProgress] = useState<Progress | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [masteredAtStart, setMasteredAtStart] = useState(0);

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
    setRounds(buildRounds(saved));
    setMasteredAtStart(masteredCount(saved));
  }, []);

  // 画面を離れたときにタイマーが残らないようにする
  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  const goNext = useCallback(() => {
    clearAdvanceTimer();
    setSelectedKey(null);
    setIndex((i) => i + 1);
  }, [clearAdvanceTimer]);

  const restart = useCallback(() => {
    clearAdvanceTimer();
    const current = progress ?? {};
    setRounds(buildRounds(current));
    setMasteredAtStart(masteredCount(current));
    setIndex(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setSelectedKey(null);
  }, [clearAdvanceTimer, progress]);

  if (progress === null || rounds.length === 0) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">もんだいを準備しています…</CardContent>
      </Card>
    );
  }

  const mastered = masteredCount(progress);
  const isFinished = index >= rounds.length;

  function selectChoice(key: string) {
    if (selectedKey !== null) return;

    const round = rounds[index];
    const correct = key === valueKey(round.question.answer);

    setSelectedKey(key);

    if (correct) {
      setScore((s) => s + 1);
      setCombo((c) => {
        const next = c + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
      // 正解なら手を止めさせない。演出だけ見せて自動で次へ進む
      advanceTimer.current = setTimeout(goNext, ADVANCE_DELAY_MS);
    } else {
      // 間違えたときは考える時間が要るので、自分で「つぎへ」を押してもらう
      setCombo(0);
    }

    setProgress((prev) => {
      const next = recordAnswer(prev ?? {}, round.a, round.b, correct);
      saveProgress(next);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
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

      {isFinished ? (
        <Card className="border-primary/30">
          <CardContent className="py-12 text-center">
            <p className="mb-2 text-sm font-medium text-muted-foreground">九九・けっか</p>
            <p className="mb-4 text-5xl font-bold text-primary">
              {score} <span className="text-2xl text-foreground">/ {rounds.length} もん</span>
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {bestCombo >= COMBO_THRESHOLD && (
                <>
                  さいこう {bestCombo} れんぞく
                  <br />
                </>
              )}
              {mastered > masteredAtStart
                ? `あたらしく ${mastered - masteredAtStart} マス マスターしました`
                : "マスターまであと少しです"}
              <br />
              のこり {TOTAL_CELLS - mastered} マス
            </p>
            <Button size="lg" onClick={restart}>
              もういちど挑戦する
            </Button>
          </CardContent>
        </Card>
      ) : (
        <QuestionCard
          round={rounds[index]}
          questionNumber={index + 1}
          total={rounds.length}
          score={score}
          combo={combo}
          selectedKey={selectedKey}
          onSelect={selectChoice}
          onNext={goNext}
        />
      )}
    </div>
  );
}

function QuestionCard({
  round,
  questionNumber,
  total,
  score,
  combo,
  selectedKey,
  onSelect,
  onNext,
}: {
  round: Round;
  questionNumber: number;
  total: number;
  score: number;
  combo: number;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onNext: () => void;
}) {
  const { question } = round;
  const answerKey = valueKey(question.answer);
  const showResult = selectedKey !== null;
  const isCorrect = selectedKey === answerKey;

  return (
    <Card>
      <CardContent className="py-10">
        <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {questionNumber} / {total} もん目
          </span>
          <span className="flex items-center gap-3">
            {combo >= COMBO_THRESHOLD && (
              <span
                key={combo}
                className="wd-pop-in rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary"
              >
                {combo} れんぞく
              </span>
            )}
            <span>とくてん: {score}</span>
          </span>
        </div>

        <p
          className={cn(
            "mb-8 flex items-center justify-center gap-2 text-center text-4xl font-bold tracking-wide",
            showResult && !isCorrect && "wd-shake"
          )}
        >
          {question.terms.map((term, i) =>
            typeof term === "string" ? <span key={i}>{term}</span> : <ValueDisplay key={i} value={term} />
          )}
          <span>=</span>
          <span>?</span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          {question.choices.map((choice) => {
            const key = valueKey(choice);
            const isCorrectChoice = key === answerKey;
            const isSelected = key === selectedKey;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                disabled={showResult}
                className={cn(
                  "flex h-16 items-center justify-center rounded-2xl border-2 text-2xl font-bold transition-colors disabled:cursor-default",
                  !showResult && "border-input bg-background hover:border-primary hover:bg-primary/5",
                  showResult && isCorrectChoice && "border-success bg-success/10 text-success",
                  showResult && isSelected && isCorrectChoice && "wd-correct",
                  showResult && isSelected && !isCorrectChoice && "border-danger bg-danger/10 text-danger",
                  showResult && !isSelected && !isCorrectChoice && "border-input opacity-50"
                )}
              >
                <ValueDisplay value={choice} />
              </button>
            );
          })}
        </div>

        {/* 正解のときは自動で次へ進むため、ボタンは出さない */}
        {showResult && isCorrect && (
          <p className="wd-pop-in mt-8 text-center text-lg font-bold text-success">せいかい！</p>
        )}

        {showResult && !isCorrect && (
          <div className="mt-8 text-center">
            <p className="mb-4 inline-flex items-center gap-1 text-lg font-bold text-danger">
              ざんねん…答えは <ValueDisplay value={question.answer} />
            </p>
            <Button size="lg" onClick={onNext}>
              つぎへ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
