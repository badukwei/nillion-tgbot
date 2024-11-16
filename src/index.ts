import { Context, Markup, Telegraf } from 'telegraf';
import { start } from './commands/start';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import axios from 'axios';
import * as fs from 'fs';
import { help, about, deleteImg, list, retrieveValue, storeValue, handleCallbackQuery } from './commands';
// import { createUserStoreID } from './commands/create';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

export const userStoreStates: Record<string, { action?: string; imageName?: string }> = {};

bot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'create', description: 'Create your Storage' },
  { command: 'store', description: 'Store an image' },
  { command: 'list', description: 'Get all stored images' },
  { command: 'delete', description: 'Delete an image' },
  { command: 'retrieve', description: 'Retrieve an image' },
  { command: 'about', description: 'About this bot' },
  { command: 'help', description: 'How to use this bot' }
]);

// bot.command('create', createUserStoreID());
bot.command('store', async (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId) return;

  // Set user state to "awaiting image"
  userStoreStates[userId] = { action: 'awaiting_image' };
  await ctx.reply('Please upload an image.');
});
bot.command('list', list());
bot.on('callback_query', handleCallbackQuery());
bot.command('delete', deleteImg());
bot.command('retrieve', retrieveValue());
bot.command('about', about());
bot.command('help', help());

bot.on('photo', async (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId || userStoreStates[userId]?.action !== 'awaiting_image') {
    return ctx.reply('Please use /store first to start the storing process.');
  }

  try {
    const photos = ctx.message.photo;
    const highestResPhoto = photos[photos.length - 1];
    const fileId = highestResPhoto.file_id;
    const fileUrl = await ctx.telegram.getFileLink(fileId);

    const response = await axios.get(fileUrl.href, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    fs.writeFileSync('downloaded_image.jpg', buffer);

    const base64Image = buffer.toString('base64');
    console.log(base64Image.length);

    userStoreStates[userId].action = 'awaiting_name';
    userStoreStates[userId].imageName = buffer.toString('base64');
    await ctx.reply('Image received! Now, please send a name for the image.');
  } catch (error) {
    await ctx.reply('An error occurred while processing the image.');
  }
});

bot.on('text', async (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId || userStoreStates[userId]?.action !== 'awaiting_name') {
    return;
  }

  const imageName = ctx.message.text;
  const base64Image = userStoreStates[userId]?.imageName;

  if (!base64Image) {
    return ctx.reply('No image found. Please start again with /store.');
  }

  try {
    const storeId = await storeValue(userId, base64Image, imageName);
    delete userStoreStates[userId]; 

    await ctx.reply(`Image stored successfully!\nStore ID: ${storeId}`);
  } catch (error) {
    console.error('Error storing image:', error);
    await ctx.reply('An error occurred while storing the image.');
  }
});


export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

ENVIRONMENT !== 'production' && development(bot);
