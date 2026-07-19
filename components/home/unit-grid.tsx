import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quizUnits } from "@/lib/quiz/units";

export function UnitGrid() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-10 text-center text-2xl font-bold">学べる単元</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {quizUnits.map((unit) => (
            <Card key={unit.slug} className={unit.available ? "border-primary/30" : "border-dashed opacity-60"}>
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                    {unit.gradeLabel}
                  </span>
                  {!unit.available && <span className="text-xs text-muted-foreground">準備中</span>}
                </div>
                <CardTitle className="text-base">{unit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{unit.description}</p>
                {unit.available && (
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/learn/${unit.slug}`}>解いてみる</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
