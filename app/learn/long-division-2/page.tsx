import type { Metadata } from "next";
import Link from "next/link";

import { LongDivisionGame } from "@/components/division/long-division-game";

export const metadata: Metadata = {
  title: "わり算のひっ算（2けたでわる） | わかる・できる",
  description:
    "小学4年生向け、2けたでわるわり算のひっ算を無料でれんしゅうできます。わる数をがい数にして仮の商の見当をつけ、合わなければ1つ増減する手順を1手ずつ進められます。",
};

export default function LongDivisionTwoDigitPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/learn" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">わり算のひっ算（2けたでわる）</h1>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          4年生向け・がい数で 見当を つけて、合わなければ ひとつ 増減する
        </p>
        <p className="mb-10 text-center text-xs text-muted-foreground">
          1けたでわるひっ算が まだのときは{" "}
          <Link href="/learn/long-division" className="font-bold text-primary underline">
            こちら
          </Link>
          から
        </p>
        <LongDivisionGame level="two-digit" />
      </div>
    </main>
  );
}
