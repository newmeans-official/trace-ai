import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { fetchKeywordsByLocation } from '@/services/api'
import type { LocationInfo, TargetInfo } from '@/types'

type LocationSelectorProps = {
  onLocationSubmit: (location: LocationInfo, keywords: string[]) => void
  disabled?: boolean
  targetInfo?: Omit<TargetInfo, 'imageFile'> | null
}

const countryToCities: Record<string, { label: string; value: string }[]> = {
  kr: [
    { label: 'Seoul', value: 'seoul' },
    { label: 'Busan', value: 'busan' },
    { label: 'Incheon', value: 'incheon' },
  ],
  us: [
    { label: 'New York', value: 'newyork' },
    { label: 'Los Angeles', value: 'la' },
    { label: 'Chicago', value: 'chicago' },
  ],
  jp: [
    { label: 'Tokyo', value: 'tokyo' },
    { label: 'Osaka', value: 'osaka' },
    { label: 'Kyoto', value: 'kyoto' },
  ],
}

export function LocationSelector({
  onLocationSubmit,
  disabled,
  targetInfo,
}: LocationSelectorProps) {
  const [country, setCountry] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [keywords, setKeywords] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCountryChange = (value: string) => {
    setCountry(value)
    setCity('')
    setKeywords([])
  }

  const handleCityChange = async (value: string) => {
    setCity(value)
    setIsLoading(true)
    setError(null)
    try {
      const kws = await fetchKeywordsByLocation({ country, city: value }, targetInfo || undefined)
      setKeywords(kws)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch keywords')
      setKeywords([])
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = country && city && !isLoading

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Country</label>
            <Select value={country} onValueChange={handleCountryChange} disabled={disabled}>
              <SelectTrigger disabled={disabled}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kr">South Korea</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">City</label>
            <Select value={city} onValueChange={handleCityChange} disabled={!country || disabled}>
              <SelectTrigger disabled={!country || disabled}>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {(countryToCities[country] || []).map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Progress value={60} />
            <div className="text-sm text-muted-foreground">Loading keywords...</div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <Badge key={k}>{k}</Badge>
            ))}
          </div>
        )}

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="pt-2">
          <Button
            type="button"
            disabled={!canProceed || !!disabled || !!error}
            onClick={() => onLocationSubmit({ country, city }, keywords)}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
