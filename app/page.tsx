import { TopicGrid } from "@/components/topic-grid"
// import { topics } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { CTABanner } from "@/components/cta-banner"
import { UserLogin } from "@/components/user-login"
import type { Topic, Question } from "@/lib/types"
import { redirect } from "next/navigation"
// import type { LucideIcon } from "lucide-react"
// import { DynamicIcon } from "@/components/ui/dynamicicon"
// import * as Icons from 'lucide-react'

// Helper function to convert snake_case to PascalCase
// function toPascalCase(str: string): string {
//   return str
//     .split('_')
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join('')
// }

// Helper function to get LucideIcon from string
// function getIconFromString(iconName: string): LucideIcon | undefined {
//   const pascalCaseName = toPascalCase(iconName)
//   return Icons[pascalCaseName as keyof typeof Icons] as LucideIcon | undefined
// }

// Define the database response types
// interface DBQuestion {
//   id: string;
//   type: Question['type'];
//   question_text: string;
//   model_answer: string | string[];
//   options?: string[];
//   correct_answer_index?: number;
//   summary?: string;
//   order_important?: boolean;
//   model_answer_python?: string;
//   explanation?: string;
//   created_at: string;
//   pairs?: { statement: string; match: string }[];
// }

// interface DBSubtopicQuestionLink {
//   questions: DBQuestion;
// }

// interface DBSubtopic {
//   id: string;
//   subtopic_question_link: DBSubtopicQuestionLink[];
// }

// interface DBTopic {
//   id: string;
//   name: string;
//   description: string;
//   icon?: string;
//   topicnumber?: number;
//   disabled?: boolean;
//   slug: string;
//   unit: number;
//   subtopics: DBSubtopic[];
// }

export default async function Home() {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  // Get the user's profile data including user_type
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('email', user?.email)
    .single()

  const userType = profile?.user_type
  const freeUser = !user

  // Track page visit
  if (user) {
    await supabase.from('user_activity').insert({
      user_id: user.id,
      event: 'visited_home',
      path: '/',
      user_email: user.email
    })
  }

  let topics: Topic[] = []
  if (user) {
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

    console.log('Final transformed topics:', topics)
  }

  // const courseTopics = 
  // const courseTopicsCount = courseTopics?.length

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">GCSE Computer Science Quiz</h1>
          <UserLogin email={user?.email} />

          {(userType === 'basic' || userType === 'revision' || userType === 'revision-plus') && (
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          )}
        </div>

        {/* CTA Banner */}
        <div className="mb-6 md:mb-8">
          {freeUser && <CTABanner variant="free" />}
          {userType === 'basic' && <CTABanner variant="basic" />}
          {userType === 'revision' && <CTABanner variant="premium" />}
        </div>

        <div className="text-center mb-8">
          <p className="text-base md:text-lg text-muted-foreground">
            Select a topic below to test your knowledge with {userType == "revision plus" ? "AI-marked" : "self-assessed"} questions
          </p>
        </div>

        <TopicGrid topics={topics} userType={userType} />
      </div>
    </div>
  )
}
