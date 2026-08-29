import { FACTORS, SIZE, WINNING_LINES, findCell } from "./board";

/**
 * かけ算じんとりの、盤の状態と手の進め方。
 *
 * 画面から切り離してあるので、まとめて機械で試せる
 * （scripts/check-product.ts でランダムに何百回も対戦させている）。
 */

export type Player = 1 | 2;

/** 各マスの持ち主。取られていなければ null */
export type Owner = (Player | null)[][];

export type GameState = {
  owner: Owner;
  /** こまが乗っている2つの数。まだ置いていなければ null */
  markers: [number | null, number | null];
  turn: Player;
  /** はじめの「置くだけ」の手が終わったか */
  opened: boolean;
  winner: Player | null;
  /** 勝ちが決まった並び。線を引くのに使う */
  winningLine: { row: number; col: number }[] | null;
  /** 引き分け（もう取れるマスが無い） */
  draw: boolean;
};

const emptyOwner = (): Owner =>
  Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));

export function newGame(): GameState {
  return {
    owner: emptyOwner(),
    markers: [null, null],
    turn: 1,
    opened: false,
    winner: null,
    winningLine: null,
    draw: false,
  };
}

export const productOf = (markers: [number | null, number | null]): number | null =>
  markers[0] !== null && markers[1] !== null ? markers[0] * markers[1] : null;

/** そのマスが空いているか。 */
export function isOpen(state: GameState, value: number): boolean {
  const cell = findCell(value);
  if (cell === null) return false;
  return state.owner[cell.row][cell.col] === null;
}

/**
 * その手が打てるか。
 *
 * - はじめの手は、2つとも置くだけ（どこでもよい）
 * - それ以降は、**こまを1つだけ**動かす。もう片方は動かせない
 * - できあがった答えのマスが空いていること
 */
export function canMove(state: GameState, which: 0 | 1, value: number): boolean {
  if (state.winner !== null || state.draw) return false;
  if (!FACTORS.includes(value)) return false;
  if (!state.opened) return true;

  const next: [number | null, number | null] = [...state.markers];
  next[which] = value;
  const product = productOf(next);
  if (product === null) return false;
  return isOpen(state, product);
}

/** その番の人が打てる手が1つでもあるか。 */
export function hasAnyMove(state: GameState): boolean {
  if (!state.opened) return true;
  for (const which of [0, 1] as const) {
    for (const value of FACTORS) {
      if (canMove(state, which, value)) return true;
    }
  }
  return false;
}

/** 勝ちの並びをさがす。 */
function findWin(owner: Owner, player: Player): { row: number; col: number }[] | null {
  for (const line of WINNING_LINES) {
    if (line.every((c) => owner[c.row][c.col] === player)) return line;
  }
  return null;
}

/**
 * こまを動かして、マスを取る。
 *
 * 打てない手が来たら、状態を変えずにそのまま返す。
 * 画面側でボタンを押せなくしているが、**ここでも受け付けない**
 * （画面の作りが変わっても、盤が壊れないように）。
 */
export function move(state: GameState, which: 0 | 1, value: number): GameState {
  if (!canMove(state, which, value)) return state;

  const markers: [number | null, number | null] = [...state.markers];
  markers[which] = value;

  // はじめの手：2つとも置くだけ。両方そろったら相手の番へ
  if (!state.opened) {
    const both = markers[0] !== null && markers[1] !== null;
    return {
      ...state,
      markers,
      opened: both,
      turn: both ? (state.turn === 1 ? 2 : 1) : state.turn,
    };
  }

  const product = productOf(markers);
  if (product === null) return state;
  const cell = findCell(product);
  if (cell === null) return state;

  const owner = state.owner.map((row) => [...row]);
  owner[cell.row][cell.col] = state.turn;

  const line = findWin(owner, state.turn);
  const next: GameState = {
    ...state,
    owner,
    markers,
    winner: line === null ? null : state.turn,
    winningLine: line,
    turn: state.turn === 1 ? 2 : 1,
    draw: false,
  };

  // 相手に打てる手が1つも無ければ、そこで終わり。取ったマスの多いほうが勝ち
  if (next.winner === null && !hasAnyMove(next)) {
    const counts = countOwned(next);
    return {
      ...next,
      draw: counts[1] === counts[2],
      winner: counts[1] === counts[2] ? null : counts[1] > counts[2] ? 1 : 2,
    };
  }

  return next;
}

/** 取ったマスの数。 */
export function countOwned(state: GameState): Record<Player, number> {
  let one = 0;
  let two = 0;
  for (const row of state.owner) {
    for (const cell of row) {
      if (cell === 1) one += 1;
      if (cell === 2) two += 1;
    }
  }
  return { 1: one, 2: two };
}

/** いま動かせるほうのこま。はじめの手では両方。 */
export function movableMarkers(state: GameState): (0 | 1)[] {
  if (!state.opened) return [0, 1];
  return [0, 1];
}

/** その数に動かしたとき取れるマス。画面の下じきに使う。 */
export function previewOf(
  state: GameState,
  which: 0 | 1,
  value: number
): { product: number; open: boolean } | null {
  const next: [number | null, number | null] = [...state.markers];
  next[which] = value;
  const product = productOf(next);
  if (product === null) return null;
  return { product, open: isOpen(state, product) };
}
