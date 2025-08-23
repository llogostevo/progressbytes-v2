// // lib/getTopics.ts
// 'use server'

// import { unstable_cache } from 'next/cache'
// import { createClient } from '@/utils/supabase/server'
// import type { Topic, Question, DBTopic, DBQuestion } from '@/lib/types'



// async function fetchAndTransformTopics(): Promise<Topic[]> {
//   const supabase = await createClient()

//   const { data: topicsWithQuestions, error } = await supabase
//     .from('topics')
//     .select(`
//       id, name, description, slug, icon, topicnumber, summary, unit_id, active,
//       units!inner ( id, name, unit_number ),
//       subtopics!inner (
//         id,
//         subtopic_question_link!inner (
//           questions!inner (
//             id, type, difficulty, question_text, explanation, created_at, model_answer,
//             multiple_choice_questions ( options, correct_answer_index, model_answer ),
//             short_answer_questions ( model_answer ),
//             fill_in_the_blank_questions ( correct_answers, model_answer, order_important, options ),
//             matching_questions ( statement, match, model_answer ),
//             essay_questions ( model_answer, rubric ),
//             code_questions ( starter_code, model_answer, language, model_answer_code )
//           )
//         )
//       )
//     `)
//     .order('topicnumber')

//   if (error) throw error

//   const topics: Topic[] = (topicsWithQuestions as DBTopic[]).map((topic) => {
//     const allQuestions: Question[] = topic.subtopics.flatMap((subtopic) =>
//         subtopic.subtopic_question_link.flatMap((link) => {
//             const q = link.questions as DBQuestion
//             const base: Question = {
//           id: q.id,
//           type: q.type as Question['type'],
//           difficulty: q.difficulty as Question['difficulty'],
//           topic: topic.slug,
//           question_text: q.question_text,
//           explanation: q.explanation,
//           created_at: q.created_at,
//           model_answer: q.model_answer || ''
//         }
//         return {
//           ...base,
//           ...(q.type === 'multiple-choice' && {
//             options: q.multiple_choice_questions?.options,
//             correctAnswerIndex: q.multiple_choice_questions?.correct_answer_index
//           }),
//           ...(q.type === 'fill-in-the-blank' && {
//             options: q.fill_in_the_blank_questions?.options,
//             order_important: q.fill_in_the_blank_questions?.order_important,
//             model_answer: q.fill_in_the_blank_questions?.correct_answers || []
//           }),
//           ...(q.type === 'matching' && {
//             pairs: q.matching_questions?.map((mq: any) => ({
//               statement: mq.statement,
//               match: mq.match
//             }))
//           }),
//           ...((q.type === 'code' || q.type === 'algorithm' || q.type === 'sql') && {
//             model_answer_code: q.code_questions?.model_answer_code,
//             language: q.code_questions?.language
//           })
//         } as Question
//       })
//     )

//     return {
//       id: topic.id,
//       name: topic.name,
//       description: topic.description,
//       summary: topic.summary,
//       icon: topic.icon || undefined,
//       disabled: !topic.active,
//       active: topic.active,
//       slug: topic.slug,
//       unit: topic.units.unit_number,
//       unitName: topic.units.name,
//       questionCount: allQuestions.length,
//       questions: allQuestions,
//       topicnumber: topic.topicnumber
//     } as Topic
//   })

//   return topics
// }

// // Cache the result for 24h and allow manual invalidation via the 'topics' tag.
// export const getTopics = unstable_cache(
//   fetchAndTransformTopics,
//   ['topics-v1'], // bump this if the returned shape changes
//   { revalidate: 60 * 60 * 24, tags: ['topics'] }
// )

// to reset cache:
// run this in terminal: curl -X POST https://quiz.progressbytes.co.uk/api/revalidate-topics

// lib/getTopics.ts
'use server'

import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/utils/supabase/supabase-public'
import type { Topic, Question } from '@/lib/types'

// ---- Raw DB shapes (what the SELECT returns) ----
type DBUnits = {
    id: string
    name: string
    unit_number: number
}

type DBMCQ = {
    options: string[]
    correct_answer_index: number
    model_answer?: string
}

type DBFill = {
    correct_answers: string[]
    model_answer?: string
    order_important?: boolean
    options?: string[]
}

type DBMatch = {
    statement: string
    match: string
    model_answer?: string
}

type DBCode = {
    starter_code?: string
    model_answer?: string
    language?: string
    model_answer_code?: string
}

type DBQuestion = {
    id: string
    type: Question['type']
    difficulty: Question['difficulty']
    question_text: string
    explanation?: string
    created_at: string
    model_answer?: string
    multiple_choice_questions?: DBMCQ
    short_answer_questions?: { model_answer?: string }
    fill_in_the_blank_questions?: DBFill
    matching_questions?: DBMatch[] | null
    essay_questions?: { model_answer?: string; rubric?: string }
    code_questions?: DBCode
}

type DBSubtopicLink = {
    subtopic_question_link: { questions: DBQuestion }[]
}

type DBTopic = {
    id: string
    name: string
    description: string
    slug: string
    icon?: string | null
    topicnumber: number
    summary?: string | null
    unit_id: string
    active: boolean
    // NOTE: Supabase can return this as a single object OR an array depending on join
    units: DBUnits | DBUnits[]
    subtopics: DBSubtopicLink[]
}

// -------------------------------------------------

async function fetchAndTransformTopics(): Promise<Topic[]> {
    console.log(">>> Fetching from Supabase (cache miss) <<<")

    const { data, error } = await supabasePublic
        .from('topics')
        .select(`
      id, name, description, slug, icon, topicnumber, summary, unit_id, active,
      units!inner ( id, name, unit_number ),
      subtopics!inner (
        id,
        subtopic_question_link!inner (
          questions!inner (
            id, type, difficulty, question_text, explanation, created_at, model_answer,
            multiple_choice_questions ( options, correct_answer_index, model_answer ),
            short_answer_questions ( model_answer ),
            fill_in_the_blank_questions ( correct_answers, model_answer, order_important, options ),
            matching_questions ( statement, match, model_answer ),
            essay_questions ( model_answer, rubric ),
            code_questions ( starter_code, model_answer, language, model_answer_code )
          )
        )
      )
    `)
        .order('topicnumber')

    if (error) throw error

    // Make TS happy about the shape we work with
    const rows = (data ?? []) as unknown as DBTopic[]

    const topics: Topic[] = rows.map((topic) => {
        // normalize units: handle object or array
        const unit: DBUnits | undefined = Array.isArray(topic.units)
            ? topic.units[0]
            : topic.units

        const allQuestions: Question[] = topic.subtopics.flatMap((subtopic) =>
            subtopic.subtopic_question_link.flatMap((link) => {
                const q = link.questions

                const base: Question = {
                    id: q.id,
                    type: q.type,
                    difficulty: q.difficulty,
                    topic: topic.slug,
                    question_text: q.question_text,
                    explanation: q.explanation,
                    created_at: q.created_at,
                    model_answer: q.model_answer || ''
                }

                const merged: Question = {
                    ...base,
                    ...(q.type === 'multiple-choice' && {
                        options: q.multiple_choice_questions?.options,
                        correctAnswerIndex: q.multiple_choice_questions?.correct_answer_index
                    }),
                    ...(q.type === 'fill-in-the-blank' && {
                        options: q.fill_in_the_blank_questions?.options,
                        order_important: q.fill_in_the_blank_questions?.order_important,
                        model_answer: q.fill_in_the_blank_questions?.correct_answers || []
                    }),
                    ...(q.type === 'matching' && {
                        pairs: (q.matching_questions ?? []).map((mq) => ({
                            statement: mq.statement,
                            match: mq.match
                        }))
                    }),
                    ...((q.type === 'code' || q.type === 'algorithm' || q.type === 'sql') && {
                        model_answer_code: q.code_questions?.model_answer_code,
                        language: q.code_questions?.language
                    })
                }

                return merged
            })
        )

        return {
            id: topic.id,
            name: topic.name,
            description: topic.description,
            summary: topic.summary ?? undefined,
            icon: topic.icon ?? undefined,
            disabled: !topic.active,
            active: topic.active,
            slug: topic.slug,
            unit: unit?.unit_number ?? 0,
            unitName: unit?.name ?? '',
            questionCount: allQuestions.length,
            questions: allQuestions,
            topicnumber: topic.topicnumber
        }
    })

    return topics
}

// Cache for a day; keep tag so you can bust via /api/revalidate-topics
// export const getTopics = unstable_cache(
//   fetchAndTransformTopics,
//   ['topics-v1'],
//   { revalidate: 60 * 60 * 24, tags: ['topics'] }
// )

// can be used to bust manually
export const getTopics = unstable_cache(
    fetchAndTransformTopics,
    ['topics-v1'],
    { tags: ['topics'] }
)
