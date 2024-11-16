import { Context } from 'telegraf';
import createDebug from 'debug';
import { saveUserStoreId, saveUserAppId } from '../core/database';

const debug = createDebug('bot:create_command');

export const createUserStoreID = () => async (ctx: Context) => {
  try {
    debug('Creating new user store ID');
    
    const userId = ctx.message?.from.id;
    if (!userId) {
      debug('User ID not found in message');
      await ctx.reply('Could not identify user');
      return;
    }

    debug(`Making API request for user ${userId}`);
    const response = await fetch('https://nillion-storage-apis-v0.onrender.com/api/apps/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      debug(`API error: ${response.status}, ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    debug(`Received app_id: ${result.app_id}`);
    
    // Save app_id to database with error handling
    try {
      await saveUserAppId(userId, result.app_id);
      debug(`Successfully saved app_id for user ${userId}`);
    } catch (dbError) {
      debug('Database error:', dbError);
      throw new Error('Failed to save user data');
    }

    await ctx.reply(
      `✅ Account created successfully!\n\n` +
      `Your account is now ready to store encrypted photos.\n\n` +
      `Use /store to start storing your photos securely.`
    );

  } catch (error) {
    debug('Error creating store ID:', error);
    await ctx.reply('❌ Error creating account: ' + (error as Error).message);
  }
};