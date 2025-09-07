import { GoogleGenerativeAI } from '@google/generative-ai'

// Ensures an API key is present and returns a Gemini model instance
export function requireGenerativeModel(model: string) {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) {
    throw new Error('Missing Gemini API key')
  }
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model })
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


