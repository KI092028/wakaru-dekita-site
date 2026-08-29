"use client";

import { cn } from "@/lib/utils";
import { EDGES, areaOf, edgeLength, perimeterOf, type AreaPlan, type Edge } from "@/lib/area/plan";

/**
 * 1cm方眼の上にかいた長方形。
 *
 * ## ふちを なぞれる
 *
 * `traceable` のとき、4つの辺が押せる帯になる。押すと色がつき、
 * その辺の長さが たされていく。**まわりの長さは「ふちを1しゅう」だ**を
 * 手の動きで分からせるため。
 *
 * 辺の帯は、方眼の外がわに かさねて 太く描く。
 * 線そのものを押させると細すぎて押せない（→ design-guidelines「見えないものは押せない」）。
 *
 * ## 枠は 形を 変えても そのまま
 *
 * 形を変える問題では、長方形だけが 伸び縮みして、
 * 方眼の枠は動かない。枠も一緒に変わると、
 * どちらの向きに 変わったのかが 見えなくなる。
 */

type Props = {
  plan: AreaPlan;
  rows: number;
  cols: number;
  /** ふちを押せるようにする */
  traceable?: boolean;
  /** なぞり終わった辺 */
  traced?: Edge[];
  onTrace?: (edge: Edge) => void;
  /** 中のマスを1つずつ見せる（面積を聞く手で使う） */
  showCells?: boolean;
};

/** 1マスの大きさ（描画上）。viewBox なので画面の幅に合わせて縮む。 */
const CELL = 24;
/** 方眼のまわりに あける ふち。辺の帯と 数字が 入る */
const PAD = 26;
/** 辺の帯の 太さ（見た目） */
const BAND = 13;
/**
 * 押せる範囲の太さ。**見た目より ずっと 太くする。**
 *
 * 帯を見た目のまま太くすると、長方形を のみこんで 図が 読めなくなる。
 * かといって 13 のままだと、画面上では 15〜20px にしか ならない
 * （viewBox は 画面の幅に合わせて 縮むので、書いた数字と 画面の大きさは 別）。
 * そこで**透明な広い帯を 上に かさねる。**
 * 見た目が どこを 押すかを 教え、当たり判定が 指の ぶんの ゆとりを 持つ。
 */
const HIT = 34;
/**
 * 帯の 両はしを 少し 縮める。
 *
 * かどまで びっしり 描くと 4本が つながって、
 * **1本の わく**に 見えてしまう。この単元は
 * 「ふちは 4本 ある」ことを 見せるためのものなので、
 * かどに すきまを あけて 4本に 見せる。
 */
const GAP = 5;

export function GridFigure({
  plan,
  rows,
  cols,
  traceable = false,
  traced = [],
  onTrace,
  showCells = false,
}: Props) {
  const frameRows = Math.max(plan.frameRows, rows);
  const frameCols = Math.max(plan.frameCols, cols);

  const width = frameCols * CELL + PAD * 2;
  const height = frameRows * CELL + PAD * 2;

  const x0 = PAD;
  const y0 = PAD;
  const rectW = cols * CELL;
  const rectH = rows * CELL;

  /** thickness を変えると、見た目の帯と、その下の押せる帯の両方を作れる */
  const bandOf = (edge: Edge, thickness: number) => {
    const g = Math.min(GAP, rectW / 4, rectH / 4);
    switch (edge) {
      case "top":
        return { x: x0 + g, y: y0 - thickness / 2, w: rectW - g * 2, h: thickness };
      case "bottom":
        return { x: x0 + g, y: y0 + rectH - thickness / 2, w: rectW - g * 2, h: thickness };
      case "left":
        return { x: x0 - thickness / 2, y: y0 + g, w: thickness, h: rectH - g * 2 };
      case "right":
        return { x: x0 + rectW - thickness / 2, y: y0 + g, w: thickness, h: rectH - g * 2 };
    }
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block h-auto w-full max-w-[22rem]"
      role="img"
      aria-label={`たて${rows}cm よこ${cols}cm の長方形。まわりの長さ ${perimeterOf(rows, cols)}cm、面積 ${areaOf(rows, cols)}cm²`}
    >
      {/* 方眼 */}
      <g>
        {Array.from({ length: frameRows }, (_, r) =>
          Array.from({ length: frameCols }, (_, c) => (
            <rect
              key={`g-${r}-${c}`}
              x={x0 + c * CELL}
              y={y0 + r * CELL}
              width={CELL}
              height={CELL}
              fill="none"
              stroke="hsl(24 20% 88%)"
              strokeWidth={1}
            />
          ))
        )}
      </g>

      {/* 長方形の中身 */}
      <rect
        x={x0}
        y={y0}
        width={rectW}
        height={rectH}
        fill="hsl(24 95% 58% / 0.14)"
        stroke="hsl(24 95% 58%)"
        strokeWidth={2}
      />

      {/* 面積を聞くときだけ、中のマスの区切りを濃くする */}
      {showCells && (
        <g>
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => (
              <rect
                key={`c-${r}-${c}`}
                x={x0 + c * CELL}
                y={y0 + r * CELL}
                width={CELL}
                height={CELL}
                fill="none"
                stroke="hsl(24 95% 58% / 0.5)"
                strokeWidth={1}
              />
            ))
          )}
        </g>
      )}

      {/* ふちの帯。押すと なぞれる */}
      {traceable &&
        EDGES.map((edge) => {
          const b = bandOf(edge, BAND);
          const hit = bandOf(edge, HIT);
          const done = traced.includes(edge);
          return (
            <g key={edge}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx={BAND / 2}
                fill={done ? "hsl(142 62% 40%)" : "hsl(24 20% 82%)"}
                pointerEvents="none"
              />
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={700}
                fill={done ? "white" : "hsl(24 10% 40%)"}
                pointerEvents="none"
              >
                {edgeLength(rows, cols, edge)}
              </text>
              {/* 押せる範囲。見た目には出さないが、ここが指の ねらう ところ */}
              <rect
                x={hit.x}
                y={hit.y}
                width={hit.w}
                height={hit.h}
                fill="transparent"
                className={cn(!done && onTrace && "cursor-pointer")}
                onClick={() => !done && onTrace?.(edge)}
              />
            </g>
          );
        })}

      {/* なぞらないときは、たて・よこの長さを外に出す */}
      {!traceable && (
        <g fontSize={11} fontWeight={700} fill="hsl(24 10% 40%)">
          <text x={x0 + rectW / 2} y={y0 - 9} textAnchor="middle">
            {cols}cm
          </text>
          <text x={x0 - 9} y={y0 + rectH / 2} textAnchor="middle" dominantBaseline="central">
            {rows}cm
          </text>
        </g>
      )}
    </svg>
  );
}
