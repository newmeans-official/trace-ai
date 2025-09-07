import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const dummyResults = [
  { id: 1, imageUrl: 'https://via.placeholder.com/400?text=Result+1', keywords: ['#후드티', '#청바지'] },
  { id: 2, imageUrl: 'https://via.placeholder.com/400?text=Result+2', keywords: ['#비니', '#백팩'] },
  { id: 3, imageUrl: 'https://via.placeholder.com/400?text=Result+3', keywords: ['#운동화', '#후디'] },
  { id: 4, imageUrl: 'https://via.placeholder.com/400?text=Result+4', keywords: ['#야상', '#청바지'] },
  { id: 5, imageUrl: 'https://via.placeholder.com/400?text=Result+5', keywords: ['#뿔테안경', '#맨투맨'] },
]

export function ResultView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>원본 이미지</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <img
            src="https://via.placeholder.com/600x400?text=Original"
            alt="원본"
            className="h-64 w-full rounded-md border object-cover"
          />
          <div className="text-sm text-muted-foreground">
            촬영 정보: 2024년 5월 · 32세 · 남성 · 서울
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {dummyResults.map((r) => (
          <Card key={r.id} className="relative">
            <CardContent className="space-y-3 p-6">
              <div className="relative">
                <img
                  src={r.imageUrl}
                  alt={`결과 ${r.id}`}
                  className="h-64 w-full rounded-md border object-cover"
                />
                <div className="absolute right-3 top-3">
                  <Button size="sm" variant="secondary">계절별 보기</Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.keywords.map((k) => (
                  <Badge key={k}>{k}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 확장 2컬럼 레이아웃 (초기 숨김) */}
      <div className="hidden grid-cols-2 gap-6 lg:grid">
        <Card>
          <CardHeader>
            <CardTitle>선택된 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src="https://via.placeholder.com/400?text=Selected"
              alt="선택된 결과"
              className="h-64 w-full rounded-md border object-cover"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>여름</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src="https://via.placeholder.com/400?text=Summer"
                alt="여름"
                className="h-48 w-full rounded-md border object-cover"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>겨울</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src="https://via.placeholder.com/400?text=Winter"
                alt="겨울"
                className="h-48 w-full rounded-md border object-cover"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>봄</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src="https://via.placeholder.com/400?text=Spring"
                alt="봄"
                className="h-48 w-full rounded-md border object-cover"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


