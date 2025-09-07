import type { LocationInfo, TargetInfo, ImageResult, SeasonalResult } from '@/types'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchKeywordsByLocation = async (location: LocationInfo): Promise<string[]> => {
  console.log('Fetching keywords for:', location)
  await sleep(3000)
  return ['#후드티', '#청바지', '#뿔테안경', '#백팩', '#운동화']
}

export const generateImages = async (
  targetInfo: TargetInfo,
  keywords: string[],
): Promise<ImageResult[]> => {
  console.log('Generating images with:', targetInfo, keywords)
  await sleep(3000)
  return [
    { id: 1, imageUrl: 'https://via.placeholder.com/400?text=Gen+1', keywords: ['#후드티', '#청바지'] },
    { id: 2, imageUrl: 'https://via.placeholder.com/400?text=Gen+2', keywords: ['#비니', '#백팩'] },
    { id: 3, imageUrl: 'https://via.placeholder.com/400?text=Gen+3', keywords: ['#운동화', '#후디'] },
    { id: 4, imageUrl: 'https://via.placeholder.com/400?text=Gen+4', keywords: ['#야상', '#청바지'] },
    { id: 5, imageUrl: 'https://via.placeholder.com/400?text=Gen+5', keywords: ['#뿔테안경', '#맨투맨'] },
  ]
}

export const fetchSeasonalImages = async (resultId: number): Promise<SeasonalResult[]> => {
  console.log('Fetching seasonal images for result:', resultId)
  await sleep(3000)
  return [
    { season: '여름', imageUrl: 'https://via.placeholder.com/400?text=Summer' },
    { season: '겨울', imageUrl: 'https://via.placeholder.com/400?text=Winter' },
    { season: '봄', imageUrl: 'https://via.placeholder.com/400?text=Spring' },
  ]
}


