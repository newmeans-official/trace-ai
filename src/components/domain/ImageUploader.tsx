import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ImageUploaderProps = {
  imageUrl?: string
}

export function ImageUploader({ imageUrl }: ImageUploaderProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {imageUrl ? (
          <div className="space-y-4">
            <img
              src={imageUrl}
              alt="업로드 미리보기"
              className="h-64 w-full rounded-md border object-cover"
            />
            <div className="flex">
              <Button type="button" variant="outline">
                변경
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed p-10 text-center">
            <div className="text-sm text-muted-foreground">
              여기에 타겟 인물의 몽타주 또는 사진 파일을 드래그하거나, 파일을 선택하세요.
            </div>
            <Button type="button">파일 선택</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


