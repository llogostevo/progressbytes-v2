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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
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
  const [addingSubtopicIds, setAddingSubtopicIds] = useState<string[]>([])
  const supabase = createClient()

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

    setFilteredQuestions(filtered)
  }, [questions, searchTerm, selectedTopic])

  const handleInlineEdit = (questionId: string, currentText: string) => {
    setEditingQuestionId(questionId)
    setEditingText(currentText)
  }

  const handleSaveInlineEdit = async (questionId: string) => {
    try {
      const { error } = await supabase.from("questions").update({ question_text: editingText }).eq("id", questionId)

      if (error) throw error

      await fetchQuestions()
      setEditingQuestionId(null)
      setEditingText("")
      toast.success("Question updated successfully")
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question")
    }
  }

  const handleCancelInlineEdit = () => {
    setEditingQuestionId(null)
    setEditingText("")
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

  const handleAdd = () => {
    setAddingQuestion({
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
    })
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

    try {
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
        case "short-answer":
          await supabase.from("short_answer_questions").insert({
            question_id: questionData.id,
            model_answer: newQuestion.model_answer,
          })
          break
        // Add other question types as needed
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
    <div className="flex h-screen bg-background">
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
              onClick={() => setSelectedTopic("all")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedTopic === "all"
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
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {topic.topicnumber} - {topic.name}
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
                      onClick={() => setSelectedTopic(topic.slug)}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                        selectedTopic === topic.slug
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
                            // Filter by subtopic - you'd need to implement this logic
                            setSelectedTopic(topic.slug)
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-sidebar-accent/50 transition-colors"
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

        <div className="p-4 border-t border-sidebar-border">
          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {selectedTopic === "all"
                  ? "All Questions"
                  : topics.find((t) => t.slug === selectedTopic)?.name || "Questions"}
              </h1>
              <p className="text-muted-foreground">
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value="all">
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                </SelectContent>
              </Select>
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
                            <div className="space-y-2">
                              <Textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="resize-none"
                                rows={2}
                              />
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
                              onClick={() => handleInlineEdit(question.id, question.question_text)}
                            >
                              <p className="text-foreground font-medium leading-relaxed">{question.question_text}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>ID: {question.id}</span>
                                <span>Created: {new Date(question.created_at).toLocaleDateString()}</span>
                                {question.model_answer && (
                                  <span>
                                    Answer:{" "}
                                    {Array.isArray(question.model_answer)
                                      ? question.model_answer.join(", ")
                                      : String(question.model_answer).substring(0, 50)}
                                    {String(question.model_answer).length > 50 ? "..." : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive">
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
      <Dialog open={!!addingQuestion} onOpenChange={() => setAddingQuestion(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Question
            </DialogTitle>
          </DialogHeader>
          {addingQuestion && (
            <div className="space-y-6 py-4">
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
                  <Label htmlFor="question-type">Question Type</Label>
                  <Select
                    value={addingQuestion.type}
                    onValueChange={(value) => setAddingQuestion({ ...addingQuestion, type: value as Question["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="space-y-2">
                <Label>Subtopics *</Label>
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
              </div>

              {addingQuestion.type === "multiple-choice" && (
                <div className="space-y-4">
                  <Label>Options</Label>
                  {addingQuestion.options?.map((option, index) => (
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
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddingQuestion(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveNew(addingQuestion)}>Create Question</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
