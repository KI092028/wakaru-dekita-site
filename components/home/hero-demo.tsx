"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { NumberPad } from "@/components/quiz/number-pad";
import { cn } from "@/lib/utils";
import { appendDigit, backspace, type AnswerInput } from "@/lib/quiz/answer-input";
import { generateAddSubQuestions } from "@/lib/quiz/generate-add-sub";
import type { Question } from "@/lib/quiz/types";

/**
 * トップページで、その場で1問解けるカード。
 *
 * ここは**本物のアプリ**であって、見本の絵ではない。
 * 数字キーパッドも判定も、たし算・ひき算の単元と同じものを使っている。
 * 「こういう感じです」と絵で見せるより、1問解いてもらうほうが早いし、
 * 見せている画面と実際の画面が食い違う心配もない。
 *
 * かつてここには4択の絵が置いてあったが、4択は全廃したので
 * **もう存在しない画面を宣伝している**状態になっていた。
 */

const EMPTY: AnswerInput = { kind: "number", digits: "" };

/**
 * 単元と同じ生成器から引くが、**10をまたぐ問題を選ぶ。**
 * 「1 + 1」が出ると、この単元で何を練習するのかが伝わらないため。
 * 作っているのは本物の問題で、その中から見せる1問を選んでいるだけ。
 */
function pickShowcase(): Question {
  const drawn = generateAddSubQuestions(12);
  const crossesTen = drawn.find((q) => {
    const [a, b] = [Number(q.a), Number(q.b)];
    return q.op === "+" ? a + b > 10 && a > 1 && b > 1 : a > 10 && b > 1;
  });
  return crossesTen ?? drawn[0];
}

export function HeroDemo() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState<AnswerInput>(EMPTY);
  const [state, setState] = useState<"answering" | "wrong" | "correct">("answering");

  // 出題は乱数を使うため、描画後に行う（サーバー側の出力と食い違わせない）
  useEffect(() => {
    setQuestion(pickShowcase());
  }, []);

  const digits = input.kind === "number" ? input.digits : "";

  function submit() {
    if (question === null || digits === "") return;
    setState(Number(digits) === question.answer ? "correct" : "wrong");
  }

  function retry() {
    setInput(EMPTY);
    setState("answering");
  }

  return (
    <div className="rounded-2xl border bg-background p-6 shadow-sm">
      <p className="mb-1 text-center text-xs font-bold text-primary">その場で 1もん やってみる</p>
      <p className="mb-4 text-center text-xs text-muted-foreground">たし算・ひき算（1〜2年生）</p>

      <p className="mb-5 text-center text-4xl font-bold tabular-nums">
        {question === null ? (
          <span className="text-muted-foreground/40">…</span>
        ) : (
          <>
            {String(question.a)} {question.op} {String(question.b)} ={" "}
            <span
              className={cn(
                state === "wrong" && "text-danger line-through decoration-2",
                state === "correct" && "text-success",
                state === "answering" && "text-primary"
              )}
            >
              {digits === "" ? "?" : digits}
            </span>
          </>
        )}
      </p>

      {state === "correct" ? (
        <div className="text-center">
          <p className="wd-pop-in mb-4 text-lg font-bold text-success">せいかい！</p>
          <Button asChild size="lg" className="w-full">
            <Link href="/learn/add-sub">このつづきを やってみる</Link>
          </Button>
        </div>
      ) : state === "wrong" ? (
        <div className="text-center">
          <p className="mb-1 text-sm font-bold text-danger">ざんねん…</p>
          <p className="mb-4 text-sm text-muted-foreground">
            こたえは <span className="font-bold text-foreground">{String(question?.answer)}</span>
          </p>
          <Button size="lg" className="w-full" onClick={retry}>
            もういちど うってみる
          </Button>
        </div>
      ) : (
        <NumberPad
          onDigit={(digit) => setInput((c) => appendDigit(c, digit))}
          onBackspace={() => setInput((c) => backspace(c))}
          onPrimary={submit}
          primaryLabel="けってい"
          primaryEnabled={digits !== ""}
          disabled={question === null}
        />
      )}
    </div>
  );
}
