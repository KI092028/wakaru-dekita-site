export type Position = {
  row: number;
  col: number;
};

export type SeatingConfig = {
  rows: number;
  cols: number;
  emptySeats: number;
};

export type SeatConditionInput = {
  frontRows: string[];
  fixedSeats: Array<{ name: string; row: number; col: number }>;
  nearPairs: Array<[string, string]>;
  apartPairs: Array<[string, string]>;
};

export type SeatRequest = {
  config: SeatingConfig;
  students: string[];
  conditions: SeatConditionInput;
};

export type ValidationResult = {
  errors: string[];
  warnings: string[];
};

export type GenerateResult = {
  grid: Array<Array<string | null>>;
  warnings: string[];
  applied: string[];
};
