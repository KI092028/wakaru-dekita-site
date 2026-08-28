"use client";

import { cn } from "@/lib/utils";
import {
  footOf,
  heightIsOutside,
  segmentsOf,
  verticesOf,
  type Figure,
  type Motion,
  type Point,
  type SegmentName,
} from "@/lib/tri/plan";

/**
 * 方眼の上の三角形・平行四辺形と、その動かし方。
 *
 * ## 動かし方は3つ
 *
 * - `slide`  左のはしを切って、右へうつす（→ 長方形）
 * - `rotate` 同じ三角形を回したものを、よこにつける（→ 平行四辺形）
 * - `apex`   頂点だけを横に動かす（面積は変わらない）
 *
 * ## rotate で「回すところ」を見せない理由
 *
 * 中点のまわりに180度回すと、**とちゅうで図形が枠の外まで大きくふくらむ。**
 * それに合わせて枠を広げると、こんどは図形そのものが小さくなって
 * 何をしているのか見えなくなる（実際に計算して確かめた。
 * 高さ3cmの三角形で、必要な枠が3マスから12マス以上になる）。
 *
 * そこで、**回したあとの向きのまま、よこから入ってくる**形にした。
 * 行き先には点線で「うつわ」を先に描いておく。
 * どこへ向かっているのかが見えないまま動かすことになると、
 * ただスライダーを端まで引くだけの作業になってしまう。
 */

const CELL = 24;
const PAD = 26;
/** 辺を押すときの帯の太さ。指で押せる太さにする */
const BAND = 16;

const PRIMARY = "hsl(24 95% 58%)";
const COPY = "hsl(200 70% 50%)";

type Props = {
  figure: Figure;
  motion: Motion;
  gridCols: number;
  gridRows: number;
  /** 0〜1。動かした量 */
  progress: number;
  /** 辺を押せるようにする */
  pickable?: boolean;
  picked?: SegmentName | null;
  onPick?: (name: SegmentName) => void;
  /** 高さの線を出す */
  showHeight?: boolean;
};

export function FigureBoard({
  figure,
  motion,
  gridCols,
  gridRows,
  progress,
  pickable = false,
  picked = null,
  onPick,
  showHeight = false,
}: Props) {
  const width = gridCols * CELL + PAD * 2;
  const height = gridRows * CELL + PAD * 2;
  const px = (p: Point) => `${PAD + p.x * CELL},${PAD + p.y * CELL}`;
  const poly = (points: Point[]) => points.map(px).join(" ");

  const vertices = verticesOf(figure);
  const foot = footOf(figure);
  const outside = heightIsOutside(figure);
  // うつしたぶんだけ、底辺のラベルも右へずらす
  const baseShift =
    motion === "slide" && figure.kind === "parallelogram" ? progress * figure.offset : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block h-auto w-full max-w-[24rem]"
      role="img"
      aria-label={`底辺${figure.base}cm、高さ${figure.height}cm の${
        figure.kind === "parallelogram" ? "平行四辺形" : "三角形"
      }`}
    >
      <Grid cols={gridCols} rows={gridRows} />

      {motion === "slide" && <SlideShape figure={figure} progress={progress} poly={poly} />}
      {motion === "rotate" && <RotateShape figure={figure} progress={progress} poly={poly} />}
      {motion === "apex" && (
        <polygon points={poly(vertices)} fill="hsl(24 95% 58% / 0.16)" stroke={PRIMARY} strokeWidth={2} />
      )}

      {/* 高さ。底辺の外に出るときは、底辺を点線でのばしてから下ろす */}
      {showHeight && (
        <g>
          {outside && (
            <line
              x1={PAD + Math.min(foot, figure.base) * CELL}
              y1={PAD + figure.height * CELL}
              x2={PAD + Math.max(foot, 0) * CELL}
              y2={PAD + figure.height * CELL}
              stroke="hsl(24 10% 55%)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}
          <line
            x1={PAD + foot * CELL}
            y1={PAD}
            x2={PAD + foot * CELL}
            y2={PAD + figure.height * CELL}
            stroke="hsl(142 62% 34%)"
            strokeWidth={2.5}
            strokeDasharray="5 3"
          />
          <RightAngle x={foot} y={figure.height} toLeft={foot > figure.base} />
          <text
            x={PAD + foot * CELL + (foot > figure.base ? -6 : 6)}
            y={PAD + (figure.height * CELL) / 2}
            fontSize={11}
            fontWeight={700}
            fill="hsl(142 62% 30%)"
            textAnchor={foot > figure.base ? "end" : "start"}
            dominantBaseline="central"
          >
            {figure.height}cm
          </text>
        </g>
      )}

      {/* 押せる辺。
          線ではなく**回した長方形**で描く。線に太い stroke を付けても
          指では押せるが、当たり判定の四角形が つぶれた ままになるので、
          「押せるものが そこに ある」と 機械にも 人にも 見えない。 */}
      {pickable &&
        segmentsOf(figure).map((s) => {
          const chosen = picked === s.name;
          const x1 = PAD + s.from.x * CELL;
          const y1 = PAD + s.from.y * CELL;
          const x2 = PAD + s.to.x * CELL;
          const y2 = PAD + s.to.y * CELL;
          const length = Math.hypot(x2 - x1, y2 - y1);
          const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
          return (
            <rect
              key={s.name}
              x={-length / 2}
              y={-BAND / 2}
              width={length}
              height={BAND}
              rx={BAND / 2}
              transform={`translate(${(x1 + x2) / 2} ${(y1 + y2) / 2}) rotate(${angle})`}
              fill={chosen ? "hsl(142 62% 40%)" : "hsl(24 20% 78%)"}
              opacity={chosen ? 0.9 : 0.6}
              className={cn(onPick && "cursor-pointer")}
              onClick={() => onPick?.(s.name)}
            />
          );
        })}

      {/* 底辺の長さ。
          切ってうつす問題では、底辺が右へずれていくので、**ラベルも一緒に動かす。**
          置いたままにすると、動かし終わったあと図形の左はしを指してしまう。 */}
      <text
        x={PAD + (figure.base / 2 + baseShift) * CELL}
        y={PAD + figure.height * CELL + 15}
        fontSize={11}
        fontWeight={700}
        fill="hsl(24 10% 40%)"
        textAnchor="middle"
      >
        {figure.base}cm
      </text>
    </svg>
  );
}

function Grid({ cols, rows }: { cols: number; rows: number }) {
  return (
    <g>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={PAD + c * CELL}
            y={PAD + r * CELL}
            width={CELL}
            height={CELL}
            fill="none"
            stroke="hsl(24 20% 90%)"
            strokeWidth={1}
          />
        ))
      )}
    </g>
  );
}

/** 直角のしるし。これが付いているほうが高さ。 */
function RightAngle({ x, y, toLeft }: { x: number; y: number; toLeft: boolean }) {
  const s = 7;
  const dx = toLeft ? -s : s;
  const px = PAD + x * CELL;
  const py = PAD + y * CELL;
  return (
    <polyline
      points={`${px + dx},${py} ${px + dx},${py - s} ${px},${py - s}`}
      fill="none"
      stroke="hsl(142 62% 34%)"
      strokeWidth={1.5}
    />
  );
}

/**
 * 平行四辺形を切って、右へうつす。
 *
 * 左はしの直角三角形を、底辺のぶんだけ右へ動かすと、
 * ちょうど右はしの欠けにはまって長方形になる。
 */
function SlideShape({
  figure,
  progress,
  poly,
}: {
  figure: Figure;
  progress: number;
  poly: (p: Point[]) => string;
}) {
  if (figure.kind !== "parallelogram") return null;
  const { base, height, offset: d } = figure;

  const piece: Point[] = [
    { x: 0, y: height },
    { x: d, y: 0 },
    { x: d, y: height },
  ];
  const rest: Point[] = [
    { x: d, y: 0 },
    { x: d + base, y: 0 },
    { x: base, y: height },
    { x: d, y: height },
  ];

  return (
    <g>
      {/* うつす先。行き先が見えないまま動かすことにならないように */}
      {progress < 1 && (
        <polygon
          points={poly(piece.map((p) => ({ x: p.x + base, y: p.y })))}
          fill="none"
          stroke={PRIMARY}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          opacity={0.6}
        />
      )}
      <polygon points={poly(rest)} fill="hsl(24 95% 58% / 0.16)" stroke={PRIMARY} strokeWidth={2} />
      <polygon
        points={poly(piece.map((p) => ({ x: p.x + progress * base, y: p.y })))}
        fill="hsl(24 95% 58% / 0.34)"
        stroke={PRIMARY}
        strokeWidth={2}
      />
    </g>
  );
}

/**
 * 同じ三角形を、回した向きのまま よこから つける。
 *
 * 回っていく途中は描かない（枠が3倍以上に広がってしまうため）。
 * かわりに、**行き先を点線で先に描く。**
 */
function RotateShape({
  figure,
  progress,
  poly,
}: {
  figure: Figure;
  progress: number;
  poly: (p: Point[]) => string;
}) {
  if (figure.kind !== "triangle") return null;
  const { base, height, apex } = figure;

  const original: Point[] = [
    { x: 0, y: height },
    { x: base, y: height },
    { x: apex, y: 0 },
  ];
  // 右の辺の中点のまわりに180度回した形（＝2m − p）
  const m = { x: (apex + base) / 2, y: height / 2 };
  const turned: Point[] = original.map((p) => ({ x: 2 * m.x - p.x, y: 2 * m.y - p.y }));

  // よこから入ってくる。とちゅうは枠の外にはみ出して見えなくなる
  const dx = (1 - progress) * (base + 2);

  return (
    <g>
      {progress < 1 && (
        <polygon
          points={poly(turned)}
          fill="none"
          stroke={COPY}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          opacity={0.6}
        />
      )}
      <polygon
        points={poly(turned.map((p) => ({ x: p.x + dx, y: p.y })))}
        fill="hsl(200 70% 50% / 0.22)"
        stroke={COPY}
        strokeWidth={2}
        opacity={0.35 + 0.65 * progress}
      />
      <polygon
        points={poly(original)}
        fill="hsl(24 95% 58% / 0.18)"
        stroke={PRIMARY}
        strokeWidth={2}
      />
    </g>
  );
}
