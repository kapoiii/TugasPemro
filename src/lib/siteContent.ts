import fs from 'fs'
import path from 'path'
import defaultContent from '@/data/site-content.json'

export type SiteContent = typeof defaultContent

const CONTENT_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'site-content.json')

// In-memory cache in case of serverless/filesystem limitations
let inMemoryContent: SiteContent = { ...defaultContent }

export function getSiteContent(): SiteContent {
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const fileData = fs.readFileSync(CONTENT_FILE_PATH, 'utf-8')
      const parsed = JSON.parse(fileData)
      inMemoryContent = parsed
      return parsed
    }
  } catch (error) {
    console.warn('Failed reading site-content.json from disk, using in-memory fallback:', error)
  }
  return inMemoryContent
}

export function saveSiteContent(newContent: SiteContent): boolean {
  try {
    inMemoryContent = newContent
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(newContent, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Failed writing site-content.json to disk:', error)
    return false
  }
}
