import type { Metadata } from "next";
import Link from "next/link";

import { QuizGame } from "@/components/quiz/quiz-game";

export const metadata: Metadata = {
  title: "たし算・ひき算ドリル | わかる・できる",
  description: "小学1〜2年生向け、20までのかずのたし算・ひき算をれんしゅうできる無料ドリルです。",
};

export default function AddSubPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/learn" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">たし算・ひき算</h1>
        <p className="mb-10 text-center text-sm text-muted-foreground">1〜2年生向け・20までのかず</p>
        <QuizGame title="たし算・ひき算" unit="add-sub" />
      </div>
    </main>
  );
}
