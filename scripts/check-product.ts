/**
 * かけ算じんとりの盤とルールを検査する。
 *
 *   npx tsx@4 --tsconfig tsconfig.json scripts/check-product.ts
 *
 * 対戦ものは、手で何回か遊んでも「起こりうる終わり方」を出しきれない。
 * ここではランダムに何百回も対戦させて、**盤が壊れないこと**を確かめる。
 */

import { BOARD, FACTORS, SIZE, WINNING_LINES, findCell } from "../lib/product/board";
import {
  canMove,
  countOwned,
  hasAnyMove,
  isOpen,
  move,
  newGame,
  productOf,
  type GameState,
} from "../lib/product/game";

const problems: string[] = [];
const fail = (message: string) => problems.push(message);

// --- 盤そのもの
{
  const cells = BOARD.flat();
  if (BOARD.length !== SIZE || BOARD.some((r) => r.length !== SIZE)) fail("盤が 6×6 でない");
  if (new Set(cells).size !== cells.length) fail("同じ数が2回ある");

  // **1〜9 どうしのかけ算の答えと、ちょうど一致すること。**
  // ここがずれると、取れないマスや、置けない答えが出る
  const products = new Set<number>();
  for (const a of FACTORS) for (const b of FACTORS) products.add(a * b);
  if (products.size !== cells.length) fail(`答えは ${products.size} 通り、盤は ${cells.length} マス`);
  for (const p of products) if (!cells.includes(p)) fail(`盤に無い答え: ${p}`);
  for (const c of cells) if (!products.has(c)) fail(`かけ算で出ない数が盤にある: ${c}`);

  // 小さい順にならんでいること（さがしやすさ）
  const sorted = [...cells].sort((a, b) => a - b);
  if (cells.join(",") !== sorted.join(",")) fail("盤が小さい順になっていない");

  for (const c of cells) if (findCell(c) === null) fail(`${c} の場所が引けない`);
  if (findCell(11) !== null) fail("盤に無い数の場所が引けてしまう");

  // 勝ちの並び
  if (WINNING_LINES.length === 0) fail("勝ちの並びが無い");
  for (const line of WINNING_LINES) {
    if (line.length !== 4) fail("4つ ならびでない");
    for (const c of line) {
      if (c.row < 0 || c.row >= SIZE || c.col < 0 || c.col >= SIZE) fail("盤の外を指している");
    }
  }
  // 6×6 で4つならび：よこ 3×6、たて 3×6、ななめ 2方向×9 = 18+18+18 = 54
  if (WINNING_LINES.length !== 54) fail(`勝ちの並びが ${WINNING_LINES.length} 通り（54のはず）`);
}

// --- はじめの手
{
  const start = newGame();
  if (start.opened) fail("はじめから opened になっている");
  if (start.turn !== 1) fail("先手が1でない");
  // 1つ置いただけでは相手の番にならない
  const one = move(start, 0, 3);
  if (one.turn !== 1) fail("1つ置いただけで番が変わった");
  if (one.opened) fail("1つ置いただけで opened になった");
  // 2つ目を置くと相手の番へ。**マスはまだ取らない**
  const two = move(one, 1, 4);
  if (!two.opened) fail("2つ置いても opened にならない");
  if (two.turn !== 2) fail("2つ置いても番が変わらない");
  if (countOwned(two)[1] !== 0) fail("はじめの手でマスを取ってしまった");
  // 盤に無い数は置けない
  if (move(start, 0, 10) !== start) fail("1〜9 の外を置けてしまった");
  if (move(start, 0, 0) !== start) fail("0 を置けてしまった");
}

// --- 取ったあとのきまり
{
  let state = move(move(newGame(), 0, 3), 1, 4); // こまは 3 と 4、2の番
  const before = state.markers;
  state = move(state, 0, 5); // 5×4 = 20 を取る
  if (state.markers[1] !== before[1]) fail("動かしていないほうのこまが動いた");
  const cell = findCell(20)!;
  if (state.owner[cell.row][cell.col] !== 2) fail("取ったマスの持ち主がちがう");
  if (state.turn !== 1) fail("取ったのに番が変わらない");
  // 取られたマスはもう取れない
  if (isOpen(state, 20)) fail("取られたマスが空いている扱い");
  if (canMove(state, 0, 5)) fail("取られたマスをもう一度取れてしまう");
  if (move(state, 0, 5) !== state) fail("取られたマスへの手が通ってしまった");
}

// --- ランダム対戦
{
  let wins = 0;
  let draws = 0;
  let byCount = 0;
  const GAMES = 500;

  for (let g = 0; g < GAMES; g++) {
    let state: GameState = newGame();
    // はじめの手
    state = move(state, 0, FACTORS[Math.floor(Math.random() * 9)]);
    state = move(state, 1, FACTORS[Math.floor(Math.random() * 9)]);

    let turns = 0;
    while (state.winner === null && !state.draw) {
      turns += 1;
      if (turns > 200) {
        fail("対戦が終わらない");
        break;
      }
      const moves: { which: 0 | 1; value: number }[] = [];
      for (const which of [0, 1] as const) {
        for (const value of FACTORS) {
          if (canMove(state, which, value)) moves.push({ which, value });
        }
      }
      if (moves.length === 0) {
        fail("打てる手が無いのに終わっていない");
        break;
      }
      const chosen = moves[Math.floor(Math.random() * moves.length)];
      const before = countOwned(state);
      const next = move(state, chosen.which, chosen.value);
      const after = countOwned(next);
      // 1手で取れるマスはちょうど1つ
      if (after[1] + after[2] !== before[1] + before[2] + 1) fail("1手でマスが1つ増えていない");
      // 動かしたのは1つだけ
      const moved = [0, 1].filter((i) => next.markers[i] !== state.markers[i]);
      if (moved.length > 1) fail("1手で2つ動いた");
      // 取ったのは、いま番の人
      if (next.owner.flat().filter((o) => o === state.turn).length !== before[state.turn] + 1) {
        fail("番でない人のマスが増えた");
      }
      state = next;
    }

    if (state.winner !== null) {
      if (state.winningLine !== null) {
        // 勝ちの並びが、ほんとうに その人の 4つならびか
        if (!state.winningLine.every((c) => state.owner[c.row][c.col] === state.winner)) {
          fail("勝ちの並びの持ち主がちがう");
        }
        wins += 1;
      } else {
        // 並ばずに終わったときは、マスの数で決まっている
        const counts = countOwned(state);
        if (counts[state.winner] <= counts[state.winner === 1 ? 2 : 1]) {
          fail("マスの少ないほうが勝ちになった");
        }
        if (hasAnyMove(state)) fail("まだ打てるのに終わった");
        byCount += 1;
      }
    } else if (state.draw) {
      if (hasAnyMove(state)) fail("まだ打てるのに引き分けになった");
      draws += 1;
    }

    // 終わったあとは、何を打っても動かない
    const frozen = move(state, 0, 5);
    if (frozen !== state) fail("終わったあとに手が通った");
  }

  if (wins + draws + byCount !== GAMES) fail("終わり方が数えきれていない");
  // 4つならびで決まる対戦が、まったく起きないなら盤かルールがおかしい
  if (wins === 0) fail("4つならびで決まる対戦が1回も起きなかった");
  console.log(`  ランダム対戦 ${GAMES} 回: 4つならび ${wins} / マスの数 ${byCount} / 引き分け ${draws}`);
}

// --- かけ算のこたえ
{
  if (productOf([3, 4]) !== 12) fail("かけ算がちがう");
  if (productOf([null, 4]) !== null) fail("こまが片方だけで答えが出た");
}

if (problems.length === 0) {
  console.log("OK: 盤・ルール・ランダム対戦をすべて確認");
} else {
  const seen = new Map<string, number>();
  for (const p of problems) seen.set(p, (seen.get(p) ?? 0) + 1);
  console.log(`NG: ${problems.length} 件`);
  for (const [message, n] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${n} 回  ${message}`);
  }
  process.exit(1);
}
