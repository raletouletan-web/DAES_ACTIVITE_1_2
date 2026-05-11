export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export interface QuestionData {
  question: string;
  answer: string;
  label?: string;
}

export type AppStep = 'identification' | 'questions' | 'review' | 'confirmation';
