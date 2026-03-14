import { SeatConditionInput } from "./types";

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitPairs(text: string): Array<[string, string]> {
  return splitLines(text)
    .map((line) => line.split(/[,、\s]+/).map((token) => token.trim()).filter(Boolean))
    .filter((parts): parts is [string, string] => parts.length >= 2)
    .map((parts) => [parts[0], parts[1]]);
}

function splitFixedSeats(text: string): Array<{ name: string; row: number; col: number }> {
  return splitLines(text)
    .map((line) => line.split(/[,、\s]+/).map((token) => token.trim()).filter(Boolean))
    .map((parts) => {
      const [name, row, col] = parts;
      return { name, row: Number(row), col: Number(col) };
    })
    .filter((item) => item.name && Number.isInteger(item.row) && Number.isInteger(item.col));
}

export function parseStudents(text: string): string[] {
  return splitLines(text);
}

export function parseConditions(input: {
  frontRows: string;
  fixedSeats: string;
  nearPairs: string;
  apartPairs: string;
}): SeatConditionInput {
  return {
    frontRows: splitLines(input.frontRows),
    fixedSeats: splitFixedSeats(input.fixedSeats),
    nearPairs: splitPairs(input.nearPairs),
    apartPairs: splitPairs(input.apartPairs),
  };
}
