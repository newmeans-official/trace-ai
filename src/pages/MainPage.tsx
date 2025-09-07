import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { ImageUploader } from '@/components/domain/ImageUploader'
import { TargetInfoForm } from '@/components/domain/TargetInfoForm'
import { LocationSelector } from '@/components/domain/LocationSelector'
import { ResultView } from '@/components/domain/ResultView'
import type { LocationInfo, TargetInfo, ImageResult, PlannerOutput } from '@/types'
import { generateBaseImage, generateImagesFromDisguises } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type Step = 'upload' | 'location' | 'result'

export function MainPage() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [targetInfo, setTargetInfo] = useState<Omit<TargetInfo, 'imageFile'> | null>(null)
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])
  const [results, setResults] = useState<ImageResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null)
  const [isBaseGenerating, setIsBaseGenerating] = useState(false)
  const [baseProg, setBaseProg] = useState(0)
  const [baseStart, setBaseStart] = useState<number | null>(null)
  const [plannerData, setPlannerData] = useState<{
    planner: PlannerOutput
    keywordToPrompt: Record<string, string>
  } | null>(null)
  const keywordToReasoning = useMemo(() => {
    const map: Record<string, string> = {}
    const cats: Array<keyof PlannerOutput> = [
      'Occupation/Status',
      'Environmental Blending',
      'Short-term Labor',
    ]
    const personas = cats.flatMap((c) => plannerData?.planner?.[c] || [])
    for (const p of personas) {
      const k = String(p.keyword || '').trim()
      const r = String(p.reasoning || '').trim()
      if (k && r && !map[k]) map[k] = r
    }
    return map
  }, [plannerData])

  const keywordToCategory = useMemo(() => {
    const map: Record<string, string> = {}
    const cats: Array<keyof PlannerOutput> = [
      'Occupation/Status',
      'Environmental Blending',
      'Short-term Labor',
    ]
    for (const c of cats) {
      for (const p of plannerData?.planner?.[c] || []) {
        const k = String(p.keyword || '').trim()
        if (k && !map[k]) map[k] = c
      }
    }
    return map
  }, [plannerData])
  const computedAge = useMemo(() => {
    if (!targetInfo || targetInfo.shotYear === 'unknown') return 'Unknown'
    const nowYear = new Date().getFullYear()
    const captureAge =
      typeof (targetInfo as any).captureAge === 'number'
        ? (targetInfo as any).captureAge
        : typeof targetInfo.age === 'number'
          ? targetInfo.age
          : 0
    return Math.max(0, nowYear - Number(targetInfo.shotYear) + captureAge)
  }, [targetInfo])

  const uploadRef = useRef<HTMLDivElement | null>(null)
  const locationRef = useRef<HTMLDivElement | null>(null)
  const resultRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // When entering location step after upload, pre-generate a base photorealistic image
  useEffect(() => {
    if (step !== 'location' || !file || !targetInfo || baseImageUrl) return
    const run = async () => {
      setIsBaseGenerating(true)
      setBaseStart(Date.now())
      setError(null)
      const fullTarget: TargetInfo = { imageFile: file, ...targetInfo }
      try {
        const url = await generateBaseImage(fullTarget)
        setBaseImageUrl(url)
      } catch (e: any) {
        setError(e?.message || 'Failed to generate base image')
      } finally {
        setIsBaseGenerating(false)
      }
    }
    run()
  }, [step, file, targetInfo, baseImageUrl])

  // Animate base image generation progress (dummy time-based)
  useEffect(() => {
    if (isBaseGenerating) {
      const interval = window.setInterval(() => {
        const start = baseStart || Date.now()
        const elapsed = Date.now() - start
        const pct = Math.min(95, Math.round((elapsed / 60000) * 95))
        setBaseProg(Math.max(5, pct))
      }, 200)
      return () => window.clearInterval(interval)
    } else if (baseStart) {
      setBaseProg(100)
      const timeout = window.setTimeout(() => {
        setBaseStart(null)
        setBaseProg(0)
      }, 800)
      return () => window.clearTimeout(timeout)
    }
  }, [isBaseGenerating, baseStart])

  useEffect(() => {
    if (step !== 'result' || !file || !targetInfo || !keywords.length) return
    const run = async () => {
      setIsGenerating(true)
      setError(null)
      const fullTarget: TargetInfo = { imageFile: file, ...targetInfo }
      try {
        // Use planner and mapping obtained in the location step for consistency
        let planner: PlannerOutput | null = plannerData?.planner || null
        let keywordToPrompt: Record<string, string> = plannerData?.keywordToPrompt || {}

        // If for some reason planner is missing, bail out
        if (!planner) throw new Error('Planner data missing. Please retry from location step.')
        const cats: Array<keyof typeof planner> = [
          'Occupation/Status',
          'Environmental Blending',
          'Short-term Labor',
        ]
        const personas = cats.flatMap((c) => planner?.[c] || [])
        const normalize = (s: string) =>
          String(s || '')
            .toLowerCase()
            .replace(/\([^)]*\)/g, '')
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim()

        // Build normalized map from persona keywords -> disguise_prompt
        const personaMap = new Map<string, string>()
        for (const p of personas) {
          const k = normalize(p.keyword)
          const v = String(p.disguise_prompt || '').trim()
          if (k && v && !personaMap.has(k)) personaMap.set(k, v)
        }

        // Primary: map UI keywords to persona prompts by normalization
        let items = keywords
          .map((k) => {
            const nk = normalize(k)
            let dp = personaMap.get(nk) || (keywordToPrompt as any)?.[k]
            if (!dp) {
              // Fuzzy fallback: symmetric substring match after normalization
              const found = personas.find((p) => {
                const pk = normalize(p.keyword)
                return pk.includes(nk) || nk.includes(pk)
              })
              dp = found ? String(found.disguise_prompt || '').trim() : ''
            }
            if (!dp) console.warn('[WARN:disguise-prompt-missing-for-keyword]', k)
            return { keyword: k, disguisePrompt: dp }
          })
          .filter((it) => it.disguisePrompt)
        // Fallback: if planner personas are too few, merge with mapping built from selected keywords
        if (items.length < 3 && keywords.length) {
          const mapped = keywords
            .map((k) => ({ keyword: k, disguisePrompt: (keywordToPrompt as any)?.[k] }))
            .filter((it) => it.disguisePrompt)
          const mergedMap = new Map<string, { keyword: string; disguisePrompt: string }>()
          for (const it of [...items, ...mapped]) mergedMap.set(it.keyword, it)
          items = Array.from(mergedMap.values())
        }
        // No second LLM call; rely on existing planner only
        if (!items.length) throw new Error('No disguise prompts found for generated keywords')
        // Use disguise-only prompts: draw {disguise_prompt}
        const imgs = await generateImagesFromDisguises(fullTarget, items, baseImageUrl || undefined)
        setResults(imgs)
      } catch (e: any) {
        setError(e?.message || 'Failed to generate images')
        setResults([])
      } finally {
        setIsGenerating(false)
      }
    }
    run()
  }, [step, file, targetInfo, keywords, baseImageUrl, locationInfo, plannerData])

  const fullTargetInfo = useMemo(() => {
    if (!file || !targetInfo) return null
    return { imageFile: file, ...targetInfo } as TargetInfo
  }, [file, targetInfo])

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const resetFromUpload = () => {
    setTargetInfo(null)
    setLocationInfo(null)
    setKeywords([])
    setResults([])
    setIsGenerating(false)
    setBaseImageUrl(null)
    setIsBaseGenerating(false)
    setPlannerData(null)
    setStep('upload')
    scrollTo(uploadRef)
  }

  const resetFromLocation = () => {
    setLocationInfo(null)
    setKeywords([])
    setResults([])
    setIsGenerating(false)
    setBaseImageUrl(null)
    setIsBaseGenerating(false)
    setPlannerData(null)
    setStep('location')
    scrollTo(locationRef)
  }

  const goToLocation = (info: Omit<TargetInfo, 'imageFile'>) => {
    setTargetInfo(info)
    setStep('location')
    setTimeout(() => scrollTo(locationRef), 0)
  }

  const goToResult = (
    loc: LocationInfo,
    payload: {
      keywords: string[]
      planner: PlannerOutput
      keywordToPrompt: Record<string, string>
    },
  ) => {
    setLocationInfo(loc)
    setKeywords(payload.keywords)
    setPlannerData({ planner: payload.planner, keywordToPrompt: payload.keywordToPrompt })
    setStep('result')
    setTimeout(() => scrollTo(resultRef), 0)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-10">
        <section ref={uploadRef} className="grid grid-cols-2 gap-8">
          <ImageUploader
            previewUrl={previewUrl}
            onFileSelected={setFile as any}
            disabled={step !== 'upload'}
          />
          <TargetInfoForm disabled={!file || step !== 'upload'} onFormSubmit={goToLocation} />
          <div className="col-span-2 flex justify-end gap-3">
            {step !== 'upload' && (
              <button className="text-sm text-muted-foreground underline" onClick={resetFromUpload}>
                Reset (Upload)
              </button>
            )}
          </div>
        </section>

        {step !== 'upload' && (
          <section ref={locationRef} className="grid grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Base Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-md border bg-muted/20">
                  {isBaseGenerating ? (
                    <div className="w-full space-y-2 p-6">
                      <Progress value={baseProg} />
                      <div className="text-sm text-muted-foreground">Generating base image...</div>
                    </div>
                  ) : baseImageUrl ? (
                    <img src={baseImageUrl} alt="Base" className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-sm text-muted-foreground">No base image</div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Calculated Age: {computedAge}</div>
                {error && <div className="text-sm text-red-500">{error}</div>}
              </CardContent>
            </Card>

            <div>
              <LocationSelector
                disabled={step !== 'location' || isBaseGenerating}
                onLocationSubmit={goToResult}
                targetInfo={targetInfo || (undefined as any)}
              />
              <div className="mt-2 flex justify-end gap-3">
                <button
                  className="text-sm text-muted-foreground underline"
                  onClick={resetFromLocation}
                >
                  Reset (Location)
                </button>
              </div>
            </div>
          </section>
        )}

        {step === 'result' && (
          <section ref={resultRef} className="">
            {error && (
              <div className="mb-4 rounded-md border border-red-500 bg-red-950/30 p-3 text-sm text-red-200">
                {error}
              </div>
            )}
            <ResultView
              isLoading={isGenerating}
              targetInfo={fullTargetInfo}
              locationInfo={locationInfo}
              results={results}
              baseImageUrl={baseImageUrl}
              keywordToReasoning={keywordToReasoning}
              keywordToCategory={keywordToCategory}
            />
          </section>
        )}
      </main>
    </div>
  )
}

export default MainPage
