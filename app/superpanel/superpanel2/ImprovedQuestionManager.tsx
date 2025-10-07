"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Question } from "@/lib/types"

// Extended Question type for code/algorithm questions
interface ExtendedQuestion extends Question {
  starter_code?: string
  language?: string
  model_answer_code?: string
}

// CSV Data types for bulk upload - using a flexible record type
// type CSVRow = Record<string, string | string[]>
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Search,
  Edit3,
  Filter,
  Plus,
  Trash2,
  Code,
  FileText,
  CheckSquare,
  ToggleLeft,
  List,
  PenTool,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Save,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox"
import { Upload, Download, FileSpreadsheet } from "lucide-react"

const questionTypeIcons = {
  "multiple-choice": List,
  "fill-in-the-blank": FileText,
  matching: ToggleLeft,
  code: Code,
  sql: Code,
  algorithm: Code,
  "true-false": CheckSquare,
  "short-answer": PenTool,
  essay: BookOpen,
  text: FileText,
} as const

const questionTypeColors = {
  "multiple-choice":
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  "fill-in-the-blank":
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  matching:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  code: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  sql: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  algorithm:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  "true-false": "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  "short-answer":
    "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  essay:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
  text: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
}

interface SubtopicLink {
  subtopic_id: string
  subtopics?: {
    id: string
    subtopictitle: string
    topic_id: string
    topics?: {
      id: number
      name: string
      slug: string
      topicnumber: string
    }
  }
}

export default function ImprovedQuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [editingAnswer, setEditingAnswer] = useState("")
  const [editingExplanation, setEditingExplanation] = useState("")
  const [editingOptions, setEditingOptions] = useState<string[]>([])
  const [editingCorrectIndex, setEditingCorrectIndex] = useState(0)
  const [editingPairs, setEditingPairs] = useState<Array<{ statement: string; match: string }>>([])
  const [editingOrderImportant, setEditingOrderImportant] = useState(false)
  const [editingFibOptions, setEditingFibOptions] = useState<string[]>([])
  const [editingStarterCode, setEditingStarterCode] = useState("")
  const [editingModelAnswer, setEditingModelAnswer] = useState("")
  const [editingLanguage, setEditingLanguage] = useState("")
  const [editingModelAnswerCode, setEditingModelAnswerCode] = useState("")
  const [editingSubtopicIds, setEditingSubtopicIds] = useState<string[]>([])
  const [editingKeywords, setEditingKeywords] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingEditAction, setPendingEditAction] = useState<(() => void) | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("all")
  const [topics, setTopics] = useState<Array<{ id: number; name: string; slug: string; topicnumber: string }>>([])
  const [subtopics, setSubtopics] = useState<
    Array<{
      id: string
      subtopictitle: string
      topic_id: string
      topic?: { name: string; slug: string; topicnumber: string }
    }>
  >([])
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [addingQuestion, setAddingQuestion] = useState<Question | null>(null)
  const [keywordsInputValue, setKeywordsInputValue] = useState("")
  const [editKeywordsInputValue, setEditKeywordsInputValue] = useState("")
  const [editEssayKeywordsInputValue, setEditEssayKeywordsInputValue] = useState("")
  const [saKeywordsInputValue, setSaKeywordsInputValue] = useState("")
  const [addingSubtopicIds, setAddingSubtopicIds] = useState<string[]>([])
  const [editSubtopicSearch, setEditSubtopicSearch] = useState("")
  const [addSubtopicSearch, setAddSubtopicSearch] = useState("")
  const [showOnlySelectedEditSubtopics, setShowOnlySelectedEditSubtopics] = useState(false)
  const [showOnlySelectedAddSubtopics, setShowOnlySelectedAddSubtopics] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [bulkUploadType, setBulkUploadType] = useState<Question["type"]>("multiple-choice")
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null)
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0)
  const [bulkUploadErrors, setBulkUploadErrors] = useState<string[]>([])
  const supabase = createClient()

  // Synchronize keywords input value with addingQuestion.keywords
  useEffect(() => {
    if (addingQuestion?.keywords) {
      setKeywordsInputValue(addingQuestion.keywords.join(", "))
    } else {
      setKeywordsInputValue("")
    }
  }, [addingQuestion?.keywords])

  // Synchronize editing keywords input values
  useEffect(() => {
    setEditKeywordsInputValue(editingKeywords.join(", "))
  }, [editingKeywords])

  useEffect(() => {
    setEditEssayKeywordsInputValue(editingKeywords.join(", "))
  }, [editingKeywords])

  useEffect(() => {
    if (addingQuestion?.keywords) {
      setSaKeywordsInputValue(addingQuestion.keywords.join(", "))
    } else {
      setSaKeywordsInputValue("")
    }
  }, [addingQuestion?.keywords])

  // CSV Template Generation Functions
  const generateCSVTemplate = (questionType: Question["type"]) => {
    const headers = ["id", "question_text", "difficulty", "explanation", "model_answer"]
    let csvContent = headers.join(",") + "\n"

    // Add type-specific headers
    switch (questionType) {
      case "multiple-choice":
        csvContent = [
          "id", "question_text", "difficulty", "explanation",
          "option_1", "option_2", "option_3", "option_4",
          "correct_answer_index", "model_answer"
        ].join(",") + "\n"
        csvContent += "example_1,What is 2+2?,low,Basic math,2,3,4,5,2,The correct answer is 4\n"
        break
      
      case "fill-in-the-blank":
        csvContent = [
          "id", "question_text", "difficulty", "explanation",
          "correct_answers", "option_1", "option_2", "option_3",
          "order_important", "model_answer"
        ].join(",") + "\n"
        csvContent += "example_1,The capital of France is ___,low,Geography question,\"[Paris, France]\",London,Paris,Berlin,false,Paris is the capital of France\n"
        break
      
      case "matching":
        csvContent = [
          "id", "question_text", "difficulty", "explanation",
          "statement_1", "match_1", "statement_2", "match_2",
          "statement_3", "match_3", "model_answer"
        ].join(",") + "\n"
        csvContent += "example_1,Match the capitals with countries,low,Geography matching,Paris,France,London,UK,Berlin,Germany,Match each capital with its country\n"
        break
      
      case "true-false":
        csvContent = [
          "id", "question_text", "difficulty", "explanation",
          "correct_answer", "model_answer"
        ].join(",") + "\n"
        csvContent += "example_1,ram is volatile,low,Ram loses power when the computer is turned off,true,true\n"
        break
      
      case "short-answer":
        csvContent = [
          "id", "question_text", "difficulty", "explanation",
          "model_answer", "keywords"
        ].join(",") + "\n"
        csvContent += "example_1,What is photosynthesis?,medium,Biology question,The process by which plants convert light energy into chemical energy,\"[photosynthesis, plants, energy, chlorophyll]\"\n"
        break
      
      case "essay":
        csvContent = [
          "id", "question_text", "difficulty", "explanation",
          "model_answer", "rubric", "keywords"
        ].join(",") + "\n"
        csvContent += "example_1,Explain the water cycle,high,Environmental science,The water cycle describes how water moves through the Earth's systems through evaporation condensation and precipitation,Should include evaporation condensation precipitation and collection,\"[water cycle, evaporation, precipitation, condensation]\"\n"
        break
      
      case "code":
      case "sql":
      case "algorithm":
        csvContent = [
          "id", "question_text", "difficulty", "explanation",
          "starter_code", "model_answer", "language", "model_answer_code"
        ].join(",") + "\n"
        csvContent += "example_1,Write a function to add two numbers,medium,Programming basics,# Write your function here,Create a function that takes two parameters and returns their sum,python,def add_numbers(a, b):\n    return a + b\n"
        break
    }

    return csvContent
  }

  const downloadCSVTemplate = (questionType: Question["type"]) => {
    const csvContent = generateCSVTemplate(questionType)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${questionType}-template.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // CSV Parsing and Bulk Upload Functions
  const parseCSV = (csvText: string): Record<string, string | string[]>[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim())
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      // Parse CSV line handling quoted values
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      
      const row: Record<string, string | string[]> = {}
      headers.forEach((header, index) => {
        let value = values[index] || ''
        
        // Handle array notation for keywords and correct_answers
        if ((header === 'keywords' || header === 'correct_answers') && value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1) // Remove brackets
          row[header] = value.split(',').map((k: string) => k.trim().replace(/"/g, ''))
        } else {
          row[header] = value.replace(/"/g, '') // Remove quotes
        }
      })
      data.push(row)
    }
    
    return data
  }

  const validateQuestionData = (row: Record<string, string | string[]>, index: number): string[] => {
    const errors: string[] = []
    
    if (!row.id || String(row.id).trim() === '') {
      errors.push(`Row ${index + 2}: Question ID is required`)
    }
    if (!row.question_text || String(row.question_text).trim() === '') {
      errors.push(`Row ${index + 2}: Question text is required`)
    }
    if (!row.difficulty || !['low', 'medium', 'high'].includes(String(row.difficulty))) {
      errors.push(`Row ${index + 2}: Valid difficulty (low/medium/high) is required`)
    }

    // Type-specific validation
    switch (bulkUploadType) {
      case "multiple-choice":
        const options = [row.option_1, row.option_2, row.option_3, row.option_4].filter(Boolean)
        if (options.length < 2) {
          errors.push(`Row ${index + 2}: At least 2 options are required`)
        }
        if (!row.correct_answer_index || isNaN(parseInt(String(row.correct_answer_index)))) {
          errors.push(`Row ${index + 2}: Valid correct answer index is required`)
        }
        break
      
      case "fill-in-the-blank":
        if (!row.correct_answers || (Array.isArray(row.correct_answers) ? row.correct_answers.length === 0 : String(row.correct_answers).trim() === '')) {
          errors.push(`Row ${index + 2}: Correct answers are required`)
        }
        break
      
      case "matching":
        const pairs = []
        for (let i = 1; i <= 10; i++) {
          if (row[`statement_${i}`] && row[`match_${i}`]) {
            pairs.push({ statement: String(row[`statement_${i}`]), match: String(row[`match_${i}`]) })
          }
        }
        if (pairs.length === 0) {
          errors.push(`Row ${index + 2}: At least one matching pair is required`)
        }
        break
      
      case "true-false":
        if (!row.correct_answer || !['true', 'false'].includes(String(row.correct_answer).toLowerCase())) {
          errors.push(`Row ${index + 2}: Correct answer must be 'true' or 'false'`)
        }
        break
      
      case "short-answer":
      case "essay":
        if (!row.model_answer || String(row.model_answer).trim() === '') {
          errors.push(`Row ${index + 2}: Model answer is required`)
        }
        break
    }
    
    return errors
  }

  const processBulkUpload = async (csvData: Record<string, string | string[]>[], subtopicIds: string[]) => {
    setBulkUploadProgress(0)
    setBulkUploadErrors([])
    
    const errors: string[] = []
    const questionsToInsert: Question[] = []
    
    // Validate all rows first
    csvData.forEach((row, index) => {
      const rowErrors = validateQuestionData(row, index)
      errors.push(...rowErrors)
      
      if (rowErrors.length === 0) {
        const question: Question = {
          id: String(row.id),
          type: bulkUploadType,
          topic: '', // Will be set from subtopic
          difficulty: String(row.difficulty) as Question["difficulty"],
          question_text: String(row.question_text),
          explanation: String(row.explanation || ''),
          created_at: new Date().toISOString(),
          model_answer: String(row.model_answer || ''),
        }
        
        // Add type-specific data
        switch (bulkUploadType) {
          case "multiple-choice":
            question.options = [row.option_1, row.option_2, row.option_3, row.option_4].filter(Boolean) as string[]
            question.correctAnswerIndex = parseInt(String(row.correct_answer_index))
            break
          
          case "fill-in-the-blank":
            question.model_answer = Array.isArray(row.correct_answers) ? row.correct_answers : []
            question.options = [row.option_1, row.option_2, row.option_3].filter(Boolean) as string[]
            question.order_important = String(row.order_important) === 'true'
            break
          
          case "matching":
            const pairs: Array<{ statement: string; match: string }> = []
            for (let i = 1; i <= 10; i++) {
              if (row[`statement_${i}`] && row[`match_${i}`]) {
                pairs.push({ statement: String(row[`statement_${i}`]), match: String(row[`match_${i}`]) })
              }
            }
            question.pairs = pairs
            break
          
          case "true-false":
            question.model_answer = String(row.correct_answer).toLowerCase() === 'true'
            break
          
          case "short-answer":
          case "essay":
            question.keywords = Array.isArray(row.keywords) ? row.keywords : []
            if (bulkUploadType === "essay") {
              question.rubric = String(row.rubric || '')
            }
            break
          
          case "code":
          case "sql":
          case "algorithm":
            (question as ExtendedQuestion).starter_code = String(row.starter_code || '')
            ;(question as ExtendedQuestion).language = String(row.language || 'python')
            ;(question as ExtendedQuestion).model_answer_code = String(row.model_answer_code || '')
            break
        }
        
        questionsToInsert.push(question)
      }
    })
    
    if (errors.length > 0) {
      setBulkUploadErrors(errors)
      toast.error(`Validation failed: ${errors.length} errors found`)
      return
    }
    
    // Insert questions
    try {
      let successCount = 0
      for (let i = 0; i < questionsToInsert.length; i++) {
        const question = questionsToInsert[i]
        
        // Insert base question
        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .insert({
            id: question.id,
            question_text: question.question_text,
            explanation: question.explanation,
            type: question.type,
            difficulty: question.difficulty,
          })
          .select()
          .single()
        
        if (questionError) throw questionError
        
        // Insert type-specific data
        switch (question.type) {
          case "multiple-choice":
            await supabase.from("multiple_choice_questions").insert({
              question_id: questionData.id,
              options: question.options,
              correct_answer_index: question.correctAnswerIndex,
              model_answer: question.model_answer,
            })
            break
          
          case "fill-in-the-blank":
            await supabase.from("fill_in_the_blank_questions").insert({
              question_id: questionData.id,
              options: question.options,
              correct_answers: question.model_answer,
              order_important: question.order_important,
            })
            break
          
          case "matching":
            if (question.pairs && question.pairs.length > 0) {
              await supabase.from("matching_questions").insert(
                question.pairs.map((pair) => ({
                  question_id: questionData.id,
                  statement: pair.statement,
                  match: pair.match,
                }))
              )
            }
            break
          
          case "true-false":
            await supabase.from("true_false_questions").insert({
              question_id: questionData.id,
              correct_answer: question.model_answer as boolean,
              model_answer: question.model_answer as boolean,
            })
            break
          
          case "short-answer":
            await supabase.from("short_answer_questions").insert({
              question_id: questionData.id,
              model_answer: question.model_answer,
              keywords: question.keywords,
            })
            break
          
          case "essay":
            await supabase.from("essay_questions").insert({
              question_id: questionData.id,
              model_answer: question.model_answer,
              keywords: question.keywords,
              rubric: question.rubric || '',
            })
            break
          
          case "code":
          case "sql":
          case "algorithm":
            await supabase.from("code_questions").insert({
              question_id: questionData.id,
              starter_code: (question as ExtendedQuestion).starter_code,
              model_answer: question.model_answer,
              language: (question as ExtendedQuestion).language,
              model_answer_code: (question as ExtendedQuestion).model_answer_code,
            })
            break
        }
        
        // Insert subtopic links
        if (subtopicIds.length > 0) {
          await supabase.from("subtopic_question_link").insert(
            subtopicIds.map((subtopic_id) => ({
              question_id: questionData.id,
              subtopic_id,
            }))
          )
        }
        
        successCount++
        setBulkUploadProgress((successCount / questionsToInsert.length) * 100)
      }
      
      await fetchQuestions()
      toast.success(`Successfully uploaded ${successCount} questions`)
      setShowBulkUpload(false)
      setBulkUploadFile(null)
      setBulkUploadProgress(0)
      
    } catch (error) {
      console.error("Error during bulk upload:", error)
      toast.error("Failed to upload questions")
    }
  }

  // Group and order subtopics by topic
  const groupedSubtopics = topics
    .sort((a, b) => a.topicnumber.localeCompare(b.topicnumber, undefined, { numeric: true }))
    .map((topic) => ({
      ...topic,
      subtopics: subtopics
        .filter((s) => String(s.topic_id) === String(topic.id))
        .sort((a, b) => a.subtopictitle.localeCompare(b.subtopictitle)),
      questionCount: questions.filter((q) => q.topic === topic.slug).length,
    }))

  const fetchQuestions = async () => {
    try {
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
          essay_questions(*),
          subtopic_question_link(
            subtopic_id,
            subtopics(
              id,
              subtopictitle,
              topic_id,
              topics(
                id,
                name,
                slug,
                topicnumber
              )
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const transformedQuestions: Question[] = data.map((q) => ({
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        topic: q.subtopic_question_link?.[0]?.subtopics?.topics?.slug || "",
        question_text: q.question_text,
        explanation: q.explanation,
        created_at: q.created_at,
        model_answer: q.model_answer || "",
        subtopic_question_link: q.subtopic_question_link,
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
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const fetchSubtopics = async () => {
    try {
      const { data, error } = await supabase
        .from("subtopics")
        .select("id, subtopictitle, topic_id, topics(id, name, slug, topicnumber)")
        .order("subtopictitle", { ascending: true })
      if (error) throw error
      setSubtopics(data || [])
    } catch (error) {
      console.error("Error fetching subtopics:", error)
    }
  }

  useEffect(() => {
    fetchQuestions()
    fetchTopics()
    fetchSubtopics()
  }, [])

  // Auto-resize textarea when editing starts
  useEffect(() => {
    if (editingQuestionId) {
      const textarea = document.getElementById('edit-question-text') as HTMLTextAreaElement
      if (textarea) {
        // Small delay to ensure the textarea is rendered
        setTimeout(() => {
          textarea.style.height = 'auto'
          textarea.style.height = textarea.scrollHeight + 'px'
        }, 10)
      }
      
      // Also auto-resize essay answer textarea if it exists
      const essayTextarea = document.getElementById('edit-essay-answer') as HTMLTextAreaElement
      if (essayTextarea) {
        setTimeout(() => {
          essayTextarea.style.height = 'auto'
          essayTextarea.style.height = essayTextarea.scrollHeight + 'px'
        }, 10)
      }
    }
  }, [editingQuestionId])

  useEffect(() => {
    let filtered = questions

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.topic.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedTopic !== "all") {
      filtered = filtered.filter((q) => q.topic === selectedTopic)
    }

    if (selectedSubtopic) {
      filtered = filtered.filter((q) =>
        q.subtopic_question_link?.some((link: SubtopicLink) => link.subtopic_id === selectedSubtopic)
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((q) => q.type === selectedType)
    }

    setFilteredQuestions(filtered)
  }, [questions, searchTerm, selectedTopic, selectedSubtopic, selectedType])

  const handleInlineEdit = (questionId: string, question: Question) => {
    setEditingQuestionId(questionId)
    setEditingText(question.question_text)
    setEditingExplanation(question.explanation || "")
    
    // Handle different answer types properly
    if (question.type === "true-false") {
      // For true/false questions, convert boolean to string
      setEditingAnswer(question.model_answer === true ? "true" : "false")
    } else if (Array.isArray(question.model_answer)) {
      setEditingAnswer(question.model_answer.join(", "))
    } else {
      setEditingAnswer(String(question.model_answer || ""))
    }
    
    setEditingOptions(question.options || [])
    setEditingCorrectIndex(question.correctAnswerIndex || 0)
    setEditingPairs(question.pairs || [])
    setEditingOrderImportant(question.order_important || false)
    setEditingFibOptions(question.options || [])
    setEditingStarterCode((question as ExtendedQuestion).starter_code || "")
    setEditingModelAnswer(
      Array.isArray(question.model_answer) 
        ? question.model_answer.join(", ") 
        : String(question.model_answer || "")
    )
    setEditingLanguage((question as ExtendedQuestion).language || "")
    setEditingModelAnswerCode((question as ExtendedQuestion).model_answer_code || "")
    setEditingSubtopicIds(
      question.subtopic_question_link?.map(link => link.subtopic_id) || []
    )
    setEditingKeywords(question.keywords || [])
    setEditSubtopicSearch("")
    setShowOnlySelectedEditSubtopics(false)
    setHasUnsavedChanges(false)
  }

  const handleSaveInlineEdit = async (questionId: string) => {
    try {
      const question = questions.find(q => q.id === questionId)
      if (!question) return

      // Validation: ensure at least one subtopic is selected
      if (editingSubtopicIds.length === 0) {
        toast.error("At least one subtopic must be selected")
        return
      }

      // Update the base question
      const { error: questionError } = await supabase
        .from("questions")
        .update({ 
          question_text: editingText,
          explanation: editingExplanation 
        })
        .eq("id", questionId)

      if (questionError) throw questionError

      // Update type-specific answer data
      switch (question.type) {
        case "multiple-choice":
          const { error: mcError } = await supabase
            .from("multiple_choice_questions")
            .upsert({
              question_id: questionId,
              options: editingOptions,
              correct_answer_index: editingCorrectIndex,
              model_answer: editingAnswer
            })

          if (mcError) {
            console.error("Error updating multiple choice question:", mcError)
            throw mcError
          }
          break
        case "short-answer":
          const { error: saError } = await supabase
            .from("short_answer_questions")
            .upsert({
              question_id: questionId,
              model_answer: editingAnswer,
              keywords: editingKeywords
            })

          if (saError) {
            console.error("Error updating short answer question:", saError)
            throw saError
          }
          break
        case "true-false":
          const { error: tfError } = await supabase
            .from("true_false_questions")
            .upsert({
              question_id: questionId,
              model_answer: editingAnswer === "true" ? true : false,
              correct_answer: editingAnswer === "true" ? true : false,
            })

          if (tfError) {
            console.error("Error updating true/false question:", tfError)
            throw tfError
          }
          break
        case "essay":
          const { error: essayError } = await supabase
            .from("essay_questions")
            .upsert({
              question_id: questionId,
              model_answer: editingAnswer,
              keywords: editingKeywords
            })

          if (essayError) {
            console.error("Error updating essay question:", essayError)
            throw essayError
          }
          break
        case "code":
        case "algorithm":
          const { error: codeError } = await supabase
            .from("code_questions")
            .upsert({
              question_id: questionId,
              starter_code: editingStarterCode,
              model_answer: editingModelAnswer,
              language: editingLanguage,
              model_answer_code: editingModelAnswerCode
            })

          if (codeError) {
            console.error("Error updating code question:", codeError)
            throw codeError
          }
          break
        case "fill-in-the-blank":
          const { error: fibError } = await supabase
            .from("fill_in_the_blank_questions")
            .upsert({
              question_id: questionId,
              correct_answers: editingAnswer.split(",").map(a => a.trim()),
              order_important: editingOrderImportant,
              options: editingFibOptions
            })

          if (fibError) {
            console.error("Error updating fill-in-the-blank question:", fibError)
            throw fibError
          }
          break
        case "matching":
          // Delete existing matching pairs and insert new ones
          await supabase
            .from("matching_questions")
            .delete()
            .eq("question_id", questionId)

          if (editingPairs.length > 0) {
            await supabase
              .from("matching_questions")
              .insert(
                editingPairs.map(pair => ({
                  question_id: questionId,
                  statement: pair.statement,
                  match: pair.match
                }))
              )
          }
          break
      }

      // Update subtopic links
      // First, delete existing links
      await supabase
        .from("subtopic_question_link")
        .delete()
        .eq("question_id", questionId)

      // Then insert new links
      if (editingSubtopicIds.length > 0) {
        await supabase
          .from("subtopic_question_link")
          .insert(
            editingSubtopicIds.map(subtopicId => ({
              question_id: questionId,
              subtopic_id: subtopicId
            }))
          )
      }

      await fetchQuestions()
      setEditingQuestionId(null)
      setEditingText("")
      setEditingAnswer("")
      setEditingExplanation("")
      setEditingOptions([])
      setEditingCorrectIndex(0)
      setEditingPairs([])
      setEditingOrderImportant(false)
      setEditingFibOptions([])
      setEditingStarterCode("")
      setEditingModelAnswer("")
      setEditingLanguage("")
      setEditingModelAnswerCode("")
      setEditingSubtopicIds([])
      setEditingKeywords([])
      setEditSubtopicSearch("")
      setShowOnlySelectedEditSubtopics(false)
      setHasUnsavedChanges(false)
      toast.success("Question updated successfully")
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question")
    }
  }

  const handleCancelInlineEdit = () => {
    setEditingQuestionId(null)
    setEditingText("")
    setEditingAnswer("")
    setEditingExplanation("")
    setEditingOptions([])
    setEditingCorrectIndex(0)
    setEditingPairs([])
    setEditingOrderImportant(false)
    setEditingFibOptions([])
    setEditingStarterCode("")
    setEditingModelAnswer("")
    setEditingLanguage("")
    setEditingModelAnswerCode("")
    setEditingSubtopicIds([])
    setEditingKeywords([])
    setEditSubtopicSearch("")
    setShowOnlySelectedEditSubtopics(false)
    setHasUnsavedChanges(false)
  }

  const handleToggleEdit = (questionId: string, question: Question) => {
    if (editingQuestionId === questionId) {
      // Currently editing this question - check for unsaved changes
      if (hasUnsavedChanges) {
        setPendingEditAction(() => () => handleCancelInlineEdit())
        setShowConfirmDialog(true)
      } else {
        handleCancelInlineEdit()
      }
    } else {
      // Not editing this question - start editing
      if (editingQuestionId && hasUnsavedChanges) {
        setPendingEditAction(() => () => handleInlineEdit(questionId, question))
        setShowConfirmDialog(true)
      } else {
        handleInlineEdit(questionId, question)
      }
    }
  }

  const handleConfirmSave = async () => {
    if (editingQuestionId) {
      await handleSaveInlineEdit(editingQuestionId)
    }
    if (pendingEditAction) {
      pendingEditAction()
    }
    setShowConfirmDialog(false)
    setPendingEditAction(null)
  }

  const handleConfirmCancel = () => {
    if (pendingEditAction) {
      pendingEditAction()
    }
    setShowConfirmDialog(false)
    setPendingEditAction(null)
  }

  const handleDeleteClick = (question: Question) => {
    setQuestionToDelete(question)
    setDeleteConfirmText("")
    setShowDeleteDialog(true)
  }

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return

    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionToDelete.id)

      if (error) throw error

      await fetchQuestions()
      setShowDeleteDialog(false)
      setQuestionToDelete(null)
      setDeleteConfirmText("")
      toast.success("Question deleted successfully")
    } catch (error) {
      console.error("Error deleting question:", error)
      toast.error("Failed to delete question")
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
    setQuestionToDelete(null)
    setDeleteConfirmText("")
  }

  const toggleTopic = (topicSlug: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicSlug)) {
      newExpanded.delete(topicSlug)
    } else {
      newExpanded.add(topicSlug)
    }
    setExpandedTopics(newExpanded)
  }


  const handleSaveNew = async (newQuestion: Question) => {
    // Validation
    if (!newQuestion.id || newQuestion.id.trim() === "") {
      toast.error("Question ID is required")
      return
    }
    if (!newQuestion.question_text || newQuestion.question_text.trim() === "") {
      toast.error("Question text is required")
      return
    }
    if (!addingSubtopicIds.length) {
      toast.error("At least one subtopic must be selected")
      return
    }

    // Type-specific validation
    if (newQuestion.type === "multiple-choice") {
      if (!newQuestion.options || newQuestion.options.length < 2) {
        toast.error("Multiple choice questions must have at least 2 options")
        return
      }
      if (newQuestion.options.some(option => option.trim() === "")) {
        toast.error("All multiple choice options must be filled")
        return
      }
      if (newQuestion.correctAnswerIndex === undefined || newQuestion.correctAnswerIndex < 0 || newQuestion.correctAnswerIndex >= newQuestion.options.length) {
        toast.error("Valid correct answer index is required")
        return
      }
    }

    if (newQuestion.type === "fill-in-the-blank") {
      if (!Array.isArray(newQuestion.model_answer) || newQuestion.model_answer.length === 0) {
        toast.error("Fill-in-the-blank questions must have at least one correct answer")
        return
      }
    }

    if (newQuestion.type === "matching") {
      if (!newQuestion.pairs || newQuestion.pairs.length === 0) {
        toast.error("Matching questions must have at least one pair")
        return
      }
      if (newQuestion.pairs.some(pair => pair.statement.trim() === "" || pair.match.trim() === "")) {
        toast.error("All matching pairs must have both statement and match filled")
        return
      }
    }

    if (newQuestion.type === "true-false") {
      if (typeof newQuestion.model_answer !== "boolean") {
        toast.error("True/false questions must have a valid answer")
        return
      }
    }

    if (newQuestion.type === "short-answer" || newQuestion.type === "essay") {
      if (!newQuestion.model_answer || String(newQuestion.model_answer).trim() === "") {
        toast.error(`${newQuestion.type === "short-answer" ? "Short answer" : "Essay"} questions must have a model answer`)
        return
      }
    }

    try {
      // Insert the base question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert({
          id: newQuestion.id,
          question_text: newQuestion.question_text,
          explanation: newQuestion.explanation,
          type: newQuestion.type,
          difficulty: newQuestion.difficulty,
        })
        .select()
        .single()

      if (questionError) throw questionError

      // Insert type-specific data
      switch (newQuestion.type) {
        case "multiple-choice":
          await supabase.from("multiple_choice_questions").insert({
            question_id: questionData.id,
            options: newQuestion.options,
            correct_answer_index: newQuestion.correctAnswerIndex,
            model_answer: newQuestion.model_answer,
          })
          break
        case "fill-in-the-blank":
          await supabase.from("fill_in_the_blank_questions").insert({
            question_id: questionData.id,
            options: newQuestion.options,
            correct_answers: newQuestion.model_answer,
            order_important: newQuestion.order_important,
          })
          break
        case "matching":
          if (newQuestion.pairs && newQuestion.pairs.length > 0) {
            await supabase.from("matching_questions").insert(
              newQuestion.pairs.map((pair) => ({
                question_id: questionData.id,
                statement: pair.statement,
                match: pair.match,
              })),
            )
          }
          break
        case "code":
        case "sql":
        case "algorithm":
          await supabase.from("code_questions").insert({
            question_id: questionData.id,
            starter_code: (newQuestion as ExtendedQuestion).starter_code,
            model_answer: newQuestion.model_answer,
            language: (newQuestion as ExtendedQuestion).language,
            model_answer_code: (newQuestion as ExtendedQuestion).model_answer_code,
          })
          break
        case "true-false":
          await supabase.from("true_false_questions").insert({
            question_id: questionData.id,
            correct_answer: newQuestion.model_answer as boolean,
            model_answer: newQuestion.model_answer as boolean,
          })
          break
        case "short-answer":
          await supabase.from("short_answer_questions").insert({
            question_id: questionData.id,
            model_answer: newQuestion.model_answer,
            keywords: newQuestion.keywords,
          })
          break
        case "essay":
          await supabase.from("essay_questions").insert({
            question_id: questionData.id,
            model_answer: newQuestion.model_answer,
            keywords: newQuestion.keywords,
            rubric: newQuestion.rubric || "",
          })
          break
      }

      // Insert subtopic links
      if (addingSubtopicIds.length > 0) {
        await supabase.from("subtopic_question_link").insert(
          addingSubtopicIds.map((subtopic_id) => ({
            question_id: questionData.id,
            subtopic_id,
          })),
        )
      }

      await fetchQuestions()
      setAddingQuestion(null)
      setAddingSubtopicIds([])
      setAddSubtopicSearch("")
      toast.success("Question created successfully")
    } catch (error) {
      console.error("Error creating question:", error)
      toast.error("Failed to create question")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading questions...</span>
      </div>
    )
  }

  return (
    <div className="flex max-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">Topics</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedTopic("all")
                setSelectedSubtopic(null)
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${selectedTopic === "all" && !selectedSubtopic
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              All Questions ({questions.length})
            </button>

            {groupedSubtopics.map((topic) => (
              <div key={topic.id} className="space-y-1">
                <Collapsible open={expandedTopics.has(topic.slug)} onOpenChange={() => toggleTopic(topic.slug)}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
                      <span className="flex items-center gap-2 text-left">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-left">{topic.topicnumber} - {topic.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {topic.questionCount}
                        </Badge>
                      </span>
                      {expandedTopics.has(topic.slug) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-6 space-y-1">
                    <button
                      onClick={() => {
                        setSelectedTopic(topic.slug)
                        setSelectedSubtopic(null)
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${selectedTopic === topic.slug && !selectedSubtopic
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50"
                      }`}
                    >
                      All {topic.name} Questions ({topic.questionCount})
                    </button>
                    {topic.subtopics.map((subtopic) => {
                      const subtopicQuestionCount = questions.filter((q) =>
                        q.subtopic_question_link?.some((link: SubtopicLink) => link.subtopic_id === subtopic.id),
                      ).length

                      return (
                        <button
                          key={subtopic.id}
                          onClick={() => {
                            setSelectedTopic(topic.slug)
                            setSelectedSubtopic(subtopic.id)
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${selectedSubtopic === subtopic.id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-muted-foreground hover:bg-sidebar-accent/50"
                          }`}
                        >
                          {subtopic.subtopictitle} ({subtopicQuestionCount})
                        </button>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {selectedSubtopic 
                  ? subtopics.find((s) => s.id === selectedSubtopic)?.subtopictitle || "Questions"
                  : selectedTopic === "all"
                  ? "All Questions"
                  : topics.find((t) => t.slug === selectedTopic)?.name || "Questions"}
              </h1>
              <p className="text-muted-foreground">
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="algorithm">Algorithm</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                onClick={() => setShowBulkUpload(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={() => setAddingQuestion({
                id: "",
                type: "multiple-choice",
                topic: "",
                difficulty: "low",
                question_text: "",
                explanation: "",
                created_at: new Date().toISOString(),
                model_answer: "",
                options: [],
                correctAnswerIndex: 0,
              })}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No questions found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredQuestions.map((question) => {
                const IconComponent = questionTypeIcons[question.type as keyof typeof questionTypeIcons]
                const colorClass = questionTypeColors[question.type as keyof typeof questionTypeColors]
                const isEditing = editingQuestionId === question.id

                return (
                  <Card key={question.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className={`${colorClass} flex items-center gap-1.5 px-2 py-1`}>
                            <IconComponent className="w-3 h-3" />
                            {question.type.replace("-", " ")}
                          </Badge>
                        </div>

                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-question-text">Question Text</Label>
                              <Textarea
                                  id="edit-question-text"
                                value={editingText}
                                  onChange={(e) => {
                                    setEditingText(e.target.value)
                                    setHasUnsavedChanges(true)
                                    // Auto-resize functionality
                                    const textarea = e.target
                                    textarea.style.height = 'auto'
                                    textarea.style.height = textarea.scrollHeight + 'px'
                                  }}
                                  onInput={(e) => {
                                    // Additional auto-resize on input for better handling
                                    const textarea = e.target as HTMLTextAreaElement
                                    textarea.style.height = 'auto'
                                    textarea.style.height = textarea.scrollHeight + 'px'
                                  }}
                                  className="resize-y min-h-[2.5rem] overflow-hidden"
                                  rows={1}
                                  style={{ height: 'auto' }}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-explanation">Explanation</Label>
                                <Textarea
                                  id="edit-explanation"
                                  value={editingExplanation}
                                  onChange={(e) => {
                                    setEditingExplanation(e.target.value)
                                    setHasUnsavedChanges(true)
                                  }}
                                  rows={2}
                                  placeholder="Enter explanation for the question"
                                />
                              </div>

                              {/* Answer editing based on question type */}
                              {question.type === "multiple-choice" && (
                                <div className="space-y-3">
                                  <Label>Answer Options</Label>
                                  {editingOptions.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...editingOptions]
                                          newOptions[index] = e.target.value
                                          setEditingOptions(newOptions)
                                        }}
                                        placeholder={`Option ${index + 1}`}
                                      />
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          const newOptions = [...editingOptions]
                                          newOptions.splice(index, 1)
                                          setEditingOptions(newOptions)
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingOptions([...editingOptions, ""])}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Option
                                  </Button>
                                  <div className="space-y-2">
                                    <Label htmlFor="correct-answer">Correct Answer Index</Label>
                                    <Input
                                      id="correct-answer"
                                      type="number"
                                      min="0"
                                      max={editingOptions.length - 1}
                                      value={editingCorrectIndex}
                                      onChange={(e) => setEditingCorrectIndex(parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="model-answer">Model Answer</Label>
                                    <Textarea
                                      id="model-answer"
                                      value={editingAnswer}
                                      onChange={(e) => setEditingAnswer(e.target.value)}
                                rows={2}
                                      placeholder="Enter the model answer/explanation"
                                    />
                                  </div>
                                </div>
                              )}

                              {question.type === "short-answer" && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-answer">Answer</Label>
                                    <Textarea
                                      id="edit-answer"
                                      value={editingAnswer}
                                      onChange={(e) => {
                                        setEditingAnswer(e.target.value)
                                        setHasUnsavedChanges(true)
                                      }}
                                      rows={3}
                                      placeholder="Enter the answer"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-keywords">Keywords (comma-separated)</Label>
                                    <Input
                                      id="edit-keywords"
                                      value={editKeywordsInputValue}
                                      onChange={(e) => setEditKeywordsInputValue(e.target.value)}
                                      onBlur={() => {
                                        const keywordsArray = editKeywordsInputValue
                                          .split(",")
                                          .map(k => k.trim())
                                          .filter(k => k.length > 0)
                                        setEditingKeywords(keywordsArray)
                                        setHasUnsavedChanges(true)
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault()
                                          const keywordsArray = editKeywordsInputValue
                                            .split(",")
                                            .map(k => k.trim())
                                            .filter(k => k.length > 0)
                                          setEditingKeywords(keywordsArray)
                                          setHasUnsavedChanges(true)
                                        }
                                      }}
                                      placeholder="Enter keywords separated by commas"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Keywords help with automated grading and feedback
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {question.type === "essay" && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-essay-answer">Answer</Label>
                                    <Textarea
                                      id="edit-essay-answer"
                                      value={editingAnswer}
                                      onChange={(e) => {
                                        setEditingAnswer(e.target.value)
                                        setHasUnsavedChanges(true)
                                        // Auto-resize functionality
                                        const textarea = e.target
                                        textarea.style.height = 'auto'
                                        textarea.style.height = textarea.scrollHeight + 'px'
                                      }}
                                      onInput={(e) => {
                                        const textarea = e.target as HTMLTextAreaElement
                                        textarea.style.height = 'auto'
                                        textarea.style.height = textarea.scrollHeight + 'px'
                                      }}
                                      className="resize-y min-h-[2.5rem] overflow-hidden"
                                      rows={1}
                                      style={{ height: 'auto' }}
                                      placeholder="Enter the essay answer"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-essay-keywords">Keywords (comma-separated)</Label>
                                    <Input
                                      id="edit-essay-keywords"
                                      value={editEssayKeywordsInputValue}
                                      onChange={(e) => setEditEssayKeywordsInputValue(e.target.value)}
                                      onBlur={() => {
                                        const keywordsArray = editEssayKeywordsInputValue
                                          .split(",")
                                          .map(k => k.trim())
                                          .filter(k => k.length > 0)
                                        setEditingKeywords(keywordsArray)
                                        setHasUnsavedChanges(true)
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault()
                                          const keywordsArray = editEssayKeywordsInputValue
                                            .split(",")
                                            .map(k => k.trim())
                                            .filter(k => k.length > 0)
                                          setEditingKeywords(keywordsArray)
                                          setHasUnsavedChanges(true)
                                        }
                                      }}
                                      placeholder="Enter keywords separated by commas"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Keywords help with automated grading and feedback
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {(question.type === "code" || question.type === "algorithm") && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="starter-code">Starter Code</Label>
                                    <Textarea
                                      id="starter-code"
                                      value={editingStarterCode}
                                      onChange={(e) => {
                                        setEditingStarterCode(e.target.value)
                                        setHasUnsavedChanges(true)
                                      }}
                                      rows={4}
                                      placeholder="Enter starter code"
                                      className="font-mono"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="model-answer">Model Answer</Label>
                                    <Textarea
                                      id="model-answer"
                                      value={editingModelAnswer}
                                      onChange={(e) => {
                                        setEditingModelAnswer(e.target.value)
                                        setHasUnsavedChanges(true)
                                      }}
                                      rows={2}
                                      placeholder="Enter model answer/explanation"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Select value={editingLanguage} onValueChange={(value) => {
                                      setEditingLanguage(value)
                                      setHasUnsavedChanges(true)
                                    }}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="sql">SQL</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="model-answer-code">Model Answer Code</Label>
                                    <Textarea
                                      id="model-answer-code"
                                      value={editingModelAnswerCode}
                                      onChange={(e) => {
                                        setEditingModelAnswerCode(e.target.value)
                                        setHasUnsavedChanges(true)
                                      }}
                                      rows={6}
                                      placeholder="Enter the complete model answer code"
                                      className="font-mono"
                                    />
                                  </div>
                                </div>
                              )}

                              {question.type === "true-false" && (
                                <div className="space-y-2">
                                  <Label htmlFor="edit-answer">Correct Answer</Label>
                                  <Select value={editingAnswer} onValueChange={setEditingAnswer}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select answer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="true">True</SelectItem>
                                      <SelectItem value="false">False</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {question.type === "fill-in-the-blank" && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-answer">Correct Answers (comma-separated)</Label>
                                    <Input
                                      id="edit-answer"
                                      value={editingAnswer}
                                      onChange={(e) => {
                                        setEditingAnswer(e.target.value)
                                        setHasUnsavedChanges(true)
                                      }}
                                      placeholder="Enter correct answers separated by commas"
                                    />
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <Label>Options</Label>
                                    {editingFibOptions.map((option, index) => (
                                      <div key={index} className="flex gap-2">
                                        <Input
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [...editingFibOptions]
                                            newOptions[index] = e.target.value
                                            setEditingFibOptions(newOptions)
                                            setHasUnsavedChanges(true)
                                          }}
                                          placeholder={`Option ${index + 1}`}
                                        />
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => {
                                            const newOptions = [...editingFibOptions]
                                            newOptions.splice(index, 1)
                                            setEditingFibOptions(newOptions)
                                            setHasUnsavedChanges(true)
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingFibOptions([...editingFibOptions, ""])
                                        setHasUnsavedChanges(true)
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Option
                                    </Button>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="order-important"
                                      checked={editingOrderImportant}
                                      onChange={(e) => {
                                        setEditingOrderImportant(e.target.checked)
                                        setHasUnsavedChanges(true)
                                      }}
                                      className="rounded"
                                    />
                                    <Label htmlFor="order-important">Order Important</Label>
                                  </div>
                                </div>
                              )}

                              {question.type === "matching" && (
                                <div className="space-y-3">
                                  <Label>Matching Pairs</Label>
                                  {editingPairs.map((pair, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-2">
                                      <Input
                                        value={pair.statement}
                                        onChange={(e) => {
                                          const newPairs = [...editingPairs]
                                          newPairs[index] = { ...pair, statement: e.target.value }
                                          setEditingPairs(newPairs)
                                        }}
                                        placeholder="Statement"
                                      />
                                      <div className="flex gap-2">
                                        <Input
                                          value={pair.match}
                                          onChange={(e) => {
                                            const newPairs = [...editingPairs]
                                            newPairs[index] = { ...pair, match: e.target.value }
                                            setEditingPairs(newPairs)
                                          }}
                                          placeholder="Match"
                                        />
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => {
                                            const newPairs = [...editingPairs]
                                            newPairs.splice(index, 1)
                                            setEditingPairs(newPairs)
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingPairs([...editingPairs, { statement: "", match: "" }])}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Pair
                                  </Button>
                                </div>
                              )}

                              {/* Subtopic Selection */}
                              <div className="space-y-3">
                                <Label>Subtopics *</Label>
                                <div className="relative mb-2">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <Input
                                    placeholder="Search subtopics..."
                                    value={editSubtopicSearch}
                                    onChange={(e) => setEditSubtopicSearch(e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <ShadcnCheckbox
                                      checked={showOnlySelectedEditSubtopics}
                                      onCheckedChange={(checked: boolean) => setShowOnlySelectedEditSubtopics(checked)}
                                    />
                                    <span className="text-sm">Show only selected</span>
                                  </label>
                                  <span className="text-sm text-muted-foreground">
                                    {editingSubtopicIds.length} selected
                                  </span>
                                </div>
                                <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-muted/20">
                                  {groupedSubtopics
                                    .map((topic) => ({
                                      ...topic,
                                      subtopics: topic.subtopics.filter((sub) => {
                                        const matchesSearch = editSubtopicSearch === "" ||
                                          sub.subtopictitle.toLowerCase().includes(editSubtopicSearch.toLowerCase()) ||
                                          topic.name.toLowerCase().includes(editSubtopicSearch.toLowerCase()) ||
                                          topic.topicnumber.toLowerCase().includes(editSubtopicSearch.toLowerCase())
                                        const matchesSelected = !showOnlySelectedEditSubtopics || editingSubtopicIds.includes(sub.id)
                                        return matchesSearch && matchesSelected
                                      }),
                                    }))
                                    .filter((topic) => topic.subtopics.length > 0)
                                    .map((topic) => (
                                      <div key={topic.id} className="mb-3">
                                        <div className="font-medium text-sm mb-2 text-muted-foreground">
                                          {topic.topicnumber} - {topic.name}
                                        </div>
                                        {topic.subtopics.map((sub) => (
                                          <label key={sub.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                                            <ShadcnCheckbox
                                              checked={editingSubtopicIds.includes(sub.id)}
                                              onCheckedChange={(checked: boolean) => {
                                                setEditingSubtopicIds((ids) =>
                                                  checked ? [...ids, sub.id] : ids.filter((sid) => sid !== sub.id),
                                                )
                                                setHasUnsavedChanges(true)
                                              }}
                                            />
                                            <span className="text-sm">{sub.subtopictitle}</span>
                                          </label>
                                        ))}
                                      </div>
                                    ))}
                                  {groupedSubtopics
                                    .map((topic) => ({
                                      ...topic,
                                      subtopics: topic.subtopics.filter((sub) => {
                                        const matchesSearch = editSubtopicSearch === "" ||
                                          sub.subtopictitle.toLowerCase().includes(editSubtopicSearch.toLowerCase()) ||
                                          topic.name.toLowerCase().includes(editSubtopicSearch.toLowerCase()) ||
                                          topic.topicnumber.toLowerCase().includes(editSubtopicSearch.toLowerCase())
                                        const matchesSelected = !showOnlySelectedEditSubtopics || editingSubtopicIds.includes(sub.id)
                                        return matchesSearch && matchesSelected
                                      }),
                                    }))
                                    .filter((topic) => topic.subtopics.length > 0).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                      {showOnlySelectedEditSubtopics ? "No selected subtopics" : "No subtopics match your search"}
                                    </p>
                                  )}
                                </div>
                                {editingSubtopicIds.length === 0 && (
                                  <p className="text-sm text-destructive">At least one subtopic must be selected</p>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => handleSaveInlineEdit(question.id)}>
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelInlineEdit}>
                                  <X className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                              onClick={() => handleInlineEdit(question.id, question)}
                            >
                              <p className="text-foreground font-medium leading-relaxed">{question.question_text}</p>
                              {question.explanation && (
                                <p className="text-sm text-muted-foreground mt-1 italic">{question.explanation}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>ID: {question.id}</span>
                                <span>Created: {new Date(question.created_at).toLocaleDateString()}</span>
                                {(question.model_answer !== null && question.model_answer !== undefined && question.model_answer !== "") && (
                                  <span>
                                    Answer:{" "}
                                    {Array.isArray(question.model_answer)
                                      ? question.model_answer.join(", ")
                                      : String(question.model_answer).substring(0, 50)}
                                    {String(question.model_answer).length > 50 ? "..." : ""}
                                  </span>
                                )}
                              </div>
                              {/* Show keywords if they exist */}
                              {question.keywords && question.keywords.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-muted-foreground mb-1">Keywords:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {question.keywords.map((keyword, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Show current subtopics */}
                              {question.subtopic_question_link && question.subtopic_question_link.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-muted-foreground mb-1">Subtopics:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {question.subtopic_question_link.map((link, index) => {
                                      const subtopic = subtopics.find(s => s.id === link.subtopic_id)
                                      const topic = topics.find(t => String(t.id) === subtopic?.topic_id)
                                      return (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {topic?.topicnumber} - {subtopic?.subtopictitle}
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleToggleEdit(question.id, question)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteClick(question)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={!!addingQuestion} onOpenChange={() => {
        setAddingQuestion(null)
        setAddSubtopicSearch("")
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Question
            </DialogTitle>
          </DialogHeader>
          {addingQuestion && (
            <div className="space-y-6 py-4">
              {/* Basic Question Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="question-id">Question ID *</Label>
                  <Input
                    id="question-id"
                    value={addingQuestion.id}
                    onChange={(e) => setAddingQuestion({ ...addingQuestion, id: e.target.value })}
                    placeholder="Enter unique question ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question-type">Question Type *</Label>
                  <Select
                    value={addingQuestion.type}
                    onValueChange={(value) => setAddingQuestion({ ...addingQuestion, type: value as Question["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
                      <SelectItem value="matching">Matching</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="algorithm">Algorithm</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={addingQuestion.difficulty}
                    onValueChange={(value) => setAddingQuestion({ ...addingQuestion, difficulty: value as Question["difficulty"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Input
                    id="explanation"
                    value={addingQuestion.explanation || ""}
                    onChange={(e) => setAddingQuestion({ ...addingQuestion, explanation: e.target.value })}
                    placeholder="Enter explanation for the question"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-text">Question Text *</Label>
                <Textarea
                  id="question-text"
                  value={addingQuestion.question_text}
                  onChange={(e) => setAddingQuestion({ ...addingQuestion, question_text: e.target.value })}
                  rows={3}
                  placeholder="Enter the question text"
                />
              </div>

              {/* Multiple Choice Options */}
              {addingQuestion.type === "multiple-choice" && (
                <div className="space-y-4">
                  <Label>Answer Options *</Label>
                  {(addingQuestion.options || []).map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(addingQuestion.options || [])]
                          newOptions[index] = e.target.value
                          setAddingQuestion({ ...addingQuestion, options: newOptions })
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newOptions = [...(addingQuestion.options || [])]
                          newOptions.splice(index, 1)
                          setAddingQuestion({ ...addingQuestion, options: newOptions })
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddingQuestion({
                        ...addingQuestion,
                        options: [...(addingQuestion.options || []), ""],
                      })
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor="correct-answer-index">Correct Answer Index *</Label>
                    <Input
                      id="correct-answer-index"
                      type="number"
                      min="0"
                      max={(addingQuestion.options || []).length - 1}
                      value={addingQuestion.correctAnswerIndex || 0}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, correctAnswerIndex: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model-answer">Model Answer</Label>
                    <Textarea
                      id="model-answer"
                      value={addingQuestion.model_answer as string || ""}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, model_answer: e.target.value })}
                      rows={2}
                      placeholder="Enter the model answer/explanation"
                    />
                  </div>
                </div>
              )}

              {/* Fill in the Blank */}
              {addingQuestion.type === "fill-in-the-blank" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fib-correct-answers">Correct Answers (comma-separated) *</Label>
                    <Input
                      id="fib-correct-answers"
                      value={Array.isArray(addingQuestion.model_answer) ? addingQuestion.model_answer.join(", ") : (addingQuestion.model_answer as string || "")}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, model_answer: e.target.value.split(",").map(a => a.trim()) })}
                      placeholder="Enter correct answers separated by commas"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Options</Label>
                    {(addingQuestion.options || []).map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(addingQuestion.options || [])]
                            newOptions[index] = e.target.value
                            setAddingQuestion({ ...addingQuestion, options: newOptions })
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newOptions = [...(addingQuestion.options || [])]
                            newOptions.splice(index, 1)
                            setAddingQuestion({ ...addingQuestion, options: newOptions })
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddingQuestion({
                          ...addingQuestion,
                          options: [...(addingQuestion.options || []), ""],
                        })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="fib-order-important"
                      checked={addingQuestion.order_important || false}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, order_important: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="fib-order-important">Order Important</Label>
                  </div>
                </div>
              )}

              {/* Matching */}
              {addingQuestion.type === "matching" && (
                <div className="space-y-3">
                  <Label>Matching Pairs *</Label>
                  {(addingQuestion.pairs || []).map((pair, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        value={pair.statement}
                        onChange={(e) => {
                          const newPairs = [...(addingQuestion.pairs || [])]
                          newPairs[index] = { ...pair, statement: e.target.value }
                          setAddingQuestion({ ...addingQuestion, pairs: newPairs })
                        }}
                        placeholder="Statement"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={pair.match}
                          onChange={(e) => {
                            const newPairs = [...(addingQuestion.pairs || [])]
                            newPairs[index] = { ...pair, match: e.target.value }
                            setAddingQuestion({ ...addingQuestion, pairs: newPairs })
                          }}
                          placeholder="Match"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newPairs = [...(addingQuestion.pairs || [])]
                            newPairs.splice(index, 1)
                            setAddingQuestion({ ...addingQuestion, pairs: newPairs })
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddingQuestion({
                        ...addingQuestion,
                        pairs: [...(addingQuestion.pairs || []), { statement: "", match: "" }],
                      })
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pair
                  </Button>
                </div>
              )}

              {/* Code/SQL/Algorithm */}
              {(addingQuestion.type === "code" || addingQuestion.type === "sql" || addingQuestion.type === "algorithm") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="starter-code">Starter Code</Label>
                    <Textarea
                      id="starter-code"
                      value={(addingQuestion as ExtendedQuestion).starter_code || ""}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, starter_code: e.target.value } as ExtendedQuestion)}
                      rows={4}
                      placeholder="Enter starter code"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code-model-answer">Model Answer</Label>
                    <Textarea
                      id="code-model-answer"
                      value={addingQuestion.model_answer as string || ""}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, model_answer: e.target.value })}
                      rows={2}
                      placeholder="Enter model answer/explanation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code-language">Language</Label>
                    <Select
                      value={(addingQuestion as ExtendedQuestion).language || ""}
                      onValueChange={(value) => setAddingQuestion({ ...addingQuestion, language: value } as ExtendedQuestion)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="sql">SQL</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model-answer-code">Model Answer Code</Label>
                    <Textarea
                      id="model-answer-code"
                      value={(addingQuestion as ExtendedQuestion).model_answer_code || ""}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, model_answer_code: e.target.value } as ExtendedQuestion)}
                      rows={6}
                      placeholder="Enter the complete model answer code"
                      className="font-mono"
                    />
                  </div>
                </div>
              )}

              {/* True/False */}
              {addingQuestion.type === "true-false" && (
                <div className="space-y-2">
                  <Label htmlFor="tf-correct-answer">Correct Answer *</Label>
                  <Select
                    value={String(addingQuestion.model_answer)}
                    onValueChange={(value) => setAddingQuestion({ ...addingQuestion, model_answer: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Short Answer */}
              {addingQuestion.type === "short-answer" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sa-model-answer">Model Answer *</Label>
                    <Textarea
                      id="sa-model-answer"
                      value={addingQuestion.model_answer as string || ""}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, model_answer: e.target.value })}
                      rows={3}
                      placeholder="Enter the model answer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sa-keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="sa-keywords"
                      value={saKeywordsInputValue}
                      onChange={(e) => setSaKeywordsInputValue(e.target.value)}
                      onBlur={() => {
                        const keywordsArray = saKeywordsInputValue
                          .split(",")
                          .map(k => k.trim())
                          .filter(k => k.length > 0)
                        setAddingQuestion({ ...addingQuestion, keywords: keywordsArray })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const keywordsArray = saKeywordsInputValue
                            .split(",")
                            .map(k => k.trim())
                            .filter(k => k.length > 0)
                          setAddingQuestion({ ...addingQuestion, keywords: keywordsArray })
                        }
                      }}
                      placeholder="Enter keywords separated by commas"
                    />
                    <p className="text-xs text-muted-foreground">
                      Keywords help with automated grading and feedback
                    </p>
                  </div>
                </div>
              )}

              {/* Essay */}
              {addingQuestion.type === "essay" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="essay-model-answer">Model Answer *</Label>
                    <Textarea
                      id="essay-model-answer"
                      value={addingQuestion.model_answer as string || ""}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, model_answer: e.target.value })}
                      rows={4}
                      placeholder="Enter the model essay answer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="essay-rubric">Rubric</Label>
                    <Textarea
                      id="essay-rubric"
                      value={addingQuestion.rubric || ""}
                      onChange={(e) => setAddingQuestion({ ...addingQuestion, rubric: e.target.value })}
                      rows={3}
                      placeholder="Enter grading rubric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="essay-keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="essay-keywords"
                      value={keywordsInputValue}
                      onChange={(e) => setKeywordsInputValue(e.target.value)}
                      onBlur={() => {
                        const keywordsArray = keywordsInputValue
                          .split(",")
                          .map(k => k.trim())
                          .filter(k => k.length > 0)
                        setAddingQuestion({ ...addingQuestion, keywords: keywordsArray })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const keywordsArray = keywordsInputValue
                            .split(",")
                            .map(k => k.trim())
                            .filter(k => k.length > 0)
                          setAddingQuestion({ ...addingQuestion, keywords: keywordsArray })
                        }
                      }}
                      placeholder="Enter keywords separated by commas"
                    />
                    <p className="text-xs text-muted-foreground">
                      Keywords help with automated grading and feedback
                    </p>
                  </div>
                </div>
              )}

              {/* Subtopics Selection */}
              <div className="space-y-2">
                <Label>Subtopics *</Label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search subtopics..."
                    value={addSubtopicSearch}
                    onChange={(e) => setAddSubtopicSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <ShadcnCheckbox
                      checked={showOnlySelectedAddSubtopics}
                      onCheckedChange={(checked: boolean) => setShowOnlySelectedAddSubtopics(checked)}
                    />
                    <span className="text-sm">Show only selected</span>
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {addingSubtopicIds.length} selected
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-muted/20">
                  {groupedSubtopics
                    .map((topic) => ({
                      ...topic,
                      subtopics: topic.subtopics.filter((sub) => {
                        const matchesSearch = addSubtopicSearch === "" ||
                          sub.subtopictitle.toLowerCase().includes(addSubtopicSearch.toLowerCase()) ||
                          topic.name.toLowerCase().includes(addSubtopicSearch.toLowerCase()) ||
                          topic.topicnumber.toLowerCase().includes(addSubtopicSearch.toLowerCase())
                        const matchesSelected = !showOnlySelectedAddSubtopics || addingSubtopicIds.includes(sub.id)
                        return matchesSearch && matchesSelected
                      }),
                    }))
                    .filter((topic) => topic.subtopics.length > 0)
                    .map((topic) => (
                      <div key={topic.id} className="mb-3">
                        <div className="font-medium text-sm mb-2 text-muted-foreground">
                          {topic.topicnumber} - {topic.name}
                        </div>
                        {topic.subtopics.map((sub) => (
                          <label key={sub.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                            <ShadcnCheckbox
                              checked={addingSubtopicIds.includes(sub.id)}
                              onCheckedChange={(checked: boolean) => {
                                setAddingSubtopicIds((ids) =>
                                  checked ? [...ids, sub.id] : ids.filter((sid) => sid !== sub.id),
                                )
                              }}
                            />
                            <span className="text-sm">{sub.subtopictitle}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  {groupedSubtopics
                    .map((topic) => ({
                      ...topic,
                      subtopics: topic.subtopics.filter((sub) => {
                        const matchesSearch = addSubtopicSearch === "" ||
                          sub.subtopictitle.toLowerCase().includes(addSubtopicSearch.toLowerCase()) ||
                          topic.name.toLowerCase().includes(addSubtopicSearch.toLowerCase()) ||
                          topic.topicnumber.toLowerCase().includes(addSubtopicSearch.toLowerCase())
                        const matchesSelected = !showOnlySelectedAddSubtopics || addingSubtopicIds.includes(sub.id)
                        return matchesSearch && matchesSelected
                      }),
                    }))
                    .filter((topic) => topic.subtopics.length > 0).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {showOnlySelectedAddSubtopics ? "No selected subtopics" : "No subtopics match your search"}
                    </p>
                  )}
                </div>
                {addingSubtopicIds.length === 0 && (
                  <p className="text-sm text-destructive">At least one subtopic must be selected</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setAddingQuestion(null)
                  setAddSubtopicSearch("")
                }}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveNew(addingQuestion)}>Create Question</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Unsaved Changes */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              You have unsaved changes. What would you like to do?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleConfirmCancel}>
              Discard Changes
            </Button>
            <Button onClick={handleConfirmSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            {questionToDelete && (
              <div className="mb-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Question ID: {questionToDelete.id}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {questionToDelete.question_text.substring(0, 100)}
                  {questionToDelete.question_text.length > 100 ? "..." : ""}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <span className="font-mono bg-muted px-1 rounded">delete</span> to confirm:
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type 'delete' to confirm"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteQuestion}
              disabled={deleteConfirmText !== "delete"}
            >
              Delete Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Bulk Upload Questions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Step 1: Select Question Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 1: Select Question Type</h3>
              <Select value={bulkUploadType} onValueChange={(value) => setBulkUploadType(value as Question["type"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="algorithm">Algorithm</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Download Template */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 2: Download Template</h3>
              <p className="text-sm text-muted-foreground">
                Download the CSV template for {bulkUploadType} questions to see the required format and example data.
              </p>
              <Button 
                variant="outline" 
                onClick={() => downloadCSVTemplate(bulkUploadType)}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download {bulkUploadType} Template
              </Button>
            </div>

            {/* Step 3: Upload CSV */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 3: Upload CSV File</h3>
              <div className="space-y-2">
                <Label htmlFor="csv-upload">CSV File</Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setBulkUploadFile(e.target.files?.[0] || null)}
                />
                {bulkUploadFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {bulkUploadFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Step 4: Select Subtopics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 4: Select Subtopics</h3>
              <p className="text-sm text-muted-foreground">
                All uploaded questions will be linked to the selected subtopics.
              </p>
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-muted/20">
                {groupedSubtopics.map((topic) => (
                  <div key={topic.id} className="mb-3">
                    <div className="font-medium text-sm mb-2 text-muted-foreground">
                      {topic.topicnumber} - {topic.name}
                    </div>
                    {topic.subtopics.map((sub) => (
                      <label key={sub.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                        <ShadcnCheckbox
                          checked={addingSubtopicIds.includes(sub.id)}
                          onCheckedChange={(checked: boolean) => {
                            setAddingSubtopicIds((ids) =>
                              checked ? [...ids, sub.id] : ids.filter((sid) => sid !== sub.id),
                            )
                          }}
                        />
                        <span className="text-sm">{sub.subtopictitle}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              {addingSubtopicIds.length === 0 && (
                <p className="text-sm text-destructive">At least one subtopic must be selected</p>
              )}
            </div>

            {/* Progress and Errors */}
            {bulkUploadProgress > 0 && (
              <div className="space-y-2">
                <Label>Upload Progress</Label>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bulkUploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {Math.round(bulkUploadProgress)}% complete
                </p>
              </div>
            )}

            {bulkUploadErrors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-destructive">Validation Errors</Label>
                <div className="max-h-32 overflow-y-auto border border-destructive/20 rounded-md p-3 bg-destructive/5">
                  {bulkUploadErrors.map((error, index) => (
                    <p key={index} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowBulkUpload(false)
                setBulkUploadFile(null)
                setBulkUploadProgress(0)
                setBulkUploadErrors([])
              }}>
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!bulkUploadFile) {
                    toast.error("Please select a CSV file")
                    return
                  }
                  if (addingSubtopicIds.length === 0) {
                    toast.error("Please select at least one subtopic")
                    return
                  }

                  const text = await bulkUploadFile.text()
                  const csvData = parseCSV(text)
                  
                  if (csvData.length === 0) {
                    toast.error("No valid data found in CSV file")
                    return
                  }

                  await processBulkUpload(csvData, addingSubtopicIds)
                }}
                disabled={!bulkUploadFile || addingSubtopicIds.length === 0}
              >
                Upload Questions
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
