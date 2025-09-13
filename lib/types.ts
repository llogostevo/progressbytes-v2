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
  rubric?: string
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
  teacher_score: ScoreType | null
  teacher_feedback: string | null
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

// // Coverage tracking types
// export interface Class {
//   id: string
//   name: string
//   teacher_id: string
//   created_at: string
//   join_code?: string
//   teacher?: {
//     email: string
//     full_name: string
//   }
// }

// export interface Unit {
//   id: string
//   name: string
//   unit_number: number
// }

// export interface CoverageTopic {
//   id: string
//   name: string
//   description: string
//   slug: string
//   topicnumber: number
//   unit_id: string
//   units: Unit
// }

// export interface Subtopic {
//   id: string
//   subtopictitle: string
//   subtopicnumber: number
//   topic_id: string
//   topics: CoverageTopic
//   coverageRecords: CoverageRecord[]
// }

// export interface CoverageRecord {
//   id: string
//   class_id: string
//   subtopic_id: string
//   covered_on: string
//   created_at: string
//   created_by: string
//   notes: string | null
// }

// // export interface GroupedSubtopics {
// //   unit: Unit
// //   topics: {
// //     topic: CoverageTopic
// //     subtopics: (Subtopic & { coverageRecords?: CoverageRecord[] })[]
// //   }[]
// // }

// export interface TopicGroup {
//   topic: CoverageTopic
//   subtopics: Subtopic[]
// }
// export interface GroupedSubtopics {
//   unit: Unit
//   topics: TopicGroup[]
// }

export interface Class {
  id: string
  name: string
  teacher_id: string
  created_at: string
  updated_at?: string
}

export interface Unit {
  id: string
  name: string
  unit_number: number
}

export interface CoverageTopic {
  id: string
  name: string
  description?: string
  slug: string
  topicnumber: number
  unit_id: string
  units: Unit
}

export interface CoverageRecord {
  id: string
  class_id: string
  subtopic_id: string
  covered_on: string
  created_by: string
  notes?: string | null
  created_at?: string
}

export interface Subtopic {
  id: string
  subtopictitle: string
  subtopicnumber: number
  topic_id: string
  topics: CoverageTopic
  coverageRecords: CoverageRecord[]
}

export interface TopicGroup {
  topic: CoverageTopic
  subtopics: Subtopic[]
}

export interface GroupedSubtopics {
  unit: Unit
  topics: TopicGroup[]
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

// ProgressBoost types
export interface ProgressBoostPlanRow {
  week_id: string
  target_counts: Record<string, number>
  item_id: string
  question_id: string
  bucket: "new" | "mid" | "old"
  difficulty: "low" | "medium" | "high" | string
  order_index: number
  status: "pending" | "answered" | "skipped"
}

export interface ProgressBoostTargets {
  "low:new": number
  "low:mid": number
  "low:old": number
  "medium:new": number
  "medium:mid": number
  "medium:old": number
  "high:new": number
  "high:mid": number
  "high:old": number
}

export interface ProgressMaps {
  done: Record<string, number>
  target: Record<string, number>
}

// Database question types (raw from Supabase)
export interface DbMultipleChoiceQuestion {
  options: string[]
  correct_answer_index: number
  model_answer?: string
}

export interface DbFillInTheBlankQuestion {
  options: string[]
  correct_answers: string[]
  order_important: boolean
  model_answer?: string
}

export interface DbMatchingQuestion {
  statement: string
  match: string
  model_answer?: string
}

export interface DbTrueFalseQuestion {
  correct_answer: boolean
  model_answer?: string
}

export interface DbShortAnswerQuestion {
  model_answer: string
}

export interface DbEssayQuestion {
  model_answer: string
  rubric: string
}

export interface DbCodeQuestion {
  language: string
  model_answer: string
  model_answer_code: string
}

export interface DbQuestion {
  id: string
  type: string
  difficulty: string
  question_text: string
  explanation?: string
  created_at: string
  multiple_choice_questions?: DbMultipleChoiceQuestion
  fill_in_the_blank_questions?: DbFillInTheBlankQuestion
  matching_questions?: DbMatchingQuestion[]
  true_false_questions?: DbTrueFalseQuestion
  short_answer_questions?: DbShortAnswerQuestion
  essay_questions?: DbEssayQuestion
  code_questions?: DbCodeQuestion
}

// More flexible type for Supabase query results
export interface DbQuestionResult {
  id: string
  type: string
  difficulty: string
  question_text: string
  explanation?: string
  created_at: string
  multiple_choice_questions?: DbMultipleChoiceQuestion | null
  fill_in_the_blank_questions?: DbFillInTheBlankQuestion | null
  matching_questions?: DbMatchingQuestion[] | null
  true_false_questions?: DbTrueFalseQuestion | null
  short_answer_questions?: DbShortAnswerQuestion | null
  essay_questions?: DbEssayQuestion | null
  code_questions?: DbCodeQuestion | null
}

// Raw plan row from database
export interface RawPlanRow {
  week_id: string
  target_counts: Record<string, number>
  item_id: string
  question_id: string
  bucket: string
  difficulty: string
  order_index: number
  status: string
}

//TODO: shoudl add in here the types from getTopics.ts 
