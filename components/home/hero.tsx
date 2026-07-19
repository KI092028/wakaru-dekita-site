import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-bold text-primary">無料・登録不要・すきま時間に</p>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            わかる、できる。
            <br />
            算数がすきになる。
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            小学生向けの算数ドリルアプリ。ちょっとしたすきま時間や、おうちでの学習にぴったりの
            4択クイズで、楽しみながら計算力を身につけられます。
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/learn">今すぐ問題を解いてみる</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">このサイトについて</Link>
            </Button>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="rounded-2xl border bg-muted/40 p-8 shadow-sm">
            <p className="mb-6 text-center text-sm font-medium text-muted-foreground">たし算・ひき算</p>
            <p className="mb-8 text-center text-5xl font-bold tracking-wide">7 + 5 = ?</p>
            <div className="grid grid-cols-2 gap-3">
              {[11, 12, 13, 14].map((n) => (
                <div
                  key={n}
                  className={`flex h-14 items-center justify-center rounded-2xl border-2 text-xl font-bold ${
                    n === 12 ? "border-success bg-success/10 text-success" : "border-input bg-white"
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
