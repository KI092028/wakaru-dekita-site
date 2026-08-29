import type { Metadata } from "next";
import Link from "next/link";

import { DecimalGame } from "@/components/decimal/decimal-game";

export const metadata: Metadata = {
  title: "小数のかけ算・わり算（大きくなる？小さくなる？） | わかる・できる",
  description:
    "6×0.8は6より小さく、6÷0.8は6より大きい。計算する前に答えの向きを数直線で決めてから計算します。登録不要・完全無料。",
};

export default function DecimalSizePage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold">小数のかけ算・わり算</h1>
        <p className="mb-8 text-balance text-center text-muted-foreground">
          計算する前に、大きくなるのか 小さくなるのかを 決めよう。
        </p>
        <DecimalGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            「かけたら大きくなる」「わったら小さくなる」——整数だけを見てきた3年ぶんの経験が、
            そのまま思い込みになっています。だから
            <strong className="font-bold text-foreground">6×0.8＝4.8</strong>や
            <strong className="font-bold text-foreground">6÷0.8＝7.5</strong>
            が受け入れられません。
          </p>
          <p className="mt-3">
            やっかいなのは、計算のしかた自体は教わったとおりにできることです。
            できるのに、出てきた答えを見て「まちがえた」と思って消してしまう。
            文章題になると、そもそもかけ算かわり算かを選べなくなります。
          </p>
          <p className="mt-3">
            そこでこの単元では、
            <strong className="font-bold text-foreground">計算する前に向きを決めさせます。</strong>
            分度器で「だいたい何度か」を先に見当づけるのと同じ形です。
            先に計算させてしまうと、思い込みは表に出てこないまま素通りします。
          </p>
          <p className="mt-3">
            4問は「かけたのに小さくなる」「かけて大きくなる」「わったのに大きくなる」
            「わって小さくなる」の順です。
            <strong className="font-bold text-foreground">
              思い込みどおりになる形も必ず入れています。
            </strong>
            逆になる形だけを見せると、こんどは「小数のときはいつも逆」という
            新しい思い込みに変わってしまうからです。最後に4行の表が並びます。
          </p>
          <p className="mt-3">
            場面はすべて「1mあたり」の形にそろえてあります。
            小数をかける・わる意味が通るのはこの形のときで、
            「3人に配る」のような場面では0.8人が出てきてしまうためです。
          </p>
        </div>
      </div>
    </main>
  );
}
