import { Context } from 'telegraf';
import createDebug from 'debug';
import { getUserStoreIds, saveUserStoreId } from '../core/database';

const USER_SEED = Number(process.env.USER_SEED || '');
const debug = createDebug('bot:create_command');

export const createUserStoreID = () => async (ctx: Context) => {
  try {
    debug('Creating new user store ID');
    
    if (!USER_SEED) {
      await ctx.reply('Could not identify user');
      return;
    }

    const response = await fetch('https://nillion-storage-apis-v0.onrender.com/api/apps/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Generate a readable secret name using timestamp
    const secretName = `store_${new Date().toISOString().split('T')[0]}`;
    
    // Save to database with proper parameters
    const savedEntry = await saveUserStoreId(
      Number(USER_SEED),
      result.app_id,
      secretName,
      undefined,
      'text' // Default content type for new stores
    );
    
    // Get all user's store IDs
    const allStoreIds = await getUserStoreIds(Number(USER_SEED));
    
    // Format the list with better readability
    const storeIdsList = allStoreIds
      .map(entry => {
        const date = new Date(entry.createdAt).toLocaleString();
        return `• ${entry.secretName} (ID: ${entry.storeId})\n  Created: ${date}`;
      })
      .join('\n');
    
    await ctx.reply(
      `✅ New store created successfully!\n\n` +
      `📋 Store Details:\n` +
      `Name: ${secretName}\n` +
      `ID: ${result.app_id}\n\n` +
      `📚 Your Stores:\n${storeIdsList}`
    );

  } catch (error) {
    debug('Error creating store ID:', error);
    await ctx.reply('❌ Error creating store ID: ' + (error as Error).message);
  }
};