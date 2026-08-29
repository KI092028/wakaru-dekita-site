"use client";

import { useMemo, useState } from "react";

import { KIND_STYLE, UnitCard } from "@/components/learn/unit-card";
import { cn } from "@/lib/utils";
import {
  SUBJECT_LABEL,
  UNIT_KIND_LABEL,
  type QuizUnit,
  type Subject,
  type UnitKind,
} from "@/lib/quiz/types";

/**
 * 単元をさがす画面。
 *
 * ## 入口の数を増やさない
 *
 * 単元が増えると、一覧に並べるだけの作りは**入口そのものが伸びていく。**
 * ここでは上に置く「たなの地図」を**教科の数（いまは3枚）に固定**し、
 * 単元が何十に増えても、最初に見るものが増えないようにしてある。
 *
 * 地図はそのまま教科の絞り込みでもある。押した先へ飛ばすのではなく、
 * 下の一覧が絞られる。飛ばす作りだと、絞り込みと併用したときに
 * 「飛んだ先が隠れている」ことが起きる。
 *
 * ## 空振りする選択肢を出さない
 *
 * 学年・種類の候補は、実際に単元がある値だけを出す（`gradesInUse` / `kindsInUse`）。
 * 押しても0件になる選択肢は、探している人の手を止めるだけなので置かない。
 */

/**
 * 種類の意味。**1問にかかる時間もやることも違う**ので、開く前に分かるようにする。
 * 選んだ種類の説明だけを出す。5つ並べても読まれない。
 */
const KIND_NOTE: Record<UnitKind, string> = {
  drill: "1セット10問。1問10秒ほどで、答えを打ちます",
  steps: "ひっ算を手順どおりに1手ずつ進めます。どこで止まったかが残ります",
  figure: "図を自分で動かしてたしかめます。答えを打たない単元もあります",
  game: "さがす・当てる。おしいときは、どちらに外れたかが返ります",
  tool: "問題は出ません。書くときに使う道具です",
};

const KIND_NOTE_ALL = "やることの種類でしぼれます。えらぶと、それが何をするものかが出ます。";

type Props = {
  units: QuizUnit[];
  subjects: Subject[];
  grades: number[];
  kinds: UnitKind[];
};

type SubjectFilter = Subject | "all";

export function UnitBrowser({ units, subjects, grades, kinds }: Props) {
  const [subject, setSubject] = useState<SubjectFilter>("all");
  const [grade, setGrade] = useState<number | null>(null);
  const [kind, setKind] = useState<UnitKind | null>(null);

  const shown = useMemo(
    () =>
      units.filter(
        (unit) =>
          (subject === "all" || unit.subject === subject) &&
          (grade === null || unit.grade === grade) &&
          (kind === null || unit.kind === kind)
      ),
    [units, subject, grade, kind]
  );

  const filtered = subject !== "all" || grade !== null || kind !== null;

  const clear = () => {
    setSubject("all");
    setGrade(null);
    setKind(null);
  };

  // ぜんぶ表示のときだけ教科で区切る。1教科に絞ったら見出しは要らない
  const sections =
    subject === "all"
      ? subjects
          .map((s) => ({ subject: s, units: shown.filter((u) => u.subject === s) }))
          .filter((s) => s.units.length > 0)
      : [{ subject, units: shown }];

  return (
    <div>
      {/* たなの地図。枚数は教科の数で固定される */}
      <div className="mb-8">
        <h2 className="mb-1 text-sm font-bold tracking-wide text-muted-foreground">たなの地図</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          たなは{subjects.length}つ。えらぶと、下のならびがその教科だけになります。
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ShelfCard
            label="ぜんぶ"
            count={units.length}
            active={subject === "all"}
            onClick={() => setSubject("all")}
          />
          {subjects.map((s) => (
            <ShelfCard
              key={s}
              label={SUBJECT_LABEL[s]}
              count={units.filter((u) => u.subject === s).length}
              active={subject === s}
              onClick={() => setSubject(s)}
            />
          ))}
        </div>
      </div>

      {/* 学年と種類。候補は単元がある値だけ */}
      <div className="mb-6 space-y-3 rounded-2xl bg-muted p-4">
        <FilterRow label="学年">
          <Chip label="ぜんぶ" active={grade === null} onClick={() => setGrade(null)} />
          {grades.map((g) => (
            <Chip
              key={g}
              label={`${g}年生から`}
              active={grade === g}
              onClick={() => setGrade(grade === g ? null : g)}
            />
          ))}
        </FilterRow>

        <FilterRow label="やること">
          <Chip label="ぜんぶ" active={kind === null} onClick={() => setKind(null)} />
          {kinds.map((k) => (
            <Chip
              key={k}
              label={UNIT_KIND_LABEL[k]}
              active={kind === k}
              className={kind === k ? undefined : KIND_STYLE[k]}
              onClick={() => setKind(kind === k ? null : k)}
            />
          ))}
        </FilterRow>

        {/* 種類の意味は、その種類をえらぶボタンのすぐ下に置く。
            離して置くと、同じ言葉が画面に2度出るだけで意味が結びつかない */}
        <p className="pl-16 text-xs leading-relaxed text-muted-foreground">
          {kind === null
            ? KIND_NOTE_ALL
            : `${UNIT_KIND_LABEL[kind]}…${KIND_NOTE[kind]}`}
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="text-lg font-bold tabular-nums text-foreground">{shown.length}</span>
          <span className="ml-1">たんげん</span>
        </p>
        {filtered && (
          <button
            type="button"
            onClick={clear}
            className="text-sm font-bold text-primary underline-offset-4 hover:underline"
          >
            しぼりこみを もどす
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-12 text-center text-muted-foreground">
          その組み合わせの単元は まだ ありません。
        </p>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.subject}>
              {subject === "all" && (
                <h3 className="mb-4 border-b pb-2 text-lg font-bold">
                  {SUBJECT_LABEL[section.subject]}
                </h3>
              )}
              <div className="grid gap-6 sm:grid-cols-2">
                {section.units.map((unit) => (
                  <UnitCard key={unit.slug} unit={unit} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ShelfCard({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border-2 px-4 py-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
    >
      <span className="block text-base font-bold">{label}</span>
      <span className="block text-xs tabular-nums text-muted-foreground">{count} たんげん</span>
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-bold text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  label,
  active,
  className,
  onClick,
}: {
  label: string;
  active: boolean;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        // 44px は指で押せる下限。py だけで高さを作ると文字の大きさに引きずられるので、
        // min-h で下から支える
        "inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-bold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : (className ?? "bg-white text-muted-foreground hover:text-foreground")
      )}
    >
      {label}
    </button>
  );
}
