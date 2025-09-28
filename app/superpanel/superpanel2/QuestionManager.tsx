"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Question } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "lucide-react"
import { toast } from "sonner"
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox"

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

// Define a type for subtopic_question_link
interface SubtopicLink {
  subtopic_id: string
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [addingQuestion, setAddingQuestion] = useState<Question | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterTopic, setFilterTopic] = useState<string>("all")
  const [topics, setTopics] = useState<Array<{ id: number; name: string; slug: string; topicnumber: string }>>([])
  const [subtopics, setSubtopics] = useState<
    Array<{
      id: string
      subtopictitle: string
      topic_id: string
      topic?: { name: string; slug: string; topicnumber: string }
    }>
  >([])
  const [editingSubtopicIds, setEditingSubtopicIds] = useState<string[]>([])
  const [addingSubtopicIds, setAddingSubtopicIds] = useState<string[]>([])
  const supabase = createClient()

  // Add state for validation errors
  const [addErrors, setAddErrors] = useState<{ id?: string; question_text?: string; subtopics?: string }>({})

  // Helper to group and order subtopics by topic (move inside component for access to state)
  const groupedSubtopics = topics
    .sort((a, b) => a.topicnumber.localeCompare(b.topicnumber, undefined, { numeric: true }))
    .map((topic) => ({
      ...topic,
      subtopics: subtopics
        .filter((s) => String(s.topic_id) === String(topic.id))
        .sort((a, b) => a.subtopictitle.localeCompare(b.subtopictitle)),
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

      const transformedQuestions: Question[] = data.map((q) => {
        return {
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
            model_answer_code: q.code_questions?.model_answer_code,
            language: q.code_questions?.language,
          }),
          ...(q.type === "true-false" && {
            model_answer: q.true_false_questions?.correct_answer,
          }),
          ...(q.type === "short-answer" && {
            model_answer: q.short_answer_questions?.model_answer,
          }),
          ...(q.type === "essay" && {
            model_answer: q.essay_questions?.model_answer,
            rubric: q.essay_questions?.rubric,
          }),
        }
      })

      setQuestions(transformedQuestions)
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
    fetchTopics()
    fetchSubtopics()
  }, [])

  useEffect(() => {
    if (editingQuestion) {
      const links = (editingQuestion.subtopic_question_link ?? []) as SubtopicLink[]
      const ids = Array.isArray(links) ? links.map((link) => link.subtopic_id).filter(Boolean) : []
      setEditingSubtopicIds(ids)
    }
  }, [editingQuestion, subtopics])

  useEffect(() => {
    if (addingQuestion) setAddingSubtopicIds([])
  }, [addingQuestion])

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("id, name, slug, topicnumber")
        .order("topicnumber", { ascending: true })

      if (error) throw error
      console.log("DEBUG: Topics loaded:", data)
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
    let filtered = questions

    console.log("DEBUG: Current filterTopic:", filterTopic)
    console.log(
      "DEBUG: Questions before filtering:",
      questions.map((q) => ({ id: q.id, topic: q.topic })),
    )

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.topic.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((q) => q.type === filterType)
    }

    if (filterTopic !== "all") {
      console.log("DEBUG: Filtering by topic:", filterTopic)
      filtered = filtered.filter((q) => {
        console.log("DEBUG: Question topic:", q.topic, "Matches?", q.topic === filterTopic)
        return q.topic === filterTopic
      })
    }

    console.log(
      "DEBUG: Filtered questions:",
      filtered.map((q) => ({ id: q.id, topic: q.topic })),
    )
    setFilteredQuestions(filtered)
  }, [questions, searchTerm, filterType, filterTopic])

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
  }

  const handleSave = async (updatedQuestion: Question) => {
    try {
      // Update the base question
      const { error: questionError } = await supabase
        .from("questions")
        .update({
          question_text: updatedQuestion.question_text,
          explanation: updatedQuestion.explanation,
          type: updatedQuestion.type,
        })
        .eq("id", updatedQuestion.id)

      if (questionError) throw questionError

      // Update type-specific data
      switch (updatedQuestion.type) {
        case "multiple-choice":
          await supabase
            .from("multiple_choice_questions")
            .update({
              options: updatedQuestion.options,
              correct_answer_index: updatedQuestion.correctAnswerIndex,
              model_answer: updatedQuestion.model_answer,
            })
            .eq("question_id", updatedQuestion.id)
          break
        case "fill-in-the-blank":
          await supabase
            .from("fill_in_the_blank_questions")
            .update({
              options: updatedQuestion.options,
              correct_answers: updatedQuestion.model_answer,
              order_important: updatedQuestion.order_important,
            })
            .eq("question_id", updatedQuestion.id)
          break
        case "matching":
          // Delete existing pairs and insert new ones
          await supabase.from("matching_questions").delete().eq("question_id", updatedQuestion.id)

          if (updatedQuestion.pairs) {
            await supabase.from("matching_questions").insert(
              updatedQuestion.pairs.map((pair) => ({
                question_id: updatedQuestion.id,
                statement: pair.statement,
                match: pair.match,
              })),
            )
          }
          break
        case "code":
          await supabase
            .from("code_questions")
            .update({
              model_answer_code: updatedQuestion.model_answer_code,
              language: updatedQuestion.language,
              model_answer: updatedQuestion.model_answer,
            })
            .eq("question_id", updatedQuestion.id)
          break
        case "true-false":
          await supabase
            .from("true_false_questions")
            .update({
              correct_answer: updatedQuestion.model_answer,
              model_answer: updatedQuestion.model_answer,
            })
            .eq("question_id", updatedQuestion.id)
          break
        case "short-answer":
          await supabase
            .from("short_answer_questions")
            .update({
              model_answer: updatedQuestion.model_answer,
            })
            .eq("question_id", updatedQuestion.id)
          break
        case "essay":
          await supabase
            .from("essay_questions")
            .update({
              model_answer: updatedQuestion.model_answer,
              rubric: (updatedQuestion as Question & { rubric?: string }).rubric,
            })
            .eq("question_id", updatedQuestion.id)
          break
      }

      // Update subtopic links
      await supabase.from("subtopic_question_link").delete().eq("question_id", updatedQuestion.id)
      if (editingSubtopicIds.length > 0) {
        await supabase.from("subtopic_question_link").insert(
          editingSubtopicIds.map((subtopic_id) => ({
            question_id: updatedQuestion.id,
            subtopic_id,
          })),
        )
      }

      await fetchQuestions()
      setEditingQuestion(null)
      toast.success("Question updated successfully")
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question")
    }
  }

  const handleAdd = () => {
    setAddingQuestion({
      id: "", // Temporary ID, will be replaced by database
      type: "multiple-choice", // Default type
      topic: "",
      difficulty: "low",
      question_text: "",
      explanation: "",
      created_at: new Date().toISOString(),
      model_answer: "",
      options: [],
      correctAnswerIndex: 0,
    })
  }

  const handleSaveNew = async (newQuestion: Question) => {
    console.log("DEBUG: Starting handleSaveNew with question:", newQuestion)

    // Validation
    const errors: { id?: string; question_text?: string; subtopics?: string } = {}
    if (!newQuestion.id || newQuestion.id.trim() === "") errors.id = "Question ID is required."
    if (!newQuestion.question_text || newQuestion.question_text.trim() === "")
      errors.question_text = "Question text is required."
    if (!addingSubtopicIds.length) errors.subtopics = "At least one subtopic must be selected."
    setAddErrors(errors)
    if (Object.keys(errors).length > 0) {
      console.log("DEBUG: Validation errors:", errors)
      return
    }

    try {
      console.log("DEBUG: Attempting to insert base question")
      // Insert the base question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert({
          id: newQuestion.id,
          question_text: newQuestion.question_text,
          explanation: newQuestion.explanation,
          type: newQuestion.type,
        })
        .select()
        .single()

      if (questionError) {
        console.error("DEBUG: Error inserting base question:", questionError)
        throw questionError
      }
      console.log("DEBUG: Successfully inserted base question:", questionData)

      // Insert type-specific data
      console.log("DEBUG: Inserting type-specific data for type:", newQuestion.type)
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
          if (newQuestion.pairs) {
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
          await supabase.from("code_questions").insert({
            question_id: questionData.id,
            model_answer_code: newQuestion.model_answer_code,
            language: newQuestion.language,
            model_answer: newQuestion.model_answer,
          })
          break
        case "true-false":
          await supabase.from("true_false_questions").insert({
            question_id: questionData.id,
            correct_answer: !!newQuestion.model_answer, // convert to boolean
            model_answer: !!newQuestion.model_answer, // convert to boolean
          })
          break
        case "short-answer":
          await supabase.from("short_answer_questions").insert({
            question_id: questionData.id,
            model_answer: newQuestion.model_answer,
          })
          break
        case "essay":
          await supabase.from("essay_questions").insert({
            question_id: questionData.id,
            model_answer: newQuestion.model_answer,
            rubric: (newQuestion as Question & { rubric?: string }).rubric,
          })
          break
      }

      // Insert subtopic links
      // if (addingSubtopicIds.length > 0) {
      //   await supabase.from("subtopic_question_link").insert(
      //     addingSubtopicIds.map((subtopic_id) => ({
      //       question_id: questionData.id,
      //       subtopic_id,
      //     }))
      //   )
      // }
      // TODO: check if this is correct
      if (addingSubtopicIds.length > 0) {
        const { error: linkError } = await supabase.from("subtopic_question_link").insert(
          addingSubtopicIds.map((subtopic_id) => ({
            question_id: questionData.id,
            subtopic_id,
          })),
        )
        if (linkError) {
          console.error("Error inserting subtopic_question_link:", linkError)
        }
      }

      await fetchQuestions()
      setAddingQuestion(null)
      toast.success("Question created successfully")
    } catch (error) {
      console.error("Error creating question:", error)
      toast.error("Failed to create question")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading questions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search questions or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
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
          <Select value={filterTopic} onValueChange={setFilterTopic}>
            <SelectTrigger className="w-48">
              <BookOpen className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.slug}>
                  {topic.topicnumber} - {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid gap-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No questions found</h3>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredQuestions.map((question) => {
            const IconComponent = questionTypeIcons[question.type as keyof typeof questionTypeIcons]
            const colorClass = questionTypeColors[question.type as keyof typeof questionTypeColors]

            return (
              <Card key={question.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  {/* Top: Question Heading (full width) */}
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className={`${colorClass} flex items-center gap-1.5 px-2.5 py-1`}>
                      <IconComponent className="w-3.5 h-3.5" />
                      {question.type.replace("-", " ")}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {question.id}</span>
                    {question.topic && (
                      <Badge variant="secondary" className="text-xs">
                        {question.topic}
                      </Badge>
                    )}
                  </div>
                  <div className="mb-2">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 text-lg">{question.question_text}</h3>
                  </div>
                  {/* Second row: Model Answer (left), Explanation (right) */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <strong>Model Answer:</strong>
                      <div>
                        {question.type === "code" ? (
                          <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
                            {question.model_answer_code || question.model_answer}
                          </pre>
                        ) : Array.isArray(question.model_answer) ? (
                          <span>{question.model_answer.join(", ")}</span>
                        ) : (
                          <span>{String(question.model_answer)}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      {question.explanation && (
                        <>
                          <strong>Explanation:</strong>
                          <div>{question.explanation}</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Created: {new Date(question.created_at).toLocaleDateString()}
                  </div>
                  {/* Edit/Delete Buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(question)}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="min-w-[60%] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit3 className="w-5 h-5" />
              Edit Question
            </DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-8 py-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="question-text" className="text-base font-medium">
                    Question Text
                  </Label>
                  <Textarea
                    id="question-text"
                    value={editingQuestion.question_text}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                    rows={4}
                    className="resize-none text-base w-full"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="explanation" className="text-base font-medium">
                    Explanation
                  </Label>
                  <Textarea
                    id="explanation"
                    value={editingQuestion.explanation || ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    rows={4}
                    className="resize-none text-base w-full"
                  />
                </div>

                <Label className="text-base font-medium">Subtopics</Label>
                <div className="mb-4 max-h-64 overflow-y-auto border rounded-md p-3 bg-muted/20">
                  {groupedSubtopics.map((topic) => (
                    <div key={topic.id} className="mb-2">
                      <div className="font-semibold text-sm mb-1 text-muted-foreground">
                        {topic.topicnumber} - {topic.name}
                      </div>
                      {topic.subtopics.length === 0 ? (
                        <div className="text-xs text-muted-foreground italic mb-2">No subtopics</div>
                      ) : (
                        topic.subtopics.map((sub) => (
                          <label key={sub.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                            <ShadcnCheckbox
                              checked={editingSubtopicIds.includes(sub.id)}
                              onCheckedChange={(checked: boolean) => {
                                setEditingSubtopicIds((ids) =>
                                  checked ? [...ids, sub.id] : ids.filter((sid) => sid !== sub.id),
                                )
                              }}
                            />
                            <span className="text-sm">{sub.subtopictitle}</span>
                          </label>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Type-specific fields */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  {(() => {
                    const IconComponent = questionTypeIcons[editingQuestion.type as keyof typeof questionTypeIcons]
                    return <IconComponent className="w-5 h-5" />
                  })()}
                  {editingQuestion.type.replace("-", " ")} Configuration
                </h3>

                {editingQuestion.type === "multiple-choice" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Options</Label>
                      {editingQuestion.options?.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(editingQuestion.options || [])]
                              newOptions[index] = e.target.value
                              setEditingQuestion({ ...editingQuestion, options: newOptions })
                            }}
                            placeholder={`Option ${index + 1}`}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newOptions = [...(editingQuestion.options || [])]
                              newOptions.splice(index, 1)
                              setEditingQuestion({ ...editingQuestion, options: newOptions })
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingQuestion({
                            ...editingQuestion,
                            options: [...(editingQuestion.options || []), ""],
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Select
                        value={editingQuestion.correctAnswerIndex?.toString()}
                        onValueChange={(value) =>
                          setEditingQuestion({ ...editingQuestion, correctAnswerIndex: Number.parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {editingQuestion.options?.map((option, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              Option {index + 1}: {option.substring(0, 50)}
                              {option.length > 50 ? "..." : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {editingQuestion.type === "fill-in-the-blank" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Options</Label>
                      {editingQuestion.options?.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(editingQuestion.options || [])]
                              newOptions[index] = e.target.value
                              setEditingQuestion({ ...editingQuestion, options: newOptions })
                            }}
                            placeholder={`Option ${index + 1}`}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newOptions = [...(editingQuestion.options || [])]
                              newOptions.splice(index, 1)
                              setEditingQuestion({ ...editingQuestion, options: newOptions })
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingQuestion({
                            ...editingQuestion,
                            options: [...(editingQuestion.options || []), ""],
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Label>Correct Answers</Label>
                      {Array.isArray(editingQuestion.model_answer) &&
                        editingQuestion.model_answer.map((answer, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={answer}
                              onChange={(e) => {
                                const newAnswers = [...(editingQuestion.model_answer as string[])]
                                newAnswers[index] = e.target.value
                                setEditingQuestion({ ...editingQuestion, model_answer: newAnswers })
                              }}
                              placeholder={`Answer ${index + 1}`}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const newAnswers = [...(editingQuestion.model_answer as string[])]
                                newAnswers.splice(index, 1)
                                setEditingQuestion({ ...editingQuestion, model_answer: newAnswers })
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingQuestion({
                            ...editingQuestion,
                            model_answer: [...((editingQuestion.model_answer as string[]) || []), ""],
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Answer
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="order-important"
                        checked={editingQuestion.order_important}
                        onCheckedChange={(checked) =>
                          setEditingQuestion({ ...editingQuestion, order_important: checked })
                        }
                      />
                      <Label htmlFor="order-important">Order Important</Label>
                    </div>
                  </div>
                )}

                {editingQuestion.type === "matching" && (
                  <div className="space-y-3">
                    <Label>Matching Pairs</Label>
                    {editingQuestion.pairs?.map((pair, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <Input
                          value={pair.statement}
                          onChange={(e) => {
                            const newPairs = [...(editingQuestion.pairs || [])]
                            newPairs[index] = { ...pair, statement: e.target.value }
                            setEditingQuestion({ ...editingQuestion, pairs: newPairs })
                          }}
                          placeholder="Statement"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={pair.match}
                            onChange={(e) => {
                              const newPairs = [...(editingQuestion.pairs || [])]
                              newPairs[index] = { ...pair, match: e.target.value }
                              setEditingQuestion({ ...editingQuestion, pairs: newPairs })
                            }}
                            placeholder="Match"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newPairs = [...(editingQuestion.pairs || [])]
                              newPairs.splice(index, 1)
                              setEditingQuestion({ ...editingQuestion, pairs: newPairs })
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
                        setEditingQuestion({
                          ...editingQuestion,
                          pairs: [...(editingQuestion.pairs || []), { statement: "", match: "" }],
                        })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Pair
                    </Button>
                  </div>
                )}

                {editingQuestion.type === "code" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Model Answer (Pseudocode)</Label>
                      <Textarea
                        value={
                          Array.isArray(editingQuestion.model_answer)
                            ? editingQuestion.model_answer.join(", ")
                            : typeof editingQuestion.model_answer === "boolean"
                              ? editingQuestion.model_answer
                                ? "true"
                                : "false"
                              : editingQuestion.model_answer || ""
                        }
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, model_answer: e.target.value })}
                        rows={5}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model Answer ({editingQuestion.language})</Label>
                      <Textarea
                        value={editingQuestion.model_answer_code}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, model_answer_code: e.target.value })}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={editingQuestion.language}
                        onValueChange={(value) => setEditingQuestion({ ...editingQuestion, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {editingQuestion.type === "true-false" && (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select
                      value={
                        typeof editingQuestion.model_answer === "boolean"
                          ? editingQuestion.model_answer
                            ? "true"
                            : "false"
                          : "false"
                      }
                      onValueChange={(value) => {
                        const boolValue = value === "true"
                        setEditingQuestion({
                          ...editingQuestion,
                          model_answer: boolValue,
                          correct_answer: boolValue,
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {editingQuestion.type === "short-answer" && (
                  <div className="space-y-2">
                    <Label>Model Answer</Label>
                    <Textarea
                      value={
                        Array.isArray(editingQuestion.model_answer)
                          ? editingQuestion.model_answer.join(", ")
                          : typeof editingQuestion.model_answer === "boolean"
                            ? editingQuestion.model_answer
                              ? "true"
                              : "false"
                            : editingQuestion.model_answer || ""
                      }
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          model_answer: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  </div>
                )}

                {editingQuestion.type === "essay" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Model Answer</Label>
                      <Textarea
                        value={(editingQuestion as Question & { rubric?: string }).rubric || ""}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, rubric: e.target.value } as Question & {
                            rubric?: string
                          })
                        }
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rubric</Label>
                      <Textarea
                        value={(editingQuestion as Question & { rubric?: string }).rubric || ""}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, rubric: e.target.value } as Question & {
                            rubric?: string
                          })
                        }
                        rows={6}
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-3 pt-6 border-t mt-6">
                <Button variant="outline" onClick={() => setEditingQuestion(null)} className="px-6">
                  Cancel
                </Button>
                <Button onClick={() => handleSave(editingQuestion)} className="bg-blue-600 hover:bg-blue-700 px-6">
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={!!addingQuestion} onOpenChange={() => setAddingQuestion(null)}>
        <DialogContent className="min-w-[60%] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="flex items-center gap-2 text-2xl font-semibold">
              <Plus className="w-6 h-6" />
              Add New Question
            </DialogTitle>
          </DialogHeader>
          {addingQuestion && (
            <div className="space-y-10 py-6">
              {/* Basic Information Section */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="question-id" className="text-base font-medium">
                    Question ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="question-id"
                    value={addingQuestion.id}
                    onChange={(e) => setAddingQuestion({ ...addingQuestion, id: e.target.value })}
                    placeholder="Enter unique question ID"
                    className="text-base w-full"
                    required
                  />
                  {addErrors.id && <div className="text-red-500 text-sm mt-1">{addErrors.id}</div>}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="question-type" className="text-base font-medium">
                    Question Type
                  </Label>
                  <Select
                    value={addingQuestion.type}
                    onValueChange={(value) => setAddingQuestion({ ...addingQuestion, type: value as Question["type"] })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
                      <SelectItem value="matching">Matching</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="question-text" className="text-base font-medium">
                    Question Text <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="question-text"
                    value={addingQuestion.question_text}
                    onChange={(e) => setAddingQuestion({ ...addingQuestion, question_text: e.target.value })}
                    rows={4}
                    className="resize-none text-base w-full min-h-[120px]"
                    required
                  />
                  {addErrors.question_text && (
                    <div className="text-red-500 text-sm mt-1">{addErrors.question_text}</div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="explanation" className="text-base font-medium">
                    Explanation
                  </Label>
                  <Textarea
                    id="explanation"
                    value={addingQuestion.explanation || ""}
                    onChange={(e) => setAddingQuestion({ ...addingQuestion, explanation: e.target.value })}
                    rows={4}
                    className="resize-none text-base w-full min-h-[120px]"
                  />
                </div>

                <Label className="text-base font-medium">Subtopics</Label>
                <div className="mb-4 max-h-64 overflow-y-auto border rounded-md p-3 bg-muted/20">
                  {groupedSubtopics.map((topic) => (
                    <div key={topic.id} className="mb-2">
                      <div className="font-semibold text-sm mb-1 text-muted-foreground">
                        {topic.topicnumber} - {topic.name}
                      </div>
                      {topic.subtopics.length === 0 ? (
                        <div className="text-xs text-muted-foreground italic mb-2">No subtopics</div>
                      ) : (
                        topic.subtopics.map((sub) => (
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
                        ))
                      )}
                    </div>
                  ))}
                  {addErrors.subtopics && <div className="text-red-500 text-sm mt-1">{addErrors.subtopics}</div>}
                </div>
              </div>

              {/* Type-specific Configuration Section */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold mb-8 flex items-center gap-3">
                  {(() => {
                    const IconComponent = questionTypeIcons[addingQuestion.type as keyof typeof questionTypeIcons]
                    return <IconComponent className="w-6 h-6" />
                  })()}
                  {addingQuestion.type.replace("-", " ")} Configuration
                </h3>

                <div className="space-y-8">
                  {addingQuestion.type === "multiple-choice" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Options</Label>
                        <div className="space-y-3">
                          {addingQuestion.options?.map((option, index) => (
                            <div key={index} className="flex gap-3">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(addingQuestion.options || [])]
                                  newOptions[index] = e.target.value
                                  setAddingQuestion({ ...addingQuestion, options: newOptions })
                                }}
                                placeholder={`Option ${index + 1}`}
                                className="h-12"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newOptions = [...(addingQuestion.options || [])]
                                  newOptions.splice(index, 1)
                                  setAddingQuestion({ ...addingQuestion, options: newOptions })
                                }}
                                className="h-12 w-12"
                              >
                                <Trash2 className="w-5 h-5" />
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
                            className="h-12"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Correct Answer</Label>
                        <Select
                          value={addingQuestion.correctAnswerIndex?.toString()}
                          onValueChange={(value) =>
                            setAddingQuestion({ ...addingQuestion, correctAnswerIndex: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {addingQuestion.options?.map((option, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                Option {index + 1}: {option.substring(0, 50)}
                                {option.length > 50 ? "..." : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {addingQuestion.type === "fill-in-the-blank" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Options</Label>
                        <div className="space-y-3">
                          {addingQuestion.options?.map((option, index) => (
                            <div key={index} className="flex gap-3">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(addingQuestion.options || [])]
                                  newOptions[index] = e.target.value
                                  setAddingQuestion({ ...addingQuestion, options: newOptions })
                                }}
                                placeholder={`Option ${index + 1}`}
                                className="h-12"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newOptions = [...(addingQuestion.options || [])]
                                  newOptions.splice(index, 1)
                                  setAddingQuestion({ ...addingQuestion, options: newOptions })
                                }}
                                className="h-12 w-12"
                              >
                                <Trash2 className="w-5 h-5" />
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
                            className="h-12"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Correct Answers</Label>
                        <div className="space-y-3">
                          {Array.isArray(addingQuestion.model_answer) &&
                            addingQuestion.model_answer.map((answer, index) => (
                              <div key={index} className="flex gap-3">
                                <Input
                                  value={answer}
                                  onChange={(e) => {
                                    const newAnswers = [...(addingQuestion.model_answer as string[])]
                                    newAnswers[index] = e.target.value
                                    setAddingQuestion({ ...addingQuestion, model_answer: newAnswers })
                                  }}
                                  placeholder={`Answer ${index + 1}`}
                                  className="h-12"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const newAnswers = [...(addingQuestion.model_answer as string[])]
                                    newAnswers.splice(index, 1)
                                    setAddingQuestion({ ...addingQuestion, model_answer: newAnswers })
                                  }}
                                  className="h-12 w-12"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </div>
                            ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setAddingQuestion({
                                ...addingQuestion,
                                model_answer: [...((addingQuestion.model_answer as string[]) || []), ""],
                              })
                            }}
                            className="h-12"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Answer
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="order-important"
                          checked={addingQuestion.order_important}
                          onCheckedChange={(checked) =>
                            setAddingQuestion({ ...addingQuestion, order_important: checked })
                          }
                        />
                        <Label htmlFor="order-important" className="text-base font-medium">
                          Order Important
                        </Label>
                      </div>
                    </div>
                  )}

                  {addingQuestion.type === "matching" && (
                    <div className="space-y-6">
                      <Label className="text-base font-medium">Matching Pairs</Label>
                      <div className="space-y-3">
                        {addingQuestion.pairs?.map((pair, index) => (
                          <div key={index} className="grid grid-cols-2 gap-3">
                            <Input
                              value={pair.statement}
                              onChange={(e) => {
                                const newPairs = [...(addingQuestion.pairs || [])]
                                newPairs[index] = { ...pair, statement: e.target.value }
                                setAddingQuestion({ ...addingQuestion, pairs: newPairs })
                              }}
                              placeholder="Statement"
                              className="h-12"
                            />
                            <div className="flex gap-3">
                              <Input
                                value={pair.match}
                                onChange={(e) => {
                                  const newPairs = [...(addingQuestion.pairs || [])]
                                  newPairs[index] = { ...pair, match: e.target.value }
                                  setAddingQuestion({ ...addingQuestion, pairs: newPairs })
                                }}
                                placeholder="Match"
                                className="h-12"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newPairs = [...(addingQuestion.pairs || [])]
                                  newPairs.splice(index, 1)
                                  setAddingQuestion({ ...addingQuestion, pairs: newPairs })
                                }}
                                className="h-12 w-12"
                              >
                                <Trash2 className="w-5 h-5" />
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
                          className="h-12"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add Pair
                        </Button>
                      </div>
                    </div>
                  )}

                  {addingQuestion.type === "code" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Model Answer (Pseudocode)</Label>
                        <Textarea
                          value={
                            Array.isArray(addingQuestion.model_answer)
                              ? addingQuestion.model_answer.join(", ")
                              : typeof addingQuestion.model_answer === "boolean"
                                ? addingQuestion.model_answer
                                  ? "true"
                                  : "false"
                                : addingQuestion.model_answer || ""
                          }
                          onChange={(e) => setAddingQuestion({ ...addingQuestion, model_answer: e.target.value })}
                          rows={5}
                          className="font-mono text-sm min-h-[120px]"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Model Answer ({addingQuestion.language})</Label>
                        <Textarea
                          value={addingQuestion.model_answer_code}
                          onChange={(e) => setAddingQuestion({ ...addingQuestion, model_answer_code: e.target.value })}
                          rows={8}
                          className="font-mono text-sm min-h-[200px]"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Language</Label>
                        <Select
                          value={addingQuestion.language}
                          onValueChange={(value) => setAddingQuestion({ ...addingQuestion, language: value })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {addingQuestion.type === "true-false" && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Correct Answer</Label>
                      <Select
                        value={
                          typeof addingQuestion.model_answer === "boolean"
                            ? addingQuestion.model_answer
                              ? "true"
                              : "false"
                            : "false"
                        }
                        onValueChange={(value) => {
                          const boolValue = value === "true"
                          setAddingQuestion({
                            ...addingQuestion,
                            model_answer: boolValue,
                            correct_answer: boolValue,
                          })
                        }}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {addingQuestion.type === "short-answer" && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Model Answer</Label>
                      <Textarea
                        value={
                          Array.isArray(addingQuestion.model_answer)
                            ? addingQuestion.model_answer.join(", ")
                            : typeof addingQuestion.model_answer === "boolean"
                              ? addingQuestion.model_answer
                                ? "true"
                                : "false"
                              : addingQuestion.model_answer || ""
                        }
                        onChange={(e) =>
                          setAddingQuestion({
                            ...addingQuestion,
                            model_answer: e.target.value,
                          })
                        }
                        rows={6}
                        className="min-h-[150px]"
                      />
                    </div>
                  )}

                  {addingQuestion.type === "essay" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Model Answer</Label>
                        <Textarea
                          value={
                            Array.isArray(addingQuestion.model_answer)
                              ? addingQuestion.model_answer.join(", ")
                              : typeof addingQuestion.model_answer === "boolean"
                                ? addingQuestion.model_answer
                                  ? "true"
                                  : "false"
                                : addingQuestion.model_answer || ""
                          }
                          onChange={(e) =>
                            setAddingQuestion({
                              ...addingQuestion,
                              model_answer: e.target.value,
                            })
                          }
                          rows={8}
                          className="min-h-[200px]"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Rubric</Label>
                        <Textarea
                          value={(addingQuestion as Question & { rubric?: string }).rubric || ""}
                          onChange={(e) =>
                            setAddingQuestion({ ...addingQuestion, rubric: e.target.value } as Question & {
                              rubric?: string
                            })
                          }
                          rows={8}
                          className="min-h-[200px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-3 pt-6 border-t mt-8">
                <Button variant="outline" onClick={() => setAddingQuestion(null)} className="h-12 px-8">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveNew(addingQuestion)}
                  className="bg-blue-600 hover:bg-blue-700 h-12 px-8"
                >
                  Create Question
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
