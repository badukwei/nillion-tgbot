import { Context } from 'telegraf';
import createDebug from 'debug';
import { getUserStoreIds, saveUserStoreId, saveUserAppId } from '../core/database';

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
    const appId = result.app_id;
    
    // Save app_id to database
    await saveUserAppId(Number(USER_SEED), appId);
    
    // Generate a readable secret name using timestamp
    const secretName = `store_${new Date().toISOString().split('T')[0]}`;
    
    // Save to database with proper parameters
    const savedEntry = await saveUserStoreId(
      Number(USER_SEED),
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