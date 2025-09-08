# Trace AI

A single-page React application that turns composite sketches into photorealistic portraits and simulates disguise variations by time, place, and style using Google's Gemini models.

## Preview

[🎥 Demo Video](https://drive.google.com/file/d/1bi2yBpv9RIp2KHnCww9KoW0s8tWf7pZf/view?usp=sharing)

![App full-page screenshot](public/screencapture.png)

## Tech Stack

- React 19 + TypeScript
- Vite 7 (dev server, build, preview)
- Tailwind CSS v4 + tailwindcss-animate (styling)
- shadcn/ui (locally generated UI components under `src/components/ui/*`)
- Google GenAI SDK (`@google/genai`) for Gemini APIs
- Google Maps JavaScript API (reverse geocoding and map selection)
- ESLint + Prettier + Husky + lint-staged

Key configuration:

- Path alias: `@` → `src` (see `vite.config.ts` and `tsconfig*.json`)
- Tailwind v4 setup via PostCSS: `@tailwindcss/postcss` in `postcss.config.js`
- Global CSS in `src/index.css` with a dark, "investigation" theme and brutalist accents

## Features

- Upload a composite sketch or photo and preview it
- Enter capture metadata (year, age at capture, gender, ethnicity, distinctive features)
- Pick a location via Google Map; reverse geocode to country/city/neighborhood
- Generate:
  - Base photorealistic portrait from the uploaded sketch/photo
  - Location-aware disguise personas and prompts
  - Multiple disguise images using Gemini image model
  - Optional seasonal variations (Summer/Winter/Spring)
- Smooth, gated single-page workflow with progress indicators and reset controls

## Requirements

- Node.js 18+ (recommended 20+)
- NPM 9+
- A Google Gemini API key
- A Google Maps JavaScript API key (for map and reverse geocode)

## Environment Variables

Create a `.env` file at the project root (same directory as `package.json`). Keys are exposed to the client via Vite (prefix `VITE_`). Do NOT commit real keys.

```
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

Notes:

- Missing `VITE_GEMINI_API_KEY` will surface an in-app error and block generation.
- Missing/invalid `VITE_GOOGLE_MAPS_API_KEY` will disable the map and show an error in the location step.

## Install and Run

1. Install dependencies

```
npm install
```

2. Start the dev server

```
npm run dev
```

- Open the URL printed by Vite (usually `http://localhost:5173`).
- The favicon is set from `src/assets/TraceAILogo.png` at runtime.

3. Build for production

```
npm run build
```

- Output is in `dist/`.

4. Preview the production build

```
npm run preview
```

## Usage Walkthrough

1. Upload step

- Drag and drop a sketch/photo or choose a file.
- Fill in capture info on the right and click Continue.

2. Location step

- Click on the map to select the likely location (requires `VITE_GOOGLE_MAPS_API_KEY`).
- Continue to proceed. Base image generation may start in the background.

3. Result step

- The app calls Gemini for disguise images based on planner outputs and target info.
- Click on a result to fetch seasonal variations.

Resets

- Use "Reset (Upload)" or "Reset (Location)" to re-run earlier steps.

## How It Works (High level)

- `src/services/genai.ts`: Creates a Gemini client using `VITE_GEMINI_API_KEY`, provides helpers for file/base64 and silent image persistence in the browser (OPFS when available).
- `src/services/prompts.ts`: Centralized prompt builders for keywords/planner, base image, disguise images, and seasonal variations.
- `src/services/api.ts`: Orchestrates Gemini calls. Key functions:
  - `fetchPlannerByLocation(location, target)` → planner JSON, keyword list, and keyword→prompt map
  - `generateBaseImage(targetInfo)` → single photorealistic base image
  - `generateImagesFromDisguises(targetInfo, items, baseImageDataUrl?)` → multiple disguise images
  - `fetchSeasonalImages(resultId, baseImageDataUrl?)` → Summer/Winter/Spring images

- `src/pages/MainPage.tsx`: Manages the end-to-end flow across steps and loading UI.
- `src/components/domain/*`: Feature components for upload, form, map, and results.
- `src/components/ui/*`: shadcn components used by domain components.

## LLM and Models

This project uses Google Gemini via `@google/genai`:

- `gemini-2.5-flash` (text + tools)
  - Used for: planner/keyword generation grounded with optional `googleSearch` tool.
  - Input: structured prompt with target info and location context.
  - Output: JSON planner object and/or keyword list.
- `gemini-2.5-flash-image-preview` (multimodal image generation)
  - Used for: base photorealistic portrait and disguise/seasonal variations.
  - Input: original image as inline base64 + text prompt built from persona or season.
  - Output: inline image data URLs consumed directly by the UI.

## Maps Integration

- Library: `@react-google-maps/api`
- API: Google Maps JavaScript API (loaded with `VITE_GOOGLE_MAPS_API_KEY`)
- Usage in app:
  - Map display and interaction in `src/components/domain/LocationSelector.tsx`
  - Click to drop/drag a marker and select coordinates
  - Reverse geocoding via `google.maps.Geocoder` to resolve `country`, `city`, and optional `neighborhood`
- Required setup:
  - Enable the Maps JavaScript API for your Google Cloud project
  - Put the key in `.env` as `VITE_GOOGLE_MAPS_API_KEY`
  - Restart the dev server after creating/updating `.env`

## Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Type-check and build production bundle
- `npm run preview`: Preview built app
- `npm run lint`: Run ESLint
- `npm run format`: Prettier format
- `npm run format:check`: Prettier check only

## Security and Limitations

- This is a client-only prototype for internal testing. The Gemini API key is used in the browser; do not deploy as-is to production.
- For production, proxy model calls through a secure backend; never expose secrets to clients.
- Image generation is subject to model availability/rate limits; calls are sequential in some places to reduce errors.
