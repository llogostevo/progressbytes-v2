"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import type { Question } from "@/lib/types"

interface FillInTheBlankQuestionProps {
    question: Question
    onAnswerSelected: (isCorrect: boolean) => void
}

export function FillInTheBlankQuestion({ question, onAnswerSelected }: FillInTheBlankQuestionProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [isAnswered, setIsAnswered] = useState(false)
    const [availableOptions, setAvailableOptions] = useState<string[]>(question.options || [])

    // Split the question text into parts, replacing blanks with placeholders
    const questionParts = question.question_text.split("______")
    const blankCount = questionParts.length - 1

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const { source, destination } = result

        // If dragging from available options to a blank
        if (source.droppableId === "options" && destination.droppableId.startsWith("blank-")) {
            const blankIndex = parseInt(destination.droppableId.split("-")[1])
            const newSelectedOptions = [...selectedOptions]
            newSelectedOptions[blankIndex] = availableOptions[source.index]

            const newAvailableOptions = [...availableOptions]
            newAvailableOptions.splice(source.index, 1)

            setSelectedOptions(newSelectedOptions)
            setAvailableOptions(newAvailableOptions)
        }
        // If dragging from one blank to another
        else if (source.droppableId.startsWith("blank-") && destination.droppableId.startsWith("blank-")) {
            const sourceIndex = parseInt(source.droppableId.split("-")[1])
            const destIndex = parseInt(destination.droppableId.split("-")[1])

            const newSelectedOptions = [...selectedOptions]
            const temp = newSelectedOptions[sourceIndex]
            newSelectedOptions[sourceIndex] = newSelectedOptions[destIndex]
            newSelectedOptions[destIndex] = temp

            setSelectedOptions(newSelectedOptions)
        }
        // If dragging from a blank back to options
        else if (source.droppableId.startsWith("blank-") && destination.droppableId === "options") {
            const blankIndex = parseInt(source.droppableId.split("-")[1])
            const newAvailableOptions = [...availableOptions]
            newAvailableOptions.splice(destination.index, 0, selectedOptions[blankIndex])

            const newSelectedOptions = [...selectedOptions]
            newSelectedOptions[blankIndex] = ""

            setSelectedOptions(newSelectedOptions)
            setAvailableOptions(newAvailableOptions)
        }
    }

    //   const handleSubmit = () => {
    //     const isCorrect = selectedOptions.every((option, index) => {
    //       const modelAnswer = Array.isArray(question.model_answer) 
    //         ? question.model_answer[index]
    //         : question.model_answer
    //       return option === modelAnswer
    //     })
    //     setIsAnswered(true)
    //     onAnswerSelected(isCorrect)
    //   }

    const handleSubmit = () => {
        const modelAnswer = Array.isArray(question.model_answer)
            ? question.model_answer
            : [question.model_answer]

        let isCorrect = false

        if (question.order_important) {
            // Order matters: check item by item
            isCorrect = selectedOptions.every((option, index) => option === modelAnswer[index])
        } else {
            // Order doesn't matter: just check contents
            const sortedSelected = [...selectedOptions].sort()
            const sortedModel = [...modelAnswer].sort()
            isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedModel)
        }

        setIsAnswered(true)
        onAnswerSelected(isCorrect)
    }

    return (
        <div className="space-y-6">
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="space-y-4">
                    {/* Question text with blanks */}
                    <div className="text-lg">
                        {questionParts.map((part, index) => (
                            <span key={index}>
                                {part}
                                {index < questionParts.length - 1 && (
                                    <Droppable droppableId={`blank-${index}`}>
                                        {(provided) => (
                                            <span
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`inline-block min-w-[100px] h-8 mx-1 px-2 py-1 rounded border ${selectedOptions[index]
                                                        ? "bg-emerald-50 border-emerald-200"
                                                        : "bg-gray-50 border-gray-200"
                                                    }`}
                                            >
                                                {selectedOptions[index] && (
                                                    <Draggable draggableId={`selected-${index}`} index={0}>
                                                        {(provided) => (
                                                            <span
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="inline-block"
                                                            >
                                                                {selectedOptions[index]}
                                                            </span>
                                                        )}
                                                    </Draggable>
                                                )}
                                                {provided.placeholder}
                                            </span>
                                        )}
                                    </Droppable>
                                )}
                            </span>
                        ))}
                    </div>

                    {/* Available options */}
                    <Droppable droppableId="options" direction="horizontal">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg"
                            >
                                {availableOptions.map((option, index) => (
                                    <Draggable key={option} draggableId={`option-${option}`} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="px-3 py-1 bg-white rounded border border-gray-200 shadow-sm"
                                            >
                                                {option}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </DragDropContext>

            {/* Submit button */}
            <Button
                onClick={handleSubmit}
                disabled={isAnswered || selectedOptions.length !== blankCount || selectedOptions.some(option => !option)}
            >
                Submit Answer
            </Button>

            {/* Feedback */}
            {isAnswered && (
                <div className="flex items-center gap-2 text-sm">
                    {selectedOptions.every((option, index) => {
                        const modelAnswer = Array.isArray(question.model_answer)
                            ? question.model_answer[index]
                            : question.model_answer
                        return option === modelAnswer
                    }) ? (
                        <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Correct! Well done!</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Not quite right. Try again!</span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
} 