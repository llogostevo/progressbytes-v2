"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const PencilIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
)

const EraserIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
    <path d="M22 21H7" />
    <path d="m5 11 9 9" />
  </svg>
)

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
)

const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const UndoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
)

const RedoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  </svg>
)

interface DrawingCanvasProps {
  onSubmit?: (imageDataUrl: string) => void
  onCancel?: () => void
  showSubmit?: boolean
  initialImage?: string | null
}

export default function DrawingCanvas({ onSubmit, onCancel, showSubmit = false, initialImage }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const penSize = 2 // Fixed pencil size
  const eraserSize = 30 // Fixed eraser size
  const brushColor = "#000000" // Fixed black color
  const [isEraser, setIsEraser] = useState(false)
  const [fileSize, setFileSize] = useState<string>("")
  const [hasChanges, setHasChanges] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")

    // Remove any redo history when making a new change
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(dataUrl)

    // Limit history to 50 states to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift()
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    } else {
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set fixed internal resolution (square for simplicity)
    canvas.width = 1000
    canvas.height = 1000

    // Fill with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (initialImage) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        saveToHistory()
      }
      img.src = initialImage
    } else {
      saveToHistory()
    }
  }, [initialImage])

  const getCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getCoordinates(e.clientX, e.clientY)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getCoordinates(e.clientX, e.clientY)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.strokeStyle = isEraser ? "#ffffff" : brushColor
    ctx.lineWidth = isEraser ? eraserSize : penSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
    setHasChanges(true)
  }

  const stopDrawing = () => {
    if (isDrawing) {
      saveToHistory()
    }
    setIsDrawing(false)
  }

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const touch = e.touches[0]
    const { x, y } = getCoordinates(touch.clientX, touch.clientY)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const touch = e.touches[0]
    const { x, y } = getCoordinates(touch.clientX, touch.clientY)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.strokeStyle = isEraser ? "#ffffff" : brushColor
    ctx.lineWidth = isEraser ? eraserSize : penSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
    setHasChanges(true)
  }

  const stopDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (isDrawing) {
      saveToHistory()
    }
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setFileSize("")
    setHasChanges(false)
    saveToHistory()
  }

  const compressAndDownload = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const maxFileSize = 50 * 1024 // 50KB in bytes
    let quality = 0.95
    let blob: Blob | null = null

    while (quality > 0.1) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
      })

      if (!blob) break

      if (blob.size <= maxFileSize) {
        break
      }

      quality -= 0.05
    }

    if (!blob) {
      alert("Failed to create image")
      return
    }

    const sizeKB = (blob.size / 1024).toFixed(2)
    setFileSize(`${sizeKB} KB`)

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `drawing-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async () => {
    const canvas = canvasRef.current
    if (!canvas || !onSubmit) return

    console.log("[v0] Submit clicked")

    const maxFileSize = 50 * 1024 // 50KB in bytes
    let quality = 0.95
    let blob: Blob | null = null

    while (quality > 0.1) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
      })

      if (!blob) break

      console.log("[v0] Blob created with quality", quality, "size:", blob.size)

      if (blob.size <= maxFileSize) {
        break
      }

      quality -= 0.05
    }

    if (!blob) {
      console.log("[v0] Failed to create blob")
      alert("Failed to create image")
      return
    }

    console.log("[v0] Final blob size:", blob.size, "bytes")

    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      console.log("[v0] DataURL created, length:", dataUrl.length)
      onSubmit(dataUrl)
      setHasChanges(false)
    }
    reader.readAsDataURL(blob)
  }

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelDialog(true)
    } else {
      onCancel?.()
    }
  }

  const confirmCancel = () => {
    setShowCancelDialog(false)
    onCancel?.()
  }

  const handleUndo = () => {
    if (historyIndex <= 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history[newIndex]
    setHasChanges(true)
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history[newIndex]
    setHasChanges(true)
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex flex-col bg-background">
        <div className="flex items-center gap-2 px-3 py-2 bg-background/95 backdrop-blur border-b border-border">
          {showSubmit && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel} title="Cancel">
              <XIcon />
            </Button>
          )}

          <Button
            variant={!isEraser ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEraser(false)}
            title="Draw"
          >
            <PencilIcon />
          </Button>
          <Button
            variant={isEraser ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEraser(true)}
            title="Erase"
          >
            <EraserIcon />
          </Button>

          <div className="h-6 w-px bg-border" />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <UndoIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <RedoIcon />
          </Button>

          <div className="flex-1" />

          <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={clearCanvas} title="Clear">
            <TrashIcon />
          </Button>

          {showSubmit ? (
            <Button size="sm" className="h-8" onClick={handleSubmit} title="Submit Drawing">
              Submit
            </Button>
          ) : (
            <Button size="sm" className="h-8 gap-2" onClick={compressAndDownload} title="Download">
              <DownloadIcon />
              {fileSize && <span className="text-xs">({fileSize})</span>}
            </Button>
          )}
        </div>

        <div ref={containerRef} className="flex-1 bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawingTouch}
            onTouchMove={drawTouch}
            onTouchEnd={stopDrawingTouch}
            onTouchCancel={stopDrawingTouch}
            className="cursor-crosshair w-full h-full touch-none"
            style={{ display: "block" }}
          />
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to cancel? Your drawing will not be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Drawing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
