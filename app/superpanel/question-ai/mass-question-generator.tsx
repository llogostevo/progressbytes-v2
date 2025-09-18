"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import {
  Brain,
  BookOpen,
  Settings,
  Wand2,
  CheckSquare,
  List,
  FileText,
  ToggleLeft,
  Code,
  PenTool,
  Edit3,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react"

interface CurriculumSpec {
  examBoard: string
  specificationHeading: string
  topic: string
  subtopicHeading: string
  specificationContent: string
  supportingText: string
  markSchemeContent: string
}

interface QuestionType {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  enabled: boolean
  quantity: number
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

const questionTypes: QuestionType[] = [
  {
    id: "multiple-choice",
    name: "Multiple Choice",
    icon: List,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    enabled: false,
    quantity: 1,
  },
  {
    id: "fill-in-the-blank",
    name: "Fill in the Blank",
    icon: FileText,
    color: "bg-green-50 text-green-700 border-green-200",
    enabled: false,
    quantity: 1,
  },
  {
    id: "matching",
    name: "Matching",
    icon: ToggleLeft,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    enabled: false,
    quantity: 1,
  },
  {
    id: "code",
    name: "Code",
    icon: Code,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    enabled: false,
    quantity: 1,
  },
  {
    id: "true-false",
    name: "True/False",
    icon: CheckSquare,
    color: "bg-red-50 text-red-700 border-red-200",
    enabled: false,
    quantity: 1,
  },
  {
    id: "short-answer",
    name: "Short Answer",
    icon: PenTool,
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    enabled: false,
    quantity: 1,
  },
  {
    id: "essay",
    name: "Essay",
    icon: BookOpen,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    enabled: false,
    quantity: 1,
  },
]

export default function MassQuestionGenerator() {
  const [curriculumSpec, setCurriculumSpec] = useState<CurriculumSpec>({
    examBoard: "",
    specificationHeading: "",
    topic: "",
    subtopicHeading: "",
    specificationContent: "",
    supportingText: "",
    markSchemeContent: "",
  })

  const [questionTypeSettings, setQuestionTypeSettings] = useState<QuestionType[]>(questionTypes)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<GeneratedQuestion | null>(null)
  const [currentStep, setCurrentStep] = useState<"input" | "generate" | "review">("input")
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  const handleSpecChange = (field: keyof CurriculumSpec, value: string) => {
    setCurriculumSpec((prev) => ({ ...prev, [field]: value }))
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleQuestionTypeToggle = (id: string, enabled: boolean) => {
    setQuestionTypeSettings((prev) => prev.map((type) => (type.id === id ? { ...type, enabled } : type)))
    // Clear validation error for question types when user selects a type
    if (validationErrors.questionTypes) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.questionTypes
        return newErrors
      })
    }
  }

  const handleQuantityChange = (id: string, quantity: number) => {
    setQuestionTypeSettings((prev) =>
      prev.map((type) => (type.id === id ? { ...type, quantity: Math.max(1, quantity) } : type)),
    )
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!curriculumSpec.topic.trim()) {
      errors.topic = 'Topic is required'
    }
    
    if (!curriculumSpec.subtopicHeading.trim()) {
      errors.subtopicHeading = 'Subtopic heading is required'
    }
    
    if (!curriculumSpec.specificationContent.trim()) {
      errors.specificationContent = 'Specification content is required'
    }
    
    const enabledTypes = questionTypeSettings.filter((type) => type.enabled)
    if (enabledTypes.length === 0) {
      errors.questionTypes = 'At least one question type must be selected'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const generateQuestions = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors before generating questions')
      return
    }

    setIsGenerating(true)
    setCurrentStep("generate")

    try {
      const enabledTypes = questionTypeSettings.filter((type) => type.enabled)
      
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          curriculumSpec,
          questionTypes: enabledTypes.map(type => ({
            id: type.id,
            name: type.name,
            quantity: type.quantity
          }))
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate questions')
      }

      const data = await response.json()
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions were generated. Please try again with different parameters.')
      }
      
      setGeneratedQuestions(data.questions)
      setCurrentStep("review")
      toast.success(`Successfully generated ${data.questions.length} questions!`)
    } catch (error) {
      console.error('Error generating questions:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate questions')
      setCurrentStep("input")
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteQuestion = (id: string) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const editQuestion = (question: GeneratedQuestion) => {
    setEditingQuestion(question)
  }

  const saveEditedQuestion = (updatedQuestion: GeneratedQuestion) => {
    setGeneratedQuestions((prev) => prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)))
    setEditingQuestion(null)
  }

  const createAllQuestions = async () => {
    if (generatedQuestions.length === 0) {
      toast.error("No questions to create")
      return
    }

    setIsGenerating(true)
    try {
      const supabase = createClient()
      let successCount = 0
      let errorCount = 0

      for (const question of generatedQuestions) {
        try {
          // Insert the base question
          const { data: questionData, error: questionError } = await supabase
            .from("questions")
            .insert({
              id: question.id,
              question_text: question.question_text,
              explanation: question.explanation,
              type: question.type,
            })
            .select()
            .single()

          if (questionError) {
            console.error('Error inserting base question:', questionError)
            errorCount++
            continue
          }

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
                correct_answers: Array.isArray(question.model_answer) ? question.model_answer : [question.model_answer],
                order_important: question.order_important || false,
              })
              break
            case "matching":
              if (question.pairs) {
                await supabase.from("matching_questions").insert(
                  question.pairs.map((pair) => ({
                    question_id: questionData.id,
                    statement: pair.statement,
                    match: pair.match,
                  }))
                )
              }
              break
            case "code":
              await supabase.from("code_questions").insert({
                question_id: questionData.id,
                model_answer_code: question.model_answer_code,
                language: question.language,
                model_answer: question.model_answer,
              })
              break
            case "true-false":
              await supabase.from("true_false_questions").insert({
                question_id: questionData.id,
                correct_answer: !!question.model_answer,
                model_answer: !!question.model_answer,
              })
              break
            case "short-answer":
              await supabase.from("short_answer_questions").insert({
                question_id: questionData.id,
                model_answer: question.model_answer,
              })
              break
            case "essay":
              await supabase.from("essay_questions").insert({
                question_id: questionData.id,
                model_answer: question.model_answer,
                rubric: question.rubric,
              })
              break
          }

          successCount++
        } catch (error) {
          console.error('Error creating question:', question.id, error)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} questions created successfully!`)
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} questions failed to create`)
      }

      // Reset the form
      setGeneratedQuestions([])
      setCurrentStep("input")
    } catch (error) {
      console.error("Error creating questions:", error)
      toast.error("Failed to create questions")
    } finally {
      setIsGenerating(false)
    }
  }

  const enabledTypes = questionTypeSettings.filter((type) => type.enabled)
  const totalQuestions = enabledTypes.reduce((sum, type) => sum + type.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary rounded-lg">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Question Generator</h1>
              <p className="text-muted-foreground">Generate multiple questions from curriculum specifications</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: "input", label: "Input Specifications", icon: BookOpen },
              { step: "generate", label: "Generate Questions", icon: Wand2 },
              { step: "review", label: "Review & Create", icon: CheckSquare },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep === step
                      ? "bg-primary border-primary text-primary-foreground"
                      : index < ["input", "generate", "review"].indexOf(currentStep)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep === step ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {index < 2 && <div className="w-16 h-px bg-border ml-4" />}
              </div>
            ))}
          </div>
        </div>

        {currentStep === "input" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Curriculum Specification Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Curriculum Specification
                  </CardTitle>
                  <CardDescription>Enter the curriculum details to generate targeted questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="examBoard">Exam Board</Label>
                      <Input
                        id="examBoard"
                        placeholder="e.g., AQA, Edexcel, OCR"
                        value={curriculumSpec.examBoard}
                        onChange={(e) => handleSpecChange("examBoard", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specHeading">Specification Heading</Label>
                      <Input
                        id="specHeading"
                        placeholder="e.g., Computer Science A-Level"
                        value={curriculumSpec.specificationHeading}
                        onChange={(e) => handleSpecChange("specificationHeading", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic <span className="text-red-500">*</span></Label>
                      <Input
                        id="topic"
                        placeholder="e.g., Programming Fundamentals"
                        value={curriculumSpec.topic}
                        onChange={(e) => handleSpecChange("topic", e.target.value)}
                        className={validationErrors.topic ? "border-red-500" : ""}
                      />
                      {validationErrors.topic && (
                        <p className="text-red-500 text-sm">{validationErrors.topic}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtopic">Subtopic Heading <span className="text-red-500">*</span></Label>
                      <Input
                        id="subtopic"
                        placeholder="e.g., Data Structures"
                        value={curriculumSpec.subtopicHeading}
                        onChange={(e) => handleSpecChange("subtopicHeading", e.target.value)}
                        className={validationErrors.subtopicHeading ? "border-red-500" : ""}
                      />
                      {validationErrors.subtopicHeading && (
                        <p className="text-red-500 text-sm">{validationErrors.subtopicHeading}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specContent">Specification Content <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="specContent"
                      placeholder="Enter the detailed specification content..."
                      className={`min-h-[100px] ${validationErrors.specificationContent ? "border-red-500" : ""}`}
                      value={curriculumSpec.specificationContent}
                      onChange={(e) => handleSpecChange("specificationContent", e.target.value)}
                    />
                    {validationErrors.specificationContent && (
                      <p className="text-red-500 text-sm">{validationErrors.specificationContent}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportingText">Supporting Text</Label>
                    <Textarea
                      id="supportingText"
                      placeholder="Additional context or supporting information..."
                      className="min-h-[80px]"
                      value={curriculumSpec.supportingText}
                      onChange={(e) => handleSpecChange("supportingText", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markScheme">Mark Scheme Content</Label>
                    <Textarea
                      id="markScheme"
                      placeholder="Mark scheme guidelines and expected answers..."
                      className="min-h-[80px]"
                      value={curriculumSpec.markSchemeContent}
                      onChange={(e) => handleSpecChange("markSchemeContent", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Type Selection */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" />
                    Question Types
                  </CardTitle>
                  <CardDescription>Select question types and quantities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {questionTypeSettings.map((type) => {
                        const Icon = type.icon
                        return (
                          <div key={type.id} className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={type.id}
                                checked={type.enabled}
                                onCheckedChange={(checked) => handleQuestionTypeToggle(type.id, !!checked)}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <div className={`p-1.5 rounded border ${type.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <Label htmlFor={type.id} className="text-sm font-medium cursor-pointer">
                                  {type.name}
                                </Label>
                              </div>
                            </div>

                            {type.enabled && (
                              <div className="ml-6 flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground">Quantity:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={type.quantity}
                                  onChange={(e) => handleQuantityChange(type.id, Number.parseInt(e.target.value) || 1)}
                                  className="w-16 h-8 text-xs"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selected Types:</span>
                      <span className="font-medium">{enabledTypes.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Questions:</span>
                      <span className="font-medium">{totalQuestions}</span>
                    </div>
                    
                    {validationErrors.questionTypes && (
                      <p className="text-red-500 text-sm">{validationErrors.questionTypes}</p>
                    )}

                    <Button
                      onClick={generateQuestions}
                      disabled={enabledTypes.length === 0 || !curriculumSpec.topic || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Questions
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentStep === "generate" && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Generating Questions</h3>
                <p className="text-muted-foreground max-w-md">
                  AI is analyzing your curriculum specifications and creating {totalQuestions} questions across{" "}
                  {enabledTypes.length} different types...
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {enabledTypes.map((type) => (
                    <Badge key={type.id} variant="secondary" className="text-xs">
                      {type.quantity}x {type.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "review" && (
          <div className="space-y-6">
            {/* Summary Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" />
                    Generated Questions ({generatedQuestions.length})
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep("input")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Modify Settings
                    </Button>
                    <Button onClick={createAllQuestions} disabled={generatedQuestions.length === 0 || isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create All Questions
                        </>
                      )}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Review and edit questions before adding them to your database</CardDescription>
              </CardHeader>
            </Card>

            {/* Questions List */}
            <div className="grid gap-4">
              {generatedQuestions.map((question, index) => {
                const typeConfig = questionTypes.find((t) => t.id === question.type)
                const Icon = typeConfig?.icon || FileText

                return (
                  <Card key={question.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded border ${typeConfig?.color || "bg-gray-50"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {typeConfig?.name || question.type}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">Question {index + 1}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => editQuestion(question)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteQuestion(question.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Question:</Label>
                          <p className="text-sm mt-1 p-3 bg-muted rounded-md">{question.question_text}</p>
                        </div>

                        {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Options:</Label>
                            <ul className="text-sm mt-1 space-y-1">
                              {question.options.map((option, idx) => (
                                <li
                                  key={idx}
                                  className={`p-2 rounded ${
                                    idx === question.correctAnswerIndex ? "bg-green-50 text-green-700" : "bg-muted"
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}. {option}
                                  {idx === question.correctAnswerIndex && " ✓"}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium">Model Answer:</Label>
                          <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                            {(() => {
                              if (typeof question.model_answer === "boolean") {
                                return question.model_answer ? "True" : "False"
                              } else if (Array.isArray(question.model_answer)) {
                                return question.model_answer.join(", ")
                              } else if (typeof question.model_answer === "object" && question.model_answer !== null) {
                                return JSON.stringify(question.model_answer, null, 2)
                              } else {
                                return String(question.model_answer || "")
                              }
                            })()}
                          </p>
                        </div>

                        {question.explanation && (
                          <div>
                            <Label className="text-sm font-medium">Explanation:</Label>
                            <p className="text-sm mt-1 p-3 bg-muted rounded-md">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Edit Question Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="min-w-[60%] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Edit3 className="w-5 h-5" />
                Edit Generated Question
              </DialogTitle>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-8 py-4">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="edit-question-text" className="text-base font-medium">Question Text</Label>
                    <Textarea
                      id="edit-question-text"
                      value={editingQuestion.question_text}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                      rows={4}
                      className="resize-none text-base w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="edit-explanation" className="text-base font-medium">Explanation</Label>
                    <Textarea
                      id="edit-explanation"
                      value={editingQuestion.explanation || ""}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                      rows={4}
                      className="resize-none text-base w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="edit-difficulty" className="text-base font-medium">Difficulty</Label>
                    <Select
                      value={String(editingQuestion.difficulty || "medium")}
                      onValueChange={(value) => setEditingQuestion({ ...editingQuestion, difficulty: value })}
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
                </div>

                {/* Type-specific fields */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    {(() => {
                      const typeConfig = questionTypes.find((t) => t.id === editingQuestion.type)
                      const Icon = typeConfig?.icon || FileText
                      return <Icon className="w-5 h-5" />
                    })()}
                    {editingQuestion.type.replace("-", " ")} Configuration
                  </h3>

                  {editingQuestion.type === "multiple-choice" && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>Options</Label>
                        {editingQuestion.options && Array.isArray(editingQuestion.options) && editingQuestion.options.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={String(option || "")}
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
                          value={String(editingQuestion.correctAnswerIndex ?? "")}
                          onValueChange={(value) =>
                            setEditingQuestion({ ...editingQuestion, correctAnswerIndex: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {editingQuestion.options && Array.isArray(editingQuestion.options) && editingQuestion.options.map((option, index) => (
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
                        {editingQuestion.options && Array.isArray(editingQuestion.options) && editingQuestion.options.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={String(option || "")}
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
                        {Array.isArray(editingQuestion.model_answer) && editingQuestion.model_answer.length > 0 &&
                          editingQuestion.model_answer.map((answer, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={String(answer || "")}
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
                          id="edit-order-important"
                          checked={editingQuestion.order_important}
                          onCheckedChange={(checked) =>
                            setEditingQuestion({ ...editingQuestion, order_important: checked })
                          }
                        />
                        <Label htmlFor="edit-order-important">Order Important</Label>
                      </div>
                    </div>
                  )}

                  {editingQuestion.type === "matching" && (
                    <div className="space-y-3">
                      <Label>Matching Pairs</Label>
                      {editingQuestion.pairs && Array.isArray(editingQuestion.pairs) && editingQuestion.pairs.length > 0 && editingQuestion.pairs.map((pair, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2">
                          <Input
                            value={String(pair.statement || "")}
                            onChange={(e) => {
                              const newPairs = [...(editingQuestion.pairs || [])]
                              newPairs[index] = { ...pair, statement: e.target.value }
                              setEditingQuestion({ ...editingQuestion, pairs: newPairs })
                            }}
                            placeholder="Statement"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={String(pair.match || "")}
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
                            (() => {
                              if (Array.isArray(editingQuestion.model_answer)) {
                                return editingQuestion.model_answer.join(", ")
                              } else if (typeof editingQuestion.model_answer === "boolean") {
                                return editingQuestion.model_answer ? "true" : "false"
                              } else if (typeof editingQuestion.model_answer === "object" && editingQuestion.model_answer !== null) {
                                return JSON.stringify(editingQuestion.model_answer, null, 2)
                              } else {
                                return String(editingQuestion.model_answer || "")
                              }
                            })()
                          }
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, model_answer: e.target.value })}
                          rows={5}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Model Answer ({editingQuestion.language})</Label>
                        <Textarea
                          value={String(editingQuestion.model_answer_code || "")}
                          onChange={(e) =>
                            setEditingQuestion({ ...editingQuestion, model_answer_code: e.target.value })
                          }
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select
                          value={String(editingQuestion.language || "")}
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
                            ? String(editingQuestion.model_answer)
                            : "false"
                        }
                        onValueChange={(value) => {
                          const boolValue = value === "true"
                          setEditingQuestion({
                            ...editingQuestion,
                            model_answer: boolValue,
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
                          (() => {
                            if (Array.isArray(editingQuestion.model_answer)) {
                              return editingQuestion.model_answer.join(", ")
                            } else if (typeof editingQuestion.model_answer === "boolean") {
                              return editingQuestion.model_answer ? "true" : "false"
                            } else if (typeof editingQuestion.model_answer === "object" && editingQuestion.model_answer !== null) {
                              return JSON.stringify(editingQuestion.model_answer, null, 2)
                            } else {
                              return String(editingQuestion.model_answer || "")
                            }
                          })()
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
                          value={
                            (() => {
                              if (Array.isArray(editingQuestion.model_answer)) {
                                return editingQuestion.model_answer.join(", ")
                              } else if (typeof editingQuestion.model_answer === "boolean") {
                                return editingQuestion.model_answer ? "true" : "false"
                              } else if (typeof editingQuestion.model_answer === "object" && editingQuestion.model_answer !== null) {
                                return JSON.stringify(editingQuestion.model_answer, null, 2)
                              } else {
                                return String(editingQuestion.model_answer || "")
                              }
                            })()
                          }
                          onChange={(e) =>
                            setEditingQuestion({
                              ...editingQuestion,
                              model_answer: e.target.value,
                            })
                          }
                          rows={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rubric</Label>
                        <Textarea
                          value={String(editingQuestion.rubric || "")}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, rubric: e.target.value })}
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
                  <Button onClick={() => saveEditedQuestion(editingQuestion)} className="bg-blue-600 hover:bg-blue-700 px-6">
                    Save Changes
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
