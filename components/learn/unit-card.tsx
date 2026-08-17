import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UNIT_KIND_LABEL, type QuizUnit, type UnitKind } from "@/lib/quiz/types";

/**
 * 単元カード。一覧・絞り込み・きょうの1単元で共通に使う。
 *
 * 見た目を1か所にまとめてあるのは、単元が増えたときに
 * 「一覧では新しい見た目、トップでは古い見た目」がまざるのを防ぐため。
 * 実際に一度そうなっている（トップに4択の見本が残っていた）。
 */

/** 種類ごとの色。ここが種類の色の正。 */
export const KIND_STYLE: Record<UnitKind, string> = {
  drill: "bg-secondary/10 text-secondary",
  steps: "bg-primary/10 text-primary",
  figure: "bg-success/10 text-success",
  game: "bg-danger/10 text-danger",
  tool: "bg-foreground/10 text-foreground",
};

export function KindBadge({ kind }: { kind: UnitKind }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${KIND_STYLE[kind]}`}>
      {UNIT_KIND_LABEL[kind]}
    </span>
  );
}

export function UnitCard({ unit }: { unit: QuizUnit }) {
  return (
    <Link href={`/learn/${unit.slug}`} className="block">
      <Card className="h-full border-primary/30 transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
              {unit.gradeLabel}
            </span>
            <KindBadge kind={unit.kind} />
          </div>
          <CardTitle className="text-xl">{unit.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{unit.description}</p>
          {/* 開く前に、どれくらいあるのかが分かるようにしておく */}
          {unit.scale && (
            <p className="mt-2 text-xs font-medium tabular-nums text-foreground/60">{unit.scale}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
