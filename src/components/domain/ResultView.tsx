import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, PersonaCard } from '@/components/ui/card'
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
  baseImageUrl?: string | null
  keywordToReasoning?: Record<string, string>
  keywordToCategory?: Record<string, string>
}

export function ResultView({
  isLoading,
  targetInfo,
  locationInfo,
  results,
  baseImageUrl,
  keywordToReasoning = {},
  keywordToCategory = {},
}: ResultViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [seasonals, setSeasonals] = useState<Record<number, SeasonalResult[] | undefined>>({})
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Record<number, string | undefined>>({})
  const [mainProgress, setMainProgress] = useState<number>(0)
  const [showMainProgress, setShowMainProgress] = useState<boolean>(false)
  const [seasonalStart, setSeasonalStart] = useState<Record<number, number>>({})

  const originalInfoText = useMemo(() => {
    if (!targetInfo || !locationInfo) return '정보 없음'
    const year = targetInfo.shotYear === 'unknown' ? 'Year unknown' : `${targetInfo.shotYear}`
    const ageText = targetInfo.age === 'unknown' ? 'Age unknown' : `${targetInfo.age} yrs`
    const genderMap: Record<TargetInfo['gender'], string> = {
      male: 'Male',
      female: 'Female',
      unknown: 'Unknown',
    }
    return `${year} · ${ageText} · ${genderMap[targetInfo.gender]} · ${locationInfo.city}`
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
    setSeasonalStart((prev) => ({ ...prev, [id]: Date.now() }))
    try {
      const base = results.find((r) => r.id === id)?.imageUrl
      const imgs = await fetchSeasonalImages(id, base)
      setSeasonals((prev) => ({ ...prev, [id]: imgs }))
      setErrors((prev) => ({ ...prev, [id]: undefined }))
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, [id]: e?.message || 'Failed to load seasonal images' }))
    }
    setLoadingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  // Main progress: animate up to 95% over 60s while loading; on completion show 100% briefly
  useEffect(() => {
    if (isLoading) {
      setShowMainProgress(true)
      setMainProgress(0)
      const start = Date.now()
      const interval = window.setInterval(() => {
        const elapsed = Date.now() - start
        const pct = Math.min(95, Math.round((elapsed / 60000) * 95))
        setMainProgress(pct)
      }, 200)
      return () => window.clearInterval(interval)
    } else if (showMainProgress) {
      setMainProgress(100)
      const timeout = window.setTimeout(() => setShowMainProgress(false), 800)
      return () => window.clearTimeout(timeout)
    }
  }, [isLoading])

  const getPrimaryInfo = (
    res: ImageResult,
  ): { primaryKeyword: string; reasoning: string; category?: string } => {
    let primaryKeyword = res.keywords[0] || ''
    let reasoning = ''
    let category: string | undefined = undefined
    for (const k of res.keywords) {
      const r = keywordToReasoning?.[k]
      if (r) {
        primaryKeyword = k
        reasoning = r
        category = keywordToCategory?.[k]
        break
      }
    }
    return { primaryKeyword, reasoning, category }
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
              src={
                baseImageUrl
                  ? baseImageUrl
                  : targetInfo
                    ? URL.createObjectURL(targetInfo.imageFile)
                    : 'https://via.placeholder.com/600x400?text=Original'
              }
              alt="원본"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="text-sm text-muted-foreground">Captured Info: {originalInfoText}</div>
        </CardContent>
      </Card>

      {showMainProgress ? (
        <div className="space-y-2">
          <Progress value={mainProgress} />
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Generating images...' : 'Finalizing...'}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {results.map((r) =>
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
                        className="h-full w-full object-contain"
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
                      <Progress
                        value={Math.max(
                          5,
                          Math.min(
                            95,
                            Math.round(
                              ((Date.now() - (seasonalStart[r.id] || Date.now())) / 60000) * 95,
                            ),
                          ),
                        )}
                      />
                      <div className="text-sm text-muted-foreground">
                        Loading seasonal images...
                      </div>
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
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  {errors[r.id] && <div className="text-sm text-red-500">{errors[r.id]}</div>}
                </div>
              </div>
            ) : (
              <div key={r.id} className="relative space-y-3">
                {(() => {
                  const { primaryKeyword, reasoning, category } = getPrimaryInfo(r)
                  return (
                    <PersonaCard
                      keyword={primaryKeyword || r.keywords[0] || 'Persona'}
                      reasoning={
                        reasoning ||
                        'No detailed reasoning available for this keyword. Try expanding to view more details.'
                      }
                      subtitle={category ? `${category} Persona` : 'Persona'}
                      imageSide="left"
                      imageUrl={r.imageUrl}
                      imageAlt={`결과 ${r.id}`}
                    />
                  )
                })()}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}
