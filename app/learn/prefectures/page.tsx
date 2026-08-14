import type { Metadata } from "next";
import Link from "next/link";

import { GeoGame } from "@/components/geo/geo-game";

export const metadata: Metadata = {
  title: "都道府県 | わかる・できる",
  description:
    "47都道府県の位置を地図の上でさがして覚える無料ゲーム。近い県を押したときは「同じ地方だよ」、はなれた県のときは「もっと北のほうだよ」と方角が返ります。地方ごとの練習もできます。",
};

export default function PrefecturesPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">都道府県</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          社会・4年生〜／地図の上で さがして おぼえる
        </p>
        <GeoGame />
      </div>
    </main>
  );
}
