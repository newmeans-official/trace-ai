import { useEffect, useMemo, useState } from 'react'
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

  // derived flags will be used in later phases if needed

  const fullTargetInfo = useMemo(() => {
    if (!file || !targetInfo) return null
    return { imageFile: file, ...targetInfo } as TargetInfo
  }, [file, targetInfo])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
        {step === 'upload' && (
          <section className="grid gap-6 md:grid-cols-2">
            <ImageUploader previewUrl={previewUrl} onFileSelected={setFile as any} />
            <TargetInfoForm
              disabled={!file}
              onFormSubmit={(info) => {
                setTargetInfo(info)
                setStep('location')
              }}
            />
          </section>
        )}

        {step === 'location' && (
          <section>
            <LocationSelector
              onLocationSubmit={(loc, kws) => {
                setLocationInfo(loc)
                setKeywords(kws)
                setStep('result')
              }}
            />
          </section>
        )}

        {step === 'result' && (
          <section>
            <ResultView
              isLoading={isGenerating}
              targetInfo={fullTargetInfo}
              locationInfo={locationInfo}
              results={results}
            />
          </section>
        )}
      </main>
    </div>
  )
}

export default MainPage


