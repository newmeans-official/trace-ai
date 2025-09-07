import type { LocationInfo, TargetInfo } from '@/types'

export function buildBaseImagePrompt(target: Omit<TargetInfo, 'imageFile'>) {
  const gender =
    target.gender === 'unknown' ? 'Unknown' : target.gender === 'male' ? 'Male' : 'Female'
  const age = typeof target.age === 'number' ? String(target.age) : 'Unknown'
  const ethnicity = target.ethnicity || 'Unknown'
  const features = target.features || 'None'
  return `
  Generate a high-resolution, photorealistic color portrait of a criminal suspect based on the provided montage sketch. The primary goal is to realistically age the individual depicted in the sketch to their current estimated age for identification purposes.


**Primary Directive: Maintain Likeness**
Your absolute top priority is to maintain a strong and faithful resemblance to the original montage sketch. The generated portrait must be immediately recognizable as the same individual, only aged. Treat the sketch as the ground truth for the fundamental facial structure, bone shape, and the precise proportions and placement of all features. All other instructions are secondary to this core objective.


**Scene Description & Context:**

The provided image is a police sketch created when the suspect, a [${gender}] of [${ethnicity}] descent, was estimated to be [${age}] years old.

Your task is to transform this sketch into a photorealistic portrait, aging the individual to their current estimated age of [${age}] years. You must accurately translate the core facial structure, bone shape, and key features from the sketch while applying natural signs of aging. This includes realistic wrinkles, changes in skin texture and elasticity, and potential hair color changes (e.g., graying) that are appropriate for their current age.

If available, incorporate these distinguishing features naturally into the portrait: [${features}].

**Photographic Style & Technical Details:**

*   **Style:** The final image must be a photorealistic photograph, not a drawing, illustration, or CGI-style rendering. It should resemble a modern digital mugshot or a passport photo.
*   **Camera & Angle:** The perspective must be a direct, front-facing shot of the head and shoulders. Use a standard portrait lens setting to ensure the facial features are not distorted.
*   **Lighting:** Employ neutral, even studio lighting that clearly illuminates the face and minimizes harsh shadows, ensuring all details are visible.
*   **Details:** Render realistic skin texture, including pores and fine lines. The eyes should appear lifelike and clear.
*   **Background:** The background should be simple and out of focus, using a neutral color like light gray or blue, to keep the entire focus on the suspect's face.`
}

export function buildKeywordPrompt(location: LocationInfo, target: Omit<TargetInfo, 'imageFile'>) {
  return `You are assisting investigators to disguise-trace a suspect.
Return exactly 5 concise style keywords that are plausible for the region and demographics.
Respond ONLY with a raw JSON array of strings (no code fences, no explanation).
Context: country=${location.country}, city=${location.city},
year=${target.shotYear}, age=${String(target.age)}, gender=${target.gender}.`
}

export function buildImagePrompt(keywords: string[]) {
  return `Generate a realistic portrait variation guided by these style keywords: ${keywords.join(
    ', ',
  )}. Keep identity consistent across results; neutral background; photorealistic.`
}

export function buildSeasonPrompt(season: 'Summer' | 'Winter' | 'Spring') {
  return `Generate a fashion/appearance variation for season: ${season}. Same person, photorealistic.`
}
