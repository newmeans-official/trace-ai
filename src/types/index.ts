export interface TargetInfo {
  imageFile: File
  shotYear: string | 'unknown'
  age: number | 'unknown'
  gender: 'male' | 'female' | 'unknown'
  ethnicity?: string
  features?: string
  captureAge?: number | 'unknown'
}

export interface LocationInfo {
  country: string
  city: string
  neighborhood?: string
}

export interface ImageResult {
  id: number
  imageUrl: string
  keywords: string[]
  seed?: string
  prompt?: string
}

export interface SeasonalResult {
  season: 'Summer' | 'Winter' | 'Spring'
  imageUrl: string
}

// Planner (keyword persona) output schema
export type PlannerPersona = {
  keyword: string
  reasoning: string
  disguise_prompt: string
}

export type PlannerOutput = {
  'Occupation/Status': PlannerPersona[]
  'Environmental Blending': PlannerPersona[]
  'Short-term Labor': PlannerPersona[]
}
