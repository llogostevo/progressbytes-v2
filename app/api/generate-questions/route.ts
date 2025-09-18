import { NextRequest, NextResponse } from 'next/server'

interface CurriculumSpec {
  examBoard: string
  specificationHeading: string
  topic: string
  subtopicHeading: string
  specificationContent: string
  supportingText: string
  markSchemeContent: string
}

interface QuestionTypeRequest {
  id: string
  name: string
  quantity: number
}

interface GenerateQuestionsRequest {
  curriculumSpec: CurriculumSpec
  questionTypes: QuestionTypeRequest[]
}

interface GeneratedQuestion {
  id: string
  type: string
  question_text: string
  difficulty: string
  explanation: string
  model_answer: string | string[] | boolean
  options?: string[]
  correctAnswerIndex?: number
  pairs?: { statement: string; match: string }[]
  model_answer_code?: string
  language?: string
  rubric?: string
  order_important?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { curriculumSpec, questionTypes }: GenerateQuestionsRequest = await request.json()

    if (!curriculumSpec || !questionTypes || questionTypes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: curriculumSpec and questionTypes' },
        { status: 400 }
      )
    }

    // Validate that we have at least one enabled question type
    const enabledTypes = questionTypes.filter(type => type.quantity > 0)
    if (enabledTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one question type must be selected' },
        { status: 400 }
      )
    }

    // Generate questions using ChatGPT API
    const generatedQuestions = await generateQuestionsWithAI(curriculumSpec, enabledTypes)

    return NextResponse.json({ questions: generatedQuestions })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}

async function generateQuestionsWithAI(
  curriculumSpec: CurriculumSpec,
  questionTypes: QuestionTypeRequest[]
): Promise<GeneratedQuestion[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const totalQuestions = questionTypes.reduce((sum, type) => sum + type.quantity, 0)
  
  // Create a comprehensive prompt for ChatGPT
  const prompt = createQuestionGenerationPrompt(curriculumSpec, questionTypes, totalQuestions)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in creating high-quality assessment questions for UK exam boards. You create questions that are pedagogically sound, age-appropriate, and aligned with curriculum specifications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI API')
    }

    // Parse the JSON response from ChatGPT
    const parsedQuestions = JSON.parse(content)
    
    // Validate and transform the questions
    return validateAndTransformQuestions(parsedQuestions, questionTypes)
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    throw error
  }
}

function createQuestionGenerationPrompt(
  curriculumSpec: CurriculumSpec,
  questionTypes: QuestionTypeRequest[],
  totalQuestions: number
): string {
  const questionTypeDetails = questionTypes.map(type => {
    const typeInstructions = getQuestionTypeInstructions(type.id)
    return `${type.quantity}x ${type.name}: ${typeInstructions}`
  }).join('\n')

  return `Create ${totalQuestions} high-quality assessment questions based on the following curriculum specification:

EXAM BOARD: ${curriculumSpec.examBoard}
SPECIFICATION: ${curriculumSpec.specificationHeading}
TOPIC: ${curriculumSpec.topic}
SUBTOPIC: ${curriculumSpec.subtopicHeading}

SPECIFICATION CONTENT:
${curriculumSpec.specificationContent}

SUPPORTING TEXT:
${curriculumSpec.supportingText}

MARK SCHEME CONTENT:
${curriculumSpec.markSchemeContent}

QUESTION TYPES TO GENERATE:
${questionTypeDetails}

IMPORTANT INSTRUCTIONS:
1. Each question must be directly relevant to the specification content
2. Questions should test different levels of understanding (recall, application, analysis)
3. Use appropriate difficulty levels (low, medium, high) based on the complexity
4. Ensure questions are age-appropriate for the target level
5. Include clear, detailed explanations for each question
6. For multiple choice questions, provide 4 plausible options with only one correct answer
7. For fill-in-the-blank questions, provide multiple acceptable answers where appropriate
8. For matching questions, create 4-6 pairs that are clearly related
9. For code questions, specify the programming language and provide working code
10. For essay questions, include a detailed rubric for marking

Please respond with a JSON array of questions in the following format:
[
  {
    "id": "unique-id-1",
    "type": "multiple-choice",
    "question_text": "The question text here",
    "difficulty": "medium",
    "explanation": "Detailed explanation of the answer",
    "model_answer": "The correct answer (must be a string, boolean, or array of strings)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0
  },
  {
    "id": "unique-id-2", 
    "type": "fill-in-the-blank",
    "question_text": "Complete the following: The capital of France is _____.",
    "difficulty": "low",
    "explanation": "Paris is the capital and largest city of France.",
    "model_answer": ["Paris"],
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "order_important": false
  }
]

IMPORTANT: The model_answer field must be a string, boolean, or array of strings. Do not use objects or complex data structures for model_answer.

Generate exactly ${totalQuestions} questions as specified above.`
}

function getQuestionTypeInstructions(typeId: string): string {
  const instructions = {
    'multiple-choice': 'Create questions with 4 options (A, B, C, D) where only one is correct. Include plausible distractors.',
    'fill-in-the-blank': 'Create questions with blanks to fill. Provide multiple acceptable answers where appropriate.',
    'matching': 'Create 4-6 pairs of related items to match. Ensure clear relationships between items.',
    'code': 'Create programming questions with working code examples. Specify the programming language.',
    'true-false': 'Create clear true/false statements. Avoid ambiguous wording.',
    'short-answer': 'Create questions requiring brief written responses (1-3 sentences).',
    'essay': 'Create questions requiring longer written responses. Include detailed marking rubrics.'
  }
  
  return instructions[typeId as keyof typeof instructions] || 'Create appropriate questions for this type.'
}

function validateAndTransformQuestions(
  parsedQuestions: any[],
  questionTypes: QuestionTypeRequest[]
): GeneratedQuestion[] {
  if (!Array.isArray(parsedQuestions)) {
    throw new Error('Invalid response format: expected array of questions')
  }

  const validQuestions: GeneratedQuestion[] = []
  const typeCounts: { [key: string]: number } = {}

  for (const question of parsedQuestions) {
    // Validate required fields
    if (!question.id || !question.type || !question.question_text || !question.model_answer) {
      console.warn('Skipping invalid question:', question)
      continue
    }

    // Count questions by type
    typeCounts[question.type] = (typeCounts[question.type] || 0) + 1

    // Ensure arrays are properly initialized and handle object model answers
    const transformedQuestion: GeneratedQuestion = {
      id: question.id,
      type: question.type,
      question_text: question.question_text,
      difficulty: question.difficulty || 'medium',
      explanation: question.explanation || '',
      // Handle different types of model_answer
      model_answer: (() => {
        if (typeof question.model_answer === 'object' && question.model_answer !== null) {
          // If it's an object, convert to string for display
          return JSON.stringify(question.model_answer)
        }
        return question.model_answer
      })(),
      // Ensure options is always an array if it exists
      options: Array.isArray(question.options) ? question.options : (question.options ? [question.options] : []),
      // Ensure pairs is always an array if it exists
      pairs: Array.isArray(question.pairs) ? question.pairs : (question.pairs ? [question.pairs] : []),
      // Copy other properties
      correctAnswerIndex: question.correctAnswerIndex,
      model_answer_code: question.model_answer_code,
      language: question.language,
      rubric: question.rubric,
      order_important: question.order_important
    }

    validQuestions.push(transformedQuestion)
  }

  // Validate that we have the right number of each question type
  for (const type of questionTypes) {
    const actualCount = typeCounts[type.id] || 0
    if (actualCount !== type.quantity) {
      console.warn(`Expected ${type.quantity} ${type.name} questions, got ${actualCount}`)
    }
  }

  return validQuestions
}
