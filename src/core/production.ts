import { VercelRequest, VercelResponse } from '@vercel/node';
import createDebug from 'debug';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

const debug = createDebug('bot:dev');

const PORT = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000;
const VERCEL_URL = `${process.env.VERCEL_URL}`;

export const production = async (
  req: VercelRequest,
  res: VercelResponse,
  bot: Telegraf<Context<Update>>,
) => {
  debug('Bot runs in production mode');
  debug('Environment variables check:', {
    BOT_TOKEN: !!process.env.BOT_TOKEN,
    KV_URL: !!process.env.KV_REST_API_URL,
    KV_TOKEN: !!process.env.KV_REST_API_TOKEN,
    USER_SEED: !!process.env.USER_SEED,
    VERCEL_URL: process.env.VERCEL_URL
  });

  try {
    const webhookUrl = `https://${process.env.VERCEL_URL}/api`;
    debug(`Setting webhook: ${webhookUrl}`);

    // Initialize bot commands with retry logic
    for (let i = 0; i < 3; i++) { // Try up to 3 times
      try {
        await bot.telegram.setMyCommands([
          { command: 'about', description: 'About this bot' },
          { command: 'create', description: 'Create your storage' },
          { command: 'store', description: 'Store an image' },
          { command: 'list', description: 'Get all stored images' },
          { command: 'retrieve', description: 'Retrieve an image' },
          { command: 'help', description: 'How to use this bot' }
        ]);
        break; // If successful, break the retry loop
      } catch (cmdError) {
        debug(`Attempt ${i + 1} failed to set commands:`, cmdError);
        if (i === 2) { // Log but don't throw on final attempt
          debug('Failed to set commands after all retries');
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }

    // Set webhook
    const webhookInfo = await bot.telegram.getWebhookInfo();
    if (webhookInfo.url !== webhookUrl) {
      await bot.telegram.deleteWebhook();
      await bot.telegram.setWebhook(webhookUrl);
    }

    if (req.method === 'POST') {
      await bot.handleUpdate(req.body as Update, res);
    } else {
      res.status(200).json({ status: 'ok', webhook: webhookUrl });
    }
  } catch (error: any) {
    debug('Production error:', error);
    console.error('Full error details:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
    throw error;
  }
};