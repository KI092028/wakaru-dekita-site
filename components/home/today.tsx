"use client";

import { useEffect, useState } from "react";

import { UnitCard } from "@/components/learn/unit-card";
import { unitOfDay } from "@/lib/quiz/units";
import type { QuizUnit } from "@/lib/quiz/types";

/**
 * きょうの1単元。
 *
 * ## なぜ置くか
 *
 * 単元が増えるほど、**「どれをやればいいか分からない」で止まる人が増える。**
 * えらばなくていい入口を1つ作っておく。
 *
 * ## なぜ日付で決めるか
 *
 * 開くたびに変わるくじ引きにはしない。その日のうちは同じものが出るので、
 * 「きょうはこれ」と決まっていることになる。ついでに、
 * **あすは別のものになる**ので、また来る理由にもなる。
 *
 * ## なぜ useEffect で読むか
 *
 * 静的書き出しなので、ビルドしたときの日付でHTMLが固まってしまう。
 * 端末の時計で決めないと、公開した日の単元がずっと出つづける。
 */
export function Today() {
  const [unit, setUnit] = useState<QuizUnit | null>(null);

  useEffect(() => {
    setUnit(unitOfDay(new Date()));
  }, []);

  return (
    <section className="border-y bg-muted py-10">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-bold tracking-wide text-muted-foreground">きょうの 1つ</h2>
          <p className="text-xs text-muted-foreground">毎日 入れかわります</p>
        </div>

        {/* 読み込み前は同じ高さの箱を出す。カードが後から現れて画面が跳ねないように */}
        {unit ? (
          <UnitCard unit={unit} />
        ) : (
          <div className="h-[9.5rem] animate-pulse rounded-2xl border border-primary/20 bg-white" />
        )}
      </div>
    </section>
  );
}
