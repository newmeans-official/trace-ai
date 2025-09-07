### 범죄자 몽타주 실사화 및 변장 시뮬레이션 서비스 MVP 프론트엔드 명세

1. 페이지 레이아웃

- 구조: 단일 페이지 애플리케이션 (SPA)으로, 모든 기능이 하나의 페이지 내에서 수직 스크롤을 통해 순차적으로 이루어집니다.

2. 헤더 (Header)

- 구성:
    - 서비스 로고/타이틀: 좌측 상단에 "Trace AI"라는 서비스명을 표시합니다.
    - 서비스 설명: 우측에 "몽타주를 실사화하고 시간, 장소, 스타일에 따른 외모 변화를 예측합니다."라고 간단한 설명을 추가합니다.

3. 몽타주/사진 업로드 섹션 + 날짜 및 시간 설정 섹션

- UI 구성:
    - 파일 업로드 영역: 전체 페이지를 채우는 2컬럼으로, 왼쪽에는 점선으로 표시된 드래그 앤 드롭(Drag and Drop) 영역과 "파일 선택" 버튼을 함께 제공하여 사용자 편의성을 높입니다.
        - 업로드 안내 문구: 파일 선택 버튼 아래 "여기에 타겟 인물의 몽타주 또는 사진 파일을 드래그하거나, 파일을 선택하세요."와 같은 안내 문구를 표시합니다.
        - 이미지 미리보기: 파일이 업로드되면 해당 영역에 썸네일 형태로 이미지를 표시하고, "파일을 선택하세요" 버튼은 "변경" 버튼으로 바뀝니다.
    - 날짜 및 시간 설정 영역: 오른쪽 컬럼을 차지합니다. 수직으로 아래의 기능들이 나열되어있습니다.
        - 사진이 촬영된 날짜 선택: 사용자가 타겟 이미지가 촬영된 특정 연도/월을 입력할 수 있는 드롭다운 메뉴를 제시합니다. (월의 경우 ‘모름’ 선택지를 고르는 것도 가능)
        - 사진 촬영 당시의 나이: 타겟 이미지의의 촬영 당시 나이를 입력할 수 있도록 합니다. (모름 선택지를 고르는 것도 가능)
        - 성별: 타겟 인물의 성별을 선택할 수 있습니다. (모름 가능)
    - 이어서 진행 버튼: 모든 작업 완료 후 "이어서 진행" 버튼을 표시하여 다음 단계로 넘어갈 수 있도록 안내합니다.

5. 지역 선택 섹션

- 기능: 특정 지역에 변장 했을 법한 스타일 키워드를 추천받기 위해 위치를 선택합니다. UI 구현만 하면 되므로, 우선은 5종의 키워드를 더미 데이터에서 제공받습니다.
- UI 구성:
    - 드롭다운 메뉴:
        - 국가, 도시 및 지역 목록을 포함한 드롭다운 메뉴를 제공하여 사용자가 선택하도록 합니다.
        - 키워드가 검색되는데 실제로는 시간이 소요되므로 더미 키워드를 보여주기 전까지 3초의 시간을 소요합니다.
    - 이어서 진행 버튼: 모든 작업 완료 후 "이어서 진행" 버튼을 표시하여 다음 단계로 넘어갈 수 있도록 안내합니다.

6. 이미지 생성 및 결과 확인 섹션

- 기능: 모든 설정이 완료된 후, 최종적으로 변장 시뮬레이션 이미지를 생성하고 결과를 확인합니다.
- UI 구성:
    - 로딩 상태 표시: 이미지 생성에 시간이 소요될 수 있으므로, 로딩 중임을 알리는 스피너나 프로그레스 바를 표시합니다. (UI 개발 단계에서는 3초간 더미 로딩을 진행합니다. 키워드에 맞게 생성된 이미지 5장은 우선은 더미로 제공됩니다.)
    - 결과 이미지 표시 (기본 1컬럼, 확장 시 2컬럼):
        - 원본 이미지 카드(이미지와 그 아래 수집된 정보 텍스트)가 최 상단에 표시되고, 생성된 이미지 카드 5장(이미지 + 키워드)은 로딩 후 그 아래 수직으로 추가됩니다.)
    - 결과 이미지 확장 (두번째 컬럼의 이미지에서 확장 버튼을 클릭한 경우)
        - 2컬럼이 활성화 되면서 확장 전 이미지 우측에 추가로 계절(여름, 겨울, 봄)의 패션 이미지들이 추가됩니다. (이또한 3초 로딩 후 더미 이미지로 제공)

8. 기술 스택 제안

- 프론트엔드 프레임워크: React.js + TS
- 프론트엔드의 서비스로직 구현은 모두 별도의 함수에서 관리(더미로라도 생성해둘것)
- UI 라이브러리: shadcn 적극 사용


----

### **Trace AI: 프론트엔드 개발 상세 명세**

**1. 프로젝트 구조 및 환경**

*   **Framework:** React.js (Vite 기반) + TypeScript
*   **UI Library:** shadcn/ui (CLI를 통해 필요한 컴포넌트 추가)
*   **상태 관리:** `useState`, `useContext`를 기본으로 사용.
*   **코드 포맷팅/린팅:** Prettier, ESLint 설정 추가

**2. 컴포넌트 상세 설계**

개발자가 재사용 가능한 컴포넌트 단위로 생각할 수 있도록 각 섹션을 컴포넌트 관점에서 명세화하면 좋습니다.

*   **`Header.tsx`**
    *   **Props:** 없음
    *   **내용:** 좌측에 `Trace AI` 텍스트 로고, 우측에 서비스 설명 텍스트를 포함하는 Flexbox 레이아웃.

*   **`ImageUploader.tsx` (업로드 섹션 - 왼쪽 컬럼)**
    *   **State:** `uploadedFile: File | null`, `isUploading: boolean`
    *   **UI:**
        *   `shadcn/ui`의 `Card` 컴포넌트를 베이스로 사용.
        *   내부에 파일이 없을 경우: 점선 영역, 아이콘, "파일 선택" `Button` 컴포넌트, 안내 문구 표시.
        *   파일이 있을 경우: `<img>` 태그로 미리보기 표시, "변경" `Button` 컴포넌트 표시.
    *   **Logic:** `react-dropzone` 라이브러리 사용을 권장하여 드래그 앤 드롭 및 파일 선택 기능 구현.

*   **`TargetInfoForm.tsx` (정보 입력 섹션 - 오른쪽 컬럼)**
    *   **Props:** `onFormSubmit: (data: TargetInfo) => void`
    *   **State:** `year: string`, `month: string`, `age: string`, `gender: string`
    *   **UI:**
        *   **촬영 연도/월:** `shadcn/ui`의 `Select` 컴포넌트 2개 사용. 각 `Select`에는 '모름' `SelectItem` 포함.
        *   **촬영 당시 나이:** `Input` 컴포넌트와 '모름' `Checkbox`를 조합. 체크박스 선택 시 Input 비활성화.
        *   **성별:** `RadioGroup` 컴포넌트 사용 ('남성', '여성', '모름' 옵션).
        *   **"이어서 진행" 버튼:** `Button` 컴포넌트. 이미지 업로드와 필수 입력값이 채워지기 전까지 `disabled` 상태.

*   **`LocationSelector.tsx` (지역 선택 섹션)**
    *   **Props:** `onLocationSubmit: (location: LocationInfo) => void`
    *   **State:** `country: string`, `city: string`, `isLoading: boolean`, `keywords: string[]`
    *   **UI:**
        *   **국가/도시 선택:** 의존적인 `Select` 컴포넌트 2개. 국가 선택 시 도시 목록 업데이트.
        *   **키워드 로딩:** `isLoading` 상태가 true일 때 `3초`간 스켈레톤 UI 또는 `Spinner` 표시.
        *   **키워드 표시:** 로딩 완료 후, `shadcn/ui`의 `Badge` 컴포넌트를 사용하여 5개의 더미 키워드 표시.
        *   **"이어서 진행" 버튼:** `Button` 컴포넌트. 지역 선택이 완료되어야 활성화.

*   **`ResultView.tsx` (결과 확인 섹션)**
    *   **State:** `isLoading: boolean`, `results: ImageResult[]`, `expandedResult: ExpandedResult | null`
    *   **UI:**
        *   **초기 로딩:** `isLoading`이 true일 때 `3초`간 `Spinner` 또는 프로그레스 바 표시.
        *   **원본 이미지 카드:** `Card` 컴포넌트. `CardHeader`에 원본 이미지, `CardContent`에 수집된 정보(날짜, 나이, 성별, 지역) 텍스트 표시.
        *   **생성 이미지 카드 리스트:** `results` 배열을 map하여 `Card` 컴포넌트 리스트 렌더링. 각 카드에는 생성된 이미지와 스타일 키워드(`Badge`) 포함. 카드 우측 상단에 "계절별 보기" `Button` 추가.
        *   **결과 확장 뷰 (2컬럼):**
            *   "계절별 보기" 버튼 클릭 시 `expandedResult` 상태 업데이트.
            *   `expandedResult`가 `null`이 아닐 때, 화면을 2단 그리드로 전환.
            *   왼쪽: 선택된 생성 이미지 카드.
            *   오른쪽: 계절별 패션 이미지 로딩(`Spinner` 3초) 후, `여름`, `겨울`, `봄` 타이틀과 함께 추가 더미 이미지 3장 표시.

**3. 상태 관리 및 데이터 흐름**

*   **페이지 전체 상태:** 전체 워크플로우(업로드, 정보입력, 지역선택, 결과)를 관리하는 상위 페이지 컴포넌트(`App.tsx` 또는 `MainPage.tsx`)에서 각 단계별 상태를 관리합니다.
    *   `step: 'upload' | 'location' | 'result'`
    *   `targetInfo: TargetInfo`
    *   `locationInfo: LocationInfo`
*   사용자가 "이어서 진행" 버튼을 누를 때마다 `step` 상태를 변경하여 다음 섹션을 렌더링합니다.

**4. 더미 데이터 및 서비스 로직 (개발 구체화)**

`src/services/api.ts` 또는 유사한 파일을 생성하여 실제 API 호출을 모방하는 함수를 정의합니다.

```typescript
// src/types/index.ts
export interface TargetInfo {
  imageFile: File;
  shotYear: string | 'unknown';
  shotMonth: string | 'unknown';
  age: number | 'unknown';
  gender: 'male' | 'female' | 'unknown';
}

export interface LocationInfo {
  country: string;
  city: string;
}

// src/services/api.ts
// 3초 딜레이를 위한 유틸리티 함수
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 지역 선택 시 키워드를 가져오는 더미 함수
export const fetchKeywordsByLocation = async (location: LocationInfo): Promise<string[]> => {
  console.log('Fetching keywords for:', location);
  await sleep(3000);
  // 실제로는 location 기반으로 다른 키워드를 반환해야 함
  return ["#후드티", "#청바지", "#뿔테안경", "#백팩", "#운동화"];
};

// 최종 이미지를 생성하는 더미 함수
export const generateImages = async (targetInfo: TargetInfo, keywords: string[]): Promise<ImageResult[]> => {
  console.log('Generating images with:', targetInfo, keywords);
  await sleep(3000);
  // 더미 이미지 URL 반환
  return [
    { id: 1, imageUrl: 'https://via.placeholder.com/400', keywords: ['#후드티', '#청바지'] },
    // ... 4 more results
  ];
};

// 계절별 이미지를 가져오는 더미 함수
export const fetchSeasonalImages = async (resultId: number): Promise<SeasonalResult[]> => {
    console.log('Fetching seasonal images for result:', resultId);
    await sleep(3000);
    return [
        { season: '여름', imageUrl: 'https://via.placeholder.com/400?text=Summer' },
        { season: '겨울', imageUrl: 'https://via.placeholder.com/400?text=Winter' },
        { season: '봄', imageUrl: 'https://via.placeholder.com/400?text=Spring' },
    ];
}
```

---


### **Trace AI: 프론트엔드 개발 ACTION PLAN**

이 플랜은 총 6단계로 구성되어 있으며, 각 단계는 이전 단계의 완성을 기반으로 진행됩니다.

#### **Phase 0: 프로젝트 초기 설정 및 환경 구성**

코드를 작성하기 전, 개발 환경을 견고하게 구축하는 단계입니다.

1.  **Vite 보일러플레이트 정리:**
    *   `src/App.css` 파일의 내용을 모두 삭제합니다.
    *   `src/index.css` 파일의 내용을 삭제하고, Tailwind CSS를 위한 기본 지시어를 추가합니다.
    *   `src/App.tsx` 파일에서 기본으로 제공되는 `useState`와 로고 import 등을 모두 제거하고, 간단한 `<h1>Trace AI</h1>`만 남겨둡니다.
    *   `src/assets` 폴더 안의 `react.svg` 파일을 삭제합니다.

2.  **shadcn/ui 설정:**
    *   터미널에서 다음 명령어를 실행하여 `shadcn/ui`를 프로젝트에 초기화합니다.
        ```bash
        npx shadcn-ui@latest init
        ```
    *   CLI가 물어보는 질문에 다음과 같이 답변합니다. (기본값을 따르되, 경로 별칭(`alias`)을 설정하면 편리합니다.)
        *   `Would you like to use TypeScript?` **Yes**
        *   `Which style would you like to use?` **Default**
        *   `Which color would you like to use as base color?` **Slate**
        *   `Where is your global CSS file?` **src/index.css**
        *   `Would you like to use CSS variables for colors?` **Yes**
        *   `Where is your tailwind.config.js located?` **tailwind.config.js**
        *   `Configure import alias for components?` **@/components**
        *   `Configure import alias for utils?` **@/lib/utils**
        *   `Are you using React Server Components?` **No**

3.  **필요한 UI 컴포넌트 설치:**
    *   명세서에 필요한 `shadcn/ui` 컴포넌트들을 미리 설치합니다.
        ```bash
        npx shadcn-ui@latest add button card select input checkbox radio-group badge progress
        ```

4.  **추가 라이브러리 설치:**
    *   파일 드래그 앤 드롭 기능을 위해 `react-dropzone`을 설치합니다.
        ```bash
        npm install react-dropzone
        ```

5.  **프로젝트 폴더 구조 생성:**
    *   `src` 폴더 내에 다음 폴더들을 생성하여 코드를 체계적으로 관리합니다.
        ```
        src/
        ├── components/  (shadcn이 자동 생성)
        ├── services/    (API 로직)
        ├── types/       (TypeScript 타입 정의)
        └── pages/       (페이지 단위 컴포넌트)
        ```

#### **Phase 1: 핵심 컴포넌트 UI 구현**

각 컴포넌트를 기능 로직 없이 순수 UI만 먼저 조립하는 단계입니다. 이 단계에서는 상태나 이벤트를 신경 쓰지 않고, 눈에 보이는 형태만 만듭니다.

1.  **`Header.tsx` 컴포넌트 생성:**
    *   `src/components/layout` 폴더를 만들고 그 안에 `Header.tsx` 파일을 생성합니다.
    *   좌측에 "Trace AI" 타이틀, 우측에 서비스 설명을 포함한 헤더를 구현합니다.

2.  **`ImageUploader.tsx` 컴포넌트 생성:**
    *   `src/components/domain` 폴더를 만들고 `ImageUploader.tsx` 파일을 생성합니다.
    *   `Card` 컴포넌트를 사용하여 점선 영역과 "파일 선택" 버튼을 구현합니다.
    *   *Props*로 이미지 파일 URL을 받았을 때, 미리보기 이미지와 "변경" 버튼이 보이도록 조건부 렌더링을 구현합니다.

3.  **`TargetInfoForm.tsx` 컴포넌트 생성:**
    *   `src/components/domain` 폴더에 `TargetInfoForm.tsx` 파일을 생성합니다.
    *   `Select`(연/월), `Input`(나이), `Checkbox`(나이 모름), `RadioGroup`(성별)을 사용하여 정보 입력 폼의 UI를 완성합니다.
    *   하단에 비활성화된 "이어서 진행" `Button`을 배치합니다.

4.  **`LocationSelector.tsx` 컴포넌트 생성:**
    *   `src/components/domain` 폴더에 `LocationSelector.tsx` 파일을 생성합니다.
    *   국가, 도시를 선택하는 `Select` 컴포넌트 2개를 배치합니다.
    *   그 아래에 더미 키워드(`#후드티` 등)를 표시하는 `Badge` 컴포넌트 5개를 하드코딩하여 배치합니다.
    *   하단에 비활성화된 "이어서 진행" `Button`을 배치합니다.

5.  **`ResultView.tsx` 컴포넌트 생성:**
    *   `src/components/domain` 폴더에 `ResultView.tsx` 파일을 생성합니다.
    *   원본 이미지 카드 1개와 생성된 이미지 카드 5개를 수직으로 나열하는 1컬럼 레이아웃을 구현합니다.
    *   생성된 이미지 카드 우측 상단에 "계절별 보기" 버튼을 추가합니다.
    *   "계절별 보기" 버튼을 눌렀을 때를 가정하여, 우측에 계절별 이미지 3개가 나타나는 2컬럼 레이아웃도 구현해 둡니다. (초기에는 숨김 처리)

#### **Phase 2: 서비스 로직 및 타입 정의**

프론트엔드의 비즈니스 로직(더미 API)과 데이터 모델을 정의하는 단계입니다.

1.  **타입 정의 (`types/index.ts`):**
    *   `src/types/index.ts` 파일을 생성합니다.
    *   명세에 따라 `TargetInfo`, `ImageResult`, `SeasonalResult` 등의 인터페이스를 정의합니다.

2.  **더미 API 함수 구현 (`services/api.ts`):**
    *   `src/services/api.ts` 파일을 생성합니다.
    *   `sleep` 유틸리티 함수를 만들어 비동기 딜레이를 구현합니다.
    *   `fetchKeywordsByLocation`: 3초 딜레이 후 더미 키워드 배열을 반환하는 `async` 함수를 만듭니다.
    *   `generateImages`: 3초 딜레이 후 더미 이미지 결과 배열을 반환하는 `async` 함수를 만듭니다.
    *   `fetchSeasonalImages`: 3초 딜레이 후 더미 계절 이미지 배열을 반환하는 `async` 함수를 만듭니다.

#### **Phase 3: 페이지 구성 및 상태 연결**

만들어진 컴포넌트와 서비스 로직을 조립하여 실제 동작하도록 만드는 핵심 단계입니다.

1.  **메인 페이지 생성 (`pages/MainPage.tsx`):**
    *   `src/pages/MainPage.tsx` 파일을 생성합니다. 이 파일이 SPA의 본체가 됩니다.
    *   `useState`를 사용하여 현재 단계를 관리할 `step` 상태(`'upload' | 'location' | 'result'`)를 만듭니다.
    *   사용자가 입력한 정보를 저장할 `targetInfo`, `locationInfo` 등의 상태도 생성합니다.

2.  **1단계: 업로드 및 정보 입력 기능 구현:**
    *   `MainPage`에서 `step`이 'upload'일 때 `ImageUploader`와 `TargetInfoForm`을 렌더링합니다.
    *   `react-dropzone`을 `ImageUploader`에 연결하여 실제 파일 업로드 및 미리보기 기능을 구현합니다.
    *   `TargetInfoForm`의 각 입력 필드에 `useState`를 연결하고, 필수값이 모두 입력되면 "이어서 진행" 버튼을 활성화시킵니다.
    *   버튼 클릭 시, 입력된 정보와 업로드된 파일을 `targetInfo` 상태에 저장하고 `step`을 'location'으로 변경하는 핸들러 함수를 작성하여 `TargetInfoForm`에 `prop`으로 전달합니다.

3.  **2단계: 지역 선택 및 키워드 로딩 기능 구현:**
    *   `step`이 'location'일 때 `LocationSelector`를 렌더링합니다.
    *   지역 `Select`를 선택하면 `fetchKeywordsByLocation` 함수를 호출합니다.
    *   호출 전후로 `isLoading` 상태를 만들어 `Progress` 바 또는 스피너를 3초간 표시합니다.
    *   로딩이 끝나면 반환된 키워드 `Badge`를 화면에 렌더링하고 "이어서 진행" 버튼을 활성화합니다.
    *   버튼 클릭 시, 선택된 지역 정보를 `locationInfo`에 저장하고 `step`을 'result'로 변경하는 핸들러 함수를 작성하여 전달합니다.

4.  **3단계: 결과 표시 및 확장 기능 구현:**
    *   `step`이 'result'로 바뀌는 즉시 `generateImages` 함수를 호출하고, `ResultView` 컴포넌트에 로딩 상태를 전달합니다. (`Progress` 바 3초 표시)
    *   결과가 반환되면, 원본 정보 카드와 생성된 이미지 카드 5개를 `ResultView`에 렌더링합니다.
    *   `ResultView` 내부에서 "계절별 보기" 버튼 클릭 이벤트를 처리합니다.
    *   클릭 시 `fetchSeasonalImages`를 호출하고, 로딩 상태를 관리하며(3초), 완료되면 숨겨져 있던 2번째 컬럼에 계절별 이미지들을 표시합니다.

#### **Phase 4: 스타일링 및 최종 다듬기**

1.  **전체 레이아웃 및 간격 조정:**
    *   `App.tsx` 또는 `MainPage.tsx`에 전체적인 중앙 정렬, 최대 너비 등 스타일을 적용합니다.
    *   각 섹션 간의 수직 간격(`margin`/`padding`)을 조정하여 가독성을 높입니다.

2.  **반응형 디자인:**
    *   모바일 화면에서도 레이아웃이 깨지지 않도록 Tailwind CSS의 반응형 분기점(`md:`, `lg:`)을 사용하여 스타일을 조정합니다. (예: 2컬럼 레이아웃을 모바일에서는 1컬럼으로 변경)

3.  **애니메이션 및 전환 효과:**
    *   컴포넌트가 나타나거나 사라질 때 부드러운 전환(`transition`) 효과를 추가하여 사용자 경험을 향상시킵니다.

#### **Phase 5: 코드 정리 및 리뷰**

1.  **불필요한 코드 제거:** 디버깅용 `console.log`나 사용하지 않는 변수/함수를 제거합니다.
2.  **주석 추가:** 복잡한 로직이나 컴포넌트의 역할에 대해 간단한 주석을 작성합니다.
3.  **최종 테스트:** 처음부터 끝까지 전체 시나리오를 여러 번 테스트하며 버그나 어색한 동작이 없는지 확인합니다.
