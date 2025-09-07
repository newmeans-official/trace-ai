import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { fetchSeasonalImages } from '@/services/api'
import type { ImageResult, SeasonalResult, TargetInfo, LocationInfo } from '@/types'

type ResultViewProps = {
  isLoading: boolean
  targetInfo: TargetInfo | null
  locationInfo: LocationInfo | null
  results: ImageResult[]
}

export function ResultView({ isLoading, targetInfo, locationInfo, results }: ResultViewProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [seasonals, setSeasonals] = useState<Record<number, SeasonalResult[] | undefined>>({})
  const [seasonalLoading, setSeasonalLoading] = useState(false)

  const originalInfoText = useMemo(() => {
    if (!targetInfo || !locationInfo) return '정보 없음'
    const year = targetInfo.shotYear === 'unknown' ? '연도 모름' : `${targetInfo.shotYear}년`
    const month = targetInfo.shotMonth === 'unknown' ? '월 모름' : `${targetInfo.shotMonth}월`
    const ageText = targetInfo.age === 'unknown' ? '나이 모름' : `${targetInfo.age}세`
    const genderMap: Record<TargetInfo['gender'], string> = { male: '남성', female: '여성', unknown: '모름' }
    return `${year} ${month} · ${ageText} · ${genderMap[targetInfo.gender]} · ${locationInfo.city}`
  }, [targetInfo, locationInfo])

  const handleExpand = async (id: number) => {
    setExpandedId(id)
    setSeasonalLoading(true)
    const imgs = await fetchSeasonalImages(id)
    setSeasonals((prev) => ({ ...prev, [id]: imgs }))
    setSeasonalLoading(false)
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>원본 이미지</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <img
            src={targetInfo ? URL.createObjectURL(targetInfo.imageFile) : 'https://via.placeholder.com/600x400?text=Original'}
            alt="원본"
            className="h-64 w-full rounded-md border object-cover"
          />
          <div className="text-sm text-muted-foreground">촬영 정보: {originalInfoText}</div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          <Progress value={60} />
          <div className="text-sm text-muted-foreground">이미지 생성 중...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {results.map((r) => (
          <Card key={r.id} className="relative">
            <CardContent className="space-y-3 p-6">
              <div className="relative">
                <img
                  src={r.imageUrl}
                  alt={`결과 ${r.id}`}
                  className="h-64 w-full rounded-md border object-cover"
                />
                <div className="absolute right-3 top-3">
                  <Button size="sm" variant="secondary" onClick={() => handleExpand(r.id)}>
                    계절별 보기
                  </Button>
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
      )}

      {expandedId !== null && (
        <div className="grid grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>선택된 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={results.find((r) => r.id === expandedId)?.imageUrl}
                alt="선택된 결과"
                className="h-64 w-full rounded-md border object-cover"
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            {seasonalLoading ? (
              <div className="space-y-2">
                <Progress value={60} />
                <div className="text-sm text-muted-foreground">계절 이미지 불러오는 중...</div>
              </div>
            ) : (
              (seasonals[expandedId] || []).map((s) => (
                <Card key={s.season}>
                  <CardHeader>
                    <CardTitle>{s.season}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={s.imageUrl}
                      alt={s.season}
                      className="h-48 w-full rounded-md border object-cover"
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}


