import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ImageUploaderProps = {
  previewUrl?: string | null
  onFileSelected: (file: File) => void
}

export function ImageUploader({ previewUrl, onFileSelected }: ImageUploaderProps) {
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
  })

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {previewUrl ? (
          <div className="space-y-4">
            <div
              className="relative flex h-[360px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-muted/20"
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
              <Button type="button" variant="outline" onClick={open}>
                변경
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed p-10 text-center"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <div className="text-sm text-muted-foreground">
              여기에 타겟 인물의 몽타주 또는 사진 파일을 드래그하거나, 파일을 선택하세요.
            </div>
            <Button type="button" onClick={open}>파일 선택</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


