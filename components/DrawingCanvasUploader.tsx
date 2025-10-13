// components/DrawingCanvasUploader.tsx
"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import DrawingCanvas from "./drawing-canvas" // <- your canvas component
import { createClient } from "@/utils/supabase/client" // <- or your own client factory

type UploadResult = { url: string; path: string }

export type DrawingCanvasUploaderProps = {
  /** Supabase Storage bucket name */
  bucket?: string
  /** Optional path prefix, e.g. "answers/123" */
  pathPrefix?: string
  /** If true, uses a signed URL instead of public (for private buckets) */
  isPrivate?: boolean
  /** Start with an existing image (lets users re-edit) */
  initialUrl?: string | null
  /** Called after a successful upload */
  onUploaded?: (result: UploadResult) => void
  /** Optional: customize the open button */
  trigger?: React.ReactNode
  /** Optional: className for wrapper */
  className?: string
  /** Optional: question text to display in canvas view */
  questionText?: string
  /** Optional: keywords to display in canvas view */
  keywords?: string[]
}

function dataUrlToBlob(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",")
  const mime = /data:(.*?);base64/.exec(meta)?.[1] ?? "image/jpeg"
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export default function DrawingCanvasUploader({
  bucket = "student-answer-images",
  pathPrefix = "answers",
  isPrivate = false,
  initialUrl = null,
  onUploaded,
  trigger,
  className,
  questionText,
  keywords,
}: DrawingCanvasUploaderProps) {
  const [showCanvas, setShowCanvas] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl)
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  const uploadImageToStorage = useCallback(
    async (imageDataUrl: string): Promise<UploadResult | null> => {
      try {
        setUploading(true)

        const blob = dataUrlToBlob(imageDataUrl)
        const { data: auth } = await supabase.auth.getUser()
        const userId = auth.user?.id ?? "anon"

        const filename = `drawing-${Date.now()}.jpg`
        const path = `${pathPrefix}/${userId}/${filename}`

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, blob, { contentType: "image/jpeg", upsert: false })

        if (error) throw error

        if (isPrivate) {
          // signed URL for private buckets
          const { data: signed, error: signErr } = await supabase
            .storage
            .from(bucket)
            .createSignedUrl(data.path, 60 * 60) // 1 hour
          if (signErr) throw signErr
          return { url: signed.signedUrl, path: data.path }
        } else {
          // public URL for public buckets
          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path)
          return { url: pub.publicUrl, path: data.path }
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error"
        toast.error(`Upload failed: ${errorMessage}`)
        return null
      } finally {
        setUploading(false)
      }
    },
    [bucket, isPrivate, pathPrefix]
  )

  const handleCanvasSubmit = useCallback(
    async (dataUrl: string) => {
      const res = await uploadImageToStorage(dataUrl)
      if (!res) return
      setPreviewUrl(res.url)
      setShowCanvas(false)
      onUploaded?.(res)
      toast.success("Drawing uploaded")
    },
    [onUploaded, uploadImageToStorage]
  )

  return (
    <div className={className}>
      {!showCanvas && (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent cursor-pointer"
          onClick={() => setShowCanvas(true)}
          disabled={uploading}
        >
          <Pencil className="h-4 w-4" />
          {trigger ?? (previewUrl ? "Edit drawing" : "Add drawing")}
        </button>
      )}

      {showCanvas && (
        <DrawingCanvas
          onSubmit={handleCanvasSubmit}
          onCancel={() => setShowCanvas(false)}
          showSubmit
          initialImage={previewUrl}
          questionText={questionText}
          keywords={keywords}
        />
      )}

      {previewUrl && !showCanvas && (
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            Your drawing {uploading ? "(saving…)" : ""}:
          </p>
          <img src={previewUrl} alt="Your drawing" className="max-w-full h-auto" />
        </div>
      )}
    </div>
  )
}
