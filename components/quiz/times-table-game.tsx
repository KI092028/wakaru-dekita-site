"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NumberPad } from "@/components/quiz/number-pad";
import { TimesTableGrid } from "@/components/quiz/times-table-grid";
import { cn } from "@/lib/utils";
import {
  TOTAL_CELLS,
  loadProgress,
  masteredCount,
  pickCells,
  recordAnswer,
  saveProgress,
  type Progress,
} from "@/lib/quiz/progress";

const QUESTION_COUNT = 10;

/** 正解したあと、次の問題へ自動で進むまでの待ち時間。 */
const ADVANCE_DELAY_MS = 550;

/** これ以上つながったら「◯れんぞく」を出す。 */
const COMBO_THRESHOLD = 2;

/** 答えは 1〜81 なので 2桁まで。 */
const MAX_DIGITS = 2;

type Round = { a: number; b: number; answer: number };

/**
 * 解答の段階。
 * 間違えたときは正答を見せて終わりにせず、もう一度自分で入力させる（訂正的検索）。
 * 「答えを見て分かったつもり」で終わらせないため。
 */
type Phase = "answering" | "correct" | "wrong" | "retry";

function buildRounds(progress: Progress): Round[] {
  return pickCells(progress, QUESTION_COUNT).map(([a, b]) => ({ a, b, answer: a * b }));
}

export function TimesTableGame() {
  // localStorage は描画後にしか読めないため、読み込み前は null にしておく
  const [progress, setProgress] = useState<Progress | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [masteredAtStart, setMasteredAtStart] = useState(0);

  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
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
    setRounds(buildRounds(saved));
    setMasteredAtStart(masteredCount(saved));
  }, []);

  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  const goNext = useCallback(() => {
    clearAdvanceTimer();
    setInput("");
    setPhase("answering");
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
    setInput("");
    setPhase("answering");
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
  const round = rounds[index];

  function appendDigit(digit: string) {
    // 先頭に 0 は入れさせない（答えは 1 以上）
    if (input === "" && digit === "0") return;
    if (input.length >= MAX_DIGITS) return;
    setInput((v) => v + digit);
  }

  function submit() {
    if (input === "") return;
    const correct = Number(input) === round.answer;

    if (phase === "retry") {
      // 正答を見たあとの入力直し。得点や記録には影響させない
      if (correct) {
        advanceTimer.current = setTimeout(goNext, ADVANCE_DELAY_MS);
        setPhase("correct");
      } else {
        setShake((n) => n + 1);
        setInput("");
      }
      return;
    }

    if (correct) {
      setScore((s) => s + 1);
      setCombo((c) => {
        const next = c + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
      setPhase("correct");
      advanceTimer.current = setTimeout(goNext, ADVANCE_DELAY_MS);
    } else {
      setCombo(0);
      setPhase("wrong");
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
        <Card>
          <CardContent className="py-8">
            <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {index + 1} / {rounds.length} もん目
              </span>
              <span className="flex items-center gap-3">
                {combo >= COMBO_THRESHOLD && phase !== "wrong" && (
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
              key={shake}
              className={cn(
                "mb-6 flex items-center justify-center gap-3 text-center text-4xl font-bold tracking-wide",
                shake > 0 && phase === "retry" && "wd-shake"
              )}
            >
              <span>{round.a}</span>
              <span>×</span>
              <span>{round.b}</span>
              <span>=</span>
              <AnswerSlot value={input} phase={phase} answer={round.answer} />
            </p>

            {phase === "wrong" ? (
              <div className="text-center">
                <p className="mb-1 text-lg font-bold text-danger">ざんねん…</p>
                <p className="mb-6 text-sm text-muted-foreground">
                  こたえは <span className="text-lg font-bold text-foreground">{round.answer}</span> です
                </p>
                <Button
                  size="lg"
                  onClick={() => {
                    setInput("");
                    setPhase("retry");
                  }}
                >
                  もういちど うってみる
                </Button>
              </div>
            ) : (
              <>
                {phase === "retry" && (
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    こたえは <span className="font-bold text-foreground">{round.answer}</span>。じぶんで うってみよう
                  </p>
                )}
                {phase === "correct" && (
                  <p className="wd-pop-in mb-4 text-center text-lg font-bold text-success">せいかい！</p>
                )}
                <NumberPad
                  onDigit={appendDigit}
                  onBackspace={() => setInput((v) => v.slice(0, -1))}
                  onSubmit={submit}
                  canSubmit={input !== ""}
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

/** 答えを入れる欄。入力前は下線だけを見せる。 */
function AnswerSlot({ value, phase, answer }: { value: string; phase: Phase; answer: number }) {
  if (phase === "wrong") {
    return <span className="text-danger line-through decoration-2">{value}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-[2.2ch] justify-center border-b-4 pb-0.5",
        phase === "correct" ? "wd-correct border-success text-success" : "border-input",
        value === "" && "text-muted-foreground/40"
      )}
    >
      {value === "" ? "?" : value}
      <span className="sr-only">{phase === "correct" ? `せいかい ${answer}` : ""}</span>
    </span>
  );
}
