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

function nextDownloadIndex(): number {
  try {
    const key = 'traceai_download_index'
    const raw = window.localStorage.getItem(key)
    const current = raw ? parseInt(raw, 10) : 0
    const next = Number.isFinite(current) && current >= 0 ? current + 1 : 1
    window.localStorage.setItem(key, String(next))
    return next
  } catch {
    return Math.floor(Date.now() / 1000)
  }
}

function mimeToExtension(mime: string): string {
  const m = String(mime || '').toLowerCase()
  if (m.includes('png')) return 'png'
  if (m.includes('webp')) return 'webp'
  if (m.includes('gif')) return 'gif'
  if (m.includes('bmp')) return 'bmp'
  if (m.includes('svg')) return 'svg'
  return 'jpg'
}

// Kept for optional future use; not used when silent saving is enabled
export function downloadDataUrl(_dataUrl: string, _prefix?: string): string {
  return ''
}

async function writeBlobToOPFS(filename: string, blob: Blob): Promise<boolean> {
  try {
    const storage: any = (navigator as any)?.storage
    if (!storage || typeof storage.getDirectory !== 'function') return false
    const root = await storage.getDirectory()
    const dir = await (root as any).getDirectoryHandle('trace-ai', { create: true })
    const fileHandle = await dir.getFileHandle(filename, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(blob)
    await writable.close()
    return true
  } catch {
    return false
  }
}

export async function saveDataUrlSilently(dataUrl: string, prefix?: string): Promise<string> {
  try {
    const parsed = parseDataUrl(dataUrl)
    const idx = nextDownloadIndex()
    const ext = mimeToExtension(parsed?.mimeType || 'image/jpeg')
    const filename = `${prefix || 'trace'}_${idx}.${ext}`
    const base64 = parsed?.base64 || dataUrl.split(',')[1]
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: parsed?.mimeType || 'image/jpeg' })
    const ok = await writeBlobToOPFS(filename, blob)
    if (ok) return filename
  } catch {}
  // Intentionally avoid download UI to respect background saving request
  return ''
}

export type SavedFileHandle = {
  name: string
  size: number
  type: string
  lastModified: number
  fileHandle: FileSystemFileHandle
}

export async function listSavedImages(): Promise<SavedFileHandle[]> {
  const out: SavedFileHandle[] = []
  try {
    const storage: any = (navigator as any)?.storage
    if (!storage || typeof storage.getDirectory !== 'function') return out
    const root = await storage.getDirectory()
    const dir = await (root as any).getDirectoryHandle('trace-ai', { create: true })
    // @ts-ignore async iterator
    for await (const [name, handle] of (dir as any).entries()) {
      if ((handle as any).kind !== 'file') continue
      const fh = handle as FileSystemFileHandle
      const f = await fh.getFile()
      if (!/^image\//i.test(f.type)) continue
      out.push({
        name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified,
        fileHandle: fh,
      })
    }
  } catch {}
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

export async function readImageAsDataUrl(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile()
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  const base64 = btoa(binary)
  const mime = file.type || 'image/jpeg'
  return `data:${mime};base64,${base64}`
}
