import Link from "next/link";

import { Button } from "@/components/ui/button";
import { KindBadge } from "@/components/learn/unit-card";
import { availableUnits, subjectsInUse, unitsOfSubject } from "@/lib/quiz/units";
import { SUBJECT_LABEL, type Subject } from "@/lib/quiz/types";

/**
 * トップページの「たなの地図」。
 *
 * **枚数は教科の数で固定される。** 単元が何十に増えても、
 * トップに出るのは教科の数だけのカードで、中身の数だけが増えていく。
 * かつてここは単元を全部並べていて、単元が12になった時点で
 * トップページの大半が単元一覧になっていた。
 *
 * カードの中には、その教科の単元名を先頭からいくつかだけ出す。
 * 全部出すと結局伸びるので、**数を言い切って残りは /learn にまかせる。**
 */

/** 1枚のカードに出す単元名の数。これ以上は「ほか◯こ」にまとめる。 */
const NAMES_PER_CARD = 4;

function ShelfCard({ subject, index }: { subject: Subject; index: number }) {
  const units = unitsOfSubject(subject);
  const shown = units.slice(0, NAMES_PER_CARD);
  const rest = units.length - shown.length;

  return (
    <Link
      href="/learn"
      className="group flex flex-col rounded-2xl border-2 p-5 transition-colors hover:border-primary hover:bg-primary/5"
    >
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-xs font-bold tabular-nums text-primary">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-lg font-bold">{SUBJECT_LABEL[subject]}</h3>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {units.length} たんげん
        </span>
      </div>

      <ul className="flex-1 space-y-1.5 text-sm text-muted-foreground">
        {shown.map((unit) => (
          <li key={unit.slug} className="flex items-center gap-2">
            <span className="truncate">{unit.title}</span>
            <KindBadge kind={unit.kind} />
          </li>
        ))}
        {rest > 0 && <li className="text-xs">ほか {rest} こ</li>}
      </ul>

      <span className="mt-4 text-sm font-bold text-primary">
        {SUBJECT_LABEL[subject]}の たなへ →
      </span>
    </Link>
  );
}

export function UnitGrid() {
  const subjects = subjectsInUse();
  const total = availableUnits().length;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-2 text-center text-2xl font-bold">たなの地図</h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          たなは{subjects.length}つ、ぜんぶで{total}たんげん。えらんで はじめるだけ。登録は いりません。
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, i) => (
            <ShelfCard key={subject} subject={subject} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link href="/learn">たんげんを ぜんぶ 見る</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
