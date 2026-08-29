import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { findActivity, recActivities } from "@/lib/rec/activities";
import {
  FORMATION_LABEL,
  VOLUME_LABEL,
  gradesLabel,
  materialsLabel,
  type RecActivity,
} from "@/lib/rec/types";
import { quizUnits } from "@/lib/quiz/units";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return recActivities.map((activity) => ({ slug: activity.slug }));
}

/** 検索の入口を条件クエリに置くため、タイトルにも条件を入れる（→ docs/class-rec-spec.md 6.2）。 */
function pageTitle(activity: RecActivity): string {
  const conditions = [
    `${activity.minutes}分`,
    materialsLabel(activity),
    FORMATION_LABEL[activity.formation],
  ].join("・");
  return `${activity.name}｜${conditions}でできる学級レク`;
}

export function generateMetadata({ params }: Props): Metadata {
  const activity = findActivity(params.slug);
  if (!activity) return {};

  return {
    title: `${pageTitle(activity)} | わかる・できる`,
    description: `${activity.summary} 所要時間の目安は${activity.minutes}分、${materialsLabel(activity)}、${FORMATION_LABEL[activity.formation]}でできます。対象は${gradesLabel(activity)}。`,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function RecDetailPage({ params }: Props) {
  const activity = findActivity(params.slug);
  if (!activity) notFound();

  const related = activity.relatedUnit
    ? quizUnits.find((unit) => unit.slug === activity.relatedUnit)
    : undefined;

  const conditions = [
    { label: "時間", value: `〜${activity.minutes}分` },
    { label: "声", value: VOLUME_LABEL[activity.volume] },
    { label: "隊形", value: FORMATION_LABEL[activity.formation] },
    { label: "準備物", value: materialsLabel(activity) },
    { label: "学年", value: gradesLabel(activity) },
  ];

  return (
    <main className="flex-1 bg-muted/30 py-12 print:bg-white print:py-0">
      <article className="mx-auto max-w-2xl px-6">
        <Link
          href="/teachers/rec"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground print:hidden"
        >
          ← 学級レク一覧に戻る
        </Link>

        <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{activity.name}</h1>

        <dl className="mb-8 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border bg-white p-4 text-sm sm:grid-cols-5">
          {conditions.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        <Section title="どんな遊びか">
          <p className="leading-relaxed text-muted-foreground">{activity.description}</p>
        </Section>

        <Section title="やり方">
          <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
            {activity.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Section>

        <Section title="先生のひとこと">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            {activity.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </Section>

        <Section title="気をつけること">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
            {activity.cautions.map((caution) => (
              <li key={caution}>{caution}</li>
            ))}
          </ul>
        </Section>

        {activity.variations && (
          <Section title="慣れてきたら">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              {activity.variations.map((variation) => (
                <li key={variation}>{variation}</li>
              ))}
            </ul>
          </Section>
        )}

        {related && (
          <p className="rounded-2xl border border-primary/30 bg-white p-4 text-sm print:hidden">
            このレクは算数と地続きです。
            <Link href={`/learn/${related.slug}`} className="font-bold text-primary underline">
              {related.title}のドリル
            </Link>
            もあります。
          </p>
        )}
      </article>
    </main>
  );
}
