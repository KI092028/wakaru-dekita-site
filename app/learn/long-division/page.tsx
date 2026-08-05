import type { Metadata } from "next";
import Link from "next/link";

import { LongDivisionGame } from "@/components/division/long-division-game";

export const metadata: Metadata = {
  title: "わり算のひっ算 | わかる・できる",
  description:
    "小学3〜4年生向け、1けたでわるわり算のひっ算を無料でれんしゅうできます。たてる・かける・ひく・おろすを1手ずつ進めながら、どこでつまずいているかが分かります。",
};

export default function LongDivisionPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/learn" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">わり算のひっ算</h1>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          3〜4年生向け・たてる → かける → ひく → おろす
        </p>
        <LongDivisionGame />
      </div>
    </main>
  );
}
