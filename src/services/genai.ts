import { GoogleGenAI } from '@google/genai'

// Ensures an API key is present and returns a GoogleGenAI client
export function requireClient() {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) {
    throw new Error('Missing Gemini API key')
  }
  return new GoogleGenAI({ apiKey })
}

// Converts a File to a base64 string (no data: prefix)
export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.*)$/)
  if (!m) return null
  return { mimeType: m[1], base64: m[2] }
}
