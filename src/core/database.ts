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
  userSeed: number
  appId: string
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

  // Add initialization check
if (ENVIRONMENT === 'production' && !kv) {
  console.error('Failed to initialize KV client. Check KV_REST_API_URL and KV_REST_API_TOKEN.');
}

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
  userSeed: number,
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
    const existingIds = await kv.get<StoreEntry[]>(`user:${userSeed}`) || []
    existingIds.push(newEntry)
    await kv.set(`user:${userSeed}`, existingIds)
  } else {
    const data = readJson()
    const existingUser = data.users.find(u => u.userSeed === userSeed)

    if (!existingUser) return;

    existingUser.storeIds.push(newEntry);

    writeJson(data)
  }

  debug(`Saved store ID ${storeId} for user ${userSeed}`)
  return newEntry
}

export async function getUserStoreIds(userSeed: number) {
  if (ENVIRONMENT === 'production' && kv) {
    return await kv.get<StoreEntry[]>(`user:${userSeed}`) || []
  } else {
    const data = readJson()
    const user = data.users.find(u => u.userSeed === userSeed)
    return user?.storeIds || []
  }
}

export async function removeUserStoreId(userSeed: number, storeId: string) {
  if (ENVIRONMENT === 'production' && kv) {
    const existingIds = await kv.get<StoreEntry[]>(`user:${userSeed}`) || [];
    const updatedIds = existingIds.filter(entry => entry.storeId !== storeId);
    await kv.set(`user:${userSeed}`, updatedIds);
  } else {
    const data = readJson();
    const user = data.users.find(u => u.userSeed === userSeed);

    if (user) {
      user.storeIds = user.storeIds.filter(entry => entry.storeId !== storeId);
      user.lastUpdated = new Date().toISOString();
      writeJson(data);
    }
  }

  debug(`Removed store ID ${storeId} for user ${userSeed}`);
}
export async function saveUserAppId(userId: number, appId: string) {
  debug(`Saving app ID ${appId} for user ${userId}`);
  
  try {
    if (ENVIRONMENT === 'production' && kv) {
      await kv.set(`userApp:${userId}`, appId);
      debug(`Successfully saved app ID to KV store`);
    } else {
      const data = readJson();
      const user = data.users.find(u => u.userSeed === userId);
      
      if (user) {
        user.appId = appId;
        user.lastUpdated = new Date().toISOString();
      } else {
        data.users.push({
          userSeed: userId,
          appId,
          storeIds: [],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      
      writeJson(data);
      debug(`Successfully saved app ID to local JSON`);
    }
    return true;
  } catch (error) {
    console.error('Error saving user app ID:', error);
    debug('Error details:', error);
    throw new Error('Failed to save user app ID');
  }
}

export async function getUserAppId(userSeed: number): Promise<string | null> {
  if (ENVIRONMENT === 'production' && kv) {
    return await kv.get<string>(`user:${userSeed}:app_id`);
  } else {
    const data = readJson();
    const user = data.users.find(u => u.userSeed === userSeed);
    return user?.appId || null; // Return the most recent app ID
  }
}
