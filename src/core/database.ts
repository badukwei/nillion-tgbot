import { createClient } from '@vercel/kv'
import { readFileSync, writeFileSync } from 'fs'
import createDebug from 'debug'

const debug = createDebug('bot:database')
const ENVIRONMENT = process.env.NODE_ENV || ''
const DB_PATH = 'db.json'

type StoreEntry = {
  storeId: string
  secretName: string
  createdAt: string
  thumbnail?: string
  contentType?: 'image' | 'text'
}

type User = {
  telegramId: number
  appIds: string[] // Changed to string array
  storeIds: StoreEntry[]
  createdAt: string // Added creation timestamp
  lastUpdated: string // Added last updated timestamp
}

type Schema = {
  users: User[]
}

// Initialize Vercel KV client
const kv = ENVIRONMENT === 'production' 
  ? createClient({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null

// Simple JSON operations
const readJson = (): Schema => {
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return { users: [] }
  }
}

const writeJson = (data: Schema) => {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export async function saveUserStoreId(
    telegramId: number, 
    storeId: string, 
    secretName: string,
    thumbnail?: string,
    contentType?: 'image' | 'text'
  ) {
    const newEntry: StoreEntry = {
      storeId,
      secretName,
      createdAt: new Date().toISOString(),
      thumbnail,
      contentType
    }
  
    if (ENVIRONMENT === 'production' && kv) {
      const existingIds = await kv.get<StoreEntry[]>(`user:${telegramId}`) || []
      existingIds.push(newEntry)
      await kv.set(`user:${telegramId}`, existingIds)
    } else {
      const data = readJson()
      const existingUser = data.users.find(u => u.telegramId === telegramId)
      
      if (existingUser) {
        existingUser.storeIds.push(newEntry)
      } else {
        data.users.push({
          telegramId,
          appIds: [], // Initialize with empty array
          storeIds: [newEntry],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
      }
      writeJson(data)
    }
    
    debug(`Saved store ID ${storeId} for user ${telegramId}`)
    return newEntry
  }

export async function getUserStoreIds(telegramId: number) {
  if (ENVIRONMENT === 'production' && kv) {
    return await kv.get<StoreEntry[]>(`user:${telegramId}`) || []
  } else {
    const data = readJson()
    const user = data.users.find(u => u.telegramId === telegramId)
    return user?.storeIds || []
  }
}