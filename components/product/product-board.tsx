"use client";

import { cn } from "@/lib/utils";
import { BOARD } from "@/lib/product/board";
import type { GameState, Player } from "@/lib/product/game";

/**
 * 6×6 の盤。取ったマスに色がつく。
 *
 * 色は2人ぶん。**色だけで区別させない。** 取ったマスには
 * その人の印（●／▲）も出すので、色の見え方に差があっても分かる。
 */

export const PLAYER_LABEL: Record<Player, string> = { 1: "ひとり目", 2: "ふたり目" };
export const PLAYER_MARK: Record<Player, string> = { 1: "●", 2: "▲" };

type Props = {
  state: GameState;
  /** いま取ろうとしているマスの数 */
  pendingProduct: number | null;
};

export function ProductBoard({ state, pendingProduct }: Props) {
  const winning = new Set(
    (state.winningLine ?? []).map((c) => `${c.row}-${c.col}`)
  );

  return (
    <div className="mx-auto grid max-w-[22rem] grid-cols-6 gap-1">
      {BOARD.map((row, r) =>
        row.map((value, c) => {
          const owner = state.owner[r][c];
          const isPending = pendingProduct === value && owner === null;
          const isWinning = winning.has(`${r}-${c}`);
          return (
            <div
              key={`${r}-${c}`}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-lg border-2 text-sm font-bold tabular-nums transition-colors",
                owner === 1
                  ? "border-primary bg-primary/20 text-primary"
                  : owner === 2
                    ? "border-secondary bg-secondary/20 text-secondary"
                    : isPending
                      ? "border-foreground bg-foreground/10 text-foreground ring-2 ring-foreground"
                      : "border-border bg-background text-muted-foreground",
                isWinning && "ring-2 ring-success ring-offset-1"
              )}
            >
              <span>{value}</span>
              {owner !== null && (
                <span className="text-[9px] leading-none">{PLAYER_MARK[owner]}</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
