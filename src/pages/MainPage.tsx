import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { ImageUploader } from '@/components/domain/ImageUploader'
import { TargetInfoForm } from '@/components/domain/TargetInfoForm'
import { LocationSelector } from '@/components/domain/LocationSelector'
import { ResultView } from '@/components/domain/ResultView'
import type { LocationInfo, TargetInfo, ImageResult } from '@/types'
import { generateImages } from '@/services/api'


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

  const uploadRef = useRef<HTMLDivElement | null>(null)
  const locationRef = useRef<HTMLDivElement | null>(null)
  const resultRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (step !== 'result' || !file || !targetInfo || !keywords.length) return
    const run = async () => {
      setIsGenerating(true)
      const fullTarget: TargetInfo = { imageFile: file, ...targetInfo }
      const imgs = await generateImages(fullTarget, keywords)
      setResults(imgs)
      setIsGenerating(false)
    }
    run()
  }, [step, file, targetInfo, keywords])

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
    setStep('upload')
    scrollTo(uploadRef)
  }

  const resetFromLocation = () => {
    setLocationInfo(null)
    setKeywords([])
    setResults([])
    setIsGenerating(false)
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
          <ImageUploader previewUrl={previewUrl} onFileSelected={setFile as any} disabled={step !== 'upload'} />
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
        <section ref={locationRef} className="">
          <LocationSelector disabled={step !== 'location'} onLocationSubmit={goToResult} />
          <div className="mt-2 flex justify-end gap-3">
            <button className="text-sm text-muted-foreground underline" onClick={resetFromLocation}>
              Reset (Location)
            </button>
          </div>
        </section>
        )}

        {step === 'result' && (
        <section ref={resultRef} className="">
          <ResultView isLoading={isGenerating} targetInfo={fullTargetInfo} locationInfo={locationInfo} results={results} />
        </section>
        )}
      </main>
    </div>
  )
}

export default MainPage


