import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-2xl font-bold">今日から、すきま時間で算数の力をつけよう</h2>
        <p className="mb-8 text-muted-foreground">登録不要。今すぐ無料で問題を解き始められます。</p>
        <Button asChild size="lg">
          <Link href="/learn">今すぐ問題を解いてみる</Link>
        </Button>
      </div>
    </section>
  );
}
