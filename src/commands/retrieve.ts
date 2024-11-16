import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:nillion_command');

const APP_ID = process.env.NILLION_APP_ID || '';
const API_BASE = 'https://nillion-storage-apis-v0.onrender.com';

export const retrieveValue = () => async (ctx: Context) => {
    try {
      if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply('Please send a text message');
        return;
      }
  
      const messageText = ctx.message?.text?.split(' ');
      if (!messageText || messageText.length < 3) {
        await ctx.reply('Usage: /retrieve <store_id> <secret_name>');
        return;
      }
  
      const storeId = messageText[1];
      const secretName = messageText[2];
      const userSeed = ctx.from?.id.toString();
  
      const response = await fetch(
        `${API_BASE}/api/secret/retrieve/${storeId}?retrieve_as_nillion_user_seed=${userSeed}&secret_name=${secretName}`
      );
      const result = await response.json();
      
      debug('API Response:', result);
  
      if (!result.secret) {
        await ctx.reply('Error: No data found for this store ID');
        return;
      }
  
      // Check if the secret looks like base64 image data
      if (result.secret.startsWith('/9j/') || result.secret.startsWith('iVBOR')) {
        try {
          const imageBuffer = Buffer.from(result.secret, 'base64');
          await ctx.replyWithPhoto(
            { source: imageBuffer },
            { caption: `Retrieved image: ${secretName}` }
          );
        } catch (photoError) {
          debug('Error sending photo:', photoError);
          await ctx.reply('Error: Could not process the retrieved image');
        }
      } else {
        await ctx.reply(`Retrieved text: ${result.secret || 'No text found'}`);
      }
    } catch (error) {
      debug('Error retrieving value:', error);
      await ctx.reply('Error retrieving value: ' + (error as Error).message);
    }
  };