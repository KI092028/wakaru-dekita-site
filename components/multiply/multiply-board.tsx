"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { MultiplyPlan } from "@/lib/multiply/plan";
import type { MultiplyStep } from "@/lib/multiply/steps";

/**
 * かけ算のひっ算の盤面。
 *
 * たし算・ひき算（ColumnBoard）は1行で答えが出るが、かけ算は
 * **かける数のけたごとに1行（部分積）**ができ、最後にそれを足す。
 * 行の作りが根本的に違うので、盤を分けている。
 *
 * 進んだところまでしか書かない。完成した式を埋めさせるのではなく、
 * 1手ずつ自分で書き足していく形にすることで、手順そのものが身につくようにしている。
 *
 * 部分積の上にある細い行が、九九のくり上がりを書く場所。
 * 紙のひっ算で小さく書きそえるのと同じで、頭で覚えずに書けるようにしてある。
 *
 * 「2だんめを どこから 書きはじめるか」の手では、その段のますが
 * **すべて押せる**ようになる。位置そのものを選ばせないと、
 * ずらす意味が分からないまま形だけ覚えることになるため。
 */

type Props = {
  plan: MultiplyPlan;
  steps: MultiplyStep[];
  stepIndex: number;
  input: string;
  wrong: boolean;
  onColumnTap: (column: number) => void;
};

const CELL = "flex h-10 items-center justify-center text-2xl font-bold tabular-nums";
const CARRY = "flex h-6 items-center justify-center text-sm font-bold";

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

export function MultiplyBoard({ plan, steps, stepIndex, input, wrong, onColumnTap }: Props) {
  // 左から右へ。位の大きい方から並べる
  const columns: number[] = [];
  for (let i = plan.width - 1; i >= 0; i--) columns.push(i);

  const current: MultiplyStep | undefined = steps[stepIndex];

  /** 条件に合う手が、済んでいるか・いま問われているか。 */
  function stepAt(match: (step: MultiplyStep) => boolean) {
    const i = steps.findIndex(match);
    return { exists: i !== -1, done: i !== -1 && i < stepIndex, current: i === stepIndex };
  }

  const firstStepOf = (partial: number) => steps.findIndex((s) => s.partial === partial);
  const firstAdd = steps.findIndex((s) => s.kind === "add");

  const gridTemplate = `auto ${columns.map(() => "2.5rem").join(" ")}`;

  /** 上の数・下の数の1行。けた数を超える位には何も書かない。 */
  const operandRow = (value: number, valueWidth: number, sign: string, underline: boolean) => (
    <>
      <Cell className="pr-1.5 text-muted-foreground">{sign}</Cell>
      {columns.map((col) => (
        <Cell key={`${sign}-${col}`} className={cn(underline && "border-b-2 border-foreground")}>
          {col < valueWidth ? Math.floor(value / 10 ** col) % 10 : ""}
        </Cell>
      ))}
    </>
  );

  return (
    <div className="mx-auto grid w-fit" style={{ gridTemplateColumns: gridTemplate }}>
      {operandRow(plan.a, plan.aWidth, "", false)}
      {operandRow(plan.b, plan.bWidth, "×", true)}

      {plan.partials.map((partial, j) => {
        if (stepIndex < firstStepOf(j)) return null;

        const choosingStart = current?.kind === "shift" && current.partial === j;
        // くり上がりを書く場所は空けておくが、まだ書きはじめていない段では
        // ただの空白になってしまうので、九九に入ってから出す
        const hasCarry =
          !choosingStart && steps.some((s) => s.kind === "carry" && s.partial === j);
        // 2だんめまで書けたら、そこで線を引いて たし算に入る
        const underline = plan.sumPlan !== null && j === plan.partials.length - 1;

        return (
          <div key={`p-${j}`} className="contents">
            {hasCarry && (
              <>
                <span className={CARRY} />
                {columns.map((col) => {
                  const carry = stepAt(
                    (s) => s.kind === "carry" && s.partial === j && s.column === col
                  );
                  let content: ReactNode = null;
                  if (carry.done) {
                    const step = steps.find(
                      (s) => s.kind === "carry" && s.partial === j && s.column === col
                    );
                    content = <span className="text-primary">{step?.answer}</span>;
                  } else if (carry.current) {
                    content = <Pending input={input} wrong={wrong} />;
                  }
                  return (
                    <span key={`c${j}-${col}`} className={CARRY}>
                      {content}
                    </span>
                  );
                })}
              </>
            )}

            <Cell className="pr-1.5 text-xs text-muted-foreground">
              {plan.partials.length > 1 ? `${j + 1}だん` : ""}
            </Cell>
            {columns.map((col) => {
              if (choosingStart) {
                return (
                  <button
                    key={`p${j}-${col}`}
                    type="button"
                    onClick={() => onColumnTap(col)}
                    className={cn(
                      CELL,
                      "rounded-lg border-2 border-dashed border-primary/60 text-primary/40",
                      "transition-colors hover:bg-primary/10"
                    )}
                    aria-label={`${j + 1}だんめを ${col + 1}けた目から 書きはじめる`}
                  >
                    ·
                  </button>
                );
              }

              const i = col - partial.digitIndex;
              const inRange = i >= 0 && i < partial.cells.length;
              const product = inRange
                ? stepAt((s) => s.kind === "product" && s.partial === j && s.cell === i)
                : { exists: false, done: false, current: false };

              let content: ReactNode = null;
              if (product.done) content = partial.cells[i].digit;
              else if (product.current) content = <Pending input={input} wrong={wrong} />;

              return (
                <Cell
                  key={`p${j}-${col}`}
                  className={cn(
                    product.current && "rounded bg-primary/10",
                    underline && "border-b-2 border-foreground"
                  )}
                >
                  {content}
                </Cell>
              );
            })}
          </div>
        );
      })}

      {plan.sumPlan !== null && firstAdd !== -1 && stepIndex >= firstAdd && (
        <>
          <Cell />
          {columns.map((col) => {
            const add = stepAt((s) => s.kind === "add" && s.cell === col);
            let content: ReactNode = null;
            if (add.done) content = plan.sumPlan!.columns[col].answer;
            else if (add.current) content = <Pending input={input} wrong={wrong} />;

            return (
              <Cell key={`t-${col}`} className={cn(add.current && "rounded bg-primary/10")}>
                {content}
              </Cell>
            );
          })}
        </>
      )}
    </div>
  );
}
