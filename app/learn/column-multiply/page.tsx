import type { Metadata } from "next";
import Link from "next/link";

import { MultiplyGame } from "@/components/multiply/multiply-game";

export const metadata: Metadata = {
  title: "かけ算のひっ算 | わかる・できる",
  description:
    "小学3〜4年生向け、かけ算のひっ算を無料でれんしゅうできます。九九・くり上がり・2だんめをひとつ左にずらす、という手順を1手ずつ進められます。",
};

export default function ColumnMultiplyPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">かけ算のひっ算</h1>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          3〜4年生向け・2だんめは ひとつ 左から 書きはじめる
        </p>
        <MultiplyGame />
      </div>
    </main>
  );
}
