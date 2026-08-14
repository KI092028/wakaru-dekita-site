import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subjectsInUse, unitsByGrade, upcomingUnits } from "@/lib/quiz/units";
import { SUBJECT_LABEL, UNIT_KIND_LABEL, type QuizUnit } from "@/lib/quiz/types";

export const metadata: Metadata = {
  title: "まなぶ | わかる・できる",
  description:
    "学年・単元ごとの算数の練習ページ一覧。ドリルのほか、ひっ算や分度器を1手ずつ進める練習もあります。登録不要・完全無料。",
};

const KIND_STYLE: Record<string, string> = {
  drill: "bg-secondary/10 text-secondary",
  steps: "bg-primary/10 text-primary",
  figure: "bg-success/10 text-success",
  game: "bg-danger/10 text-danger",
};

function UnitCard({ unit }: { unit: QuizUnit }) {
  return (
    <Link href={`/learn/${unit.slug}`} className="block">
      <Card className="h-full border-primary/30 transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
              {unit.gradeLabel}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${KIND_STYLE[unit.kind]}`}
            >
              {UNIT_KIND_LABEL[unit.kind]}
            </span>
          </div>
          <CardTitle className="text-xl">{unit.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{unit.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function LearnPage() {
  const subjects = subjectsInUse();
  const upcoming = upcomingUnits();

  return (
    <main className="flex-1 bg-white py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">まなぶ</h1>
        <p className="mb-8 text-center text-muted-foreground">
          すきな単元をえらんで、さっそくれんしゅうしよう。
        </p>

        {/* 単元によって、やることも1問にかかる時間もちがう。開く前に分かるようにしておく */}
        <ul className="mx-auto mb-12 flex max-w-2xl flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <li>
            <span className={`mr-1.5 rounded-full px-2 py-0.5 font-bold ${KIND_STYLE.drill}`}>
              ドリル
            </span>
            10問・1問10秒ほど
          </li>
          <li>
            <span className={`mr-1.5 rounded-full px-2 py-0.5 font-bold ${KIND_STYLE.steps}`}>
              1手ずつ
            </span>
            ひっ算を手順どおりに進める
          </li>
          <li>
            <span className={`mr-1.5 rounded-full px-2 py-0.5 font-bold ${KIND_STYLE.figure}`}>
              図で考える
            </span>
            図を動かしてたしかめる
          </li>
          <li>
            <span className={`mr-1.5 rounded-full px-2 py-0.5 font-bold ${KIND_STYLE.game}`}>
              ゲーム
            </span>
            さがす・当てる
          </li>
        </ul>

        <div className="space-y-14">
          {/* 教科 → 学年 の2段で区切る。教科が増えてもここは直さずに済む */}
          {subjects.map((subject) => (
            <section key={subject}>
              <h2 className="mb-6 text-center text-2xl font-bold">{SUBJECT_LABEL[subject]}</h2>
              <div className="space-y-8">
                {unitsByGrade(subject).map((group) => (
                  <div key={group.grade}>
                    <h3 className="mb-4 border-b pb-2 text-sm font-bold text-muted-foreground">
                      {group.label}
                    </h3>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {group.units.map((unit) => (
                        <UnitCard key={unit.slug} unit={unit} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {upcoming.length > 0 && (
            <section>
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
      </div>
    </main>
  );
}
