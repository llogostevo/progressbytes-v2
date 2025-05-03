"use client"

import { useState } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function CodeEditor({ value, onChange, disabled }: CodeEditorProps) {
  return (
    <div className="rounded-md overflow-hidden border border-input">
      <CodeMirror
        value={value}
        height="300px"
        theme={oneDark}
        extensions={[javascript()]}
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
        }}
      />
    </div>
  )
} 