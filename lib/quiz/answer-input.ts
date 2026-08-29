import { isFraction } from "./fraction";
import type { Value } from "./types";

/**
 * 数字キーパッドで組み立てている途中の答え。
 *
 * 整数は1枠、分数は分子・分母の2枠を持ち、いま入力中の枠を active で示す。
 * ここは純粋な状態遷移だけを扱い、正誤判定はしない。
 */

/** 答えは最大でも 81 や 12/35 なので2桁で足りる。 */
export const MAX_DIGITS = 2;

export type Slot = "numerator" | "denominator";

export type AnswerInput =
  | { kind: "number"; digits: string }
  | { kind: "fraction"; numerator: string; denominator: string; active: Slot };

export function emptyInput(answer: Value): AnswerInput {
  return isFraction(answer)
    ? { kind: "fraction", numerator: "", denominator: "", active: "numerator" }
    : { kind: "number", digits: "" };
}

/**
 * 1枠ぶんの数字を足す。
 *
 * 先頭の 0 は「0」単独のときだけ許す。たし算・ひき算では答えが 0 になりうるので
 * 0 そのものは入力できる必要があるが、「05」は入力させたくない。
 *
 * ## 小数点
 *
 * `.` を送れるのは、小数を打たせる単元だけ（キーパッド側で `.` の
 * キーを出したときだけ送られてくる）。ここでは
 *
 * - **2つめの `.` は受けつけない**
 * - **先頭には置けない**（`.5` ではなく `0.5` と打たせる）
 * - 桁数の上限は**数字だけ**で数える。`.` で1桁ぶん損をしないように
 *
 * の3つだけを見る。0.5 のような値を扱う単元がこれまで無かったので、
 * 既存の単元は `.` を送らず、動きは何も変わらない。
 */
function pushDigit(current: string, digit: string, maxDigits: number): string {
  if (digit === ".") {
    if (current === "" || current.includes(".")) return current;
    return current + ".";
  }
  if (current === "") return digit;
  if (current === "0") return digit === "0" ? current : digit;
  if (current.replace(".", "").length >= maxDigits) return current;
  return current + digit;
}

/**
 * 桁数の上限は既定で2桁。
 * わり算のひっ算だけは、商は1桁・かけた数は3桁になりうるので呼び出し側で指定する。
 */
export function appendDigit(
  input: AnswerInput,
  digit: string,
  maxDigits: number = MAX_DIGITS
): AnswerInput {
  if (input.kind === "number") {
    return { ...input, digits: pushDigit(input.digits, digit, maxDigits) };
  }
  return input.active === "numerator"
    ? { ...input, numerator: pushDigit(input.numerator, digit, maxDigits) }
    : { ...input, denominator: pushDigit(input.denominator, digit, maxDigits) };
}

export function backspace(input: AnswerInput): AnswerInput {
  const drop = (value: string) => value.slice(0, -1);

  if (input.kind === "number") {
    return { ...input, digits: drop(input.digits) };
  }
  return input.active === "numerator"
    ? { ...input, numerator: drop(input.numerator) }
    : { ...input, denominator: drop(input.denominator) };
}

export function selectSlot(input: AnswerInput, slot: Slot): AnswerInput {
  if (input.kind === "number") return input;
  return { ...input, active: slot };
}

export function isComplete(input: AnswerInput): boolean {
  return input.kind === "number"
    ? // 「4.」のように小数点で終わっている間は、まだ打ちおわっていない
      input.digits !== "" && !input.digits.endsWith(".")
    : input.numerator !== "" && input.denominator !== "";
}

export function toValue(input: AnswerInput): Value {
  return input.kind === "number"
    ? Number(input.digits)
    : { numerator: Number(input.numerator), denominator: Number(input.denominator) };
}

/**
 * 打ち込まれた答えが正解か。
 *
 * 分数は約分し終えた形だけを正解にする。2/4 を 1/2 と同じとみなしてしまうと、
 * この単元でいちばん練習させたい約分を素通りできてしまうため。
 * 約分前の形は誤答として拾い、diagnose.ts が「もっとかんたんにできる」と返す。
 */
export function matchesAnswer(answer: Value, typed: Value): boolean {
  if (isFraction(answer)) {
    return (
      isFraction(typed) &&
      typed.numerator === answer.numerator &&
      typed.denominator === answer.denominator
    );
  }
  return !isFraction(typed) && typed === answer;
}

/**
 * 大きいボタンが「いま何をするボタンか」。
 *
 * 分数で分子だけ埋まっている間は分母へ移すボタンとして働かせる。
 * 枠のタップでも移動できるが、それに気づかないと詰まるため、
 * 常に押せる導線をキーパッド側にも用意している。
 */
export type PrimaryAction = "submit" | "advance" | "none";

export function primaryAction(input: AnswerInput): PrimaryAction {
  if (isComplete(input)) return "submit";
  if (input.kind === "fraction" && input.active === "numerator" && input.numerator !== "") {
    return "advance";
  }
  return "none";
}
