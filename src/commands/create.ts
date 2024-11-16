// import { Context } from 'telegraf';
// import createDebug from 'debug';
// import { getUserStoreIds, saveUserStoreId } from '../core/database';

// const debug = createDebug('bot:create_command');

// export const createUserStoreID = () => async (ctx: Context) => {
//     try {
//         debug('Creating new user store ID');

//         const telegramId = ctx.from?.id;

//         if (!telegramId) {
//             await ctx.reply('Could not identify user');
//             return;
//         }

//         const response = await fetch('https://nillion-storage-apis-v0.onrender.com/api/apps/register', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });

//         const result = await response.json();

//         // Save to database
//         await saveUserStoreId(telegramId, result.app_id);

//         // Get all user's store IDs
//         const allStoreIds = await getUserStoreIds(telegramId);
//         const storeIdsList = allStoreIds
//             .map(entry => `- ${entry.storeId} (created: ${new Date(entry.createdAt).toLocaleString()})`)
//             .join('\n');

//         await ctx.reply(
//             `New store ID created: ${result.app_id}\n\nAll your store IDs:\n${storeIdsList}`
//         );
//     } catch (error) {
//         debug('Error creating store ID:', error);
//         await ctx.reply('Error creating store ID: ' + (error as Error).message);
//     }
// };


