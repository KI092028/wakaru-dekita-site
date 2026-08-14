import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HeroDemo } from "@/components/home/hero-demo";
import { subjectsInUse } from "@/lib/quiz/units";
import { SUBJECT_LABEL } from "@/lib/quiz/types";

/**
 * スマホでは 見出し → その場で解けるカード → 説明とボタン の順に並べる。
 * 説明を読ませてから触らせるより、先に1問触ってもらうほうが早いため。
 * 画面が広いときは、左に文・右にカードの2列に組み直す。
 */
export function Hero() {
  // 「算数と社会」。教科が増えたら units.ts を足すだけでここも変わる
  const subjects = subjectsInUse().map((s) => SUBJECT_LABEL[s]).join("と");

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-12">
        <div className="order-1 md:col-start-1 md:row-start-1">
          <p className="mb-4 text-sm font-bold text-primary">無料・登録不要・すきま時間に</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            わかる、できる。
            <br />
            {subjects}が すきになる。
          </h1>
        </div>

        {/* 見本の絵ではなく、本物のアプリを置く（→ hero-demo.tsx） */}
        <div className="order-2 md:col-start-2 md:row-span-2 md:row-start-1">
          <HeroDemo />
        </div>

        <div className="order-3 md:col-start-1 md:row-start-2">
          <p className="mb-8 text-lg text-muted-foreground">
            小学校の{subjects}を、学年・単元ごとに練習できる無料サイト。
            答えを選ぶのではなく自分で書き、ひっ算や分度器は
            <strong className="font-bold text-foreground">1手ずつ</strong>
            進めるので、どこでつまずいたのかが自分で分かります。
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/learn">たんげんを えらぶ</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">このサイトについて</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
