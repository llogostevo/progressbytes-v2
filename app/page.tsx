'use server';
import { createClient } from "@/utils/supabase/server"

import { UserLogin } from "@/components/user-login"
import { HomeAccessControl } from "./components/HomeAccessControl"
import type { Topic, Question } from "@/lib/types"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile server-side
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, ai_interest_banner, role')
    .eq('email', user?.email)
    .single()

    const accessUser = {
      user_type: profile?.user_type || 'anonymous',
      role: profile?.role || undefined
    }
      

  // Server-side data fetching (more secure)
  let topics: Topic[] = []
    /**
     * Fetch topics with their associated questions
     * This query gets all questions associated with a topic's subtopics
     * in a single flattened structure, including all question type specific data
     */
    const { data: topicsWithQuestions, error } = await supabase
      .from('topics')
      .select(`
        id,
        name,
        description,
        slug,
        icon,
        topicnumber,
        summary,
        unit_id,
        active,
        units!inner (
          id,
          name,
          unit_number
        ),
        subtopics!inner (
          id,
          subtopic_question_link!inner (
            questions!inner (
              id,
              type,
              question_text,
              explanation,
              created_at,
              multiple_choice_questions (
                options,
                correct_answer_index,
                model_answer
              ),
              short_answer_questions (
                model_answer
              ),
              fill_in_the_blank_questions (
                correct_answers,
                model_answer,
                order_important,
                options
              ),
              matching_questions (
                statement,
                match,
                model_answer
              ),
              essay_questions (
                model_answer,
                rubric
              ),
              code_questions (
                starter_code,
                model_answer,
                language,
                model_answer_code
              )
            )
          )
        )
      `)
      .order('topicnumber')

    if (error) {
      console.error('Error fetching topics with questions:', error)
      return
    }

    /**
     * Transform the data to match the expected format for the TopicCard component
     * - Extract all questions from subtopics into a single array per topic
     * - Combine base question data with type-specific data
     * - Remove the subtopic hierarchy completely
     */
    // TODO: fix the type error
    // @ts-expect-error - this is a workaround to fix the type error
    topics = (topicsWithQuestions as DBTopic[])?.map(topic => {      // Get all questions from all subtopics in a single flat array
      const allQuestions = topic.subtopics.flatMap((subtopic: {
        subtopic_question_link: Array<{
          questions: {
            id: string;
            type: Question['type'];
            question_text: string;
            explanation?: string;
            created_at: string;
            model_answer?: string;
            multiple_choice_questions?: {
              options: string[];
              correct_answer_index: number;
              model_answer?: string;
            };
            fill_in_the_blank_questions?: {
              correct_answers: string[];
              model_answer?: string;
              order_important?: boolean;
              options?: string[];
            };
            matching_questions?: Array<{
              statement: string;
              match: string;
              model_answer?: string;
            }>;
            code_questions?: {
              starter_code?: string;
              model_answer?: string;
              language?: string;
              model_answer_code?: string;
            };
          }
        }>
      }) =>
        subtopic.subtopic_question_link.flatMap((link: {
          questions: {
            id: string;
            type: Question['type'];
            question_text: string;
            explanation?: string;
            created_at: string;
            model_answer?: string;
            multiple_choice_questions?: {
              options: string[];
              correct_answer_index: number;
              model_answer?: string;
            };
            fill_in_the_blank_questions?: {
              correct_answers: string[];
              model_answer?: string;
              order_important?: boolean;
              options?: string[];
            };
            matching_questions?: Array<{
              statement: string;
              match: string;
              model_answer?: string;
            }>;
            code_questions?: {
              starter_code?: string;
              model_answer?: string;
              language?: string;
              model_answer_code?: string;
            };
          }
        }) => {
          const question = link.questions
          // Combine base question data with type-specific data
          const questionData: Question = {
            id: question.id,
            type: question.type,
            topic: topic.slug,
            question_text: question.question_text,
            explanation: question.explanation,
            created_at: question.created_at,
            model_answer: question.model_answer || '',
            // Add type-specific data
            ...(question.type === 'multiple-choice' && {
              options: question.multiple_choice_questions?.options,
              correctAnswerIndex: question.multiple_choice_questions?.correct_answer_index
            }),
            ...(question.type === 'fill-in-the-blank' && {
              options: question.fill_in_the_blank_questions?.options,
              order_important: question.fill_in_the_blank_questions?.order_important,
              model_answer: question.fill_in_the_blank_questions?.correct_answers || []
            }),
            ...(question.type === 'matching' && {
              pairs: question.matching_questions?.map((mq) => ({
                statement: mq.statement,
                match: mq.match
              }))
            }),
            ...(question.type === 'code' && {
              model_answer_python: question.code_questions?.model_answer_code,
              language: question.code_questions?.language
            })
          }
          return questionData
        })
      )

      // Convert the topic to match the Topic type
      const transformedTopic: Topic = {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        summary: topic.summary,
        icon: topic.icon ? topic.icon : undefined,
        disabled: !topic.active, // Set disabled based on active status
        active: topic.active,
        slug: topic.slug,
        unit: topic.units.unit_number,
        unitName: topic.units.name,
        questionCount: allQuestions.length,
        questions: allQuestions,
        topicnumber: topic.topicnumber // Add the topicnumber field
      }

      return transformedTopic
    }) || []


  // Track page visit
  if (user) {
    await supabase.from('user_activity').insert({
      user_id: user.id,
      event: 'visited_home',
      path: '/',
      user_email: user.email
    })
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">GCSE Computer Science Quiz</h1>
          <UserLogin email={user?.email} />
        </div>

        {/* Client component for access control */}
        <HomeAccessControl 
          user={accessUser}
          userType={profile?.user_type}
          showAIInterestBanner={profile?.ai_interest_banner !== false}
          topics={topics}
        />

      </div>
    </div>
  )
}
