import type { LocationInfo, TargetInfo, ImageResult, SeasonalResult } from '@/types'
import { Type } from '@google/genai'
import { requireClient, fileToBase64, parseDataUrl } from '@/services/genai'
import {
  buildKeywordPrompt,
  buildImagePrompt,
  buildSeasonPrompt,
  buildBaseImagePrompt,
} from '@/services/prompts'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchKeywordsByLocation = async (
  location: LocationInfo,
  target?: Omit<TargetInfo, 'imageFile'>,
): Promise<string[]> => {
  if (!target) throw new Error('Target info is required for keyword generation')
  const ai = requireClient()
  const prompt = buildKeywordPrompt(location, target)
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  })
  let text = res.text ?? ''
  try {
    // Remove common markdown code fence wrappers if present
    let cleaned = text.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
    }
    const parsed = JSON.parse(cleaned) as string[]
    return parsed
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 5)
  } catch {
    // Try to extract the first JSON array substring and parse
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        const arr = JSON.parse(match[0]) as string[]
        return arr
          .map((k) => k.trim())
          .filter(Boolean)
          .slice(0, 5)
      } catch {}
    }
    // Lenient fallback: split and sanitize tokens
    const fallback = text
      .split(/[\n,]/)
      .map((s: string) =>
        s
          .replace(/```/g, '')
          .replace(/^[-#*\s\[\]]+|[\s\[\]]+$/g, '')
          .replace(/^["'`]+|["'`]+$/g, '')
          .trim(),
      )
      .filter((t) => t && !/^json$/i.test(t))
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
    contents: [{ inlineData: { data: imageBase64, mimeType } } as any, { text: prompt } as any],
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

export const generateBaseImage = async (targetInfo: TargetInfo): Promise<string> => {
  const ai = requireClient()
  const imageBase64 = await fileToBase64(targetInfo.imageFile)
  const mimeType = targetInfo.imageFile.type || 'image/jpeg'
  const prompt = buildBaseImagePrompt({
    shotYear: targetInfo.shotYear,
    shotMonth: targetInfo.shotMonth,
    age: targetInfo.age,
    gender: targetInfo.gender,
    ethnicity: targetInfo.ethnicity,
    features: targetInfo.features,
  })
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: [{ inlineData: { data: imageBase64, mimeType } } as any, { text: prompt } as any],
  })
  const parts = (res as any)?.candidates?.[0]?.content?.parts ?? []
  const img = parts.find(
    (p: any) => p?.inlineData?.mimeType && String(p.inlineData.mimeType).startsWith('image/'),
  )
  if (!img) throw new Error('No base image returned by Gemini')
  return `data:${img.inlineData.mimeType};base64,${img.inlineData.data}`
}

export const fetchSeasonalImages = async (
  resultId: number,
  baseImageDataUrl?: string,
): Promise<SeasonalResult[]> => {
  const ai = requireClient()
  const seasons: SeasonalResult['season'][] = ['Summer', 'Winter', 'Spring']
  const out: SeasonalResult[] = []
  for (let i = 0; i < seasons.length; i++) {
    const s = seasons[i]
    const prompt = buildSeasonPrompt(s)
    const contentParts: any[] = []
    if (baseImageDataUrl) {
      const parsed = parseDataUrl(baseImageDataUrl)
      if (parsed) {
        contentParts.push({ inlineData: { data: parsed.base64, mimeType: parsed.mimeType } } as any)
      }
    }
    contentParts.push({ text: prompt } as any)
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: contentParts,
    })
    const parts = (res as any)?.candidates?.[0]?.content?.parts ?? []
    const img = parts.find(
      (p: any) => p?.inlineData?.mimeType && String(p.inlineData.mimeType).startsWith('image/'),
    )
    if (!img) throw new Error(`No seasonal image for ${s}`)
    out.push({
      season: s,
      imageUrl: `data:${img.inlineData.mimeType};base64,${img.inlineData.data}`,
    })
    if (i < seasons.length - 1) {
      await sleep(3000)
    }
  }
  return out
}
