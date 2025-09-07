import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { fetchKeywordsByLocation } from '@/services/api'
import type { LocationInfo } from '@/types'

type LocationSelectorProps = {
  onLocationSubmit: (location: LocationInfo, keywords: string[]) => void
  disabled?: boolean
}

const countryToCities: Record<string, { label: string; value: string }[]> = {
  kr: [
    { label: '서울', value: 'seoul' },
    { label: '부산', value: 'busan' },
    { label: '인천', value: 'incheon' },
  ],
  us: [
    { label: '뉴욕', value: 'newyork' },
    { label: 'LA', value: 'la' },
    { label: '시카고', value: 'chicago' },
  ],
  jp: [
    { label: '도쿄', value: 'tokyo' },
    { label: '오사카', value: 'osaka' },
    { label: '교토', value: 'kyoto' },
  ],
}

export function LocationSelector({ onLocationSubmit, disabled }: LocationSelectorProps) {
  const [country, setCountry] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [keywords, setKeywords] = useState<string[]>([])

  const handleCountryChange = (value: string) => {
    setCountry(value)
    setCity('')
    setKeywords([])
  }

  const handleCityChange = async (value: string) => {
    setCity(value)
    setIsLoading(true)
    const kws = await fetchKeywordsByLocation({ country, city: value })
    setKeywords(kws)
    setIsLoading(false)
  }

  const canProceed = country && city && !isLoading

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>지역 선택</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">국가</label>
            <Select value={country} onValueChange={handleCountryChange} disabled={disabled}>
              <SelectTrigger disabled={disabled}>
                <SelectValue placeholder="국가 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kr">대한민국</SelectItem>
                <SelectItem value="us">미국</SelectItem>
                <SelectItem value="jp">일본</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">도시</label>
            <Select value={city} onValueChange={handleCityChange} disabled={!country || disabled}>
              <SelectTrigger disabled={!country || disabled}>
                <SelectValue placeholder="도시 선택" />
              </SelectTrigger>
              <SelectContent>
                {(countryToCities[country] || []).map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Progress value={60} />
            <div className="text-sm text-muted-foreground">키워드 불러오는 중...</div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <Badge key={k}>{k}</Badge>
            ))}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="button"
            disabled={!canProceed || !!disabled}
            onClick={() => onLocationSubmit({ country, city }, keywords)}
            className="w-full"
          >
            이어서 진행
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


