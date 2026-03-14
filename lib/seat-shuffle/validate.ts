import { SeatRequest, ValidationResult } from "./types";

export function validateSeatRequest(request: SeatRequest): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!request.students.length) {
    errors.push("名簿を入力してください。");
  }

  const uniqueCount = new Set(request.students).size;
  if (uniqueCount !== request.students.length) {
    errors.push("名簿に重複した名前があります。");
  }

  const totalSeats = request.config.rows * request.config.cols - request.config.emptySeats;
  if (request.students.length > totalSeats) {
    errors.push("席数が不足しています。行数・列数・空席数を見直してください。");
  }

  const allNames = new Set(request.students);
  for (const name of request.conditions.frontRows) {
    if (!allNames.has(name)) {
      errors.push(`前列条件に存在しない名前があります: ${name}`);
    }
  }

  const fixedKeySet = new Set<string>();
  for (const condition of request.conditions.fixedSeats) {
    if (!allNames.has(condition.name)) {
      errors.push(`固定席条件に存在しない名前があります: ${condition.name}`);
    }
    const key = `${condition.row}-${condition.col}`;
    if (fixedKeySet.has(key)) {
      errors.push(`固定席が重複しています: ${condition.row}行${condition.col}列`);
    }
    fixedKeySet.add(key);

    if (condition.row < 1 || condition.row > request.config.rows || condition.col < 1 || condition.col > request.config.cols) {
      errors.push(`固定席が教室範囲外です: ${condition.name}`);
    }
  }

  for (const [a, b] of [...request.conditions.nearPairs, ...request.conditions.apartPairs]) {
    if (!allNames.has(a) || !allNames.has(b)) {
      warnings.push(`ペア条件に存在しない名前が含まれます: ${a}, ${b}`);
    }
  }

  return { errors, warnings };
}
