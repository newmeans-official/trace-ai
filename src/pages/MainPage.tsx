import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { ImageUploader } from '@/components/domain/ImageUploader'
import { TargetInfoForm } from '@/components/domain/TargetInfoForm'
import { LocationSelector } from '@/components/domain/LocationSelector'
import { ResultView } from '@/components/domain/ResultView'
import type { LocationInfo, TargetInfo, ImageResult } from '@/types'
import { generateImages, generateBaseImage } from '@/services/api'
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
  const computedAge = useMemo(() => {
    if (!targetInfo || targetInfo.shotYear === 'unknown') return 'Unknown'
    const nowYear = new Date().getFullYear()
    const captureAge = typeof targetInfo.age === 'number' ? targetInfo.age : 0
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

  useEffect(() => {
    if (step !== 'result' || !file || !targetInfo || !keywords.length) return
    const run = async () => {
      setIsGenerating(true)
      setError(null)
      const fullTarget: TargetInfo = { imageFile: file, ...targetInfo }
      try {
        const imgs = await generateImages(fullTarget, keywords, baseImageUrl || undefined)
        setResults(imgs)
      } catch (e: any) {
        setError(e?.message || 'Failed to generate images')
        setResults([])
      } finally {
        setIsGenerating(false)
      }
    }
    run()
  }, [step, file, targetInfo, keywords, baseImageUrl])

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
    setStep('location')
    scrollTo(locationRef)
  }

  const goToLocation = (info: Omit<TargetInfo, 'imageFile'>) => {
    setTargetInfo(info)
    setStep('location')
    setTimeout(() => scrollTo(locationRef), 0)
  }

  const goToResult = (loc: LocationInfo, kws: string[]) => {
    setLocationInfo(loc)
    setKeywords(kws)
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
                      <Progress value={60} />
                      <div className="text-sm text-muted-foreground">Generating base image...</div>
                    </div>
                  ) : baseImageUrl ? (
                    <img
                      src={baseImageUrl}
                      alt="Base"
                      className="max-h-full max-w-full object-contain"
                    />
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
            />
          </section>
        )}
      </main>
    </div>
  )
}

export default MainPage
