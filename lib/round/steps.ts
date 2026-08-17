import {
  digitAt,
  digitCount,
  placeName,
  targetText,
  truncated,
  type RoundPlan,
} from "./plan";

/**
 * がい数の1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は3つ。
 *
 * 1. `look`   四捨五入で見る位をタップする **← ここが本体**
 * 2. `updown` その数字を見て、切り上げか切り捨てかを決める
 * 3. `write`  答えを打つ
 */

export type RoundStepKind = "look" | "updown" | "write";

export const ROUND_STEP_KINDS: RoundStepKind[] = ["look", "updown", "write"];

export const ROUND_STEP_LABEL: Record<RoundStepKind, string> = {
  look: "見る位をさがす",
  updown: "切り上げ・切り捨て",
  write: "書く",
};

export const ROUND_STEP_SHORT: Record<RoundStepKind, string> = {
  look: "見る位",
  updown: "上げる・捨てる",
  write: "書く",
};

/** 見る位を外していれば、その先は全部ずれる。 */
export const ROUND_ADVICE_PRIORITY: RoundStepKind[] = ["look", "write", "updown"];

export function roundStepPrompt(plan: RoundPlan, kind: RoundStepKind): string {
  switch (kind) {
    case "look":
      return "四捨五入で 見る位は どれ？ タップしよう";
    case "updown":
      return `見る位の 数字は ${digitAt(plan.value, plan.lookExp)}。切り上げ？ 切り捨て？`;
    case "write":
      return `${targetText(plan)}に すると いくつ？`;
  }
}

/**
 * 見る位の取りちがえ。
 *
 * **残す位そのものをタップした形をいちばんに拾う。**
 * 「百の位までのがい数」で百の位を四捨五入してしまうのが、この単元の代表的な誤り。
 */
export function diagnoseLook(plan: RoundPlan, exp: number): string | null {
  if (exp === plan.lookExp) return null;

  if (exp === plan.keepExp) {
    return plan.kind === "place"
      ? `そこは のこす位だよ。${placeName(plan.keepExp)}「までの」がい数 なので、${placeName(plan.keepExp)}は 答えに のこる。四捨五入するのは その 1つ下の ${placeName(plan.lookExp)}`
      : `そこは のこす位だよ。上から ${digitCount(plan.value) - plan.keepExp}けた のこすので、その 次の けたを 見る`;
  }

  if (exp > plan.keepExp) {
    return `そこは 答えに そのまま のこる位だよ。四捨五入するのは ${placeName(plan.lookExp)}`;
  }

  return `そこは もっと 下の位。四捨五入するのは ${placeName(plan.lookExp)}（いま タップしたのは ${placeName(exp)}）`;
}

/** 切り上げ・切り捨ての取りちがえ。 */
export function diagnoseUpDown(plan: RoundPlan, pickedUp: boolean): string | null {
  if (pickedUp === plan.roundUp) return null;
  const d = digitAt(plan.value, plan.lookExp);
  return plan.roundUp
    ? `${d} は 5 以上だから 切り上げだよ。0・1・2・3・4 なら 切り捨て、5・6・7・8・9 なら 切り上げ`
    : `${d} は 5 より 小さいから 切り捨てだよ。0・1・2・3・4 なら 切り捨て、5・6・7・8・9 なら 切り上げ`;
}

/** 答えのちがい。 */
export function diagnoseWrite(plan: RoundPlan, typed: number): string | null {
  if (typed === plan.answer) return null;

  // もとの数をそのまま書いた。**下位が0でない形なので、
  // 「下を0にする」より先に見ないとそちらに吸われる**
  if (typed === plan.value) {
    return `それは もとの 数だね。${targetText(plan)}に すると ${plan.answer}`;
  }

  const cut = truncated(plan.value, plan.keepExp);

  // 切り上げるべきところを切り捨てた（またはその逆）
  if (plan.roundUp && typed === cut) {
    return `切り上げるので、${placeName(plan.keepExp)}が 1 ふえるよ。${plan.answer}`;
  }
  if (!plan.roundUp && typed === cut + 10 ** plan.keepExp) {
    return `切り捨てるので、${placeName(plan.keepExp)}は そのまま。${plan.answer}`;
  }

  // 下の位を 0 にしていない
  if (typed % 10 ** plan.keepExp !== 0) {
    return `${placeName(plan.lookExp)}より 下は ぜんぶ 0 に するよ。${plan.answer}`;
  }

  return `${plan.answer} だよ。${placeName(plan.lookExp)}を 四捨五入して、それより 下は 0 にする`;
}

/** 何回もそこで止まっている子への提案。 */
export function roundAdviceFor(kind: RoundStepKind): { text: string } | null {
  switch (kind) {
    case "look":
      return {
        text: "「◯の位までの がい数」の ◯は、答えに のこる位。四捨五入するのは いつも その 1つ下だよ。",
      };
    case "updown":
      return {
        text: "0・1・2・3・4 なら 切り捨て、5・6・7・8・9 なら 切り上げ。まん中の 5 が 上がる側だと 覚えよう。",
      };
    case "write":
      return {
        text: "四捨五入したあと、それより 下の位は ぜんぶ 0 にする。書いてから けた数を 数えなおすと たしかめられるよ。",
      };
  }
}
