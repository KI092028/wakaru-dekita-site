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
 */
function pushDigit(current: string, digit: string): string {
  if (current === "") return digit;
  if (current === "0") return digit === "0" ? current : digit;
  if (current.length >= MAX_DIGITS) return current;
  return current + digit;
}

export function appendDigit(input: AnswerInput, digit: string): AnswerInput {
  if (input.kind === "number") {
    return { ...input, digits: pushDigit(input.digits, digit) };
  }
  return input.active === "numerator"
    ? { ...input, numerator: pushDigit(input.numerator, digit) }
    : { ...input, denominator: pushDigit(input.denominator, digit) };
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
    ? input.digits !== ""
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
