## Service Logic Implementation Plan (Gemini integration)

Scope updates (per request):
- Implement only a local/dev client prototype (no server/proxy).
- Guard: If API key is missing, do NOT fallback to dummy; show an error message and stop.
- Do not implement `src/services/requests.ts` (no AbortController layer for now).
- Production security/proxy guidance is intentionally ignored for internal testing.

### 0) Dependencies and configuration

- Add Gemini SDK (JS GenAI) for client prototype:
  - `npm i @google/generative-ai`
- Env variable (dev only):
  - `VITE_GEMINI_API_KEY`
- Config handling:
  - `const apiKey = import.meta.env.VITE_GEMINI_API_KEY`
  - Guard: If API key is missing, throw an error (surface to UI); do not fallback.

### 1) New files and modules

- `src/services/genai.ts`
  - Create a factory for Gemini clients and helpers for file-to-base64
  - Expose: `getGenerativeModel(modelName)`, `fileToBase64(file)`

- `src/services/prompts.ts`
  - Centralize prompt templates (keywords and image generation)
  - Keep concise, model-friendly, and JSON oriented

// Removed: requests.ts (not implementing to keep complexity low)

### 2) Types: confirm and extend only if needed

No required shape changes, but consider optional metadata:
- `ImageResult`: may add `seed?: string` | `prompt?: string`
- Keep current contracts to minimize UI churn

### 3) Implement Gemini client utilities

File: `src/services/genai.ts`

```ts
// src/services/genai.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

export function requireGenerativeModel(model: string) {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!key) throw new Error('Missing Gemini API key')
  const genAI = new GoogleGenerativeAI(key)
  return genAI.getGenerativeModel({ model })
}

export async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}
```

### 4) Prompt templates

File: `src/services/prompts.ts`

```ts
// src/services/prompts.ts
import type { LocationInfo, TargetInfo } from '@/types'

export function buildKeywordPrompt(location: LocationInfo, target: Omit<TargetInfo, 'imageFile'>) {
  return `You are assisting investigators to disguise-trace a suspect.
Return exactly 5 concise style keywords that are plausible for the region and demographics.
Respond as JSON array of strings, no extra text.
Context: country=${location.country}, city=${location.city},
year=${target.shotYear}, month=${target.shotMonth}, age=${String(target.age)}, gender=${target.gender}.`;
}

export function buildImagePrompt(keywords: string[]) {
  return `Generate a realistic portrait variation guided by these style keywords: ${keywords.join(', ')}.
Keep identity consistent across results; neutral background; photorealistic.`;
}

export function buildSeasonPrompt(season: 'Summer' | 'Winter' | 'Spring') {
  return `Generate a fashion/appearance variation for season: ${season}. Same person, photorealistic.`;
}
```

### 5) Replace dummy service functions (no fallback)

File: `src/services/api.ts`

Implement real calls; if API key/model is unavailable, throw an error and surface it in UI.

1) fetchKeywordsByLocation (use gemini-2.5-flash)

```ts
import { requireGenerativeModel } from '@/services/genai'
import { buildKeywordPrompt } from '@/services/prompts'

export const fetchKeywordsByLocation = async (
  location: LocationInfo,
  target?: Omit<TargetInfo, 'imageFile'>
): Promise<string[]> => {
  if (!target) throw new Error('Target info is required for keyword generation')
  const model = requireGenerativeModel('gemini-2.5-flash')

  const prompt = buildKeywordPrompt(location, target)
  const res = await model.generateContent(prompt)
  const text = res.response.text()
  try {
    const arr = JSON.parse(text) as string[]
    return arr
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 5)
  } catch {
    // Lenient parse: split lines / commas as fallback
    const arr = text.split(/[\n,]/).map((s) => s.replace(/^[-#*\s]+/, '').trim()).filter(Boolean)
    return arr.slice(0, 5)
  }
}
```

2) generateImages (use gemini-2.5-flash-image)

```ts
import { requireGenerativeModel, fileToBase64 } from '@/services/genai'
import { buildImagePrompt } from '@/services/prompts'

export const generateImages = async (
  targetInfo: TargetInfo,
  keywords: string[]
): Promise<ImageResult[]> => {
  const model = requireGenerativeModel('gemini-2.5-flash-image')

  const imageBase64 = await fileToBase64(targetInfo.imageFile)
  const mimeType = targetInfo.imageFile.type || 'image/jpeg'
  const prompt = buildImagePrompt(keywords)

  // Gemini image generation with multi-part (text + image)
  const res = await model.generateContent([
    { text: prompt },
    { inlineData: { data: imageBase64, mimeType } },
  ])

  // Extract image(s) from response. Depending on SDK, inspect parts for inlineData.
  // Pseudocode; implement against actual SDK return shape from googleapis/js-genai docs.
  const parts = (res as any)?.response?.candidates?.[0]?.content?.parts ?? []
  const images: string[] = []
  for (const p of parts) {
    if (p.inlineData?.mimeType?.startsWith('image/')) {
      images.push(`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`)
    }
  }
  if (images.length === 0) throw new Error('No image returned by Gemini')
  return images.slice(0, 5).map((url, i) => ({ id: i + 1, imageUrl: url, keywords: keywords.slice(0, 2) }))
}
```

3) fetchSeasonalImages (use gemini-2.5-flash-image)

```ts
import { buildSeasonPrompt } from '@/services/prompts'

export const fetchSeasonalImages = async (resultId: number): Promise<SeasonalResult[]> => {
  const model = requireGenerativeModel('gemini-2.5-flash-image')

  // For MVP, call 3 times sequentially; can be parallelized with Promise.all later
  const seasons: SeasonalResult['season'][] = ['Summer', 'Winter', 'Spring']
  const out: SeasonalResult[] = []
  for (const s of seasons) {
    const prompt = buildSeasonPrompt(s)
    const res = await model.generateContent([{ text: prompt }])
    const parts = (res as any)?.response?.candidates?.[0]?.content?.parts ?? []
    const img = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'))
    if (!img) throw new Error(`No seasonal image for ${s}`)
    out.push({ season: s, imageUrl: `data:${img.inlineData.mimeType};base64,${img.inlineData.data}` })
  }
  return out
}
```

### 6) UI wiring updates

- Upload step: already persists `file` and partial `targetInfo`. No network call here.

- Location step: call real `fetchKeywordsByLocation(location, targetInfo)`
  - File: `src/pages/MainPage.tsx`
  - On country/city selection completion, before enabling Continue: trigger fetch
  - Show loading indicator while awaiting Gemini
  - On error (e.g., no API key), surface message (toast/banner) and block Continue
  - Store the 5 returned keywords; pass to next step

- Result step: `useEffect` in `MainPage` already calls `generateImages(target, keywords)` when step becomes `result`
  - Replace import with real function (same signature)
  - Maintain loading state; render results on completion
  - On error, show message and suppress results rendering

- Expanded/seasonal within `ResultView`: call `fetchSeasonalImages(id)` (already wired); switch import to real function
  - On error, show message within the expanded card and do not collapse others

### 7) Error handling (simple, per scope)

- No fallback to dummy when API key missing; throw and show message
- Display a non-blocking toast or an inline banner in the respective section
- Resets clear error state along with other step state

### 8) Security guidance (internal testing only)

- For internal testing we are NOT following production hardening (no proxy, key exposed to client). Do not ship this configuration publicly.

### 9) Acceptance criteria

- With a valid API key, location step returns 5 English keywords from Gemini within ~3–6s
- Result step produces at least 1 generated image (data URL or hosted) using the uploaded photo and keywords
- Seasonal expansion returns 3 season images; each card loads independently
- Resets cancel pending work and clear downstream state
- If API key is missing, user sees an error message and the flow halts at that step

### 10) Task checklist (implementation)

- [ ] Install `@google/generative-ai`
- [ ] Add `VITE_GEMINI_API_KEY` (dev); guard throws error if missing (no fallback)
- [ ] Create `src/services/genai.ts` (client factory + fileToBase64)
- [ ] Create `src/services/prompts.ts` (keyword/image/season prompts)
- [ ] Replace `fetchKeywordsByLocation` with real call (no fallback)
- [ ] Replace `generateImages` with real call (no fallback)
- [ ] Replace `fetchSeasonalImages` with real call (no fallback)
- [ ] Wire location step to pass `targetInfo` into keywords call
- [ ] Keep 3s UX skeleton while calling Gemini
- [ ] Basic error parsing/logging; surface a user-friendly message
- [ ] Validate that outputs match types consumed by UI


