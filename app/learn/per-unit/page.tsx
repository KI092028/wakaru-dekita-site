import type { Metadata } from "next";
import Link from "next/link";

import { RateGame } from "@/components/rate/rate-game";

export const metadata: Metadata = {
  title: "単位量あたりの大きさ | わかる・できる",
  description:
    "小学5年生向け、単位量あたりの大きさを無料でれんしゅうできます。二重数直線のしるしを動かして「1つ分にそろえる」ことから始め、こみぐあい・こさ・速さをくらべます。差でくらべる考え方から抜け出すための問題を入れています。",
};

export default function PerUnitPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">単位量あたりの大きさ</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          5年生向け・1つ分に そろえて くらべる
        </p>
        <RateGame />
      </div>
    </main>
  );
}
