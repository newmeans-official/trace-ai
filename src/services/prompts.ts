import type { LocationInfo, TargetInfo } from '@/types'

export function buildKeywordPrompt(location: LocationInfo, target: Omit<TargetInfo, 'imageFile'>) {
  return `You are assisting investigators to disguise-trace a suspect.
Return exactly 5 concise style keywords that are plausible for the region and demographics.
Respond ONLY with a raw JSON array of strings (no code fences, no explanation).
Context: country=${location.country}, city=${location.city},
year=${target.shotYear}, month=${target.shotMonth}, age=${String(target.age)}, gender=${target.gender}.`
}

export function buildImagePrompt(keywords: string[]) {
  return `Generate a realistic portrait variation guided by these style keywords: ${keywords.join(
    ', ',
  )}. Keep identity consistent across results; neutral background; photorealistic.`
}

export function buildSeasonPrompt(season: 'Summer' | 'Winter' | 'Spring') {
  return `Generate a fashion/appearance variation for season: ${season}. Same person, photorealistic.`
}
