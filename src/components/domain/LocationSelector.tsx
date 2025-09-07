import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function LocationSelector() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>지역 선택</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">국가</label>
            <Select>
              <SelectTrigger>
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
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="도시 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seoul">서울</SelectItem>
                <SelectItem value="busan">부산</SelectItem>
                <SelectItem value="incheon">인천</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>#후드티</Badge>
          <Badge variant="secondary">#청바지</Badge>
          <Badge variant="outline">#뿔테안경</Badge>
          <Badge>#백팩</Badge>
          <Badge variant="secondary">#운동화</Badge>
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


