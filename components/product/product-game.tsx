"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FinishActions } from "@/components/learn/finish-actions";
import { Card, CardContent } from "@/components/ui/card";
import { PLAYER_LABEL, PLAYER_MARK, ProductBoard } from "@/components/product/product-board";
import { cn } from "@/lib/utils";

import { FACTORS } from "@/lib/product/board";
import {
  canMove,
  countOwned,
  move,
  newGame,
  previewOf,
  productOf,
  type GameState,
} from "@/lib/product/game";

/**
 * かけ算じんとり。1台を2人で回す。
 *
 * **勝敗を抜くと何も残らない**ので、点数を被せただけの
 * 「外側の層」にはならない（→ game-elements.md 4）。
 *
 * 記録は取らない。勝ち負けを端末に残しても、次にやることが分かるわけではない。
 * このサイトでは、はじめて localStorage を使わない単元になる。
 */

type Pending = { which: 0 | 1; value: number } | null;

export function ProductGame() {
  const [state, setState] = useState<GameState>(newGame);
  const [pending, setPending] = useState<Pending>(null);

  const finished = state.winner !== null || state.draw;
  const counts = countOwned(state);

  // 動かしたあとのこま。まだ決めていなければ、いまのまま
  const shownMarkers: [number | null, number | null] = pending
    ? ((): [number | null, number | null] => {
        const next: [number | null, number | null] = [...state.markers];
        next[pending.which] = pending.value;
        return next;
      })()
    : state.markers;

  const pendingProduct = pending ? productOf(shownMarkers) : null;

  function tap(which: 0 | 1, value: number) {
    if (finished) return;
    // はじめの手は「置くだけ」なので、押した時点で決まる
    if (!state.opened) {
      setState(move(state, which, value));
      return;
    }
    if (!canMove(state, which, value)) return;
    setPending({ which, value });
  }

  function commit() {
    if (pending === null) return;
    setState(move(state, pending.which, pending.value));
    setPending(null);
  }

  function restart() {
    setState(newGame());
    setPending(null);
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardContent className="py-6">
          <Header state={state} counts={counts} />

          <div className="mb-4">
            <ProductBoard state={state} pendingProduct={pendingProduct} />
          </div>

          {finished ? (
            <div className="text-center">
              <p className="wd-pop-in mb-2 text-2xl font-bold text-success">
                {state.draw
                  ? "引き分け！"
                  : `${PLAYER_LABEL[state.winner!]}の 勝ち！`}
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                {state.winningLine !== null
                  ? "たて・よこ・ななめに 4つ ならびました"
                  : `もう 取れる マスが ありません。${counts[1]} 対 ${counts[2]}`}
              </p>
              <FinishActions onRestart={restart} restartLabel="もういちど" />
            </div>
          ) : (
            <>
              <p className="mb-3 text-balance text-center text-sm font-medium">
                {!state.opened
                  ? `${PLAYER_LABEL[state.turn]}は、こまを 2つとも おこう（まだ 取れないよ）`
                  : `${PLAYER_LABEL[state.turn]}の ばん。こまを 1つだけ 動かそう`}
              </p>

              <div className="space-y-3">
                {([0, 1] as const).map((which) => (
                  <FactorRow
                    key={which}
                    which={which}
                    label={which === 0 ? "こま①" : "こま②"}
                    state={state}
                    pending={pending}
                    onTap={tap}
                  />
                ))}
              </div>

              {state.opened && (
                <div className="mt-4 text-center">
                  <p className="mb-2 text-lg font-bold tabular-nums">
                    {shownMarkers[0] ?? "?"} × {shownMarkers[1] ?? "?"} ={" "}
                    <span className={pendingProduct ? "text-primary" : "text-muted-foreground/40"}>
                      {pendingProduct ?? "?"}
                    </span>
                  </p>
                  <Button size="lg" onClick={commit} disabled={pending === null}>
                    {pending === null ? "こまを えらぼう" : `${pendingProduct} を とる`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5 text-sm text-muted-foreground">
          <p className="mb-2 text-center text-xs font-bold text-foreground">あそびかた</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>はじめの人は、下の こまを 2つとも おく（まだ 取れない）</li>
            <li>つぎの人から、こまを <strong className="text-foreground">1つだけ</strong> 動かす</li>
            <li>2つの数の かけ算の 答えの マスを 取る</li>
            <li>たて・よこ・ななめに <strong className="text-foreground">4つ ならべたら 勝ち</strong></li>
          </ol>
          <p className="mt-3">
            取られた マスには 動かせません。
            <strong className="text-foreground">
              自分が 取ったあと、相手が 何を 取れるかも 考えてみよう。
            </strong>
          </p>
          <div className="mt-3 text-center">
            <Button variant="outline" size="sm" onClick={restart}>
              はじめから
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Header({ state, counts }: { state: GameState; counts: Record<1 | 2, number> }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2">
      {([1, 2] as const).map((player) => (
        <div
          key={player}
          className={cn(
            "rounded-xl border-2 px-3 py-2 text-center transition-colors",
            player === 1 ? "border-primary/40" : "border-secondary/40",
            state.turn === player &&
              state.winner === null &&
              !state.draw &&
              (player === 1 ? "bg-primary/15" : "bg-secondary/15"),
            state.winner === player && "ring-2 ring-success"
          )}
        >
          <p
            className={cn(
              "text-xs font-bold",
              player === 1 ? "text-primary" : "text-secondary"
            )}
          >
            {PLAYER_MARK[player]} {PLAYER_LABEL[player]}
          </p>
          <p className="text-lg font-bold tabular-nums">{counts[player]} マス</p>
        </div>
      ))}
    </div>
  );
}

/**
 * こまを乗せる 1〜9 の帯。
 *
 * 押せない数（取れるマスが もう 無い数）は、はじめから 押せなくしておく。
 * 押してから「そこは 取られています」と言うより、
 * **押せないことが 見えている**ほうが早い。
 */
function FactorRow({
  which,
  label,
  state,
  pending,
  onTap,
}: {
  which: 0 | 1;
  label: string;
  state: GameState;
  pending: Pending;
  onTap: (which: 0 | 1, value: number) => void;
}) {
  const here = pending?.which === which ? pending.value : state.markers[which];
  // 動かすのは1つだけ。もう片方をえらんでいる間は、こちらは動かせない
  const locked = state.opened && pending !== null && pending.which !== which;

  return (
    <div>
      <p className="mb-1 text-center text-[11px] font-bold text-muted-foreground">
        {label}
        {locked && "（この番は 動かせません）"}
      </p>
      {/* 9列に並べると1つ33pxしかなく、指で押せない。5列2段にする */}
      <div className="grid grid-cols-5 gap-1.5">
        {FACTORS.map((value) => {
          const chosen = here === value;
          const preview = state.opened ? previewOf(state, which, value) : null;
          const disabled = locked || (state.opened && !canMove(state, which, value));
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onTap(which, value)}
              className={cn(
                "flex min-h-[44px] flex-col items-center justify-center rounded-lg border-2 py-1.5 text-base font-bold tabular-nums transition-colors",
                chosen
                  ? "border-foreground bg-foreground text-background"
                  : "border-input bg-background hover:border-primary",
                disabled && !chosen && "opacity-35"
              )}
            >
              <span>{value}</span>
              {preview && (
                <span className="text-[8px] leading-none opacity-70">{preview.product}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
