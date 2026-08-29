"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LetterPad } from "@/components/romaji/letter-pad";
import { RomajiTable } from "@/components/romaji/romaji-table";
import { cn } from "@/lib/utils";

import { ROMAJI_QUESTION_COUNT, generateRomajiSet } from "@/lib/romaji/generate";
import {
  learningCount,
  loadRomajiProgress,
  masteredCount,
  record,
  saveRomajiProgress,
  TOTAL_KANA,
  type RomajiProgress,
} from "@/lib/romaji/progress";
import { judge } from "@/lib/romaji/steps";
import type { RomajiEntry } from "@/lib/romaji/table";

/**
 * ローマ字ドリル。1セット10問。
 *
 * かなを見て、ローマ字で打つ。**訓令式もヘボン式も正解**にして、
 * 「学校でならうのはこちら」を1行そえる。
 * 消すべきなのは書き方の片方ではなく、混乱のほうなので。
 */

type Phase = "typing" | "correct" | "alternate" | "wrong";

export function RomajiGame() {
  const [progress, setProgress] = useState<RomajiProgress | null>(null);
  const [questions, setQuestions] = useState<RomajiEntry[] | null>(null);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [note, setNote] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // 保存されたものは端末の時計・保存領域に依るので、必ず useEffect の中で読む
  useEffect(() => {
    const loaded = loadRomajiProgress();
    setProgress(loaded);
    setQuestions(generateRomajiSet(loaded));
  }, []);

  const question = questions?.[index] ?? null;
  const finished = questions !== null && index >= questions.length;

  function restart() {
    const loaded = loadRomajiProgress();
    setProgress(loaded);
    setQuestions(generateRomajiSet(loaded));
    setIndex(0);
    setTyped("");
    setPhase("typing");
    setNote(null);
    setScore(0);
  }

  if (progress === null || questions === null) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">
          もんだいを じゅんびしています…
        </CardContent>
      </Card>
    );
  }

  if (finished) {
    return <Result progress={progress} score={score} onRestart={restart} />;
  }

  if (question === null) return null;

  function commit() {
    if (question === null || progress === null || typed === "") return;
    const result = judge(question, typed);
    const correct = result.kind !== "wrong";

    const next = record(progress, question.kana, correct);
    setProgress(next);
    saveRomajiProgress(next);

    if (correct) setScore((n) => n + 1);
    setNote(result.kind === "correct" ? null : result.kind === "alternate" ? result.note : result.message);
    setPhase(result.kind === "wrong" ? "wrong" : result.kind);
  }

  function nextQuestion() {
    setIndex((i) => i + 1);
    setTyped("");
    setPhase("typing");
    setNote(null);
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
              おぼえた {masteredCount(progress)} / {TOTAL_KANA} 字
            </span>
          </div>

          <p className="mb-1 text-center text-sm text-muted-foreground">この字を ローマ字で</p>
          <p className="mb-4 text-center text-6xl font-bold">{question.kana}</p>

          <p
            className={cn(
              "mb-4 min-h-[2.5rem] text-center text-4xl font-bold lowercase tracking-widest",
              phase === "wrong" && "text-danger line-through decoration-2",
              (phase === "correct" || phase === "alternate") && "text-success",
              typed === "" && "text-muted-foreground/30"
            )}
          >
            {typed === "" ? "␣" : typed}
          </p>

          {phase === "typing" ? (
            <LetterPad
              onLetter={(letter) => setTyped((t) => (t.length >= 4 ? t : t + letter))}
              onBackspace={() => setTyped((t) => t.slice(0, -1))}
              onSubmit={commit}
              submitEnabled={typed !== ""}
            />
          ) : (
            <div className="text-center">
              <p
                className={cn(
                  "mb-2 text-lg font-bold",
                  phase === "wrong" ? "text-danger" : "text-success"
                )}
              >
                {phase === "wrong" ? "ざんねん…" : phase === "alternate" ? "それも 正かい！" : "せいかい！"}
              </p>
              {phase === "wrong" && (
                <p className="mb-2 text-2xl font-bold lowercase tracking-widest text-success">
                  {question.main}
                </p>
              )}
              {note && <p className="mb-4 text-balance text-sm text-muted-foreground">{note}</p>}
              <Button size="lg" onClick={nextQuestion}>
                {index + 1 >= questions.length ? "けっかを見る" : "つぎへ"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5">
          <p className="mb-3 text-center text-xs font-bold text-muted-foreground">
            ローマ字ひょう（46字）
          </p>
          <RomajiTable progress={progress} highlight={question.kana} />
        </CardContent>
      </Card>
    </div>
  );
}

function Result({
  progress,
  score,
  onRestart,
}: {
  progress: RomajiProgress;
  score: number;
  onRestart: () => void;
}) {
  const done = masteredCount(progress);
  const learning = learningCount(progress);
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card className="border-primary/30">
        <CardContent className="py-12 text-center">
          <p className="mb-2 text-sm font-medium text-muted-foreground">ローマ字・けっか</p>
          <p className="mb-1 text-5xl font-bold text-primary">
            {score}{" "}
            <span className="text-2xl text-foreground">/ {ROMAJI_QUESTION_COUNT} もん</span>
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            おぼえた字は {done} / {TOTAL_KANA}
          </p>

          {done >= TOTAL_KANA ? (
            <p className="mb-6 text-sm font-bold text-success">46字 ぜんぶ おぼえました！</p>
          ) : (
            <p className="mb-6 text-balance text-sm text-muted-foreground">
              {learning > 0 && `あと1回で おぼえた に なる字が ${learning}字。`}
              同じ字を 2回 つづけて 書けたら「おぼえた」に なるよ
            </p>
          )}

          <Button size="lg" onClick={onRestart}>
            もういちど挑戦する
          </Button>

          <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
            きろくはこの端末のブラウザにだけ保存されます。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5">
          <p className="mb-3 text-center text-xs font-bold text-muted-foreground">
            ローマ字ひょう（46字）
          </p>
          <RomajiTable progress={progress} />
        </CardContent>
      </Card>
    </div>
  );
}
