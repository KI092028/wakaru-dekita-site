"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ValueDisplay } from "@/components/quiz/value-display";
import { cn } from "@/lib/utils";
import { valueKey } from "@/lib/quiz/fraction";
import { generateAddSubQuestions } from "@/lib/quiz/generate-add-sub";
import { generateFractionsQuestions } from "@/lib/quiz/generate-fractions";
import { generateTimesTableQuestions } from "@/lib/quiz/generate-times-table";
import type { Question } from "@/lib/quiz/types";

const QUESTION_COUNT = 10;

// Server pages cannot pass functions to client components, so generators are
// resolved here from the unit slug.
const generators = {
  "add-sub": generateAddSubQuestions,
  "times-table": generateTimesTableQuestions,
  fractions: generateFractionsQuestions,
} satisfies Record<string, (count: number) => Question[]>;

type Props = {
  title: string;
  unit: keyof typeof generators;
};

export function QuizApp({ title, unit }: Props) {
  const generateQuestions = generators[unit];
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(generateQuestions(QUESTION_COUNT));
  }, [generateQuestions]);

  function restart() {
    setQuestions(generateQuestions(QUESTION_COUNT));
    setIndex(0);
    setScore(0);
    setSelectedKey(null);
  }

  function selectChoice(key: string) {
    if (selectedKey !== null) return;
    setSelectedKey(key);
    if (key === valueKey(questions[index].answer)) {
      setScore((s) => s + 1);
    }
  }

  function next() {
    setSelectedKey(null);
    setIndex((i) => i + 1);
  }

  if (questions.length === 0) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">もんだいを準備しています…</CardContent>
      </Card>
    );
  }

  const isFinished = index >= questions.length;

  if (isFinished) {
    return (
      <Card className="mx-auto max-w-lg border-primary/30">
        <CardContent className="py-12 text-center">
          <p className="mb-2 text-sm font-medium text-muted-foreground">{title}・けっか</p>
          <p className="mb-6 text-5xl font-bold text-primary">
            {score} <span className="text-2xl text-foreground">/ {questions.length} もん</span>
          </p>
          <Button size="lg" onClick={restart}>
            もういちど挑戦する
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[index];
  const answerKey = valueKey(question.answer);
  const showResult = selectedKey !== null;
  const isCorrect = selectedKey === answerKey;

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="py-10">
        <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {index + 1} / {questions.length} もん目
          </span>
          <span>とくてん: {score}</span>
        </div>

        <p className="mb-8 flex items-center justify-center gap-2 text-center text-4xl font-bold tracking-wide">
          {question.terms.map((term, i) =>
            typeof term === "string" ? (
              <span key={i}>{term}</span>
            ) : (
              <ValueDisplay key={i} value={term} />
            )
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
                onClick={() => selectChoice(key)}
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
              {isCorrect ? (
                "せいかい！"
              ) : (
                <span className="inline-flex items-center gap-1">
                  ざんねん…答えは <ValueDisplay value={question.answer} />
                </span>
              )}
            </p>
            <Button size="lg" onClick={next}>
              つぎへ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
