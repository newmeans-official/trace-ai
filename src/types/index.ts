export interface TargetInfo {
  imageFile: File
  shotYear: string | 'unknown'
  shotMonth: string | 'unknown'
  age: number | 'unknown'
  gender: 'male' | 'female' | 'unknown'
}

export interface LocationInfo {
  country: string
  city: string
}

export interface ImageResult {
  id: number
  imageUrl: string
  keywords: string[]
}

export interface SeasonalResult {
  season: '여름' | '겨울' | '봄'
  imageUrl: string
}


