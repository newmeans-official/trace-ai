import { useMemo, useState } from 'react'
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
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [seasonals, setSeasonals] = useState<Record<number, SeasonalResult[] | undefined>>({})
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set())

  const originalInfoText = useMemo(() => {
    if (!targetInfo || !locationInfo) return '정보 없음'
    const year = targetInfo.shotYear === 'unknown' ? 'Year unknown' : `${targetInfo.shotYear}`
    const month = targetInfo.shotMonth === 'unknown' ? 'Month unknown' : `${targetInfo.shotMonth}`
    const ageText = targetInfo.age === 'unknown' ? 'Age unknown' : `${targetInfo.age} yrs`
    const genderMap: Record<TargetInfo['gender'], string> = { male: 'Male', female: 'Female', unknown: 'Unknown' }
    return `${year} ${month} · ${ageText} · ${genderMap[targetInfo.gender]} · ${locationInfo.city}`
  }, [targetInfo, locationInfo])

  const handleExpand = async (id: number) => {
    if (expandedIds.has(id)) return
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    setLoadingIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    const imgs = await fetchSeasonalImages(id)
    setSeasonals((prev) => ({ ...prev, [id]: imgs }))
    setLoadingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Original Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-md border bg-muted/20">
            <img
              src={targetInfo ? URL.createObjectURL(targetInfo.imageFile) : 'https://via.placeholder.com/600x400?text=Original'}
              alt="원본"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="text-sm text-muted-foreground">Captured Info: {originalInfoText}</div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          <Progress value={60} />
          <div className="text-sm text-muted-foreground">Generating images...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {results.map((r) => (
            expandedIds.has(r.id) ? (
              <div key={r.id} className="grid grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-md border bg-muted/20">
                      <img
                        src={r.imageUrl}
                        alt={`결과 ${r.id}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.keywords.map((k) => (
                        <Badge key={k}>{k}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  {loadingIds.has(r.id) ? (
                    <div className="space-y-2">
                      <Progress value={60} />
                      <div className="text-sm text-muted-foreground">Loading seasonal images...</div>
                    </div>
                  ) : (
                    (seasonals[r.id] || []).map((s) => (
                      <Card key={s.season}>
                        <CardHeader>
                          <CardTitle>{s.season}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-md border bg-muted/20">
                            <img
                              src={s.imageUrl}
                              alt={s.season}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <Card key={r.id} className="relative">
                <CardContent className="space-y-3 p-6">
                  <div className="relative">
                    <div className="relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-md border bg-muted/20">
                      <img
                        src={r.imageUrl}
                        alt={`결과 ${r.id}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    {!expandedIds.has(r.id) && (
                      <div className="absolute right-3 top-3">
                        <Button size="sm" variant="secondary" onClick={() => handleExpand(r.id)}>
                          계절별 보기
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.keywords.map((k) => (
                      <Badge key={k}>{k}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  )
}


