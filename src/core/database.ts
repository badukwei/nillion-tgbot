// import { Low } from 'lowdb'
// import { JSONFile } from 'lowdb/node'
// import createDebug from 'debug';

// const debug = createDebug('bot:database');

// // Define types for our database structure
// type StoreEntry = {
//     storeId: string
//     createdAt: string
// }

// type User = {
//     telegramId: number
//     storeIds: StoreEntry[]
// }

// type Schema = {
//     users: User[]
// }

// // Create default data
// const defaultData: Schema = {
//     users: []
// }

// // Initialize database
// const adapter = new JSONFile<Schema>('db.json')
// const db = new Low<Schema>(adapter, defaultData)

// export async function saveUserStoreId(telegramId: number, storeId: string) {
//     await db.read()

//     const newEntry: StoreEntry = {
//         storeId,
//         createdAt: new Date().toISOString()
//     }

//     const existingUser = db.data.users.find(u => u.telegramId === telegramId)

//     if (existingUser) {
//         // Add new store ID to existing user's array
//         existingUser.storeIds.push(newEntry)
//     } else {
//         // Create new user with their first store ID
//         db.data.users.push({
//             telegramId,
//             storeIds: [newEntry]
//         })
//     }

//     await db.write()
//     debug(`Saved store ID ${storeId} for user ${telegramId}`)
//     return newEntry
// }

// export async function getUserStoreIds(telegramId: number) {
//     await db.read()
//     const user = db.data.users.find(u => u.telegramId === telegramId)
//     return user?.storeIds || []
// }
