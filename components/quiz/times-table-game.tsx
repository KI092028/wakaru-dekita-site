"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [masteredAtStart, setMasteredAtStart] = useState(0);

  useEffect(() => {
    const saved = loadProgress();
    setProgress(saved);
    setRounds(buildRounds(saved));
    setMasteredAtStart(masteredCount(saved));
  }, []);

  const restart = useCallback(() => {
    const current = progress ?? {};
    setRounds(buildRounds(current));
    setMasteredAtStart(masteredCount(current));
    setIndex(0);
    setScore(0);
    setSelectedKey(null);
  }, [progress]);

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
    if (correct) setScore((s) => s + 1);

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
            きろくはこの端末のブラウザにだけ保存されます。<br />
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
          selectedKey={selectedKey}
          onSelect={selectChoice}
          onNext={() => {
            setSelectedKey(null);
            setIndex((i) => i + 1);
          }}
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
  selectedKey,
  onSelect,
  onNext,
}: {
  round: Round;
  questionNumber: number;
  total: number;
  score: number;
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
          <span>とくてん: {score}</span>
        </div>

        <p className="mb-8 flex items-center justify-center gap-2 text-center text-4xl font-bold tracking-wide">
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
                  showResult && isSelected && !isCorrectChoice && "border-danger bg-danger/10 text-danger",
                  showResult && !isSelected && !isCorrectChoice && "border-input opacity-50"
                )}
              >
                <ValueDisplay value={choice} />
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="mt-8 text-center">
            <p className={cn("mb-4 text-lg font-bold", isCorrect ? "text-success" : "text-danger")}>
              {isCorrect ? "せいかい！" : `ざんねん…答えは ${question.answer}`}
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
