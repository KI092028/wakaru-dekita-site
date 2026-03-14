export function printSeating(grid: Array<Array<string | null>>): string {
  return grid
    .map((row, index) => `${index + 1}行: ${row.map((seat) => seat ?? "-").join(" | ")}`)
    .join("\n");
}
