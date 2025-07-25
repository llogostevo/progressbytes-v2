"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import type { Question } from "@/lib/types"

interface FillInTheBlankQuestionProps {
    question: Question
    onAnswerSelected: (isCorrect: boolean, selectedIndexes: number[]) => void
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
        const sourceId = source.droppableId
        const destId = destination.droppableId

        // Create new arrays for both states
        const newSelectedOptions = [...selectedOptions]
        const newAvailableOptions = [...availableOptions]

        // Handle dragging from available options to a blank
        if (sourceId === "options" && destId.startsWith("blank-")) {
            const blankIndex = parseInt(destId.split("-")[1])
            const option = newAvailableOptions[source.index]
            
            // If there's already a word in the blank, move it back to available options
            if (newSelectedOptions[blankIndex]) {
                newAvailableOptions.push(newSelectedOptions[blankIndex])
            }
            
            // Move the selected option to the blank
            newSelectedOptions[blankIndex] = option
            newAvailableOptions.splice(source.index, 1)
        }
        // Handle dragging from a blank to available options
        else if (sourceId.startsWith("blank-") && destId === "options") {
            const blankIndex = parseInt(sourceId.split("-")[1])
            const option = newSelectedOptions[blankIndex]
            
            // Move the option back to available options
            newAvailableOptions.splice(destination.index, 0, option)
            newSelectedOptions[blankIndex] = ""
        }
        // Handle dragging between blanks
        else if (sourceId.startsWith("blank-") && destId.startsWith("blank-")) {
            const sourceIndex = parseInt(sourceId.split("-")[1])
            const destIndex = parseInt(destId.split("-")[1])
            
            // If there's already a word in the destination blank, move it to available options
            if (newSelectedOptions[destIndex]) {
                newAvailableOptions.push(newSelectedOptions[destIndex])
            }
            
            // Move the word from source to destination
            newSelectedOptions[destIndex] = newSelectedOptions[sourceIndex]
            newSelectedOptions[sourceIndex] = ""
        }

        // Update both states
        setSelectedOptions(newSelectedOptions)
        setAvailableOptions(newAvailableOptions)
    }

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

        // Get the indexes of the selected options in the original options array
        const selectedIndexes = selectedOptions.map(option => 
            question.options?.indexOf(option) ?? -1
        )

        setIsAnswered(true)
        onAnswerSelected(isCorrect, selectedIndexes)
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
                                                className={`inline-block min-w-[100px] h-8 mx-1 px-2 py-1 rounded border ${
                                                    selectedOptions[index]
                                                        ? "bg-emerald-50 border-emerald-200"
                                                        : "bg-gray-50 border-gray-200"
                                                }`}
                                            >
                                                {selectedOptions[index] && (
                                                    <Draggable 
                                                        draggableId={`selected-${index}-${selectedOptions[index]}`} 
                                                        index={0}
                                                    >
                                                        {(provided) => (
                                                            <span
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="inline-block cursor-move"
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
                                                className="px-3 py-1 bg-white rounded border border-gray-200 shadow-sm cursor-move"
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