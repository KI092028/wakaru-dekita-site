/**
 * かけ算じんとり（2人で遊ぶ）。
 *
 * ## なぜこれを作るか
 *
 * game-elements.md の判断基準は「**その要素を抜いたら中核が残るか**」。
 * 点数・ランク・見た目の変化は、抜いても中核が残る＝外側の層で、
 * 前に効かなかった道だと結論している。
 *
 * このゲームは**勝敗を抜くと何も残らない。** 中核が勝負そのものなので、
 * 基準を満たす。ドリルに点数を被せるのとは別のものになる。
 *
 * ## ルール（Product Game）
 *
 * - 盤は 6×6。**1〜9 どうしをかけた答えが、ちょうど36通り**あるので埋まる
 * - 下の「1〜9」に、こまが2つ乗っている
 * - 自分の番は、**こまを1つだけ動かす。** 2つのこまがさす数のかけ算の
 *   答えのマスを取る
 * - たて・よこ・ななめに **4つ ならべたら 勝ち**
 * - はじめの人は、2つのこまを **置くだけ**（まだ取れない）。
 *   ここで取れると先手が有利になりすぎる
 *
 * ## どこが算数か
 *
 * 「どのマスを取るか」ではなく、**「相手に どの数を 渡すか」**を考えることになる。
 * こまは1つしか動かせないので、自分が取ったあと、相手が次に何を取れるかが決まる。
 * 九九を覚えているだけでは勝てない——**逆から考える**必要が出る。
 */

/** 盤の並び。1〜9 どうしのかけ算の答え36通りを、小さい順に6列で並べる。 */
export const BOARD: number[][] = [
  [1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 12, 14],
  [15, 16, 18, 20, 21, 24],
  [25, 27, 28, 30, 32, 35],
  [36, 40, 42, 45, 48, 49],
  [54, 56, 63, 64, 72, 81],
];

export const SIZE = 6;
/** ならべたら勝ちになる数 */
export const WIN_LENGTH = 4;

/** こまを乗せる数 */
export const FACTORS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** 盤にある数を、位置から引く */
export const numberAt = (row: number, col: number): number => BOARD[row][col];

/** その数が盤のどこにあるか。無ければ null */
export function findCell(value: number): { row: number; col: number } | null {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (BOARD[row][col] === value) return { row, col };
    }
  }
  return null;
}

/**
 * 勝ちになる並びをぜんぶ。たて・よこ・ななめ（両向き）の4つならび。
 * 盤は動かないので、はじめに1回だけ作る。
 */
export const WINNING_LINES: { row: number; col: number }[][] = (() => {
  const lines: { row: number; col: number }[][] = [];
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      for (const { dr, dc } of directions) {
        const cells = [];
        for (let i = 0; i < WIN_LENGTH; i++) {
          cells.push({ row: row + dr * i, col: col + dc * i });
        }
        if (cells.every((c) => c.row >= 0 && c.row < SIZE && c.col >= 0 && c.col < SIZE)) {
          lines.push(cells);
        }
      }
    }
  }
  return lines;
})();
