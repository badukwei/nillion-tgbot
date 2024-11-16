import { Context } from "telegraf";
import createDebug from 'debug';

const debug = createDebug('bot:nillion_command');

const API_BASE = 'https://nillion-storage-apis-v0.onrender.com';

export const deleteValue = () => async (ctx: Context) => {
    try {
      if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply('Please send a text message');
        return;
      }
      if (!('text' in ctx.message)) {
        await ctx.reply('Please send a text message');
        return;
      }
      const messageText = ctx.message?.text?.split(' ');
      if (!messageText || messageText.length < 2) {
        await ctx.reply('Usage: /delete <store_id>');
        return;
      }
  
      const storeId = messageText[1];
      const userSeed = ctx.from?.id.toString();
  
      await fetch(`${API_BASE}/api/secret/delete/${storeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delete_as_nillion_user_seed: userSeed,
        }),
      });
  
      await ctx.reply('Value deleted successfully!');
    } catch (error) {
      debug('Error deleting value:', error);
      await ctx.reply('Error deleting value: ' + (error as Error).message);
    }
  };