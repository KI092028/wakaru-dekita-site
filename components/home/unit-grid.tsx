import Link from "next/link";

import { Button } from "@/components/ui/button";
import { subjectsInUse, unitsByGrade } from "@/lib/quiz/units";
import { SUBJECT_LABEL, UNIT_KIND_LABEL } from "@/lib/quiz/types";

/**
 * トップページの単元一覧。
 *
 * 単元が増えたので、**カードを全部並べるのはやめて学年ごとの行にした。**
 * 12枚のカードを縦に積むと、トップページの大半が単元一覧になってしまい、
 * 学年で探している人にはかえって見つけにくい。
 * ここでは名前を並べるだけにして、詳しくは /learn にまかせる。
 */
const KIND_STYLE: Record<string, string> = {
  drill: "bg-secondary/10 text-secondary",
  steps: "bg-primary/10 text-primary",
  figure: "bg-success/10 text-success",
  game: "bg-danger/10 text-danger",
  tool: "bg-foreground/10 text-foreground",
};

export function UnitGrid() {
  const subjects = subjectsInUse();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-2 text-center text-2xl font-bold">学べる単元</h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          学年ごとに、ならう順に並べています。
        </p>

        <div className="space-y-10">
          {subjects.map((subject) => (
            <div key={subject}>
              <h3 className="mb-4 text-center text-lg font-bold">{SUBJECT_LABEL[subject]}</h3>
              <div className="space-y-4">
          {unitsByGrade(subject).map((group) => (
            <div key={group.grade} className="sm:flex sm:gap-6">
              <h3 className="mb-2 shrink-0 pt-1 text-sm font-bold text-muted-foreground sm:w-24">
                {group.label}
              </h3>
              <ul className="flex flex-1 flex-wrap gap-2">
                {group.units.map((unit) => (
                  <li key={unit.slug}>
                    <Link
                      href={`/learn/${unit.slug}`}
                      className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <span className="font-medium">{unit.title}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${KIND_STYLE[unit.kind]}`}
                      >
                        {UNIT_KIND_LABEL[unit.kind]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link href="/learn">単元をくわしく見る</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
