'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Question } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
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
            subtopic:subtopics(
              topic:topics(*)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the questions to match our Question type
      const transformedQuestions = data.map((q: any) => ({
        id: q.id,
        type: q.type,
        topic: q.subtopic_question_link?.[0]?.subtopic?.topic?.slug || '',
        question_text: q.question_text,
        explanation: q.explanation,
        created_at: q.created_at,
        model_answer: q.model_answer || '',
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
          pairs: q.matching_questions?.map((mq: any) => ({
            statement: mq.statement,
            match: mq.match
          }))
        }),
        ...(q.type === 'code' && {
          model_answer_python: q.code_questions?.model_answer_code,
          language: q.code_questions?.language
        }),
        ...(q.type === 'true-false' && {
          model_answer: q.true_false_questions?.correct_answer
        }),
        ...(q.type === 'short-answer' && {
          model_answer: q.short_answer_questions?.model_answer
        }),
        ...(q.type === 'essay' && {
          model_answer: q.essay_questions?.model_answer,
          rubric: q.essay_questions?.rubric
        })
      }))

      setQuestions(transformedQuestions)
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
  }

  const handleSave = async (updatedQuestion: Question) => {
    try {
      // Update the base question
      const { error: questionError } = await supabase
        .from('questions')
        .update({
          question_text: updatedQuestion.question_text,
          explanation: updatedQuestion.explanation,
          type: updatedQuestion.type
        })
        .eq('id', updatedQuestion.id)

      if (questionError) throw questionError

      // Update type-specific data
      switch (updatedQuestion.type) {
        case 'multiple-choice':
          await supabase
            .from('multiple_choice_questions')
            .update({
              options: updatedQuestion.options,
              correct_answer_index: updatedQuestion.correctAnswerIndex,
              model_answer: updatedQuestion.model_answer
            })
            .eq('question_id', updatedQuestion.id)
          break
        case 'fill-in-the-blank':
          await supabase
            .from('fill_in_the_blank_questions')
            .update({
              options: updatedQuestion.options,
              correct_answers: updatedQuestion.model_answer,
              order_important: updatedQuestion.order_important
            })
            .eq('question_id', updatedQuestion.id)
          break
        case 'matching':
          // Delete existing pairs and insert new ones
          await supabase
            .from('matching_questions')
            .delete()
            .eq('question_id', updatedQuestion.id)
          
          if (updatedQuestion.pairs) {
            await supabase
              .from('matching_questions')
              .insert(
                updatedQuestion.pairs.map(pair => ({
                  question_id: updatedQuestion.id,
                  statement: pair.statement,
                  match: pair.match
                }))
              )
          }
          break
        case 'code':
          await supabase
            .from('code_questions')
            .update({
              model_answer_code: updatedQuestion.model_answer_python,
              language: updatedQuestion.language,
              model_answer: updatedQuestion.model_answer
            })
            .eq('question_id', updatedQuestion.id)
          break
        case 'true-false':
          await supabase
            .from('true_false_questions')
            .update({
              correct_answer: updatedQuestion.correct_answer,
              model_answer: updatedQuestion.model_answer
            })
            .eq('question_id', updatedQuestion.id)
          break
        case 'short-answer':
          await supabase
            .from('short_answer_questions')
            .update({
              model_answer: updatedQuestion.model_answer
            })
            .eq('question_id', updatedQuestion.id)
          break
        case 'essay':
          await supabase
            .from('essay_questions')
            .update({
              model_answer: updatedQuestion.model_answer,
              rubric: (updatedQuestion as any).rubric
            })
            .eq('question_id', updatedQuestion.id)
          break
      }

      await fetchQuestions()
      setEditingQuestion(null)
    } catch (error) {
      console.error('Error updating question:', error)
    }
  }

  if (loading) {
    return <div>Loading questions...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Question</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Topic</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id} className="border-b">
                    <td className="p-4 align-middle">{question.id}</td>
                    <td className="p-4 align-middle">
                      <Badge variant="secondary">{question.type}</Badge>
                    </td>
                    <td className="p-4 align-middle">{question.question_text}</td>
                    <td className="p-4 align-middle">{question.topic}</td>
                    <td className="p-4 align-middle">
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(question)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question-text">Question Text</Label>
                <Textarea
                  id="question-text"
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  rows={3}
                />
              </div>

              {editingQuestion.type === 'multiple-choice' && (
                <div className="space-y-2">
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
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = [...(editingQuestion.options || [])]
                          newOptions.splice(index, 1)
                          setEditingQuestion({ ...editingQuestion, options: newOptions })
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingQuestion({
                        ...editingQuestion,
                        options: [...(editingQuestion.options || []), '']
                      })
                    }}
                  >
                    Add Option
                  </Button>
                  <div className="space-y-2">
                    <Label>Correct Answer Index</Label>
                    <Select
                      value={editingQuestion.correctAnswerIndex?.toString()}
                      onValueChange={(value) => setEditingQuestion({ ...editingQuestion, correctAnswerIndex: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {editingQuestion.options?.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Option {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {editingQuestion.type === 'fill-in-the-blank' && (
                <div className="space-y-2">
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
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = [...(editingQuestion.options || [])]
                          newOptions.splice(index, 1)
                          setEditingQuestion({ ...editingQuestion, options: newOptions })
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingQuestion({
                        ...editingQuestion,
                        options: [...(editingQuestion.options || []), '']
                      })
                    }}
                  >
                    Add Option
                  </Button>
                  <div className="space-y-2">
                    <Label>Correct Answers</Label>
                    {Array.isArray(editingQuestion.model_answer) && editingQuestion.model_answer.map((answer, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={answer}
                          onChange={(e) => {
                            const newAnswers = [...(editingQuestion.model_answer as string[])]
                            newAnswers[index] = e.target.value
                            setEditingQuestion({ ...editingQuestion, model_answer: newAnswers })
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newAnswers = [...(editingQuestion.model_answer as string[])]
                            newAnswers.splice(index, 1)
                            setEditingQuestion({ ...editingQuestion, model_answer: newAnswers })
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingQuestion({
                          ...editingQuestion,
                          model_answer: [...(editingQuestion.model_answer as string[] || []), '']
                        })
                      }}
                    >
                      Add Answer
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="order-important"
                      checked={editingQuestion.order_important}
                      onCheckedChange={(checked) => setEditingQuestion({ ...editingQuestion, order_important: checked })}
                    />
                    <Label htmlFor="order-important">Order Important</Label>
                  </div>
                </div>
              )}

              {editingQuestion.type === 'matching' && (
                <div className="space-y-2">
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
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newPairs = [...(editingQuestion.pairs || [])]
                            newPairs.splice(index, 1)
                            setEditingQuestion({ ...editingQuestion, pairs: newPairs })
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingQuestion({
                        ...editingQuestion,
                        pairs: [...(editingQuestion.pairs || []), { statement: '', match: '' }]
                      })
                    }}
                  >
                    Add Pair
                  </Button>
                </div>
              )}

              {editingQuestion.type === 'code' && (
                <div className="space-y-2">
                  <Label>Model Answer (Pseudocode)</Label>
                  <Textarea
                    value={
                      Array.isArray(editingQuestion.model_answer)
                        ? editingQuestion.model_answer.join(', ')
                        : typeof editingQuestion.model_answer === 'boolean'
                          ? editingQuestion.model_answer ? 'true' : 'false'
                          : editingQuestion.model_answer || ''
                    }
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, model_answer: e.target.value })}
                    rows={5}
                  />
                  <Label>Model Answer (Python)</Label>
                  <Textarea
                    value={editingQuestion.model_answer_python}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, model_answer_python: e.target.value })}
                    rows={5}
                    className="font-mono"
                  />
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

              {editingQuestion.type === 'true-false' && (
                <div className="space-y-4">
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
                        const boolValue = value === "true";
                        setEditingQuestion({
                          ...editingQuestion,
                          model_answer: boolValue,
                          correct_answer: boolValue
                        });
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
                </div>
              )}

              {editingQuestion.type === 'short-answer' && (
                <div className="space-y-2">
                  <Label>Model Answer</Label>
                  <Textarea
                    value={
                      Array.isArray(editingQuestion.model_answer)
                        ? editingQuestion.model_answer.join(', ')
                        : typeof editingQuestion.model_answer === 'boolean'
                          ? editingQuestion.model_answer ? 'true' : 'false'
                          : editingQuestion.model_answer || ''
                    }
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      model_answer: e.target.value
                    })}
                    rows={5}
                  />
                </div>
              )}

              {editingQuestion.type === 'essay' && (
                <div className="space-y-2">
                  <Label>Model Answer</Label>
                  <Textarea
                    value={
                      Array.isArray(editingQuestion.model_answer)
                        ? editingQuestion.model_answer.join(', ')
                        : typeof editingQuestion.model_answer === 'boolean'
                          ? editingQuestion.model_answer ? 'true' : 'false'
                          : editingQuestion.model_answer || ''
                    }
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      model_answer: e.target.value
                    })}
                    rows={5}
                  />
                  <Label>Rubric</Label>
                  <Textarea
                    value={(editingQuestion as any).rubric || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, rubric: e.target.value } as any)}
                    rows={5}
                  />
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSave(editingQuestion)}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
} 