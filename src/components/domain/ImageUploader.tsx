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
    [onFileSelected]
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
                alt="업로드 미리보기"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex">
              <Button type="button" variant="outline" onClick={open} disabled={disabled}>
                변경
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
              여기에 타겟 인물의 몽타주 또는 사진 파일을 드래그하거나, 파일을 선택하세요.
            </div>
            <Button type="button" onClick={open} disabled={disabled}>파일 선택</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


