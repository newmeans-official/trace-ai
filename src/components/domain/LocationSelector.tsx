import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { fetchPlannerByLocation } from '@/services/api'
import type { LocationInfo, TargetInfo, PlannerOutput } from '@/types'

type LocationSelectorProps = {
  onLocationSubmit: (
    location: LocationInfo,
    data: { keywords: string[]; planner: PlannerOutput; keywordToPrompt: Record<string, string> },
  ) => void
  disabled?: boolean
  targetInfo?: Omit<TargetInfo, 'imageFile'> | null
}

type LatLngLiteral = google.maps.LatLngLiteral

const defaultCenter: LatLngLiteral = { lat: 37.5665, lng: 126.978 }
const containerStyle = { width: '100%', height: '360px' }

function parseAdministrativeParts(components: google.maps.GeocoderAddressComponent[]): {
  country?: string
  city?: string
  neighborhood?: string
} {
  let country: string | undefined
  let city: string | undefined
  let neighborhood: string | undefined

  for (const c of components) {
    if (c.types.includes('country') && !country) country = c.long_name
    if ((c.types.includes('locality') || c.types.includes('postal_town')) && !city)
      city = c.long_name
    if (c.types.includes('administrative_area_level_2') && !city) city = c.long_name
    if (c.types.includes('administrative_area_level_1') && !city) city = c.long_name
    if (
      (c.types.includes('sublocality') ||
        c.types.includes('neighborhood') ||
        c.types.includes('sublocality_level_1')) &&
      !neighborhood
    )
      neighborhood = c.long_name
  }

  return { country, city, neighborhood }
}

export function LocationSelector({
  onLocationSubmit,
  disabled,
  targetInfo,
}: LocationSelectorProps) {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
  })
  const mapRef = useRef<google.maps.Map | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  const [position, setPosition] = useState<LatLngLiteral | null>(null)
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || geocoderRef.current) return
    geocoderRef.current = new google.maps.Geocoder()
  }, [isLoaded])

  useEffect(() => {
    if (position && isLoaded && mapRef.current) {
      mapRef.current.panTo(position)
    }
  }, [position, isLoaded])

  const reverseGeocode = useCallback(
    async (latLng: LatLngLiteral) => {
      if (!geocoderRef.current) return
      setIsLoading(true)
      setError(null)
      try {
        const res = await geocoderRef.current.geocode({ location: latLng })
        const result = res.results?.[0]
        if (!result) throw new Error('No address found for this location')
        const { country, city, neighborhood } = parseAdministrativeParts(result.address_components)
        if (!country || !city) throw new Error('Unable to resolve country/city here')
        const loc: LocationInfo = { country, city, neighborhood }
        setLocation(loc)
        setKeywords([])
      } catch (e: any) {
        setError(e?.message || 'Failed to resolve address')
        setLocation(null)
        setKeywords([])
      } finally {
        setIsLoading(false)
      }
    },
    [targetInfo],
  )

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || disabled) return
      // If clicking a POI/title, stop default behavior (info/requests) and treat as plain click
      if ((e as any).placeId) {
        ;(e as any).stop?.()
      }
      const latLng = e.latLng.toJSON()
      setPosition(latLng)
      reverseGeocode(latLng)
    },
    [disabled, reverseGeocode],
  )

  const onMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || disabled) return
      const latLng = e.latLng.toJSON()
      setPosition(latLng)
      reverseGeocode(latLng)
    },
    [disabled, reverseGeocode],
  )

  const canProceed = !!location && !isLoading && !error

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Location</CardTitle>
      </CardHeader>
      <CardContent className={`space-y-6 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
        {!apiKey || loadError ? (
          <div className="text-sm text-red-500">Missing or invalid Google Maps API key</div>
        ) : !isLoaded ? (
          <div className="space-y-2">
            <Progress value={60} />
            <div className="text-sm text-muted-foreground">Loading map...</div>
          </div>
        ) : (
          <div className="rounded-md border">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={position || defaultCenter}
              zoom={position ? 13 : 8}
              onLoad={(map) => {
                mapRef.current = map
              }}
              onUnmount={() => {
                mapRef.current = null
              }}
              onClick={onMapClick}
              options={{
                // Minimal UI: pan/zoom/drag and click only
                disableDefaultUI: true,
                clickableIcons: false,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                rotateControl: false,
                scaleControl: false,
                keyboardShortcuts: false,
                disableDoubleClickZoom: true,
                gestureHandling: disabled ? 'none' : 'auto',
                draggable: !disabled,
                scrollwheel: true,
              }}
            >
              {position && (
                <Marker position={position} draggable={!disabled} onDragEnd={onMarkerDragEnd} />
              )}
            </GoogleMap>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {location
              ? `${location.country} · ${location.city}${location.neighborhood ? ' · ' + location.neighborhood : ''}`
              : 'Click on the map to select a location'}
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
        </div>

        <div className="pt-2">
          <Button
            type="button"
            disabled={!canProceed || !!disabled}
            onClick={async () => {
              if (!location) return
              if (!targetInfo) {
                setError('Target info is required before generating keywords')
                return
              }
              setIsLoading(true)
              setError(null)
              try {
                const {
                  planner,
                  keywords: kws,
                  keywordToPrompt,
                } = await fetchPlannerByLocation(location, targetInfo)
                setKeywords(kws)
                onLocationSubmit(location, { keywords: kws, planner, keywordToPrompt })
              } catch (e: any) {
                setError(e?.message || 'Failed to fetch keywords')
                setKeywords([])
              } finally {
                setIsLoading(false)
              }
            }}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
