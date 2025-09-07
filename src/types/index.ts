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
