import type { LocationInfo, TargetInfo, ImageResult, SeasonalResult, PlannerOutput } from '@/types'
import { requireClient, fileToBase64, parseDataUrl } from '@/services/genai'
import {
  buildKeywordPrompt,
  buildSeasonPrompt,
  buildBaseImagePrompt,
  buildImagePrompt,
} from '@/services/prompts'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Removes markdown code fences from a text block
function cleanCodeFence(text: string): string {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
  }
  return cleaned
}

// Logs grounding sources and queries for debugging if present
function logGrounding(label: string, res: any) {
  try {
    const gm = res?.candidates?.[0]?.groundingMetadata
    const urls = (gm?.groundingChunks || []).map((c: any) => c?.web?.uri).filter(Boolean)
    if (urls?.length) console.log(`[LLM:${label}:sources]`, urls)
    if (Array.isArray(gm?.webSearchQueries) && gm.webSearchQueries.length)
      console.log(`[LLM:${label}:queries]`, gm.webSearchQueries)
  } catch {}
}

// Resolves the image content to base64 + mime, optionally preferring a provided data URL
async function resolveImageContent(
  targetInfo: TargetInfo,
  baseImageDataUrl?: string,
): Promise<{ base64: string; mimeType: string }> {
  if (baseImageDataUrl) {
    const parsed = parseDataUrl(baseImageDataUrl)
    if (parsed) return { base64: parsed.base64, mimeType: parsed.mimeType }
  }
  const base64 = await fileToBase64(targetInfo.imageFile)
  const mimeType = targetInfo.imageFile.type || 'image/jpeg'
  return { base64, mimeType }
}

// (Intentionally no hard timeout; LLM calls may take long.)

export const fetchKeywordsByLocation = async (
  location: LocationInfo,
  target?: Omit<TargetInfo, 'imageFile'>,
): Promise<string[]> => {
  if (!target) throw new Error('Target info is required for keyword generation')
  const ai = requireClient()
  const prompt = buildKeywordPrompt(location, target)
  console.log('[PROMPT:keywords]', prompt)
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  })
  let text = res.text ?? ''
  console.log('[LLM:keywords:raw]', text)
  logGrounding('keywords', res as any)
  try {
    const cleaned = cleanCodeFence(text)
    const parsed = JSON.parse(cleaned) as PlannerOutput | string[]
    if (Array.isArray(parsed)) {
      return parsed.map((k) => String(k).trim()).filter(Boolean)
    }
    const categories: (keyof PlannerOutput)[] = [
      'Occupation/Status',
      'Environmental Blending',
      'Short-term Labor',
    ]
    const all = categories.flatMap((c) => (parsed?.[c] || []).map((p) => p.keyword))
    const unique = Array.from(new Set(all.map((k) => String(k).trim()).filter(Boolean)))
    return unique
  } catch {
    // Try to extract the first JSON array substring and parse
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const out = JSON.parse(match[0]) as PlannerOutput
        const categories: (keyof PlannerOutput)[] = [
          'Occupation/Status',
          'Environmental Blending',
          'Short-term Labor',
        ]
        const all = categories.flatMap((c) => (out?.[c] || []).map((p) => p.keyword))
        const unique = Array.from(new Set(all.map((k) => String(k).trim()).filter(Boolean)))
        if (unique.length) return unique
      } catch {}
    }
    const arrMatch = text.match(/\[[\s\S]*\]/)
    if (arrMatch) {
      try {
        const arr = JSON.parse(arrMatch[0]) as string[]
        return arr.map((k) => String(k).trim()).filter(Boolean)
      } catch {}
    }
    // Lenient fallback: split and sanitize tokens
    const keywordLines = text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => /keyword\s*[:=]/i.test(l))
      .map((l) =>
        l
          .replace(/.*keyword\s*[:=]\s*/i, '')
          .replace(/[",`']/g, '')
          .trim(),
      )
      .filter(Boolean)
    if (keywordLines.length) return Array.from(new Set(keywordLines))
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
    return Array.from(new Set(fallback))
  }
}

export const fetchPlannerByLocation = async (
  location: LocationInfo,
  target: Omit<TargetInfo, 'imageFile'>,
): Promise<{
  planner: PlannerOutput
  keywords: string[]
  keywordToPrompt: Record<string, string>
}> => {
  const ai = requireClient()
  const prompt = buildKeywordPrompt(location, target)
  console.log('[PROMPT:planner]', prompt)
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  })
  const text = res.text ?? ''
  console.log('[LLM:planner:raw]', text)
  logGrounding('planner', res as any)
  // Clean markdown code fences
  let cleaned = cleanCodeFence(text)
  let parsed: PlannerOutput | null = null
  try {
    parsed = JSON.parse(cleaned) as PlannerOutput
  } catch {
    const objMatch = text.match(/\{[\s\S]*\}/)
    if (objMatch) {
      try {
        parsed = JSON.parse(objMatch[0]) as PlannerOutput
      } catch {}
    }
  }
  if (!parsed) throw new Error('Failed to parse planner JSON')
  const categories: (keyof PlannerOutput)[] = [
    'Occupation/Status',
    'Environmental Blending',
    'Short-term Labor',
  ]
  const allPersonas = categories.flatMap((c) => parsed?.[c] || [])
  const keywords = Array.from(
    new Set(allPersonas.map((p) => String(p.keyword).trim()).filter(Boolean)),
  )
  const keywordToPrompt: Record<string, string> = {}
  for (const p of allPersonas) {
    const k = String(p.keyword).trim()
    if (k && !keywordToPrompt[k]) keywordToPrompt[k] = String(p.disguise_prompt || '').trim()
  }
  return { planner: parsed, keywords, keywordToPrompt }
}

// generateImages removed; replaced by generateImagesFromDisguises

export const generateImagesFromDisguises = async (
  targetInfo: TargetInfo,
  items: { keyword: string; disguisePrompt: string }[],
  baseImageDataUrl?: string,
): Promise<ImageResult[]> => {
  const ai = requireClient()
  const { base64: imageBase64, mimeType } = await resolveImageContent(targetInfo, baseImageDataUrl)

  const results: ImageResult[] = []
  for (let i = 0; i < items.length; i++) {
    const { keyword, disguisePrompt } = items[i]
    const textPrompt = buildImagePrompt(disguisePrompt)
    console.log('[PROMPT:disguise]', { keyword, textPrompt })
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: [
          { inlineData: { data: imageBase64, mimeType } } as any,
          { text: textPrompt } as any,
        ],
      })
      const parts = (res as any)?.candidates?.[0]?.content?.parts ?? []
      const img = parts.find(
        (p: any) => p?.inlineData?.mimeType && String(p.inlineData.mimeType).startsWith('image/'),
      )
      if (!img) continue
      const url = `data:${img.inlineData.mimeType};base64,${img.inlineData.data}`
      results.push({
        id: results.length + 1,
        imageUrl: url,
        keywords: [keyword],
        prompt: textPrompt,
      })
    } catch (e) {
      console.warn('[ERROR:disguise-image]', e)
    }
    if (i < items.length - 1) {
      await sleep(5000)
    }
  }
  if (!results.length) throw new Error('No images returned for disguise prompts')
  return results
}

export const generateBaseImage = async (targetInfo: TargetInfo): Promise<string> => {
  const ai = requireClient()
  const { base64: imageBase64, mimeType } = await resolveImageContent(targetInfo)
  const prompt = buildBaseImagePrompt({
    shotYear: targetInfo.shotYear,
    age: targetInfo.age,
    captureAge: targetInfo.captureAge,
    gender: targetInfo.gender,
    ethnicity: targetInfo.ethnicity,
    features: targetInfo.features,
  } as any)
  console.log('[PROMPT:baseImage]', prompt)
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
  _resultId: number,
  baseImageDataUrl?: string,
): Promise<SeasonalResult[]> => {
  const ai = requireClient()
  const seasons: SeasonalResult['season'][] = ['Summer', 'Winter', 'Spring']
  const out: SeasonalResult[] = []
  for (let i = 0; i < seasons.length; i++) {
    const s = seasons[i]
    const prompt = buildSeasonPrompt(s)
    console.log('[PROMPT:season]', prompt)
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
