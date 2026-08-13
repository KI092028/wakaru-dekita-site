"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { borrowedValue, type ColumnPlan } from "@/lib/column/plan";
import type { ColumnStep, ColumnStepKind, DecimalInfo } from "@/lib/column/steps";

/**
 * たし算・ひき算のひっ算の盤面。整数でも小数でも使う。
 *
 * 進んだところまでしか書かない。完成した式を見せて埋めさせるのではなく、
 * 1手ずつ自分で書き足していく形にすることで、手順そのものが身につくようにしている。
 *
 * いちばん上の行は、たし算では「くり上がりの1」、ひき算では「借りたあとの数」が入る。
 * 紙のひっ算で同じ場所に書くものなので、行を分けていない。
 *
 * 小数のときは位と位のあいだに細い枠を挟む。答えの小数点を打つ手では
 * **すべてのすきまが押せる**ようにして、位置そのものを選ばせる。
 */

type Props = {
  plan: ColumnPlan;
  steps: ColumnStep[];
  stepIndex: number;
  input: string;
  wrong: boolean;
  onColumnTap: (index: number) => void;
  /** 小数のときだけ渡す */
  decimal?: DecimalInfo;
};

const CELL = "flex h-10 items-center justify-center text-2xl font-bold tabular-nums";
const GAP = "flex h-10 w-3 items-center justify-center text-2xl font-bold";

function Cell({ children, className }: { children?: ReactNode; className?: string }) {
  return <span className={cn(CELL, className)}>{children}</span>;
}

function Pending({ input, wrong }: { input: string; wrong: boolean }) {
  if (wrong) return <span className="text-danger line-through decoration-2">{input}</span>;
  return (
    <span className={cn("text-primary", input === "" && "text-muted-foreground/40")}>
      {input === "" ? "?" : input}
    </span>
  );
}

type Item = { kind: "col"; index: number } | { kind: "gap"; boundary: number };

export function ColumnBoard({
  plan,
  steps,
  stepIndex,
  input,
  wrong,
  onColumnTap,
  decimal,
}: Props) {
  // 左から右へ。位の大きい方から並べ、小数のときは位のあいだにすきまを挟む
  const items: Item[] = [];
  for (let i = plan.width - 1; i >= 0; i--) {
    items.push({ kind: "col", index: i });
    if (decimal && i > 0) items.push({ kind: "gap", boundary: i });
  }

  const current: ColumnStep | undefined = steps[stepIndex];

  const find = (kind: ColumnStepKind, index: number) =>
    steps.findIndex((s) => s.kind === kind && s.index === index);
  const done = (kind: ColumnStepKind, index: number) => {
    const i = find(kind, index);
    return i !== -1 && i < stepIndex;
  };
  const isCurrent = (kind: ColumnStepKind, index: number) =>
    current?.kind === kind && current.index === index;

  const choosingCarry = current?.kind === "carry";
  const choosingPoint = current?.kind === "point";
  // 小数点を問う手がない盤では、最初から打たれた状態にする
  const pointPlaced =
    decimal !== undefined &&
    (find("point", decimal.decimals) === -1 || done("point", decimal.decimals));

  /** その位が、けたをそろえるために書き足す 0 かどうか */
  const isPad = (side: "a" | "b", index: number) =>
    decimal?.padTarget === side && decimal.padColumns.includes(index);

  const gridTemplate = `auto ${items
    .map((item) => (item.kind === "col" ? "2.5rem" : "0.75rem"))
    .join(" ")}`;

  return (
    <div className="mx-auto grid w-fit" style={{ gridTemplateColumns: gridTemplate }}>
      {/* くり上がり・くり下がりを書く行 */}
      <Cell />
      {items.map((item) => {
        if (item.kind === "gap") return <span key={`m-g${item.boundary}`} className={GAP} />;
        const col = item.index;
        const carryDone = plan.op === "+" && done("carry", col - 1);
        const borrowDone = plan.op === "−" && col >= 1 && done("borrow", col - 1);

        if (choosingCarry) {
          return (
            <button
              key={`m-${col}`}
              type="button"
              onClick={() => onColumnTap(col)}
              className={cn(
                CELL,
                "rounded-lg border-2 border-dashed border-primary/60 text-base text-primary/50",
                "transition-colors hover:bg-primary/10"
              )}
              aria-label={`${col + 1}けた目の上に くり上がりを書く`}
            >
              1
            </button>
          );
        }

        let content: ReactNode = null;
        if (carryDone) content = <span className="text-base text-primary">1</span>;
        else if (borrowDone)
          content = <span className="text-base text-primary">{borrowedValue(plan, col - 1)}</span>;
        else if (plan.op === "−" && isCurrent("borrow", col - 1))
          content = (
            <span className="text-base">
              <Pending input={input} wrong={wrong} />
            </span>
          );

        return <Cell key={`m-${col}`}>{content}</Cell>;
      })}

      {/* 上の数 */}
      <Cell />
      {items.map((item) => {
        if (item.kind === "gap") {
          return (
            <span key={`a-g${item.boundary}`} className={GAP}>
              {decimal && item.boundary === decimal.decimals ? "." : ""}
            </span>
          );
        }
        const col = item.index;
        const lent = plan.op === "−" && plan.columns[col].lent && done("borrow", col - 1);
        const padding = isPad("a", col);

        // けた数を超える位には何も書かない（2.7 を 02.7 と書かないため）
        let content: ReactNode = col < plan.topWidth ? plan.columns[col].top : "";
        if (padding && !done("pad", col)) {
          content = isCurrent("pad", col) ? <Pending input={input} wrong={wrong} /> : null;
        } else if (padding) {
          content = <span className="text-primary">{plan.columns[col].top}</span>;
        }

        return (
          <Cell key={`a-${col}`} className={cn(lent && "text-muted-foreground line-through")}>
            {content}
          </Cell>
        );
      })}

      {/* 下の数と、ひっ算の横線 */}
      <Cell className="pr-1.5 text-muted-foreground">{plan.op}</Cell>
      {items.map((item) => {
        if (item.kind === "gap") {
          return (
            <span key={`b-g${item.boundary}`} className={cn(GAP, "border-b-2 border-foreground")}>
              {decimal && item.boundary === decimal.decimals ? "." : ""}
            </span>
          );
        }
        const col = item.index;
        const padding = isPad("b", col);

        let content: ReactNode = col < plan.bottomWidth ? plan.columns[col].bottom : "";
        if (padding && !done("pad", col)) {
          content = isCurrent("pad", col) ? <Pending input={input} wrong={wrong} /> : null;
        } else if (padding) {
          content = <span className="text-primary">{plan.columns[col].bottom}</span>;
        }

        return (
          <Cell key={`b-${col}`} className="border-b-2 border-foreground">
            {content}
          </Cell>
        );
      })}

      {/* 答え */}
      <Cell />
      {items.map((item) => {
        if (item.kind === "gap") {
          if (choosingPoint) {
            return (
              <button
                key={`r-g${item.boundary}`}
                type="button"
                onClick={() => onColumnTap(item.boundary)}
                className={cn(
                  GAP,
                  "rounded border-2 border-dashed border-primary/60 text-primary/50",
                  "transition-colors hover:bg-primary/10"
                )}
                aria-label={`${item.boundary + 1}けた目と ${item.boundary}けた目の あいだに 小数点を打つ`}
              >
                ·
              </button>
            );
          }
          return (
            <span key={`r-g${item.boundary}`} className={cn(GAP, "text-primary")}>
              {pointPlaced && decimal && item.boundary === decimal.decimals ? "." : ""}
            </span>
          );
        }

        const col = item.index;
        let content: ReactNode = null;
        if (done("write", col)) content = plan.columns[col].answer;
        else if (isCurrent("write", col)) content = <Pending input={input} wrong={wrong} />;

        return (
          <Cell key={`r-${col}`} className={cn(isCurrent("write", col) && "rounded bg-primary/10")}>
            {content}
          </Cell>
        );
      })}
    </div>
  );
}
