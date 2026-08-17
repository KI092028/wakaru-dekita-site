"use client";

import { cn } from "@/lib/utils";
import { expression, splitTarget, type SakuraPlan } from "@/lib/sakura/plan";

/**
 * さくらんぼの図と、10のまとまり。
 *
 * ## 分ける数を、式の中で目立たせる
 *
 * **どちらの数を分けるのかで迷う**のがこの単元のつまずきなので、
 * 分ける数だけ枠で囲み、そこから下へ2つのふさを伸ばす。
 * たし算は後ろの数、ひき算は前の数。式を見れば分かるようにしておく。
 *
 * ## 10のまとまりを、点で見せる
 *
 * 「あと2で10」は、数だけ言われても1年生には出てこない。
 * 5×2 の枠に点を置いて、**空いている数がそのまま答え**になるようにする。
 * これは教室でブロックを並べてやっていることと同じ。
 */

type Props = {
  plan: SakuraPlan;
  /** 左のふさ。まだ答えていなければ null */
  left: number | null;
  /** 右のふさ */
  right: number | null;
  /** いま光らせるふさ */
  active: "left" | "right" | null;
};

export function Cherry({ plan, left, right, active }: Props) {
  const target = splitTarget(plan);
  const parts = expression(plan).split(" ");
  const splitIndex = plan.kind === "add" ? 2 : 0;

  return (
    <div className="flex flex-col items-center">
      {/* 式。分ける数だけ枠で囲む */}
      <div className="flex items-center gap-2 text-4xl font-bold tabular-nums">
        {parts.map((part, i) => (
          <span
            key={i}
            className={cn(
              i === splitIndex && "rounded-xl border-2 border-primary px-2 py-0.5 text-primary"
            )}
          >
            {part}
          </span>
        ))}
        <span className="text-muted-foreground">=</span>
        <span className="text-muted-foreground">?</span>
      </div>

      {/* さくらんぼ。分ける数から2本の線が下りる */}
      <svg viewBox="0 0 140 62" className="mt-1 w-40" role="img" aria-label={`${target} を 2つに 分ける`}>
        <line x1={70} y1={2} x2={38} y2={26} className="stroke-primary" strokeWidth={2} />
        <line x1={70} y1={2} x2={102} y2={26} className="stroke-primary" strokeWidth={2} />
        <Bud x={38} value={left} on={active === "left"} />
        <Bud x={102} value={right} on={active === "right"} />
      </svg>
    </div>
  );
}

function Bud({ x, value, on }: { x: number; value: number | null; on: boolean }) {
  return (
    <g>
      <circle
        cx={x}
        cy={40}
        r={16}
        className={cn(
          value !== null ? "fill-primary/15 stroke-primary" : "fill-white",
          on ? "stroke-primary" : "stroke-border"
        )}
        strokeWidth={on ? 3 : 2}
        strokeDasharray={value === null && !on ? "4 3" : undefined}
      />
      <text
        x={x}
        y={40}
        textAnchor="middle"
        dominantBaseline="central"
        className={cn("text-[20px] font-bold", value !== null ? "fill-primary" : "fill-muted-foreground")}
      >
        {value ?? "?"}
      </text>
    </g>
  );
}

/**
 * 10 のまとまり。5×2 の枠に点を置く。
 *
 * たし算では前の数ぶんを置いて、**空いているところがそのまま「あといくつ」**。
 * ひき算では 10 こ置いてから、ひく数ぶんを消す。
 */
export function TenFrame({
  filled,
  removed = 0,
  label,
}: {
  filled: number;
  removed?: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="grid grid-cols-5 gap-1 rounded-lg border-2 border-border p-1.5">
        {Array.from({ length: 10 }, (_, i) => {
          const on = i < filled;
          const gone = on && i >= filled - removed;
          return (
            <span
              key={i}
              className={cn(
                "h-5 w-5 rounded-full border",
                gone
                  ? "border-danger/50 bg-danger/10"
                  : on
                    ? "border-primary bg-primary/70"
                    : "border-dashed border-border bg-white"
              )}
            />
          );
        })}
      </div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
