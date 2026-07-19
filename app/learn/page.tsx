import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quizUnits } from "@/lib/quiz/units";

export const metadata: Metadata = {
  title: "まなぶ | わかる・できる",
  description: "学年・単元ごとの算数ドリル一覧。すきま時間や家庭学習にぴったりの無料学習コンテンツです。",
};

export default function LearnPage() {
  return (
    <main className="flex-1 bg-white py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">まなぶ</h1>
        <p className="mb-12 text-center text-muted-foreground">すきな単元をえらんで、さっそくれんしゅうしよう。</p>

        <div className="grid gap-6 sm:grid-cols-2">
          {quizUnits.map((unit) =>
            unit.available ? (
              <Link key={unit.slug} href={`/learn/${unit.slug}`}>
                <Card className="h-full border-primary/30 transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                        {unit.gradeLabel}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{unit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{unit.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card key={unit.slug} className="h-full border-dashed opacity-60">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                      {unit.gradeLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">準備中</span>
                  </div>
                  <CardTitle className="text-xl">{unit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{unit.description}</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </main>
  );
}
