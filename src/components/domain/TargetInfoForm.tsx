import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import type { TargetInfo } from '@/types'

type TargetInfoFormProps = {
  disabled?: boolean
  onFormSubmit: (data: Omit<TargetInfo, 'imageFile'>) => void
}

export function TargetInfoForm({ disabled, onFormSubmit }: TargetInfoFormProps) {
  const [shotYear, setShotYear] = useState<string | 'unknown'>('unknown')
  const [age, setAge] = useState<string>('')
  const [ageUnknown, setAgeUnknown] = useState(false)
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown')
  const [ethnicity, setEthnicity] = useState<string>('Unknown')
  const [customEthnicity, setCustomEthnicity] = useState<string>('')
  const [features, setFeatures] = useState<string>('')

  const isEthnicityValid = ethnicity !== 'Self-Identification' || customEthnicity.trim() !== ''
  const canProceed =
    shotYear !== 'unknown' &&
    !!gender &&
    (ageUnknown || (age !== '' && Number(age) >= 0)) &&
    isEthnicityValid

  const handleSubmit = () => {
    if (!canProceed || disabled) return
    const nowYear = new Date().getFullYear()
    const computedAge =
      shotYear === 'unknown' || ageUnknown || age === ''
        ? 'unknown'
        : Math.max(0, nowYear - Number(shotYear) + Number(age))
    const payload: Omit<TargetInfo, 'imageFile'> = {
      shotYear,
      age: computedAge,
      captureAge: ageUnknown || age === '' ? 'unknown' : Number(age),
      gender,
      ethnicity:
        ethnicity === 'Self-Identification' ? customEthnicity.trim() || 'Unknown' : ethnicity,
      features,
    }
    onFormSubmit(payload)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Capture Information</CardTitle>
      </CardHeader>
      <CardContent
        className={`space-y-6 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
        aria-disabled={disabled}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Capture Year</label>
            <Select value={shotYear} onValueChange={setShotYear} disabled={disabled}>
              <SelectTrigger disabled={disabled} className="max-h-10">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="unknown">Unknown</SelectItem>
                {Array.from({ length: 2025 - 1950 + 1 }, (_, i) => 1950 + i)
                  .reverse()
                  .map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Ethnicity</label>
          <Select value={ethnicity} onValueChange={setEthnicity} disabled={disabled}>
            <SelectTrigger disabled={disabled}>
              <SelectValue placeholder="Select ethnicity" />
            </SelectTrigger>
            <SelectContent>
              {[
                'East Asian',
                'Southeast Asian',
                'South Asian',
                'Black',
                'White',
                'Hispanic/Latino',
                'Middle Eastern',
                'Self-Identification',
                'Unknown',
              ].map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ethnicity === 'Self-Identification' ? (
            <div className="mt-2">
              <Input
                type="text"
                placeholder="Please self-identify"
                value={customEthnicity}
                onChange={(e) => setCustomEthnicity(e.target.value)}
                disabled={disabled}
              />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Age at Capture</label>
            <Input
              type="number"
              min={0}
              placeholder="Enter age at capture"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={ageUnknown || !!disabled}
            />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Checkbox
              id="age-unknown"
              checked={ageUnknown}
              onCheckedChange={(v) => setAgeUnknown(Boolean(v))}
              disabled={disabled}
            />
            <label htmlFor="age-unknown" className="text-sm">
              Unknown
            </label>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Distinctive Features (comma separated)
          </label>
          <Input
            type="text"
            placeholder="e.g., scar under left eye, mole on chin"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Gender</label>
          <RadioGroup
            className="flex gap-6"
            value={gender}
            onValueChange={(v) => setGender(v as any)}
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="male" id="gender-male" />
              <label htmlFor="gender-male" className="text-sm">
                Male
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="female" id="gender-female" />
              <label htmlFor="gender-female" className="text-sm">
                Female
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="unknown" id="gender-unknown" />
              <label htmlFor="gender-unknown" className="text-sm">
                Unknown
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            disabled={!canProceed || disabled}
            onClick={handleSubmit}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
