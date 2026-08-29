"use client";

import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  FORMATION_LABEL,
  VOLUME_LABEL,
  gradesLabel,
  materialsLabel,
  type Formation,
  type RecActivity,
  type Volume,
} from "@/lib/rec/types";

/**
 * 学級レクの一覧と絞り込み。
 *
 * 教室で片手で開いて1〜2分で1つ選ぶ場面を想定しているので、
 * 詳細を開かなくても選べるだけの情報をカードに出す。
 *
 * 「声の大きさ」で絞れるのが要点。隣のクラスが授業中だと、
 * 盛り上がるレクはそもそも候補から外れる。
 */

type TimeFilter = "all" | 2 | 3 | 5;

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: 2, label: "2分以内" },
  { value: 3, label: "3分以内" },
  { value: 5, label: "5分以内" },
];

const VOLUME_OPTIONS: { value: Volume | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "silent", label: VOLUME_LABEL.silent },
  { value: "normal", label: VOLUME_LABEL.normal },
  { value: "lively", label: VOLUME_LABEL.lively },
];

const FORMATION_OPTIONS: { value: Formation | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "seated", label: FORMATION_LABEL.seated },
  { value: "stand", label: FORMATION_LABEL.stand },
  { value: "move", label: FORMATION_LABEL.move },
];

function Chips<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-bold text-muted-foreground">{label}</span>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          className={cn(
            // 44px は指で押せる下限。py だけで高さを作ると文字の大きさに引きずられる
            "inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm transition-colors",
            option.value === value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background hover:border-primary hover:bg-primary/5"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

export function RecBrowser({ activities }: { activities: RecActivity[] }) {
  const [time, setTime] = useState<TimeFilter>("all");
  const [volume, setVolume] = useState<Volume | "all">("all");
  const [formation, setFormation] = useState<Formation | "all">("all");
  const [noMaterials, setNoMaterials] = useState(false);

  const visible = activities
    .filter((a) => (time === "all" ? true : a.minutes <= time))
    .filter((a) => (volume === "all" ? true : a.volume === volume))
    .filter((a) => (formation === "all" ? true : a.formation === formation))
    .filter((a) => (noMaterials ? a.materials.length === 0 : true))
    .sort((a, b) => a.minutes - b.minutes);

  const reset = () => {
    setTime("all");
    setVolume("all");
    setFormation("all");
    setNoMaterials(false);
  };

  return (
    <div>
      <div className="mb-8 space-y-3 rounded-2xl border bg-white p-5 print:hidden">
        <Chips label="時間" options={TIME_OPTIONS} value={time} onChange={setTime} />
        <Chips label="声" options={VOLUME_OPTIONS} value={volume} onChange={setVolume} />
        <Chips label="隊形" options={FORMATION_OPTIONS} value={formation} onChange={setFormation} />

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 shrink-0 text-xs font-bold text-muted-foreground">準備物</span>
          <button
            type="button"
            onClick={() => setNoMaterials((v) => !v)}
            aria-pressed={noMaterials}
            className={cn(
              // 44px は指で押せる下限。py だけで高さを作ると文字の大きさに引きずられる
            "inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm transition-colors",
              noMaterials
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:border-primary hover:bg-primary/5"
            )}
          >
            準備なしだけ
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {visible.length} 件
        {visible.length !== activities.length && (
          <button type="button" onClick={reset} className="ml-3 underline print:hidden">
            条件を外す
          </button>
        )}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          条件に合うものがありません。どれかの条件をゆるめてみてください。
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visible.map((activity) => (
            <li key={activity.slug}>
              <Link
                href={`/teachers/rec/${activity.slug}`}
                className="block h-full rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md"
              >
                <h2 className="mb-1 text-lg font-bold">{activity.name}</h2>
                <p className="mb-3 text-sm text-muted-foreground">{activity.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge>〜{activity.minutes}分</Badge>
                  <Badge>{VOLUME_LABEL[activity.volume]}</Badge>
                  <Badge>{FORMATION_LABEL[activity.formation]}</Badge>
                  <Badge>{materialsLabel(activity)}</Badge>
                  <Badge>{gradesLabel(activity)}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
