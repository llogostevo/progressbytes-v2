import { UserType } from "./access"

export type ScoreType = "green" | "amber" | "red"

export interface Question {
  id: string
  topic: string
  type: "text" | "multiple-choice" | "fill-in-the-blank" | "matching" | "code" | "algorithm" | "sql" | "short-answer" | "essay" | "true-false"
  difficulty: "low" | "medium" | "high"
  question_text: string
  model_answer: string | string[] | boolean
  options?: string[]
  correctAnswerIndex?: number
  order_important?: boolean
  correct_answer?: boolean // TODO: true-false question - need to check if this is correct
  model_answer_code?: string
  language?: string
  explanation?: string
  created_at: string
  pairs?: {
    statement: string
    match: string
  }[]
  subtopic_question_link?: { subtopic_id: string }[]
}

export interface Answer {
  id: string
  question_id: string
  student_id: string | null
  response_text: string
  ai_feedback: string | null
  score: ScoreType
  submitted_at: string
  self_assessed: boolean
}

export interface Topic {
  id: string
  slug: string
  name: string
  description: string
  icon?: string
  topicnumber?: number
  summary?: string
  unitName?: string
  questionCount: number
  questions: Question[]
  unit: number
  disabled?: boolean
  active?: boolean
}

export interface Student {
  id: string
  email: string
  created_at: string
  user_type: UserType | null
}

export interface Plan {
  name: string
  slug: UserType
  description: string
  price: number
  interval: string
  features: string[]
  daily_question_limit: number | null
  total_question_limit: number | null;
  has_ai_feedback: boolean
  plan_type: string
  stripe_price_id?: string
  stripe_product_id?: string
  active: boolean
};