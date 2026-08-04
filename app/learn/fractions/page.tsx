import type { Metadata } from "next";
import Link from "next/link";

import { QuizGame } from "@/components/quiz/quiz-game";

export const metadata: Metadata = {
  title: "分数ドリル | わかる・できる",
  description:
    "小学4〜5年生向け、分数のたし算・ひき算をれんしゅうできる無料ドリルです。同分母から、通分・約分が必要な問題まで少しずつ進みます。",
};

export default function FractionsPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/learn" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">分数</h1>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          4〜5年生向け・通分と約分にちょうせん
        </p>
        <QuizGame title="分数" unit="fractions" />
      </div>
    </main>
  );
}
