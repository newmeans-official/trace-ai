import type { LocationInfo, TargetInfo, ImageResult, SeasonalResult } from '@/types'
import { requireClient, fileToBase64 } from '@/services/genai'
import { buildKeywordPrompt, buildImagePrompt, buildSeasonPrompt } from '@/services/prompts'

export const fetchKeywordsByLocation = async (
  location: LocationInfo,
  target?: Omit<TargetInfo, 'imageFile'>,
): Promise<string[]> => {
  if (!target) throw new Error('Target info is required for keyword generation')
  const ai = requireClient()
  const prompt = buildKeywordPrompt(location, target)
  const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt })
  const text = res.text ?? ''
  try {
    const parsed = JSON.parse(text) as string[]
    return parsed.map((k) => k.trim()).filter(Boolean).slice(0, 5)
  } catch {
    const fallback = text
      .split(/[\n,]/)
      .map((s: string) => s.replace(/^[-#*\s]+/, '').trim())
      .filter(Boolean)
    return fallback.slice(0, 5)
  }
}

export const generateImages = async (
  targetInfo: TargetInfo,
  keywords: string[],
): Promise<ImageResult[]> => {
  const ai = requireClient()

  const imageBase64 = await fileToBase64(targetInfo.imageFile)
  const mimeType = targetInfo.imageFile.type || 'image/jpeg'
  const prompt = buildImagePrompt(keywords)

  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: [
      { inlineData: { data: imageBase64, mimeType } } as any,
      { text: prompt } as any,
    ],
  })

  const parts = (res as any)?.candidates?.[0]?.content?.parts ?? []
  const imageParts = parts.filter((p: any) => p?.inlineData?.mimeType?.startsWith?.('image/'))
  if (imageParts.length === 0) throw new Error('No image returned by Gemini')
  const urls = imageParts.map(
    (p: any) => `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`,
  )
  return urls.slice(0, 5).map((url: string, i: number) => ({
    id: i + 1,
    imageUrl: url,
    keywords: keywords.slice(0, 2),
    prompt,
  }))
}

export const fetchSeasonalImages = async (resultId: number): Promise<SeasonalResult[]> => {
  const ai = requireClient()
  const seasons: SeasonalResult['season'][] = ['Summer', 'Winter', 'Spring']
  const out: SeasonalResult[] = []
  for (const s of seasons as SeasonalResult['season'][]) {
    const prompt = buildSeasonPrompt(s)
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash-image-preview', contents: [{ text: prompt } as any] })
    const parts = (res as any)?.candidates?.[0]?.content?.parts ?? []
    const img = parts.find(
      (p: any) => p?.inlineData?.mimeType && String(p.inlineData.mimeType).startsWith('image/'),
    )
    if (!img) throw new Error(`No seasonal image for ${s}`)
    out.push({ season: s, imageUrl: `data:${img.inlineData.mimeType};base64,${img.inlineData.data}` })
  }
  return out
}


