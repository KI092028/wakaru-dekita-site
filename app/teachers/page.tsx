import type { Metadata } from "next";
import Link from "next/link";

import { recActivities } from "@/lib/rec/activities";

export const metadata: Metadata = {
  title: "先生の方へ | わかる・できる",
  description:
    "現役の小学校教員が作っている「わかる・できる」の、先生向けのページです。すきま時間にそのまま使える学級レクと、授業での利用についてまとめています。",
};

export default function TeachersPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl">先生の方へ</h1>

        <p className="mb-4 leading-relaxed text-muted-foreground">
          このサイトは、現役の小学校教員が1人で作っています。児童向けの算数ドリルが主ですが、
          このページから先は<strong className="font-bold text-foreground">先生向け</strong>です。
        </p>
        <p className="mb-10 leading-relaxed text-muted-foreground">
          学級レクは数を並べていません。
          <strong className="font-bold text-foreground">
            授業の残り5分にそのまま使えるかどうか
          </strong>
          だけを基準に選んであります。準備物が要るもの、体育館が要るもの、
          説明に時間がかかるものは、良いレクでも載せていません。
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/teachers/rec"
            className="rounded-2xl border border-primary/30 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="mb-2 text-lg font-bold">すきま時間の学級レク</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              時間・声の大きさ・隊形で絞り込めます。現在 {recActivities.length} 件。
            </p>
            <span className="text-sm font-bold text-primary">見てみる →</span>
          </Link>

          <Link
            href="/teachers/use"
            className="rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="mb-2 text-lg font-bold">授業での利用について</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              印刷・投影・学習端末での表示について、できることをまとめています。
            </p>
            <span className="text-sm font-bold text-primary">確認する →</span>
          </Link>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          児童向けの算数ドリルは{" "}
          <Link href="/learn" className="font-bold text-primary underline">
            まなぶ
          </Link>{" "}
          にあります。学級で使っていただいてもかまいません。
        </p>
      </div>
    </main>
  );
}
