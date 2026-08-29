import type { Metadata } from "next";
import Link from "next/link";

import { RecBrowser } from "@/components/teachers/rec-browser";
import { recActivities } from "@/lib/rec/activities";

export const metadata: Metadata = {
  title: "すきま時間の学級レク | わかる・できる",
  description:
    "授業の残り5分、給食の待ち時間にそのまま使える学級レクだけを集めました。準備物なし・教室で成立・説明30秒のものに絞ってあります。時間と声の大きさで絞り込めます。",
};

export default function RecListPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/teachers"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground print:hidden"
        >
          ← 先生の方へ
        </Link>

        <h1 className="mb-3 text-2xl font-bold sm:text-3xl">すきま時間の学級レク</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          授業の残り5分、給食の待ち時間、雨の日の休み時間に、そのまま使えるものだけを集めました。
          <strong className="font-bold text-foreground">
            5分以内・準備物は黒板まで・教室で成立・説明が30秒で済む
          </strong>
          、この条件を満たさないものは載せていません。数を増やすことは目的にしていません。
        </p>

        <RecBrowser activities={recActivities} />
      </div>
    </main>
  );
}
