export type Question = {
  id: string;
  prompt: string;
  choices: number[];
  answer: number;
};

export type QuizUnit = {
  slug: string;
  title: string;
  gradeLabel: string;
  description: string;
  available: boolean;
};
