import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [shotMonth, setShotMonth] = useState<string | 'unknown'>('unknown')
  const [ageUnknown, setAgeUnknown] = useState(false)
  const [age, setAge] = useState<string>('')
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown')

  const canProceed = (ageUnknown || (!!age && Number(age) >= 0)) && !!shotYear && !!shotMonth && !!gender

  const handleSubmit = () => {
    if (!canProceed || disabled) return
    const payload: Omit<TargetInfo, 'imageFile'> = {
      shotYear,
      shotMonth,
      age: ageUnknown ? 'unknown' : Number(age),
      gender,
    }
    onFormSubmit(payload)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Capture Information</CardTitle>
      </CardHeader>
      <CardContent className={`space-y-6 ${disabled ? 'pointer-events-none opacity-60' : ''}`} aria-disabled={disabled}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Capture Year</label>
            <Select value={shotYear} onValueChange={setShotYear} disabled={disabled}>
              <SelectTrigger disabled={disabled}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Unknown</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Capture Month</label>
            <Select value={shotMonth} onValueChange={setShotMonth} disabled={disabled}>
              <SelectTrigger disabled={disabled}>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Unknown</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="11">11</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Age at Capture</label>
            <Input
              type="number"
              min={0}
              placeholder="Enter age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={ageUnknown || !!disabled}
            />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Checkbox id="age-unknown" checked={ageUnknown} onCheckedChange={(v) => setAgeUnknown(Boolean(v))} disabled={disabled} />
            <label htmlFor="age-unknown" className="text-sm">
              Unknown
            </label>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Gender</label>
          <RadioGroup className="flex gap-6" value={gender} onValueChange={(v) => setGender(v as any)} disabled={disabled}>
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
          <Button type="button" disabled={!canProceed || disabled} onClick={handleSubmit} className="w-full">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


