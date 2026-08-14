"use client";

import { cn } from "@/lib/utils";
import {
  PREFECTURES,
  REGION_LABEL,
  bounds,
  prefecturesOf,
  type Prefecture,
  type Region,
} from "@/lib/geo/prefectures";
import { geoStatus, type GeoProgress } from "@/lib/geo/progress";

/**
 * 都道府県の模式図。1県＝1マス。
 *
 * 県の形をそのまま描くと、スマホでは香川県や大阪府が指で押せない大きさになる。
 * ここで覚えたいのは形ではなく**どこにあるか**なので、どのマスも同じ大きさにした。
 * **正確な地図ではない**ことは画面に書いてある。
 *
 * 地方だけを練習するときは、その地方のマスだけを大きく描く。
 * 47マスを1画面に入れると1マスが小さくなるので、
 * 範囲をせまくしたぶんを、そのままマスの大きさに回している。
 */

type Props = {
  /** null なら全国 */
  region: Region | null;
  progress: GeoProgress;
  /** 押せるか */
  interactive: boolean;
  onPick?: (prefecture: Prefecture) => void;
  /** 直前に押したマス（不正解のときに赤く出す） */
  picked?: Prefecture | null;
  /** 正解を光らせる */
  reveal?: Prefecture | null;
  /** マスに名前を出す（練習中は出さない） */
  showNames?: boolean;
};

const GAP = 1.5;

/**
 * まだ手をつけていないマスは、**地方ごとに色をうっすら変える。**
 *
 * 全部同じ色だと、はじめての人には手がかりがまったくない。
 * 地方が見えていれば「近畿はこのあたり」から入れるし、
 * 「おしい！ 同じ 近畿地方だよ」という返しが、目に見えるものと結びつく。
 *
 * 進んだマス（おぼえた・あと1回・にがて）は、そちらの色を優先する。
 */
const REGION_HUE: Record<Region, number> = {
  hokkaido: 205,
  tohoku: 168,
  kanto: 272,
  chubu: 96,
  kinki: 38,
  chugoku: 318,
  shikoku: 188,
  kyushu: 8,
};

const regionTint = (region: Region) => `hsl(${REGION_HUE[region]} 52% 90%)`;

export function JapanMap({
  region,
  progress,
  interactive,
  onPick,
  picked,
  reveal,
  showNames = false,
}: Props) {
  const list = region === null ? PREFECTURES : prefecturesOf(region);
  const box = bounds(list);
  const cols = box.maxCol - box.minCol + 1;
  const rows = box.maxRow - box.minRow + 1;

  // マスの大きさは範囲によらず 10。viewBox のほうを範囲に合わせる
  const CELL = 10;
  const width = cols * CELL;
  const height = rows * CELL;
  const fontSize = cols <= 5 ? 2.6 : cols <= 8 ? 2.2 : 1.9;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block w-full select-none"
      style={{ touchAction: "manipulation", maxHeight: "58vh" }}
      role="group"
      aria-label={`都道府県の 模式図（${cols}×${rows}マス）`}
    >
      {list.map((p) => {
        const x = (p.col - box.minCol) * CELL;
        const y = (p.row - box.minRow) * CELL;
        const status = geoStatus(progress, p.code);
        const isPicked = picked?.code === p.code;
        const isAnswer = reveal?.code === p.code;

        const fill = isAnswer
          ? "fill-success"
          : isPicked
            ? "fill-danger"
            : status === "mastered"
              ? "fill-primary/70"
              : status === "learning"
                ? "fill-primary/25"
                : status === "weak"
                  ? "fill-danger/25"
                  : null;

        const label = isAnswer || isPicked || showNames || status === "mastered";
        const labelTone = isAnswer || isPicked ? "fill-white" : "fill-foreground/70";

        const cell = (
          <>
            <rect
              x={x + GAP / 2}
              y={y + GAP / 2}
              width={CELL - GAP}
              height={CELL - GAP}
              rx={1.6}
              className={cn(fill ?? undefined, "stroke-background")}
              fill={fill === null ? regionTint(p.region) : undefined}
              strokeWidth={0.4}
            />
            {label && (
              <text
                x={x + CELL / 2}
                y={y + CELL / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                className={cn("pointer-events-none font-bold", labelTone)}
              >
                {p.name.length > 3 ? p.name.slice(0, 2) : p.name}
              </text>
            )}
          </>
        );

        if (!interactive) return <g key={p.code}>{cell}</g>;

        return (
          <g
            key={p.code}
            role="button"
            tabIndex={0}
            aria-label={p.name}
            onClick={() => onPick?.(p)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onPick?.(p);
            }}
            className="cursor-pointer outline-none [&>rect]:transition-colors [&:hover>rect]:opacity-70"
          >
            {cell}
          </g>
        );
      })}
    </svg>
  );
}

/** 地図の色の意味。地図だけだと何色が何か分からないので添える。 */
export function MapLegend() {
  const items = [
    { label: "おぼえた", className: "bg-primary/70" },
    { label: "あと1回", className: "bg-primary/25" },
    { label: "にがて", className: "bg-danger/25" },
  ];
  return (
    <div className="space-y-1.5">
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span className={cn("inline-block h-3 w-3 rounded-sm", item.className)} />
            {item.label}
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {(Object.keys(REGION_HUE) as Region[]).map((region) => (
          <li key={region} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: regionTint(region) }}
            />
            {REGION_LABEL[region]}
          </li>
        ))}
      </ul>
    </div>
  );
}
