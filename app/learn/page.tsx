import type { Metadata } from "next";

import { UnitBrowser } from "@/components/learn/unit-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  availableUnits,
  gradesInUse,
  kindsInUse,
  subjectsInUse,
  upcomingUnits,
} from "@/lib/quiz/units";

export const metadata: Metadata = {
  title: "まなぶ | わかる・できる",
  description:
    "学年・単元ごとの練習ページ一覧。算数・社会・国語。ドリルのほか、ひっ算や分度器を1手ずつ進める練習、地図や原稿用紙などの道具もあります。登録不要・完全無料。",
};

export default function LearnPage() {
  const units = availableUnits();
  const upcoming = upcomingUnits();

  return (
    <main className="flex-1 bg-white py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">まなぶ</h1>
        <p className="mb-10 text-center text-muted-foreground">
          すきな単元をえらんで、さっそくれんしゅうしよう。
        </p>

        <UnitBrowser
          units={units}
          subjects={subjectsInUse()}
          grades={gradesInUse()}
          kinds={kindsInUse()}
        />

        {upcoming.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-center text-2xl font-bold text-muted-foreground">準備中</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {upcoming.map((unit) => (
                <Card key={unit.slug} className="h-full border-dashed opacity-60">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                        {unit.gradeLabel}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{unit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{unit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
