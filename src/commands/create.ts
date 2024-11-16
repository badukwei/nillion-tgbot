import { Context } from 'telegraf';
import createDebug from 'debug';
import { saveUserStoreId, saveUserAppId } from '../core/database';

const debug = createDebug('bot:create_command');

export const createUserStoreID = () => async (ctx: Context) => {
  try {
    debug('Creating new user store ID');
    
    const userId = ctx.message?.from.id;
    if (!userId) {
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
    const appId = result.app_id;
    
    // Save app_id to database
    await saveUserAppId(userId, appId);
    
    // Generate a readable secret name using timestamp
    const secretName = `store_${new Date().toISOString().split('T')[0]}`;
    
    // Save to database with proper parameters
    await saveUserStoreId(
      userId,
      appId,
      secretName,
      undefined,
      'text'
    );
    
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