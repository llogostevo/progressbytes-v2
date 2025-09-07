import { UserType } from "./access"

export type ScoreType = "green" | "amber" | "red"

export type Bucket = "new" | "mid" | "old"

export interface Question {
  id: string
  topic: string
  type: "text" | "multiple-choice" | "fill-in-the-blank" | "matching" | "code" | "algorithm" | "sql" | "short-answer" | "essay" | "true-false"
  difficulty: "low" | "medium" | "high"
  question_text: string
  model_answer?: string | string[] | boolean
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

// Coverage tracking types
export interface Class {
  id: string
  name: string
  teacher_id: string
  created_at: string
  join_code?: string
  teacher?: {
    email: string
    full_name: string
  }
}

export interface Unit {
  id: string
  name: string
  unit_number: number
}

export interface CoverageTopic {
  id: string
  name: string
  description: string
  slug: string
  topicnumber: number
  unit_id: string
  units: Unit
}

export interface Subtopic {
  id: string
  subtopictitle: string
  subtopicnumber: number
  topic_id: string
  topics: CoverageTopic
}

export interface CoverageRecord {
  id: string
  class_id: string
  subtopic_id: string
  covered_on: string
  created_at: string
  created_by: string
  notes: string | null
}

export interface GroupedSubtopics {
  unit: Unit
  topics: {
    topic: CoverageTopic
    subtopics: (Subtopic & { coverageRecords?: CoverageRecord[] })[]
  }[]
}

// Class management types
export interface ClassMember {
  class_id: string
  student_id: string
  joined_at: string
}

export interface ClassMemberRow {
  student_id: string
  joined_at: string
  class: {
    id: string
    name: string
  }
  student: {
    email: string
    full_name: string
  }
}

export interface StudentClassMember {
  class: {
    id: string
    name: string
    teacher_id: string
    created_at: string
    teacher: {
      email: string
      full_name: string
    }[] | null
  }[]
}

//TODO: shoudl add in here the types from getTopics.ts 
