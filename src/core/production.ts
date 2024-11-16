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

  try {
    const webhookUrl = `https://${process.env.VERCEL_URL}/api`;
    debug(`Setting webhook: ${webhookUrl}`);

    // Initialize bot commands first
    try {
      await bot.telegram.setMyCommands([
        { command: 'about', description: 'About this bot' },
        { command: 'create', description: 'Create your storage' },
        { command: 'store', description: 'Store an image' },
        { command: 'list', description: 'Get all stored images' },
        { command: 'retrieve', description: 'Retrieve an image' },
        { command: 'help', description: 'How to use this bot' }
      ]);
    } catch (cmdError) {
      debug('Error setting commands:', cmdError);
      // Continue even if setting commands fails
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
  } catch (error) {
    debug('Production error:', error);
    throw error;
  }
};