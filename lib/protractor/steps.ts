import {
  ALIGN_TOLERANCE,
  alignedSide,
  distance,
  isFlipped,
  isPlaced,
  nearestAlignment,
  normalizeDeg,
  zeroEnd,
  type AnglePlan,
  type Pose,
} from "./plan";

/**
 * 分度器の1手ごとの問いと、間違えたときに返す言葉。
 *
 * つまずきを3つに分けて扱う。
 * 中心を頂点に合わせる（place）／0 を辺に合わせる（align）／
 * 目もりを読む（read）は別の力で、まとめて「不正解」にすると
 * 何ができていないのか本人にも分からない。
 *
 * とくに **内側と外側の読み違い**（60度を120度と読む）は、
 * 「どちらのはしに 0 を合わせたか」を意識できていないことの現れなので、
 * 読みの誤りとしてではなく、合わせた辺に立ち返らせる形で返す。
 */

export type ProtractorStepKind = "guess" | "place" | "align" | "read";

export const PROTRACTOR_STEP_KINDS: ProtractorStepKind[] = ["guess", "place", "align", "read"];

export const PROTRACTOR_STEP_LABEL: Record<ProtractorStepKind, string> = {
  guess: "目分量で予想",
  place: "中心を合わせる",
  align: "0を合わせる",
  read: "目もりを読む",
};

/** 手順の帯に出す短い名前。横に並べても折り返さない長さにしてある。 */
export const PROTRACTOR_STEP_SHORT: Record<ProtractorStepKind, string> = {
  guess: "予想",
  place: "中心",
  align: "0の線",
  read: "読む",
};

/**
 * 目分量の当たり具合。**外れ幅で段階に分ける。**
 *
 * この単元でいちばん多い誤りは、60度を120度と読むこと。
 * 道具の当て方を直しても、**そもそも見当がついていない**子は、
 * 出てきた数がおかしいことに気づけない。
 *
 * そこで測る前に「だいたい何度だと思う？」を1手置く。
 * ここに正解・不正解はない（予想なので外れて当たり前）。
 * 大事なのは、**測ったあとに自分の予想と見くらべられる**こと。
 * 予想が 50°くらいだったのに 130° と読んだなら、読み方のほうが間違っている。
 */
export type GuessGrade = "spot" | "close" | "rough" | "far";

export function gradeGuess(guess: number, actual: number): GuessGrade {
  const gap = Math.abs(guess - actual);
  if (gap === 0) return "spot";
  if (gap <= 10) return "close";
  if (gap <= 25) return "rough";
  return "far";
}

export const GUESS_WORD: Record<GuessGrade, string> = {
  spot: "ピッタリ！",
  close: "いい線いってる！",
  rough: "まあまあ",
  far: "だいぶ ちがったね",
};

/** 予想したあとに返す言葉。直角より上か下かだけでも当たっていれば、そこを認める。 */
export function guessComment(guess: number, actual: number): string {
  const gap = Math.abs(guess - actual);
  const sameSide = (guess < 90) === (actual < 90);

  if (gap === 0) return "ぴったり 当てたね。分度器で たしかめてみよう";
  if (gap <= 10) return `ズレは ${gap}度。かなり 近いよ。分度器で たしかめてみよう`;
  if (sameSide) {
    return `ズレは ${gap}度。でも 直角（90度）より ${actual < 90 ? "小さい" : "大きい"} ことは 当たっているね`;
  }
  return `ズレは ${gap}度。この角は 直角（90度）より ${actual < 90 ? "小さい" : "大きい"} よ。よく見てみよう`;
}

// 手の並びは PROTRACTOR_STEP_KINDS の順そのもの。
// 当ててから読む、という順序自体が練習になるので入れかえない。

export function protractorStepPrompt(kind: ProtractorStepKind): string {
  switch (kind) {
    case "guess":
      return "はかる前に、目分量で。この角は だいたい 何度だと 思う？";
    case "place":
      return "分度器の 中心を、角の いただきに 合わせよう（分度器を ドラッグ）";
    case "align":
      return "分度器を まわして、まっすぐな へりを 辺に かさねよう";
    case "read":
      return "この 角の 大きさは 何度？";
  }
}

/** その手ができているか。read だけは打った数で判定するので別に扱う。 */
export function isStepDone(kind: "place" | "align", plan: AnglePlan, pose: Pose): boolean {
  return kind === "place" ? isPlaced(plan, pose) : alignedSide(plan, pose) !== null;
}

function diagnosePlace(plan: AnglePlan, pose: Pose): string {
  const gap = distance(pose, plan.vertex);
  if (gap > 60) {
    return "分度器の まん中の しるしを、2本の 辺が 交わる ところ（いただき）に 持っていこう";
  }
  return "もう すこし。分度器の まん中の しるしと、角の いただきが ぴったり 重なるまで 動かそう";
}

function diagnoseAlign(plan: AnglePlan, pose: Pose): string {
  if (isFlipped(plan, pose)) {
    return "へりは 辺に 合っているけれど、はかりたい 角が 分度器の 外に 出ているよ。半円の 中に 角が 入るように、ひっくり返そう";
  }
  const gap = normalizeDeg(pose.rotation - nearestAlignment(plan, pose));
  if (Math.abs(gap) <= ALIGN_TOLERANCE * 3) {
    return gap > 0 ? "あと すこし 右に まわそう" : "あと すこし 左に まわそう";
  }
  return "分度器の まっすぐな へりが、辺と ぴったり 重なるように まわそう。0 の 線が 辺の 上に くるよ";
}

/**
 * 目もりの読み。
 * side は、その子が実際に 0 を合わせた辺（合わせ方は2通りとも正しい）。
 */
function diagnoseRead(plan: AnglePlan, side: "base" | "other", typed: number): string {
  const end = zeroEnd(side) === "right" ? "右" : "左";

  if (typed === 180 - plan.angle) {
    return `0 を 合わせた 辺から 数えよう。いま 0 は ${end}はし に あるから、${end}はしの 0 から 進む ほうの 目もりだよ`;
  }
  if (typed === 180) {
    return "それは 分度器の はしまで の 大きさだね。もう一方の 辺が さしている ところを 読もう";
  }
  if (Math.abs(typed - plan.angle) <= 10) {
    return `おしい。${end}はしの 0 から 10とびで 数えて、そこから 細かい 目もりを 数えてみよう`;
  }
  return `${end}はしの 0 から 数えはじめて、辺が さしている 目もりを 読もう`;
}

export function diagnoseProtractorStep(
  kind: ProtractorStepKind,
  plan: AnglePlan,
  pose: Pose,
  typed: number,
  guess: number | null = null
): string {
  switch (kind) {
    case "guess":
      return "";
    case "place":
      return diagnosePlace(plan, pose);
    case "align":
      return diagnoseAlign(plan, pose);
    case "read": {
      // 自分の予想のほうが合っていたなら、まずそこに気づかせる。
      // 「内側と外側を取りちがえた」の正体は、たいていこれ
      if (guess !== null && typed === 180 - plan.angle) {
        const toActual = Math.abs(guess - plan.angle);
        const toTyped = Math.abs(guess - typed);
        if (toActual + 15 < toTyped) {
          return `自分で ${guess}度くらいと 予想したのに、${typed}度 と 読んだね。予想のほうが 合っているよ。0 を 合わせた 辺から 数えなおそう`;
        }
      }
      return diagnoseRead(plan, alignedSide(plan, pose) ?? "base", typed);
    }
  }
}

/** 同率のときの優先順。道具の当て方を、読みより先に見る。 */
export const PROTRACTOR_ADVICE_PRIORITY: ProtractorStepKind[] = ["align", "place", "read", "guess"];

export function protractorAdviceFor(kind: ProtractorStepKind): { text: string } {
  switch (kind) {
    case "guess":
      return {
        text: "目分量の 予想が よく 当たっていたよ。この 見当が つくと、目もりを 読みまちがえても 自分で 気づける",
      };
    case "place":
      return {
        text: "分度器の 中心を 合わせる ところで つまずいていたよ。まず「まん中の しるしを いただきに」、これだけを 先に やろう",
      };
    case "align":
      return {
        text: "0 を 辺に 合わせる ところで つまずいていたよ。中心が 合っていても、へりが ずれていると 目もりは 読めないんだね",
      };
    case "read":
      return {
        text: "目もりの 読み方で まよっていたよ。目もりが 2しゅるい あるのは、どちらの 辺に 0 を 合わせても よいから。「自分が 0 を 合わせた ほうから 数える」と おぼえよう",
      };
  }
}
