"use client";

// @svg-maps/japan は型に locations の中身がないので、使う分だけここで書く
import japanMap from "@svg-maps/japan";

type MapLocation = { id: string; name: string; path: string };

import { useId } from "react";

import { cn } from "@/lib/utils";
import { insetPlacement, largestIsland, padBox } from "@/lib/geo/inset";
import {
  MAP_VIEW_BOX,
  PREFECTURES,
  REGIONS,
  REGION_LABEL,
  bounds,
  prefecturesOf,
  type Prefecture,
  type Region,
} from "@/lib/geo/prefectures";
import { geoStatus, type GeoProgress } from "@/lib/geo/progress";

/**
 * 都道府県の白地図。
 *
 * 形は `@svg-maps/japan`（CC BY 4.0）の県境をそのまま描く。
 * 出典は画面にも書く（→ page.tsx）。
 *
 * ## 小さい県のために、当たり判定を広げている
 *
 * 実際の形で描くと、香川県・大阪府・東京都は全国表示だと指では押せない。
 * そこで**県の中心に見えない丸を置き**、パスの下に敷いている。
 * パスは丸より上にあるので、県の中を押せばその県が取れ、
 * すこし外れたときだけ近くの丸が拾う。
 *
 * ## 全国表示では、タップは「答える」ではなく「寄る」
 *
 * 北海道から沖縄までを1画面に入れると、香川・大阪・東京は指では押せないし、
 * そもそも見えない。**当たり判定を広げても、見えないものは押せない。**
 *
 * そこで全国表示では、タップは「その地方に寄る」だけにした。
 * 答えるのは寄ったあと。手数は1回増えるが、
 *
 * - 小さい県を正確に押す必要がなくなる（だいたいの場所でよい）
 * - 日本 → 地方 → 県 という、教わる順序とそろう
 * - 「同じ地方だよ」「もっと北のほう」という返しが、操作と噛み合う
 *
 * 地方をえらんで始めたときは、はじめからその地方に寄っている。
 *
 * ## 沖縄も本当の位置に描く
 *
 * 紙の地図は沖縄を左下の別わくに入れることが多いが、ここでは入れない。
 * **位置を覚えるための地図で別わくに入れると、「沖縄はわくの中」と覚えてしまう。**
 * そのぶん本土は少し小さくなるが、地方をえらべば大きく描かれるので、
 * 小さい県はそちらで練習できる。
 */

type Props = {
  /** 出題の範囲。null なら全国 */
  region: Region | null;
  /**
   * いま寄せて見ている地方。null なら日本ぜんたい。
   * `region` とは別に持つ。出題は全国でも、見ているのは近畿、ということがあるため。
   */
  zoom?: Region | null;
  /** 全国表示で県を押したときに呼ぶ。渡さなければ、押しても寄らない */
  onZoom?: (region: Region) => void;
  progress: GeoProgress;
  /** 押せるか */
  interactive: boolean;
  onPick?: (prefecture: Prefecture) => void;
  /** 直前に押した県（不正解のときに赤く出す） */
  picked?: Prefecture | null;
  /** 正解を光らせる */
  reveal?: Prefecture | null;
  /** すべての県に名前を出す（けっか画面用） */
  showAllNames?: boolean;
};

/**
 * 地方ごとの色。**まだの県をうっすら塗り分けて、地方の枠もこの色で描く。**
 *
 * 全部白いと、はじめての人には手がかりがまったくない。
 * 地方が見えていれば「近畿はこのあたり」から入れるし、
 * 「おしい！ 同じ 近畿地方だよ」という返しが、目に見えるものと結びつく。
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

const regionTint = (region: Region) => `hsl(${REGION_HUE[region]} 55% 92%)`;
const regionLine = (region: Region) => `hsl(${REGION_HUE[region]} 45% 45%)`;

const PATHS: Record<string, string> = Object.fromEntries(
  (japanMap.locations as MapLocation[]).map((location) => [location.id, location.path])
);



export function JapanMap({
  region,
  zoom = null,
  onZoom,
  progress,
  interactive,
  onPick,
  picked,
  reveal,
  showAllNames = false,
}: Props) {
  // 出題の範囲にある県だけを描く。そのうえで、寄せて見る範囲を決める
  const list = region === null ? PREFECTURES : prefecturesOf(region);
  const focus = zoom ?? region;

  /**
   * 九州・沖縄に寄ったときだけ、沖縄を別枠に出す。
   *
   * 沖縄は九州のはるか南西にあるので、そのまま入れると
   * **枠の 82% が海になり、九州が 42% の大きさでしか描けない**
   * （実測：沖縄こみ 167×237、九州だけ 69×104）。
   * 紙の地図が沖縄を四角い別枠に出しているのと同じ理由。
   *
   * 別枠に出しても、**押せば答えになる**ことは変えない。
   * 出題からは外さない（47県のうちの1つなので）。
   */
  // 別枠は中身を切り取るので、この地図だけの id が要る
  // （けっか画面など、1つのページに地図が2つ出ることがある）
  const clipId = `okinawa-inset-${useId()}`;

  const insetting = focus === "kyushu";
  const mainList = insetting ? list.filter((p) => p.code !== OKINAWA_CODE) : list;
  const insetList = insetting ? list.filter((p) => p.code === OKINAWA_CODE) : [];

  const view =
    focus === null
      ? { x: 0, y: 0, width: MAP_VIEW_BOX.width, height: MAP_VIEW_BOX.height }
      : padded(
          bounds(
            insetting
              ? prefecturesOf(focus).filter((p) => p.code !== OKINAWA_CODE)
              : prefecturesOf(focus)
          )
        );

  /** 別枠の位置と大きさ。**左下**に置く（紙の地図と同じで、ここは海しかない） */
  const inset = insetList.length > 0 ? insetPlacement(view, OKINAWA_WINDOW) : null;

  /** 全国を見ているあいだは、押しても答えにならず、その地方へ寄るだけ */
  const zoomingOnly = interactive && focus === null && onZoom !== undefined;
  const tap = (p: Prefecture) => (zoomingOnly ? onZoom?.(p.region) : onPick?.(p));

  // 表示している範囲の広さで、文字と線の太さを決める（地方表示では大きくなる）
  const scale = view.width / MAP_VIEW_BOX.width;
  const fontSize = Math.max(4.5, 9 * scale);
  const hitRadius = Math.max(5, 9 * scale);

  const shownRegions = focus === null ? REGIONS : [focus];

  const fillOf = (p: Prefecture): string | null => {
    if (reveal?.code === p.code) return "fill-success";
    if (picked?.code === p.code) return "fill-danger";
    const status = geoStatus(progress, p.code);
    if (status === "mastered") return "fill-primary/70";
    if (status === "learning") return "fill-primary/30";
    if (status === "weak") return "fill-danger/30";
    return null;
  };

  /** 一度でも正解した県には名前を出す（→ requirements 5.13）。 */
  const nameOf = (p: Prefecture, boost = 1) => {
    const status = geoStatus(progress, p.code);
    const show =
      showAllNames ||
      reveal?.code === p.code ||
      picked?.code === p.code ||
      status === "mastered" ||
      status === "learning";
    if (!show) return null;
    const strong = reveal?.code === p.code || picked?.code === p.code;
    const size = (strong ? fontSize * 1.15 : fontSize) * boost;

    return (
      <text
        key={`name-${p.code}`}
        x={p.cx}
        y={p.cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        className={cn(
          "pointer-events-none font-bold",
          strong ? "fill-foreground" : "fill-foreground/80"
        )}
        stroke="white"
        strokeWidth={size * 0.28}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {p.name}
      </text>
    );
  };

  /**
   * 県のひとまとまりを描く。当たり判定・かたち・地方のふちどり・名前の4枚。
   *
   * 本体と別枠で**同じものを2回**呼ぶ。別枠だけ別の描き方にすると、
   * 色や名前の出しかたが片方だけ古くなる。
   */
  const layers = (items: Prefecture[]) => (
    <>
      {/* 当たり判定の丸。パスより下に敷き、押しそこねを拾う */}
      {interactive &&
        items.map((p) => (
          <circle
            key={`hit-${p.code}`}
            cx={p.cx}
            cy={p.cy}
            r={hitRadius}
            fill="transparent"
            className="cursor-pointer"
            aria-hidden="true"
            data-pref={p.name}
            data-region={p.region}
            onClick={() => tap(p)}
          />
        ))}

      {items.map((p) => {
        const fill = fillOf(p);
        return (
          <path
            key={p.code}
            d={PATHS[p.mapId]}
            className={cn(fill ?? undefined, interactive && "cursor-pointer")}
            fill={fill === null ? regionTint(p.region) : undefined}
            stroke={regionLine(p.region)}
            strokeWidth={0.5 * scale}
            role={interactive ? "button" : undefined}
            aria-label={interactive ? (zoomingOnly ? `${REGION_LABEL[p.region]}地方に よる` : p.name) : undefined}
            onClick={interactive ? () => tap(p) : undefined}
          />
        );
      })}

      {/* 地方の枠。同じ地方の県を、その地方の色で太く縁どる */}
      {shownRegions.map((r) => (
        <g key={`edge-${r}`} className="pointer-events-none" fill="none">
          {items
            .filter((p) => p.region === r)
            .map((p) => (
              <path
                key={p.code}
                d={PATHS[p.mapId]}
                stroke={regionLine(r)}
                strokeWidth={1.6 * scale}
                strokeOpacity={0.55}
                strokeLinejoin="round"
              />
            ))}
        </g>
      ))}

      {/* 名前。**一度でも正解した県には出る**（→ requirements 5.13） */}
      {items.map((p) => nameOf(p))}
    </>
  );

  return (
    <svg
      viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      className="mx-auto block w-full select-none"
      style={{ touchAction: "manipulation", maxHeight: "68vh" }}
      role="group"
      aria-label={focus === null ? "日本全国の白地図" : `${REGION_LABEL[focus]}地方の白地図`}
    >
      {layers(mainList)}

      {/* 沖縄の別枠。**中身は本体とまったく同じもの**を、縮めて左下に置く */}
      {inset && (
        <>
          <rect
            x={inset.x}
            y={inset.y}
            width={inset.width}
            height={inset.height}
            rx={2 * scale}
            fill="white"
            stroke="hsl(20 15% 55%)"
            strokeWidth={0.7 * scale}
            strokeDasharray={`${2.5 * scale} ${1.8 * scale}`}
          />
          <clipPath id={clipId}>
            <rect x={inset.x} y={inset.y} width={inset.width} height={inset.height} />
          </clipPath>
          {/* 本島から離れた島は、別枠からはみ出すので切り取る */}
          <g clipPath={`url(#${clipId})`}>
            <g transform={inset.transform}>{layers(insetList)}</g>
          </g>
          {/* 別枠ぜんたいを押せるようにする。
              中を縮めているので、丸の当たり判定もいっしょに小さくなるため */}
          {interactive && !zoomingOnly && (
            <rect
              x={inset.x}
              y={inset.y}
              width={inset.width}
              height={inset.height}
              fill="transparent"
              className="cursor-pointer"
              data-pref={insetList[0].name}
              data-region={insetList[0].region}
              aria-label={insetList[0].name}
              role="button"
              onClick={() => tap(insetList[0])}
            />
          )}
        </>
      )}
    </svg>
  );
}

/** 沖縄。九州・沖縄に寄ったときだけ、別枠に出す */
const OKINAWA_CODE = 47;

/**
 * 別枠に映す範囲。**沖縄本島のまわりだけ。**
 *
 * 沖縄の輪郭ぜんたい（125.6×94.3）を別枠に入れると、
 * こんどは別枠の中がほとんど海になる（本島はその 2%）。
 * 本島だけに寄せると 9.2倍 大きく描ける。
 * 離れた島は別枠からはみ出すので、切り取って見せない。
 *
 * 位置は地図データから計算する。書き写すと、地図が新しくなったときに気づけない。
 */
const OKINAWA_WINDOW = padBox(largestIsland(PATHS.okinawa), 0.22);

/** 地方を大きく描くときに、まわりに少し余白をとる。 */
function padded(box: { x: number; y: number; width: number; height: number }) {
  const pad = Math.max(box.width, box.height) * 0.08;
  return {
    x: box.x - pad,
    y: box.y - pad,
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  };
}

/**
 * 地方に寄るための帯。地図の上に置く。
 *
 * 地図を直接タップしても寄れるが、**押せる的をはっきり見せておく。**
 * 「どこを押せばいいのか分からない」ままでは、寄れることに気づかれない。
 */
export function RegionZoomBar({
  zoom,
  onZoom,
}: {
  zoom: Region | null;
  onZoom: (region: Region | null) => void;
}) {
  return (
    <div className="mb-2 flex flex-wrap justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onZoom(null)}
        aria-pressed={zoom === null}
        className={cn(
          "rounded-full border px-2.5 py-1 text-xs font-bold transition-colors",
          zoom === null
            ? "border-foreground bg-foreground text-white"
            : "border-border text-muted-foreground hover:text-foreground"
        )}
      >
        日本ぜんたい
      </button>
      {REGIONS.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onZoom(r)}
          aria-pressed={zoom === r}
          className="rounded-full border px-2.5 py-1 text-xs font-bold transition-colors"
          style={
            zoom === r
              ? { borderColor: regionLine(r), backgroundColor: regionLine(r), color: "white" }
              : { borderColor: regionLine(r), backgroundColor: regionTint(r), color: regionLine(r) }
          }
        >
          {REGION_LABEL[r]}
        </button>
      ))}
    </div>
  );
}

/** 地図の色の意味。地図だけだと何色が何か分からないので添える。 */
export function MapLegend() {
  const items = [
    { label: "おぼえた", className: "bg-primary/70" },
    { label: "あと1回", className: "bg-primary/30" },
    { label: "にがて", className: "bg-danger/30" },
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
        {REGIONS.map((region) => (
          <li key={region} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: regionTint(region), outline: `1.5px solid ${regionLine(region)}` }}
            />
            {REGION_LABEL[region]}
          </li>
        ))}
      </ul>
    </div>
  );
}
