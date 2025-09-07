## Implementation Notes (based on SPEC)

This document captures technical implementation details that matter to developers extending or maintaining this project. No run instructions are included.

### Tech stack and global configuration

- Framework: React 19 + TypeScript + Vite
- Styling: Tailwind CSS v4 (PostCSS plugin `@tailwindcss/postcss`), `tailwindcss-animate`
- UI kit: shadcn/ui (local components under `src/components/ui/*`)
- Path alias: `@` → `src` (configured in both `tsconfig*.json` and `vite.config.ts`)

Files of interest:

- `vite.config.ts`: alias `@` mapped to `/src` (no Node.js path usage required)
- `postcss.config.js`: uses `@tailwindcss/postcss` (Tailwind v4 style)
- `tailwind.config.js`: minimal v4 content globs and `darkMode: ['class']`
- `src/index.css`: Tailwind v4 entry (`@import "tailwindcss";`), `@plugin "tailwindcss-animate";`, custom dark palette and “neo-brutalist police investigation” theme variables, background texture, and common radii
- `index.html`: `<html class="dark brutal">` to force dark mode and enable brutalist styling hooks globally; document title is `Trace AI`

Notes on Tailwind v4:

- CSS contains Tailwind v4 at-rules (`@plugin`, `@custom-variant`, `@theme`) that may show linter warnings but build correctly via PostCSS. Warnings can be ignored.

### Project structure (selected)

- `src/components/ui/*`: shadcn-ui generated components:
  - `button`, `card`, `select`, `input`, `checkbox`, `radio-group`, `badge`, `progress`
- `src/components/layout/Header.tsx`: page header
- `src/components/domain/*`: feature components (uploader/form/location/results)
- `src/pages/MainPage.tsx`: composes the single-page workflow, manages cross-step state
- `src/services/api.ts`: dummy async services with 3s delay (`sleep`) for UX simulation
- `src/types/index.ts`: public types (`TargetInfo`, `LocationInfo`, `ImageResult`, `SeasonalResult`)
- `src/lib/utils.ts`: `cn()` uses `clsx` + `tailwind-merge` (shadcn default)

### Theming and visual system

- Dark mode default (`html.dark`) with additional `html.brutal` hook
- Police investigation palette (deep navy, slate cards, police blue primary, caution-yellow accent):
  - Defined via CSS custom properties in `src/index.css` under `:root` and `.dark`
  - Investigative background texture via multiple gradients, attached to body (fixed)
- Brutalist accents:
  - Global CSS variables: `--shadow-brutal`, `--shadow-brutal-muted`
  - Applied to components:
    - `src/components/ui/card.tsx`: adds `brutal:shadow-[var(--shadow-brutal)] brutal:border-2`
    - `src/components/ui/button.tsx`: adds `brutal:shadow-[var(--shadow-brutal)] brutal:border-2`

Tuning:

- Accent color (caution yellow) drives brutalist shadow color. Change `--accent` and `--shadow-brutal` to re-skin quickly.
- Section fade-ins use `animate-in fade-in-10` (provided by `tailwindcss-animate`).

### Types and services

- `src/types/index.ts`:
  - `TargetInfo`: `{ imageFile: File; shotYear: string | 'unknown'; shotMonth: string | 'unknown'; age: number | 'unknown'; gender: 'male' | 'female' | 'unknown' }`
  - `LocationInfo`: `{ country: string; city: string }`
  - `ImageResult`: `{ id: number; imageUrl: string; keywords: string[] }`
  - `SeasonalResult`: `{ season: 'Summer' | 'Winter' | 'Spring'; imageUrl: string }`

- `src/services/api.ts` (dummy async, 3s delay each):
  - `fetchKeywordsByLocation(location: LocationInfo): Promise<string[]>`
  - `generateImages(targetInfo: TargetInfo, keywords: string[]): Promise<ImageResult[]>` (returns 5 placeholder images)
  - `fetchSeasonalImages(resultId: number): Promise<SeasonalResult[]>` (returns 3 placeholder seasonal images)

### Single-page workflow (state machine)

Owner: `src/pages/MainPage.tsx`

State:

- `step: 'upload' | 'location' | 'result'`
- `file: File | null`, `previewUrl: string | null`
- `targetInfo: Omit<TargetInfo, 'imageFile'> | null`
- `locationInfo: LocationInfo | null`, `keywords: string[]`
- `results: ImageResult[]`, `isGenerating: boolean`

Transitions and gating:

- Upload step is always rendered; its children are disabled after advancing to later steps.
- Location step renders only once upload+capture info are complete (`step !== 'upload'`). It is fully disabled after advancing to result.
- Result step renders only at `step === 'result'`. A `useEffect` triggers `generateImages` once per entry into the result step (guarded by dependencies: `step`, `file`, `targetInfo`, `keywords`).

Scrolling and reset:

- Each section has a `ref`; helpers scroll to target section on step changes/resets (`scrollIntoView({ behavior: 'smooth' })`).
- `resetFromUpload()`: clears all downstream state (targetInfo, locationInfo, keywords, results, isGenerating), sets `step='upload'` and scrolls to upload.
- `resetFromLocation()`: clears location-related and results state; sets `step='location'` and scrolls to location.

Known trade-off:

- `ImageUploader` expects `(file: File) => void`. `setFile` is `Dispatch<SetStateAction<File | null>>`, so it is passed as `setFile as any`. A small wrapper like `(f: File) => setFile(f)` would avoid `any`.

### Components (domain)

`src/components/domain/ImageUploader.tsx`

- Uses `react-dropzone` with `noClick`, `noKeyboard`; explicit “Choose File” button triggers `open()`
- Props: `{ previewUrl?: string | null; onFileSelected: (file: File) => void; disabled?: boolean }`
- Visual container: fixed height `h-[360px]`, `object-contain` to preserve aspect ratio (no cropping, no overflow)
- When `disabled`, disables dropzone (`disabled: true`) and adds `pointer-events-none opacity-60`

`src/components/domain/TargetInfoForm.tsx`

- Local state: `shotYear`, `shotMonth`, `ageUnknown`, `age`, `gender`
- `canProceed` ensures required values (or unknown options) are present
- Props: `{ disabled?: boolean; onFormSubmit: (data: Omit<TargetInfo, 'imageFile'>) => void }`
- Disables all interactive controls and dims the card when `disabled`
- Emits sanitized payload on “Continue”

`src/components/domain/LocationSelector.tsx`

- Country → city dependency: `countryToCities` mapping
- When city changes, calls `fetchKeywordsByLocation`, shows `Progress` bar for ~3s, then renders badges for keywords
- Props: `{ onLocationSubmit: (location: LocationInfo, keywords: string[]) => void; disabled?: boolean }`
- Fully disabled until previous step completes; dims controls via `disabled` on shadcn inputs

`src/components/domain/ResultView.tsx`

- Props: `{ isLoading: boolean; targetInfo: TargetInfo | null; locationInfo: LocationInfo | null; results: ImageResult[] }`
- Original (left/top) card shows uploaded image plus computed info string (`Year/Month/Age/Gender/City`)
- Results grid (single column list) with per-card expansion:
  - Multiple cards can be expanded simultaneously
  - State: `expandedIds: Set<number>`, `loadingIds: Set<number>`, `seasonals: Record<number, SeasonalResult[] | undefined>`
  - Expand → in-place replacement with 2-column layout: left selected result, right seasonal cards
  - Seasonal image loading is per-card and independent
- Images use aspect-safe containers (`h-[360px]` main, `h-[220px]` seasonal) with `object-contain`

### Accessibility and UX details

- Disabled sections use `pointer-events-none` and opacity changes; inputs also receive `disabled` props
- Buttons and triggers are disabled when gated; reset links provided to jump back and re-enable earlier steps
- Spacing and grids are tuned for desktop (PC-first): 2-column upload section, generous `gap-*` and `max-w-6xl` content width

### Extensibility pointers

- Replace dummy service calls in `src/services/api.ts` with real endpoints. Keep return shapes consistent with types in `src/types`.
- To add more locations, extend `countryToCities` (labels are user-facing and in English).
- To change image container sizes, edit heights in:
  - Uploader & result main: `h-[360px]`
  - Seasonal panels: `h-[220px]`
- To theme:
  - Adjust CSS variables in `src/index.css` (`--background`, `--primary`, `--accent`, `--border`) and brutalist shadow variables

### Known minor items to improve (backlog)

- Remove `as any` by wrapping `setFile`: `const handleFile = (f: File) => setFile(f)`
- Persist step state to session/local storage if desired
- Add skeletons for original card while generating results (currently shows progress bar only in results list)
