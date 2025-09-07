import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ImageUploaderProps = {
  previewUrl?: string | null
  onFileSelected: (file: File) => void
  disabled?: boolean
}

export function ImageUploader({ previewUrl, onFileSelected, disabled }: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles[0]) {
        onFileSelected(acceptedFiles[0])
      }
    },
    [onFileSelected],
  )

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    disabled: Boolean(disabled),
  })

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {previewUrl ? (
          <div className="space-y-4" aria-disabled={disabled}>
            <div
              className={`relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-md border bg-muted/20 ${disabled ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex">
              <Button type="button" variant="outline" onClick={open} disabled={disabled}>
                Change
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed p-10 text-center ${disabled ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <div className="text-sm text-muted-foreground">
              Drag and drop a composite sketch or photo here, or choose a file.
            </div>
            <Button type="button" onClick={open} disabled={disabled}>
              Choose File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
