// "use client"

// import { useState, useEffect } from "react"
// import { createClient } from "@/utils/supabase/client"
// import type { Question } from "@/lib/types"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
// import { Checkbox } from "@/components/ui/checkbox"
// import { FileText, Download, Loader2 } from "lucide-react"
// import { toast } from "sonner"
// import jsPDF from "jspdf"
// import autoTable from "jspdf-autotable"

// interface Topic {
//   id: number
//   name: string
//   slug: string
//   topicnumber: string
// }

// interface ExtendedQuestion extends Question {
//   starter_code?: string
//   language?: string
//   model_answer_code?: string
// }

// export default function TestBuilder() {
//   const [topics, setTopics] = useState<Topic[]>([])
//   const [selectedTopicId, setSelectedTopicId] = useState<string>("")
//   const [questions, setQuestions] = useState<ExtendedQuestion[]>([])
//   const [loading, setLoading] = useState(true)
//   const [generating, setGenerating] = useState(false)
//   const [showKeywords, setShowKeywords] = useState(false)
//   const [includeAnswers, setIncludeAnswers] = useState(false)
//   const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
//   const supabase = createClient()

//   useEffect(() => {
//     fetchTopics()
//   }, [])

//   useEffect(() => {
//     if (selectedTopicId) {
//       fetchQuestions(selectedTopicId)
//     }
//   }, [selectedTopicId])

//   // Select all questions by default when questions are loaded
//   useEffect(() => {
//     if (questions.length > 0) {
//       setSelectedQuestions(new Set(questions.map(q => q.id)))
//     }
//   }, [questions])

//   const fetchTopics = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("topics")
//         .select("id, name, slug, topicnumber")
//         .order("topicnumber", { ascending: true })

//       if (error) throw error
//       setTopics(data || [])
//     } catch (error) {
//       console.error("Error fetching topics:", error)
//       toast.error("Failed to load topics")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchQuestions = async (topicId: string) => {
//     setLoading(true)
//     try {
//       // Get all subtopics for this topic
//       const { data: subtopicsData, error: subtopicsError } = await supabase
//         .from("subtopics")
//         .select("id")
//         .eq("topic_id", topicId)

//       if (subtopicsError) throw subtopicsError

//       const subtopicIds = subtopicsData.map(s => s.id)

//       if (subtopicIds.length === 0) {
//         setQuestions([])
//         return
//       }

//       // Get all questions linked to these subtopics
//       const { data: linksData, error: linksError } = await supabase
//         .from("subtopic_question_link")
//         .select("question_id")
//         .in("subtopic_id", subtopicIds)

//       if (linksError) throw linksError

//       const questionIds = [...new Set(linksData.map(l => l.question_id))]

//       if (questionIds.length === 0) {
//         setQuestions([])
//         return
//       }

//       // Fetch all questions
//       const { data, error } = await supabase
//         .from("questions")
//         .select(`
//           *,
//           short_answer_questions(*),
//           true_false_questions(*),
//           matching_questions(*),
//           fill_in_the_blank_questions(
//             options,
//             correct_answers,
//             order_important
//           ),
//           code_questions(*),
//           multiple_choice_questions(*),
//           essay_questions(*)
//         `)
//         .in("id", questionIds)
//         .order("difficulty", { ascending: true })

//       if (error) throw error

//       const transformedQuestions: ExtendedQuestion[] = data.map((q) => ({
//         id: q.id,
//         type: q.type,
//         difficulty: q.difficulty,
//         topic: "",
//         question_text: q.question_text,
//         explanation: q.explanation,
//         created_at: q.created_at,
//         model_answer: q.model_answer || "",
//         ...(q.type === "multiple-choice" && {
//           options: q.multiple_choice_questions?.options,
//           correctAnswerIndex: q.multiple_choice_questions?.correct_answer_index,
//           model_answer: q.multiple_choice_questions?.model_answer || "",
//         }),
//         ...(q.type === "fill-in-the-blank" && {
//           options: q.fill_in_the_blank_questions?.options,
//           order_important: q.fill_in_the_blank_questions?.order_important,
//           model_answer: q.fill_in_the_blank_questions?.correct_answers || [],
//         }),
//         ...(q.type === "matching" && {
//           pairs: q.matching_questions?.map((mq: { statement: string; match: string }) => ({
//             statement: mq.statement,
//             match: mq.match,
//           })),
//         }),
//         ...(q.type === "code" && {
//           starter_code: q.code_questions?.starter_code,
//           model_answer: q.code_questions?.model_answer,
//           model_answer_code: q.code_questions?.model_answer_code,
//           language: q.code_questions?.language,
//         }),
//         ...(q.type === "algorithm" && {
//           starter_code: q.code_questions?.starter_code,
//           model_answer: q.code_questions?.model_answer,
//           model_answer_code: q.code_questions?.model_answer_code,
//           language: q.code_questions?.language,
//         }),
//         ...(q.type === "sql" && {
//           starter_code: q.code_questions?.starter_code,
//           model_answer: q.code_questions?.model_answer,
//           model_answer_code: q.code_questions?.model_answer_code,
//           language: q.code_questions?.language,
//         }),
//         ...(q.type === "true-false" && {
//           model_answer: q.true_false_questions?.correct_answer,
//         }),
//         ...(q.type === "short-answer" && {
//           model_answer: q.short_answer_questions?.model_answer,
//           keywords: q.short_answer_questions?.keywords,
//         }),
//         ...(q.type === "essay" && {
//           model_answer: q.essay_questions?.model_answer,
//           rubric: q.essay_questions?.rubric,
//           keywords: q.essay_questions?.keywords,
//         }),
//       }))

//       setQuestions(transformedQuestions)
//     } catch (error) {
//       console.error("Error fetching questions:", error)
//       toast.error("Failed to load questions")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleQuestionToggle = (questionId: string) => {
//     setSelectedQuestions(prev => {
//       const newSet = new Set(prev)
//       if (newSet.has(questionId)) {
//         newSet.delete(questionId)
//       } else {
//         newSet.add(questionId)
//       }
//       return newSet
//     })
//   }

//   const handleSelectAll = () => {
//     if (selectedQuestions.size === questions.length) {
//       setSelectedQuestions(new Set())
//     } else {
//       setSelectedQuestions(new Set(questions.map(q => q.id)))
//     }
//   }

//   const generatePDF = () => {
//     if (!selectedTopicId || questions.length === 0) {
//       toast.error("Please select a topic with questions")
//       return
//     }

//     if (selectedQuestions.size === 0) {
//       toast.error("Please select at least one question")
//       return
//     }

//     setGenerating(true)

//     try {
//       const selectedTopic = topics.find(t => String(t.id) === selectedTopicId)
//       const doc = new jsPDF()

//       // Add title page
//       doc.setFontSize(24)
//       doc.setFont("helvetica", "bold")
//       const titleText = `Test: ${selectedTopic?.topicnumber} - ${selectedTopic?.name}`
//       const splitTitle = doc.splitTextToSize(titleText, 180)
//       doc.text(splitTitle, 14, 40)

//       doc.setFontSize(12)
//       doc.setFont("helvetica", "normal")
//       doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 60)
//       doc.text(`Total Questions: ${selectedQuestions.size}`, 14, 75)

//       // Student information fields
//       doc.setFontSize(14)
//       doc.setFont("helvetica", "bold")
//       doc.text("Student Information:", 14, 100)

//       doc.setFontSize(12)
//       doc.setFont("helvetica", "normal")
//       doc.text("Forename: _____________________________", 14, 120)
//       doc.text("Last Name: _____________________________", 14, 140)
//       doc.text("Year: _____________________________", 14, 160)
//       doc.text("Teacher: _____________________________", 14, 180)

//       // Start questions on new page
//       doc.addPage()
//       let yPosition = 20

//       // Group questions by type in the specified order
//       const questionTypes = [
//         "true-false",
//         "multiple-choice", 
//         "matching",
//         "fill-in-the-blank",
//         "short-answer",
//         "essay",
//         "code",
//         "sql",
//         "algorithm"
//       ]

//       const difficultyOrder: Record<string, number> = {
//         "low": 1,
//         "medium": 2,
//         "high": 3
//       }

//       let firstGroup = true

//       questionTypes.forEach((type, typeIndex) => {
//         const typeQuestions = questions
//           .filter(q => q.type === type && selectedQuestions.has(q.id))
//           .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])

//         if (typeQuestions.length === 0) return

//         // Start each new question type group on a new page (except the first group with questions)
//         if (!firstGroup) {
//           doc.addPage()
//           yPosition = 20
//         } else if (yPosition > 260) {
//           doc.addPage()
//           yPosition = 20
//         }

//         firstGroup = false

//         // Section header
//         doc.setFontSize(14)
//         doc.setFont("helvetica", "bold")
//         doc.text(type.toUpperCase().replace(/-/g, " "), 14, yPosition)
//         yPosition += 12 // 1.5 line spacing

//         typeQuestions.forEach((question, index) => {
//           // Check if we need a new page for short answer, essay, code, or algorithm questions
//           if (question.type === "short-answer" && yPosition > 200) {
//             doc.addPage()
//             yPosition = 20
//           } else if (question.type === "essay" && yPosition > 50) {
//             doc.addPage()
//             yPosition = 20
//           } else if ((question.type === "code" || question.type === "sql" || question.type === "algorithm") && yPosition > 200) {
//             doc.addPage()
//             yPosition = 20
//           } else if (question.type === "true-false" && yPosition > 250) {
//             doc.addPage()
//             yPosition = 20
//           } else if (yPosition > 260) {
//             doc.addPage()
//             yPosition = 20
//           }

//           // Question number and difficulty
//           doc.setFontSize(10)
//           doc.setFont("helvetica", "bold")
//           const questionNum = `Q${index + 1} [${question.difficulty}]`
//           doc.text(questionNum, 14, yPosition)
//           yPosition += 9 // 1.5 line spacing

//           // Question text
//           doc.setFont("helvetica", "normal")
//           const splitText = doc.splitTextToSize(question.question_text, 180)
//           doc.text(splitText, 14, yPosition)
//           yPosition += splitText.length * 7.5 + 3 // 1.5 line spacing

//           // Type-specific content
//           if (question.type === "multiple-choice" && question.options) {
//             question.options.forEach((option, idx) => {
//               if (yPosition > 275) {
//                 doc.addPage()
//                 yPosition = 20
//               }
//               const optionText = `${String.fromCharCode(65 + idx)}) ${option}`
//               const splitOption = doc.splitTextToSize(optionText, 170)
//               doc.text(splitOption, 18, yPosition)
//               yPosition += splitOption.length * 7.5 // 1.5 line spacing
//             })
//             yPosition += 3
//           }

//           if (question.type === "fill-in-the-blank" && question.options) {
//             doc.setFont("helvetica", "italic")
//             doc.text("Options:", 18, yPosition)
//             yPosition += 7.5 // 1.5 line spacing
//             question.options.forEach((option) => {
//               if (yPosition > 275) {
//                 doc.addPage()
//                 yPosition = 20
//               }
//               const optionText = `• ${option}`
//               const splitOption = doc.splitTextToSize(optionText, 170)
//               doc.text(splitOption, 22, yPosition)
//               yPosition += splitOption.length * 7.5 // 1.5 line spacing
//             })
//             yPosition += 3
//           }

//           if (question.type === "matching" && question.pairs) {
//             doc.setFont("helvetica", "italic")
//             doc.text("Match the following:", 18, yPosition)
//             yPosition += 5

//             // Create two columns for matching pairs
//             const leftColumn = 22
//             const rightColumn = 110
//             const lineHeight = 5

//             question.pairs.forEach((pair, idx) => {
//               if (yPosition > 270) {
//                 doc.addPage()
//                 yPosition = 20
//               }

//               // Left side - statement
//               const statementText = `${idx + 1}. ${pair.statement}`
//               const splitStatement = doc.splitTextToSize(statementText, 80)
//               doc.text(splitStatement, leftColumn, yPosition)

//               // Right side - match
//               const matchText = `${String.fromCharCode(65 + idx)}) ${pair.match}`
//               const splitMatch = doc.splitTextToSize(matchText, 80)
//               doc.text(splitMatch, rightColumn, yPosition)

//               // Move to next line based on the longer text
//               const maxLines = Math.max(splitStatement.length, splitMatch.length)
//               yPosition += maxLines * (lineHeight * 1.5) + 2 // 1.5 line spacing
//             })
//             yPosition += 3
//           }

//           if (question.type === "true-false") {
//             // Create a subtle table for True/False questions
//             doc.setFont("helvetica", "normal")
//             doc.setFontSize(10)

//             // Table header
//             doc.setFont("helvetica", "bold")
//             doc.text("Circle your answer:", 18, yPosition)
//             yPosition += 5

//             // Create table with T and F options
//             const tableStartX = 18
//             const tableWidth = 120
//             const rowHeight = 10

//             // Draw table border with thinner lines
//             doc.setLineWidth(0.3)
//             doc.rect(tableStartX, yPosition, tableWidth, rowHeight)

//             // Draw vertical line in the middle
//             doc.line(tableStartX + tableWidth/2, yPosition, tableStartX + tableWidth/2, yPosition + rowHeight)

//             // Add T and F labels with smaller font
//             doc.setFont("helvetica", "bold")
//             doc.setFontSize(10)
//             doc.text("T", tableStartX + tableWidth/4, yPosition + 6)
//             doc.text("F", tableStartX + 3*tableWidth/4, yPosition + 6)

//             yPosition += rowHeight + 3
//           }

//           if (question.type === "code" || question.type === "sql" || question.type === "algorithm") {
//             if (question.starter_code) {
//               doc.setFont("courier", "normal")
//               doc.setFontSize(8)
//               const codeLines = doc.splitTextToSize(question.starter_code, 170)
//               codeLines.forEach((line: string) => {
//                 if (yPosition > 275) {
//                   doc.addPage()
//                   yPosition = 20
//                 }
//                 doc.text(line, 18, yPosition)
//                 yPosition += 6 // 1.5 line spacing for code
//               })
//               doc.setFontSize(10)
//               doc.setFont("helvetica", "normal")
//               yPosition += 3
//             }

//             // Add writing lines to fill the rest of the page
//             doc.setFont("helvetica", "normal")
//             doc.setFontSize(10)
//             while (yPosition < 280) { // Fill to near bottom of page
//               doc.line(18, yPosition, 190, yPosition)
//               yPosition += 7.5 // 1.5 line spacing
//             }
//             yPosition += 5
//           }

//           // Add writing space for short answer and essay questions
//           if (question.type === "short-answer") {
//             // Add 1/4 page of writing space for short answers
//             // Page break already handled above, but double-check
//             if (yPosition > 200) {
//               doc.addPage()
//               yPosition = 20
//             }

//             // Show keywords if enabled
//             if (showKeywords && question.keywords && question.keywords.length > 0) {
//               doc.setFont("helvetica", "italic")
//               doc.setFontSize(9)
//               doc.text("Keywords:", 18, yPosition)
//               yPosition += 7.5
//               const keywordsText = question.keywords.join(", ")
//               const splitKeywords = doc.splitTextToSize(keywordsText, 170)
//               doc.text(splitKeywords, 18, yPosition)
//               yPosition += splitKeywords.length * 7.5 + 3
//             }

//             // Add lines for writing
//             doc.setFont("helvetica", "normal")
//             doc.setFontSize(10)
//             for (let i = 0; i < 10; i++) {
//               if (yPosition > 270) {
//                 doc.addPage()
//                 yPosition = 20
//               }
//               doc.line(18, yPosition, 190, yPosition)
//               yPosition += 7.5 // 1.5 line spacing
//             }
//             yPosition += 5
//           }

//           if (question.type === "essay") {
//             // Add full page of writing space for essays
//             // Page break already handled above, but double-check
//             if (yPosition > 50) {
//               doc.addPage()
//               yPosition = 20
//             }

//             // Show keywords if enabled
//             if (showKeywords && question.keywords && question.keywords.length > 0) {
//               doc.setFont("helvetica", "italic")
//               doc.setFontSize(9)
//               doc.text("Keywords:", 18, yPosition)
//               yPosition += 7.5
//               const keywordsText = question.keywords.join(", ")
//               const splitKeywords = doc.splitTextToSize(keywordsText, 170)
//               doc.text(splitKeywords, 18, yPosition)
//               yPosition += splitKeywords.length * 7.5 + 3
//             }

//             // Add lines for writing (full page)
//             doc.setFont("helvetica", "normal")
//             doc.setFontSize(10)
//             for (let i = 0; i < 50; i++) {
//               doc.line(18, yPosition, 190, yPosition)
//               yPosition += 7.5 // 1.5 line spacing
//             }
//             yPosition += 5
//           }

//           // Add space between questions
//           yPosition += 5
//         })

//         yPosition += 5
//       })

//       // Add answer key if requested
//       if (includeAnswers) {
//         // Add answer key page
//         doc.addPage()
//         yPosition = 20

//         // Answer key title
//         doc.setFontSize(20)
//         doc.setFont("helvetica", "bold")
//         const answerTitle = "ANSWERS"
//         const splitAnswerTitle = doc.splitTextToSize(answerTitle, 180)
//         doc.text(splitAnswerTitle, 14, yPosition)
//         yPosition += splitAnswerTitle.length * 7.5 + 5

//         // Generate answers for each question type
//         let firstAnswerGroup = true
//         questionTypes.forEach((type) => {
//           const typeQuestions = questions
//             .filter(q => q.type === type && selectedQuestions.has(q.id))
//             .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])

//           if (typeQuestions.length === 0) return

//           // Start each new question group on a new page (except the first)
//           if (!firstAnswerGroup) {
//             doc.addPage()
//             yPosition = 20
//           }
//           firstAnswerGroup = false

//           // Section header
//           doc.setFontSize(14)
//           doc.setFont("helvetica", "bold")
//           doc.text(type.toUpperCase().replace(/-/g, " "), 14, yPosition)
//           yPosition += 12

//           typeQuestions.forEach((question, index) => {
//             // Calculate space needed for this question
//             let spaceNeeded = 0

//             // Question number and difficulty
//             spaceNeeded += 9

//             // Question text
//             const splitText = doc.splitTextToSize(question.question_text, 180)
//             spaceNeeded += splitText.length * 7.5 + 3

//             // Keywords (if enabled)
//             if (showKeywords && question.keywords && question.keywords.length > 0) {
//               const keywordsText = question.keywords.join(", ")
//               const splitKeywords = doc.splitTextToSize(keywordsText, 170)
//               spaceNeeded += 7.5 + splitKeywords.length * 7.5 + 3
//             }

//             // Answer section
//             spaceNeeded += 7.5 // "Answer:" label

//             // Answer content based on type
//             if (question.type === "multiple-choice" && question.options && question.correctAnswerIndex !== undefined) {
//               spaceNeeded += 7.5
//             } else if (question.type === "true-false") {
//               spaceNeeded += 5 + 10 + 3 // "Circle your answer:" + table height + spacing
//             } else if (question.type === "fill-in-the-blank") {
//               spaceNeeded += 7.5
//             } else if (question.type === "matching" && question.pairs) {
//               // Calculate space for each matching pair with two-line format
//               question.pairs.forEach((pair) => {
//                 // Statement line
//                 const statementText = `1. ${pair.statement}`
//                 const splitStatement = doc.splitTextToSize(statementText, 170)
//                 spaceNeeded += splitStatement.length * 7.5

//                 // Match line (no arrow)
//                 const matchText = pair.match
//                 const splitMatch = doc.splitTextToSize(matchText, 160)
//                 spaceNeeded += splitMatch.length * 7.5 + 3 // Extra space between pairs
//               })
//             } else if (question.type === "short-answer" || question.type === "essay") {
//               const answerText = String(question.model_answer)
//               const splitAnswer = doc.splitTextToSize(answerText, 170)
//               spaceNeeded += splitAnswer.length * 7.5
//             } else if (question.type === "code" || question.type === "sql" || question.type === "algorithm") {
//               if (question.model_answer_code) {
//                 const codeLines = doc.splitTextToSize(question.model_answer_code, 170)
//                 spaceNeeded += codeLines.length * 6
//               }
//             }

//             // Explanation (if available)
//             if (question.explanation) {
//               const splitExplanation = doc.splitTextToSize(question.explanation, 170)
//               spaceNeeded += 7.5 + splitExplanation.length * 7.5 + 3
//             }

//             // Space between questions
//             spaceNeeded += 5

//             // Check if we need a new page
//             if (yPosition + spaceNeeded > 280) {
//               doc.addPage()
//               yPosition = 20
//             }

//             // Question number and difficulty
//             doc.setFontSize(10)
//             doc.setFont("helvetica", "bold")
//             const questionNum = `Q${index + 1} [${question.difficulty}]`
//             doc.text(questionNum, 14, yPosition)
//             yPosition += 9

//             // Question text
//             doc.setFont("helvetica", "normal")
//             doc.text(splitText, 14, yPosition)
//             yPosition += splitText.length * 7.5 + 3

//             // Show keywords before answer if enabled
//             if (showKeywords && question.keywords && question.keywords.length > 0) {
//               doc.setFont("helvetica", "italic")
//               doc.setFontSize(9)
//               doc.text("Keywords:", 18, yPosition)
//               yPosition += 7.5
//               const keywordsText = question.keywords.join(", ")
//               const splitKeywords = doc.splitTextToSize(keywordsText, 170)
//               doc.text(splitKeywords, 18, yPosition)
//               yPosition += splitKeywords.length * 7.5 + 3
//             }

//             // Answer based on question type
//             doc.setFont("helvetica", "bold")
//             doc.text("Answer:", 18, yPosition)
//             yPosition += 7.5

//             doc.setFont("helvetica", "normal")

//             if (question.type === "multiple-choice" && question.options && question.correctAnswerIndex !== undefined) {
//               const correctAnswer = question.options[question.correctAnswerIndex]
//               doc.text(`${String.fromCharCode(65 + question.correctAnswerIndex)}) ${correctAnswer}`, 22, yPosition)
//               yPosition += 7.5
//             }

//             if (question.type === "true-false") {
//               doc.text(question.model_answer === true ? "True" : "False", 22, yPosition)
//               yPosition += 7.5
//             }

//             if (question.type === "fill-in-the-blank") {
//               if (Array.isArray(question.model_answer)) {
//                 doc.text(question.model_answer.join(", "), 22, yPosition)
//               } else {
//                 doc.text(String(question.model_answer), 22, yPosition)
//               }
//               yPosition += 7.5
//             }

//             if (question.type === "matching" && question.pairs) {
//               question.pairs.forEach((pair, idx) => {
//                 // Statement on first line
//                 doc.setFont("helvetica", "normal")
//                 const statementText = `${idx + 1}. ${pair.statement}`
//                 const splitStatement = doc.splitTextToSize(statementText, 170)
//                 doc.text(splitStatement, 22, yPosition)
//                 yPosition += splitStatement.length * 7.5

//                 // Match on second line with indentation (no arrow)
//                 doc.setFont("helvetica", "normal")
//                 const matchText = pair.match
//                 const splitMatch = doc.splitTextToSize(matchText, 160)
//                 doc.text(splitMatch, 30, yPosition)
//                 yPosition += splitMatch.length * 7.5 + 3 // Extra space between pairs
//               })
//             }

//             if (question.type === "short-answer" || question.type === "essay") {
//               const answerText = String(question.model_answer)
//               const splitAnswer = doc.splitTextToSize(answerText, 170)
//               doc.text(splitAnswer, 22, yPosition)
//               yPosition += splitAnswer.length * 7.5
//             }

//             if (question.type === "code" || question.type === "sql" || question.type === "algorithm") {
//               if (question.model_answer_code) {
//                 doc.setFont("courier", "normal")
//                 doc.setFontSize(8)
//                 const codeLines = doc.splitTextToSize(question.model_answer_code, 170)
//                 codeLines.forEach((line: string) => {
//                   doc.text(line, 22, yPosition)
//                   yPosition += 6
//                 })
//                 doc.setFontSize(10)
//                 doc.setFont("helvetica", "normal")
//               }
//             }

//             // Show explanation if available
//             if (question.explanation) {
//               doc.setFont("helvetica", "bold")
//               doc.text("Explanation:", 18, yPosition)
//               yPosition += 7.5
//               doc.setFont("helvetica", "normal")
//               const splitExplanation = doc.splitTextToSize(question.explanation, 170)
//               doc.text(splitExplanation, 18, yPosition)
//               yPosition += splitExplanation.length * 7.5 + 3
//             }

//             yPosition += 3 // Minimal space between questions
//           })

//           yPosition += 5
//         })
//       }

//       // Open in new tab
//       const pdfBlob = doc.output('blob')
//       const pdfUrl = URL.createObjectURL(pdfBlob)
//       window.open(pdfUrl, '_blank')

//       toast.success("Test PDF generated successfully!")
//     } catch (error) {
//       console.error("Error generating PDF:", error)
//       toast.error("Failed to generate PDF")
//     } finally {
//       setGenerating(false)
//     }
//   }

//   // Group questions by type for preview in the same order as PDF
//   const questionTypes = [
//     "true-false",
//     "multiple-choice", 
//     "matching",
//     "fill-in-the-blank",
//     "short-answer",
//     "essay",
//     "code",
//     "sql",
//     "algorithm"
//   ]

//   const difficultyOrder: Record<string, number> = {
//     "low": 1,
//     "medium": 2,
//     "high": 3
//   }

//   const questionsByType = questionTypes.reduce((acc, type) => {
//     const typeQuestions = questions
//       .filter(q => q.type === type)
//       .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])

//     if (typeQuestions.length > 0) {
//       acc[type] = typeQuestions
//     }
//     return acc
//   }, {} as Record<string, ExtendedQuestion[]>)

//   if (loading && topics.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="flex items-center gap-2">
//           <Loader2 className="w-6 h-6 animate-spin" />
//           <span>Loading...</span>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto p-6 max-w-6xl">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold mb-2">Test Builder</h1>
//         <p className="text-muted-foreground">
//           Select a topic to generate a PDF test with all questions grouped by type and sorted by difficulty.
//         </p>
//       </div>

//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Select Topic</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex gap-4 items-end">
//               <div className="flex-1">
//                 <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Choose a topic..." />
//                   </SelectTrigger>
//                   <SelectContent className="max-h-60 overflow-y-auto">
//                     {topics.map((topic) => (
//                       <SelectItem key={topic.id} value={String(topic.id)}>
//                         {topic.topicnumber} - {topic.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <Button
//                 onClick={generatePDF}
//                 disabled={!selectedTopicId || selectedQuestions.size === 0 || generating}
//               >
//                 {generating ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Download className="w-4 h-4 mr-2" />
//                     Generate PDF
//                   </>
//                 )}
//               </Button>
//             </div>
//             <div className="space-y-3">
//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="show-keywords"
//                   checked={showKeywords}
//                   onCheckedChange={(checked) => setShowKeywords(checked as boolean)}
//                 />
//                 <label
//                   htmlFor="show-keywords"
//                   className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                 >
//                   Show keywords in PDF (for short answer and essay questions)
//                 </label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="include-answers"
//                   checked={includeAnswers}
//                   onCheckedChange={(checked) => setIncludeAnswers(checked as boolean)}
//                 />
//                 <label
//                   htmlFor="include-answers"
//                   className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                 >
//                   Include answer key at the end of the PDF
//                 </label>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {selectedTopicId && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center justify-between">
//               <span>Preview</span>
//               <div className="flex items-center gap-4">
//                 <Badge variant="secondary">{selectedQuestions.size} of {questions.length} selected</Badge>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleSelectAll}
//                 >
//                   {selectedQuestions.size === questions.length ? "Deselect All" : "Select All"}
//                 </Button>
//               </div>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="flex items-center justify-center py-12">
//                 <Loader2 className="w-6 h-6 animate-spin" />
//                 <span className="ml-2">Loading questions...</span>
//               </div>
//             ) : questions.length === 0 ? (
//               <div className="text-center py-12 text-muted-foreground">
//                 <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
//                 <p>No questions found for this topic</p>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 {questionTypes.map((type) => {
//                   const typeQuestions = questionsByType[type]
//                   if (!typeQuestions || typeQuestions.length === 0) return null

//                   return (
//                     <div key={type} className="border-l-4 border-primary pl-4">
//                       <h3 className="font-semibold text-lg mb-3 capitalize">
//                         {type.replace(/-/g, " ")} ({typeQuestions.length})
//                       </h3>
//                       <div className="space-y-2">
//                         {typeQuestions.map((question, index) => (
//                           <div
//                             key={question.id}
//                             className="flex items-start gap-3 p-3 bg-muted/30 rounded-md"
//                           >
//                             <Checkbox
//                               checked={selectedQuestions.has(question.id)}
//                               onCheckedChange={() => handleQuestionToggle(question.id)}
//                               className="mt-1"
//                             />
//                             <Badge
//                               className={`mt-1 ${
//                                 question.difficulty === "low"
//                                   ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
//                                   : question.difficulty === "medium"
//                                   ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
//                                   : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
//                               }`}
//                             >
//                               {question.difficulty}
//                             </Badge>
//                             <div className="flex-1">
//                               <p className="text-sm">
//                                 <span className="font-medium">Q{index + 1}:</span>{" "}
//                                 {question.question_text.substring(0, 100)}
//                                 {question.question_text.length > 100 ? "..." : ""}
//                               </p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Question } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Loader2, X, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import jsPDF from "jspdf"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface Topic {
    id: number
    name: string
    slug: string
    topicnumber: string
}

interface ExtendedQuestion extends Question {
    starter_code?: string
    language?: string
    model_answer_code?: string
}

export default function TestBuilder() {
    const [topics, setTopics] = useState<Topic[]>([])
    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
    const [questions, setQuestions] = useState<ExtendedQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [showKeywords, setShowKeywords] = useState(false)
    const [includeAnswers, setIncludeAnswers] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
    const [open, setOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchTopics()
    }, [])

    useEffect(() => {
        if (selectedTopicIds.length > 0) {
            fetchQuestions(selectedTopicIds)
        } else {
            setQuestions([])
            setSelectedQuestions(new Set())
        }
    }, [selectedTopicIds])

    // Select all questions by default when questions are loaded
    useEffect(() => {
        if (questions.length > 0) {
            setSelectedQuestions(new Set(questions.map((q) => q.id)))
        }
    }, [questions])

    const fetchTopics = async () => {
        try {
            const { data, error } = await supabase
                .from("topics")
                .select("id, name, slug, topicnumber")
                .order("topicnumber", { ascending: true })

            if (error) throw error
            setTopics(data || [])
        } catch (error) {
            console.error("Error fetching topics:", error)
            toast.error("Failed to load topics")
        } finally {
            setLoading(false)
        }
    }

    const fetchQuestions = async (topicIds: string[]) => {
        setLoading(true)
        try {
            // Get all subtopics for all selected topics
            const { data: subtopicsData, error: subtopicsError } = await supabase
                .from("subtopics")
                .select("id")
                .in("topic_id", topicIds)

            if (subtopicsError) throw subtopicsError

            const subtopicIds = subtopicsData.map((s) => s.id)

            if (subtopicIds.length === 0) {
                setQuestions([])
                return
            }

            // Get all questions linked to these subtopics
            const { data: linksData, error: linksError } = await supabase
                .from("subtopic_question_link")
                .select("question_id")
                .in("subtopic_id", subtopicIds)

            if (linksError) throw linksError

            const questionIds = [...new Set(linksData.map((l) => l.question_id))]

            if (questionIds.length === 0) {
                setQuestions([])
                return
            }

            // Fetch all questions
            const { data, error } = await supabase
                .from("questions")
                .select(`
          *,
          short_answer_questions(*),
          true_false_questions(*),
          matching_questions(*),
          fill_in_the_blank_questions(
            options,
            correct_answers,
            order_important
          ),
          code_questions(*),
          multiple_choice_questions(*),
          essay_questions(*)
        `)
                .in("id", questionIds)
                .order("difficulty", { ascending: true })

            if (error) throw error

            const transformedQuestions: ExtendedQuestion[] = data.map((q) => ({
                id: q.id,
                type: q.type,
                difficulty: q.difficulty,
                topic: "",
                question_text: q.question_text,
                explanation: q.explanation,
                created_at: q.created_at,
                model_answer: q.model_answer || "",
                ...(q.type === "multiple-choice" && {
                    options: q.multiple_choice_questions?.options,
                    correctAnswerIndex: q.multiple_choice_questions?.correct_answer_index,
                    model_answer: q.multiple_choice_questions?.model_answer || "",
                }),
                ...(q.type === "fill-in-the-blank" && {
                    options: q.fill_in_the_blank_questions?.options,
                    order_important: q.fill_in_the_blank_questions?.order_important,
                    model_answer: q.fill_in_the_blank_questions?.correct_answers || [],
                }),
                ...(q.type === "matching" && {
                    pairs: q.matching_questions?.map((mq: { statement: string; match: string }) => ({
                        statement: mq.statement,
                        match: mq.match,
                    })),
                }),
                ...(q.type === "code" && {
                    starter_code: q.code_questions?.starter_code,
                    model_answer: q.code_questions?.model_answer,
                    model_answer_code: q.code_questions?.model_answer_code,
                    language: q.code_questions?.language,
                }),
                ...(q.type === "algorithm" && {
                    starter_code: q.code_questions?.starter_code,
                    model_answer: q.code_questions?.model_answer,
                    model_answer_code: q.code_questions?.model_answer_code,
                    language: q.code_questions?.language,
                }),
                ...(q.type === "sql" && {
                    starter_code: q.code_questions?.starter_code,
                    model_answer: q.code_questions?.model_answer,
                    model_answer_code: q.code_questions?.model_answer_code,
                    language: q.code_questions?.language,
                }),
                ...(q.type === "true-false" && {
                    model_answer: q.true_false_questions?.correct_answer,
                }),
                ...(q.type === "short-answer" && {
                    model_answer: q.short_answer_questions?.model_answer,
                    keywords: q.short_answer_questions?.keywords,
                }),
                ...(q.type === "essay" && {
                    model_answer: q.essay_questions?.model_answer,
                    rubric: q.essay_questions?.rubric,
                    keywords: q.essay_questions?.keywords,
                }),
            }))

            setQuestions(transformedQuestions)
        } catch (error) {
            console.error("Error fetching questions:", error)
            toast.error("Failed to load questions")
        } finally {
            setLoading(false)
        }
    }

    const handleQuestionToggle = (questionId: string) => {
        setSelectedQuestions((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(questionId)) {
                newSet.delete(questionId)
            } else {
                newSet.add(questionId)
            }
            return newSet
        })
    }

    const handleSelectAll = () => {
        if (selectedQuestions.size === questions.length) {
            setSelectedQuestions(new Set())
        } else {
            setSelectedQuestions(new Set(questions.map((q) => q.id)))
        }
    }

    const toggleTopic = (topicId: string) => {
        setSelectedTopicIds((prev) => {
            if (prev.includes(topicId)) {
                return prev.filter((id) => id !== topicId)
            } else {
                return [...prev, topicId]
            }
        })
    }

    const removeTopic = (topicId: string) => {
        setSelectedTopicIds((prev) => prev.filter((id) => id !== topicId))
    }

    const generatePDF = () => {
        if (selectedTopicIds.length === 0 || questions.length === 0) {
            toast.error("Please select at least one topic with questions")
            return
        }

        if (selectedQuestions.size === 0) {
            toast.error("Please select at least one question")
            return
        }

        setGenerating(true)

        try {
            const selectedTopics = topics.filter((t) => selectedTopicIds.includes(String(t.id)))
            const doc = new jsPDF()

            // Add title page
            doc.setFontSize(24)
            doc.setFont("helvetica", "bold")
            const titleText =
                selectedTopics.length === 1
                    ? `Test: ${selectedTopics[0].topicnumber} - ${selectedTopics[0].name}`
                    : "Multi-Topic Test"
            const splitTitle = doc.splitTextToSize(titleText, 180)
            doc.text(splitTitle, 14, 40)

            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 60)

            if (selectedTopics.length > 1) {
                doc.setFontSize(10)
                doc.text("Topics covered:", 14, 75)
                let yPos = 82
                selectedTopics.forEach((topic, idx) => {
                    doc.text(`${idx + 1}. ${topic.topicnumber} - ${topic.name}`, 18, yPos)
                    yPos += 7
                })
                doc.setFontSize(12)
                doc.text(`Total Questions: ${selectedQuestions.size}`, 14, yPos + 5)
            } else {
                doc.text(`Total Questions: ${selectedQuestions.size}`, 14, 75)
            }

            // Student information fields
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            const studentInfoY = selectedTopics.length > 1 ? 140 : 100
            doc.text("Student Information:", 14, studentInfoY)

            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            doc.text("Forename: _____________________________", 14, studentInfoY + 20)
            doc.text("Last Name: _____________________________", 14, studentInfoY + 40)
            doc.text("Year: _____________________________", 14, studentInfoY + 60)
            doc.text("Teacher: _____________________________", 14, studentInfoY + 80)

            // Start questions on new page
            doc.addPage()
            let yPosition = 20

            // Group questions by type in the specified order
            const questionTypes = [
                "true-false",
                "multiple-choice",
                "matching",
                "fill-in-the-blank",
                "short-answer",
                "essay",
                "code",
                "sql",
                "algorithm",
            ]

            const difficultyOrder: Record<string, number> = {
                low: 1,
                medium: 2,
                high: 3,
            }

            let firstGroup = true

            questionTypes.forEach((type, typeIndex) => {
                const typeQuestions = questions
                    .filter((q) => q.type === type && selectedQuestions.has(q.id))
                    .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])

                if (typeQuestions.length === 0) return

                // Start each new question type group on a new page (except the first group with questions)
                if (!firstGroup) {
                    doc.addPage()
                    yPosition = 20
                } else if (yPosition > 260) {
                    doc.addPage()
                    yPosition = 20
                }

                firstGroup = false

                // Section header
                doc.setFontSize(14)
                doc.setFont("helvetica", "bold")
                doc.text(type.toUpperCase().replace(/-/g, " "), 14, yPosition)
                yPosition += 12 // 1.5 line spacing

                typeQuestions.forEach((question, index) => {
                    // Check if we need a new page for short answer, essay, code, or algorithm questions
                    if (question.type === "short-answer" && yPosition > 200) {
                        doc.addPage()
                        yPosition = 20
                    } else if (question.type === "essay" && yPosition > 50) {
                        doc.addPage()
                        yPosition = 20
                    } else if (
                        (question.type === "code" || question.type === "sql" || question.type === "algorithm") &&
                        yPosition > 200
                    ) {
                        doc.addPage()
                        yPosition = 20
                    } else if (question.type === "true-false" && yPosition > 250) {
                        doc.addPage()
                        yPosition = 20
                    } else if (yPosition > 260) {
                        doc.addPage()
                        yPosition = 20
                    }

                    // Question number and difficulty
                    doc.setFontSize(10)
                    doc.setFont("helvetica", "bold")
                    const questionNum = `Q${index + 1} [${question.difficulty}]`
                    doc.text(questionNum, 14, yPosition)
                    yPosition += 9 // 1.5 line spacing

                    // Question text
                    doc.setFont("helvetica", "normal")
                    const splitText = doc.splitTextToSize(question.question_text, 180)
                    doc.text(splitText, 14, yPosition)
                    yPosition += splitText.length * 7.5 + 3 // 1.5 line spacing

                    // Type-specific content
                    if (question.type === "multiple-choice" && question.options) {
                        question.options.forEach((option, idx) => {
                            if (yPosition > 275) {
                                doc.addPage()
                                yPosition = 20
                            }
                            const optionText = `${String.fromCharCode(65 + idx)}) ${option}`
                            const splitOption = doc.splitTextToSize(optionText, 170)
                            doc.text(splitOption, 18, yPosition)
                            yPosition += splitOption.length * 7.5 // 1.5 line spacing
                        })
                        yPosition += 3
                    }

                    if (question.type === "fill-in-the-blank" && question.options) {
                        doc.setFont("helvetica", "italic")
                        doc.text("Options:", 18, yPosition)
                        yPosition += 7.5 // 1.5 line spacing
                        question.options.forEach((option) => {
                            if (yPosition > 275) {
                                doc.addPage()
                                yPosition = 20
                            }
                            const optionText = `• ${option}`
                            const splitOption = doc.splitTextToSize(optionText, 170)
                            doc.text(splitOption, 22, yPosition)
                            yPosition += splitOption.length * 7.5 // 1.5 line spacing
                        })
                        yPosition += 3
                    }

                    if (question.type === "matching" && question.pairs) {
                        doc.setFont("helvetica", "italic")
                        doc.text("Match the following:", 18, yPosition)
                        yPosition += 5

                        // Create two columns for matching pairs
                        const leftColumn = 22
                        const rightColumn = 110
                        const lineHeight = 5

                        question.pairs.forEach((pair, idx) => {
                            if (yPosition > 270) {
                                doc.addPage()
                                yPosition = 20
                            }

                            // Left side - statement
                            const statementText = `${idx + 1}. ${pair.statement}`
                            const splitStatement = doc.splitTextToSize(statementText, 80)
                            doc.text(splitStatement, leftColumn, yPosition)

                            // Right side - match
                            const matchText = `${String.fromCharCode(65 + idx)}) ${pair.match}`
                            const splitMatch = doc.splitTextToSize(matchText, 80)
                            doc.text(splitMatch, rightColumn, yPosition)

                            // Move to next line based on the longer text
                            const maxLines = Math.max(splitStatement.length, splitMatch.length)
                            yPosition += maxLines * (lineHeight * 1.5) + 2 // 1.5 line spacing
                        })
                        yPosition += 3
                    }

                    if (question.type === "true-false") {
                        // Create a subtle table for True/False questions
                        doc.setFont("helvetica", "normal")
                        doc.setFontSize(10)

                        // Table header
                        doc.setFont("helvetica", "bold")
                        doc.text("Circle your answer:", 18, yPosition)
                        yPosition += 5

                        // Create table with T and F options
                        const tableStartX = 18
                        const tableWidth = 120
                        const rowHeight = 10

                        // Draw table border with thinner lines
                        doc.setLineWidth(0.3)
                        doc.rect(tableStartX, yPosition, tableWidth, rowHeight)

                        // Draw vertical line in the middle
                        doc.line(tableStartX + tableWidth / 2, yPosition, tableStartX + tableWidth / 2, yPosition + rowHeight)

                        // Add T and F labels with smaller font
                        doc.setFont("helvetica", "bold")
                        doc.setFontSize(10)
                        doc.text("T", tableStartX + tableWidth / 4, yPosition + 6)
                        doc.text("F", tableStartX + (3 * tableWidth) / 4, yPosition + 6)

                        yPosition += rowHeight + 3
                    }

                    if (question.type === "code" || question.type === "sql" || question.type === "algorithm") {
                        if (question.starter_code) {
                            doc.setFont("courier", "normal")
                            doc.setFontSize(8)
                            const codeLines = doc.splitTextToSize(question.starter_code, 170)
                            codeLines.forEach((line: string) => {
                                if (yPosition > 275) {
                                    doc.addPage()
                                    yPosition = 20
                                }
                                doc.text(line, 18, yPosition)
                                yPosition += 6 // 1.5 line spacing for code
                            })
                            doc.setFontSize(10)
                            doc.setFont("helvetica", "normal")
                            yPosition += 3
                        }

                        // Add writing lines to fill the rest of the page
                        doc.setFont("helvetica", "normal")
                        doc.setFontSize(10)
                        while (yPosition < 280) {
                            // Fill to near bottom of page
                            doc.line(18, yPosition, 190, yPosition)
                            yPosition += 7.5 // 1.5 line spacing
                        }
                        yPosition += 5
                    }

                    // Add writing space for short answer and essay questions
                    if (question.type === "short-answer") {
                        // Add 1/4 page of writing space for short answers
                        // Page break already handled above, but double-check
                        if (yPosition > 200) {
                            doc.addPage()
                            yPosition = 20
                        }

                        // Show keywords if enabled
                        if (showKeywords && question.keywords && question.keywords.length > 0) {
                            doc.setFont("helvetica", "italic")
                            doc.setFontSize(9)
                            doc.text("Keywords:", 18, yPosition)
                            yPosition += 7.5
                            const keywordsText = question.keywords.join(", ")
                            const splitKeywords = doc.splitTextToSize(keywordsText, 170)
                            doc.text(splitKeywords, 18, yPosition)
                            yPosition += splitKeywords.length * 7.5 + 3
                        }

                        // Add lines for writing
                        doc.setFont("helvetica", "normal")
                        doc.setFontSize(10)
                        for (let i = 0; i < 10; i++) {
                            if (yPosition > 270) {
                                doc.addPage()
                                yPosition = 20
                            }
                            doc.line(18, yPosition, 190, yPosition)
                            yPosition += 7.5 // 1.5 line spacing
                        }
                        yPosition += 5
                    }

                    if (question.type === "essay") {
                        // Add full page of writing space for essays
                        // Page break already handled above, but double-check
                        if (yPosition > 50) {
                            doc.addPage()
                            yPosition = 20
                        }

                        // Show keywords if enabled
                        if (showKeywords && question.keywords && question.keywords.length > 0) {
                            doc.setFont("helvetica", "italic")
                            doc.setFontSize(9)
                            doc.text("Keywords:", 18, yPosition)
                            yPosition += 7.5
                            const keywordsText = question.keywords.join(", ")
                            const splitKeywords = doc.splitTextToSize(keywordsText, 170)
                            doc.text(splitKeywords, 18, yPosition)
                            yPosition += splitKeywords.length * 7.5 + 3
                        }

                        // Add lines for writing (full page)
                        doc.setFont("helvetica", "normal")
                        doc.setFontSize(10)
                        for (let i = 0; i < 50; i++) {
                            doc.line(18, yPosition, 190, yPosition)
                            yPosition += 7.5 // 1.5 line spacing
                        }
                        yPosition += 5
                    }

                    // Add space between questions
                    yPosition += 5
                })

                yPosition += 5
            })

            // Add answer key if requested
            if (includeAnswers) {
                // Add answer key page
                doc.addPage()
                yPosition = 20

                // Answer key title
                doc.setFontSize(20)
                doc.setFont("helvetica", "bold")
                const answerTitle = "ANSWERS"
                const splitAnswerTitle = doc.splitTextToSize(answerTitle, 180)
                doc.text(splitAnswerTitle, 14, yPosition)
                yPosition += splitAnswerTitle.length * 7.5 + 5

                // Generate answers for each question type
                let firstAnswerGroup = true
                questionTypes.forEach((type) => {
                    const typeQuestions = questions
                        .filter((q) => q.type === type && selectedQuestions.has(q.id))
                        .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])

                    if (typeQuestions.length === 0) return

                    // Start each new question group on a new page (except the first)
                    if (!firstAnswerGroup) {
                        doc.addPage()
                        yPosition = 20
                    }
                    firstAnswerGroup = false

                    // Section header
                    doc.setFontSize(14)
                    doc.setFont("helvetica", "bold")
                    doc.text(type.toUpperCase().replace(/-/g, " "), 14, yPosition)
                    yPosition += 12

                    typeQuestions.forEach((question, index) => {
                        // Calculate space needed for this question
                        let spaceNeeded = 0

                        // Question number and difficulty
                        spaceNeeded += 9

                        // Question text
                        const splitText = doc.splitTextToSize(question.question_text, 180)
                        spaceNeeded += splitText.length * 7.5 + 3

                        // Keywords (if enabled)
                        if (showKeywords && question.keywords && question.keywords.length > 0) {
                            const keywordsText = question.keywords.join(", ")
                            const splitKeywords = doc.splitTextToSize(keywordsText, 170)
                            spaceNeeded += 7.5 + splitKeywords.length * 7.5 + 3
                        }

                        // Answer section
                        spaceNeeded += 7.5 // "Answer:" label

                        // Answer content based on type
                        if (question.type === "multiple-choice" && question.options && question.correctAnswerIndex !== undefined) {
                            spaceNeeded += 7.5
                        } else if (question.type === "true-false") {
                            spaceNeeded += 5 + 10 + 3 // "Circle your answer:" + table height + spacing
                        } else if (question.type === "fill-in-the-blank") {
                            spaceNeeded += 7.5
                        } else if (question.type === "matching" && question.pairs) {
                            // Calculate space for each matching pair with two-line format
                            question.pairs.forEach((pair) => {
                                // Statement line
                                const statementText = `1. ${pair.statement}`
                                const splitStatement = doc.splitTextToSize(statementText, 170)
                                spaceNeeded += splitStatement.length * 7.5

                                // Match line (no arrow)
                                const matchText = pair.match
                                const splitMatch = doc.splitTextToSize(matchText, 160)
                                spaceNeeded += splitMatch.length * 7.5 + 3 // Extra space between pairs
                            })
                        } else if (question.type === "short-answer" || question.type === "essay") {
                            const answerText = String(question.model_answer)
                            const splitAnswer = doc.splitTextToSize(answerText, 170)
                            spaceNeeded += splitAnswer.length * 7.5
                        } else if (question.type === "code" || question.type === "sql" || question.type === "algorithm") {
                            if (question.model_answer_code) {
                                const codeLines = doc.splitTextToSize(question.model_answer_code, 170)
                                spaceNeeded += codeLines.length * 6
                            }
                        }

                        // Explanation (if available)
                        if (question.explanation) {
                            const splitExplanation = doc.splitTextToSize(question.explanation, 170)
                            spaceNeeded += 7.5 + splitExplanation.length * 7.5 + 3
                        }

                        // Space between questions
                        spaceNeeded += 5

                        // Check if we need a new page
                        if (yPosition + spaceNeeded > 280) {
                            doc.addPage()
                            yPosition = 20
                        }

                        // Question number and difficulty
                        doc.setFontSize(10)
                        doc.setFont("helvetica", "bold")
                        const questionNum = `Q${index + 1} [${question.difficulty}]`
                        doc.text(questionNum, 14, yPosition)
                        yPosition += 9

                        // Question text
                        doc.setFont("helvetica", "normal")
                        doc.text(splitText, 14, yPosition)
                        yPosition += splitText.length * 7.5 + 3

                        // Show keywords before answer if enabled
                        if (showKeywords && question.keywords && question.keywords.length > 0) {
                            doc.setFont("helvetica", "italic")
                            doc.setFontSize(9)
                            doc.text("Keywords:", 18, yPosition)
                            yPosition += 7.5
                            const keywordsText = question.keywords.join(", ")
                            const splitKeywords = doc.splitTextToSize(keywordsText, 170)
                            doc.text(splitKeywords, 18, yPosition)
                            yPosition += splitKeywords.length * 7.5 + 3
                        }

                        // Answer based on question type
                        doc.setFont("helvetica", "bold")
                        doc.text("Answer:", 18, yPosition)
                        yPosition += 7.5

                        doc.setFont("helvetica", "normal")

                        if (question.type === "multiple-choice" && question.options && question.correctAnswerIndex !== undefined) {
                            const correctAnswer = question.options[question.correctAnswerIndex]
                            doc.text(`${String.fromCharCode(65 + question.correctAnswerIndex)}) ${correctAnswer}`, 22, yPosition)
                            yPosition += 7.5
                        }

                        if (question.type === "true-false") {
                            doc.text(question.model_answer === true ? "True" : "False", 22, yPosition)
                            yPosition += 7.5
                        }

                        if (question.type === "fill-in-the-blank") {
                            if (Array.isArray(question.model_answer)) {
                                doc.text(question.model_answer.join(", "), 22, yPosition)
                            } else {
                                doc.text(String(question.model_answer), 22, yPosition)
                            }
                            yPosition += 7.5
                        }

                        if (question.type === "matching" && question.pairs) {
                            question.pairs.forEach((pair, idx) => {
                                // Statement on first line
                                doc.setFont("helvetica", "normal")
                                const statementText = `${idx + 1}. ${pair.statement}`
                                const splitStatement = doc.splitTextToSize(statementText, 170)
                                doc.text(splitStatement, 22, yPosition)
                                yPosition += splitStatement.length * 7.5

                                // Match on second line with indentation (no arrow)
                                doc.setFont("helvetica", "normal")
                                const matchText = pair.match
                                const splitMatch = doc.splitTextToSize(matchText, 160)
                                doc.text(splitMatch, 30, yPosition)
                                yPosition += splitMatch.length * 7.5 + 3 // Extra space between pairs
                            })
                        }

                        if (question.type === "short-answer" || question.type === "essay") {
                            const answerText = String(question.model_answer)
                            const splitAnswer = doc.splitTextToSize(answerText, 170)
                            doc.text(splitAnswer, 22, yPosition)
                            yPosition += splitAnswer.length * 7.5
                        }

                        if (question.type === "code" || question.type === "sql" || question.type === "algorithm") {
                            if (question.model_answer_code) {
                                doc.setFont("courier", "normal")
                                doc.setFontSize(8)
                                const codeLines = doc.splitTextToSize(question.model_answer_code, 170)
                                codeLines.forEach((line: string) => {
                                    doc.text(line, 22, yPosition)
                                    yPosition += 6
                                })
                                doc.setFontSize(10)
                                doc.setFont("helvetica", "normal")
                            }
                        }

                        // Show explanation if available
                        if (question.explanation) {
                            doc.setFont("helvetica", "bold")
                            doc.text("Explanation:", 18, yPosition)
                            yPosition += 7.5
                            doc.setFont("helvetica", "normal")
                            const splitExplanation = doc.splitTextToSize(question.explanation, 170)
                            doc.text(splitExplanation, 18, yPosition)
                            yPosition += splitExplanation.length * 7.5 + 3
                        }

                        yPosition += 3 // Minimal space between questions
                    })

                    yPosition += 5
                })
            }

            // Open in new tab
            const pdfBlob = doc.output("blob")
            const pdfUrl = URL.createObjectURL(pdfBlob)
            window.open(pdfUrl, "_blank")

            toast.success("Test PDF generated successfully!")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Failed to generate PDF")
        } finally {
            setGenerating(false)
        }
    }

    // Group questions by type for preview in the same order as PDF
    const questionTypes = [
        "true-false",
        "multiple-choice",
        "matching",
        "fill-in-the-blank",
        "short-answer",
        "essay",
        "code",
        "sql",
        "algorithm",
    ]

    const difficultyOrder: Record<string, number> = {
        low: 1,
        medium: 2,
        high: 3,
    }

    const questionsByType = questionTypes.reduce(
        (acc, type) => {
            const typeQuestions = questions
                .filter((q) => q.type === type)
                .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])

            if (typeQuestions.length > 0) {
                acc[type] = typeQuestions
            }
            return acc
        },
        {} as Record<string, ExtendedQuestion[]>,
    )

    if (loading && topics.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Test Builder</h1>
                <p className="text-muted-foreground">
                    Select one or more topics to generate a PDF test with questions grouped by type and sorted by difficulty.
                </p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Select Topics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between bg-transparent"
                                        >
                                            {selectedTopicIds.length === 0
                                                ? "Select topics..."
                                                : `${selectedTopicIds.length} topic${selectedTopicIds.length > 1 ? "s" : ""} selected`}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search topics..." />
                                            <CommandList>
                                                <CommandEmpty>No topics found.</CommandEmpty>
                                                <CommandGroup>
                                                    {topics.map((topic) => (
                                                        <CommandItem
                                                            key={topic.id}
                                                            value={`${topic.topicnumber} ${topic.name}`}
                                                            onSelect={() => toggleTopic(String(topic.id))}
                                                        >
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <Checkbox
                                                                    checked={selectedTopicIds.includes(String(topic.id))}
                                                                    className="pointer-events-none"
                                                                />
                                                                <span className="text-sm">
                                                                    {topic.topicnumber} - {topic.name}
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button
                                onClick={generatePDF}
                                disabled={selectedTopicIds.length === 0 || selectedQuestions.size === 0 || generating}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Generate PDF
                                    </>
                                )}
                            </Button>
                        </div>

                        {selectedTopicIds.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedTopicIds.map((topicId) => {
                                    const topic = topics.find((t) => String(t.id) === topicId)
                                    if (!topic) return null
                                    return (
                                        <Badge key={topicId} variant="secondary" className="gap-1 pr-1">
                                            <span>
                                                {topic.topicnumber} - {topic.name}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => removeTopic(topicId)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )
                                })}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="show-keywords"
                                    checked={showKeywords}
                                    onCheckedChange={(checked) => setShowKeywords(checked as boolean)}
                                />
                                <label
                                    htmlFor="show-keywords"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Show keywords in PDF (for short answer and essay questions)
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="include-answers"
                                    checked={includeAnswers}
                                    onCheckedChange={(checked) => setIncludeAnswers(checked as boolean)}
                                />
                                <label
                                    htmlFor="include-answers"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Include answer key at the end of the PDF
                                </label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedTopicIds.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Preview</span>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary">
                                    {selectedQuestions.size} of {questions.length} selected
                                </Badge>
                                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                    {selectedQuestions.size === questions.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="ml-2">Loading questions...</span>
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No questions found for the selected topic(s)</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {questionTypes.map((type) => {
                                    const typeQuestions = questionsByType[type]
                                    if (!typeQuestions || typeQuestions.length === 0) return null

                                    return (
                                        <div key={type} className="border-l-4 border-primary pl-4">
                                            <h3 className="font-semibold text-lg mb-3 capitalize">
                                                {type.replace(/-/g, " ")} ({typeQuestions.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {typeQuestions.map((question, index) => (
                                                    <div key={question.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-md">
                                                        <Checkbox
                                                            checked={selectedQuestions.has(question.id)}
                                                            onCheckedChange={() => handleQuestionToggle(question.id)}
                                                            className="mt-1"
                                                        />
                                                        <Badge
                                                            className={`mt-1 ${question.difficulty === "low"
                                                                    ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                                                    : question.difficulty === "medium"
                                                                        ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
                                                                        : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                                                                }`}
                                                        >
                                                            {question.difficulty}
                                                        </Badge>
                                                        <div className="flex-1">
                                                            <p className="text-sm">
                                                                <span className="font-medium">Q{index + 1}:</span>{" "}
                                                                {question.question_text.substring(0, 100)}
                                                                {question.question_text.length > 100 ? "..." : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
