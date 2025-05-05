import type { LucideIcon } from "lucide-react"

export type ScoreType = "green" | "amber" | "red"

export interface Question {
  id: string
  topic: string
  type: "text" | "multiple-choice" | "fill-in-the-blank" | "matching" | "code" | "short-answer" | "essay" | "true-false"
  question_text: string
  model_answer: string | string[]
  options?: string[]
  correctAnswerIndex?: number
  order_important?: boolean
  model_answer_python?: string
  created_at: string
  pairs?: {
    statement: string
    match: string
  }[]
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
  icon?: LucideIcon
  questionCount: number
  questions: Question[]
  unit: number
  disabled?: boolean
}

export interface Student {
  id: string
  email: string
  created_at: string
  has_paid: boolean
}
