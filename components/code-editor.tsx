"use client"

import { useState } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autocomplete?: boolean
  onAutocompleteChange?: (enabled: boolean) => void
}

export function CodeEditor({ 
  value, 
  onChange, 
  disabled, 
  autocomplete = false,
  onAutocompleteChange 
}: CodeEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autocomplete"
          checked={autocomplete}
          onChange={(e) => onAutocompleteChange?.(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
        />
        <label htmlFor="autocomplete" className="text-sm font-medium text-gray-700">
          Enable code support <em>(remember you won't get this in the exam)</em>
        </label>
      </div>
      <div className="rounded-md overflow-hidden border border-input">
        <CodeMirror
          value={value}
          height="300px"
          theme={oneDark}
          extensions={[python()]}
          onChange={onChange}
          editable={!disabled}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            autocompletion: autocomplete,
          }}
        />
      </div>
    </div>
  )
} 