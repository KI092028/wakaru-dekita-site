/**
 * かけ算の意味（2年）。「1つ分の数 × いくつ分」。
 *
 * ## なぜここを作るか
 *
 * 九九は言えるのに**文章題になると式が立てられない**、というのは
 * 算数が苦手な子のいちばん多い訴え。
 * 原因は計算力ではなく、**かけ算が「1つ分の数」と「いくつ分」の
 * かけ合わせだと分かっていない**こと。
 *
 * 九九を先に覚えると、この意味が抜けたまま先へ進める。
 * ひっ算もわり算も、意味が抜けたまま手順だけで乗り切れてしまい、
 * 文章題になったところで初めて止まる。
 *
 * ## そこで、絵から2つの数をとり出させる
 *
 * 絵（さらにのっているクッキーなど）を見て、
 *
 * 1. **1つ分は いくつ？**
 * 2. **いくつ分 ある？**
 * 3. ぜんぶで いくつ？
 *
 * の順に答えさせる。式は子どもが埋めた数から組み立てて見せる。
 * **答えの数を先に聞かない。** 数えて出せてしまうと、
 * かけ算を使わずに終わってしまうから。
 *
 * ## 順序について
 *
 * 日本の教科書は「1つ分の数 × いくつ分」の順で書く。
 * ここでもその順にそろえているが、**答えの正誤には使っていない。**
 * 3×4 と 4×3 のどちらを正解とするかは議論があり、
 * ここで問いたいのは順序ではなく「2つの数が何を表しているか」だから。
 */

export type TimesScene = {
  /** 「さら」「はこ」 */
  container: string;
  /** 「クッキー」「えんぴつ」 */
  item: string;
  /** 「まい」「本」 */
  itemUnit: string;
  /** 入れものの数え方（「さら」なら「さら」） */
  containerUnit: string;
  /**
   * 「のっています」か「入っています」か。
   * さらには のる が、ふくろ・はこ・かご には 入る。
   * ここを共通にすると日本語がおかしくなる。
   */
  verb: string;
};

export type TimesPlan = {
  id: string;
  scene: TimesScene;
  /** 1つ分の数 */
  per: number;
  /** いくつ分 */
  groups: number;
  answer: number;
  /** 場面の文 */
  story: string;
  stage: string;
  /**
   * 同じ答えになる、1つ分といくつ分を入れかえた場面。
   * 「答えが同じでも場面はちがう」を見せる問題でだけ使う。
   */
  showsSwap: boolean;
};

export const totalOf = (plan: TimesPlan): number => plan.per * plan.groups;

/** 「3 × 4」 */
export const expressionOf = (plan: TimesPlan): string => `${plan.per} × ${plan.groups}`;

/** 「1さらに 3まい」 */
export const perPhrase = (plan: TimesPlan): string =>
  `1${plan.scene.containerUnit}に ${plan.per}${plan.scene.itemUnit}`;

/** 「4さら分」 */
export const groupsPhrase = (plan: TimesPlan): string =>
  `${plan.groups}${plan.scene.containerUnit}分`;

/** 入れかえた場面の言い方。「4こずつ 3さら」 */
export const swapPhrase = (plan: TimesPlan): string =>
  `1${plan.scene.containerUnit}に ${plan.groups}${plan.scene.itemUnit}が ${plan.per}${plan.scene.containerUnit}分`;

/** 「のっている」「入っている」。文の途中に置く形。 */
export const verbAttributive = (plan: TimesPlan): string =>
  plan.scene.verb.replace("います", "いる");

/** たし算で書くと、という比較。かけ算の良さを見せるのに使う。 */
export function asAddition(plan: TimesPlan): string {
  return Array.from({ length: plan.groups }, () => String(plan.per)).join(" + ");
}
