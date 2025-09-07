import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'

export function TargetInfoForm() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>촬영 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">촬영 연도</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="연도 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">모름</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">촬영 월</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="월 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">모름</SelectItem>
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
            <label className="mb-2 block text-sm font-medium">촬영 당시 나이</label>
            <Input type="number" min={0} placeholder="나이 입력" />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Checkbox id="age-unknown" />
            <label htmlFor="age-unknown" className="text-sm">
              모름
            </label>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">성별</label>
          <RadioGroup className="flex gap-6">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="male" id="gender-male" />
              <label htmlFor="gender-male" className="text-sm">
                남성
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="female" id="gender-female" />
              <label htmlFor="gender-female" className="text-sm">
                여성
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="unknown" id="gender-unknown" />
              <label htmlFor="gender-unknown" className="text-sm">
                모름
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-2">
          <Button type="button" disabled className="w-full">
            이어서 진행
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


