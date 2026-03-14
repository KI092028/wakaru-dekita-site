import { GenerateResult, Position, SeatRequest } from "./types";

function shuffle<T>(values: T[]): T[] {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function findPosition(grid: Array<Array<string | null>>, name: string): Position | null {
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid[r].length; c += 1) {
      if (grid[r][c] === name) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

function swapNames(grid: Array<Array<string | null>>, a: string, b: string): boolean {
  const aPos = findPosition(grid, a);
  const bPos = findPosition(grid, b);
  if (!aPos || !bPos) return false;
  [grid[aPos.row][aPos.col], grid[bPos.row][bPos.col]] = [grid[bPos.row][bPos.col], grid[aPos.row][aPos.col]];
  return true;
}

export function generateSeating(request: SeatRequest): GenerateResult {
  const { config, students, conditions } = request;
  const grid: Array<Array<string | null>> = Array.from({ length: config.rows }, () => Array(config.cols).fill(null));
  const warnings: string[] = [];
  const applied: string[] = [];

  const allPositions: Position[] = [];
  for (let r = 0; r < config.rows; r += 1) {
    for (let c = 0; c < config.cols; c += 1) {
      allPositions.push({ row: r, col: c });
    }
  }

  const shuffledPositions = shuffle(allPositions);
  const empty = shuffledPositions.slice(0, config.emptySeats);
  for (const pos of empty) {
    grid[pos.row][pos.col] = "(空席)";
  }

  const usedNames = new Set<string>();
  for (const fixed of conditions.fixedSeats) {
    const rowIndex = fixed.row - 1;
    const colIndex = fixed.col - 1;
    if (grid[rowIndex][colIndex] === "(空席)") {
      warnings.push(`固定席 ${fixed.name} は空席と競合したため未反映です。`);
      continue;
    }
    if (grid[rowIndex][colIndex] !== null) {
      warnings.push(`固定席 ${fixed.name} の位置が使用済みです。`);
      continue;
    }
    grid[rowIndex][colIndex] = fixed.name;
    usedNames.add(fixed.name);
    applied.push(`固定席: ${fixed.name} → ${fixed.row}行${fixed.col}列`);
  }

  const remainingNames = shuffle(students.filter((name) => !usedNames.has(name)));

  for (const name of conditions.frontRows) {
    const index = remainingNames.indexOf(name);
    if (index < 0) continue;

    const target = allPositions.find((pos) => pos.row === 0 && grid[pos.row][pos.col] === null);
    if (!target) {
      warnings.push(`前列条件 ${name} を反映できませんでした。`);
      continue;
    }

    grid[target.row][target.col] = name;
    remainingNames.splice(index, 1);
    applied.push(`前列: ${name}`);
  }

  for (const pos of allPositions) {
    if (grid[pos.row][pos.col] === null) {
      const next = remainingNames.shift();
      grid[pos.row][pos.col] = next ?? null;
    }
  }

  for (const [a, b] of conditions.nearPairs) {
    const aPos = findPosition(grid, a);
    const bPos = findPosition(grid, b);
    if (!aPos || !bPos) continue;
    if (manhattanDistance(aPos, bPos) <= 2) {
      applied.push(`近づけたい: ${a} / ${b}`);
      continue;
    }
    const candidate = allPositions.find((pos) => {
      const value = grid[pos.row][pos.col];
      return typeof value === "string" && value !== "(空席)" && manhattanDistance(pos, aPos) <= 2;
    });
    if (candidate) {
      const swapTarget = grid[candidate.row][candidate.col];
      if (swapTarget) {
        swapNames(grid, b, swapTarget);
        applied.push(`近づけたい調整: ${a} / ${b}`);
      }
    } else {
      warnings.push(`近づけたい条件を十分に反映できませんでした: ${a} / ${b}`);
    }
  }

  for (const [a, b] of conditions.apartPairs) {
    const aPos = findPosition(grid, a);
    const bPos = findPosition(grid, b);
    if (!aPos || !bPos) continue;
    if (manhattanDistance(aPos, bPos) > 2) {
      applied.push(`離したい: ${a} / ${b}`);
      continue;
    }
    const farCandidate = allPositions.find((pos) => {
      const value = grid[pos.row][pos.col];
      return typeof value === "string" && value !== "(空席)" && manhattanDistance(pos, aPos) > 2;
    });
    if (farCandidate) {
      const swapTarget = grid[farCandidate.row][farCandidate.col];
      if (swapTarget) {
        swapNames(grid, b, swapTarget);
        applied.push(`離したい調整: ${a} / ${b}`);
      }
    } else {
      warnings.push(`離したい条件を十分に反映できませんでした: ${a} / ${b}`);
    }
  }

  return { grid, warnings, applied };
}
