import { Context, Markup, Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import axios from 'axios';
import { start, help, about, list, retrieveValue, storeValue, handleCallbackQuery, createUserStoreID } from './commands';
import { autoDeleteMessage } from './utils/utils';

import createDebug from 'debug';
import { getUserAppId } from './core/database';
const debug = createDebug('bot:index');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const bot = new Telegraf(BOT_TOKEN);

export const userStoreStates: Record<string, { action?: string; imageName?: string }> = {};

bot.telegram.setMyCommands([
  { command: 'about', description: 'About this bot' },
  { command: 'create', description: 'Create your storage' },
  { command: 'store', description: 'Store an image' },
  { command: 'list', description: 'Get all stored images' },
  { command: 'retrieve', description: 'Retrieve an image' },
  { command: 'help', description: 'How to use this bot' }
]);

bot.command('start', start());
bot.command('store', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!userId) {
    await ctx.reply('Could not identify user');
    return;
  }
  const appId = await getUserAppId(Number(userId));
  if (!appId) {
    throw new Error('Please create an account first using /create');
  }

  userStoreStates[userId] = { action: 'awaiting_image' };
  await ctx.reply('Please upload an image.');
});
bot.command('list', list());
bot.on('callback_query', handleCallbackQuery());
bot.command('create', createUserStoreID())
bot.command('retrieve', retrieveValue());
bot.command('about', about());
bot.command('help', help());

bot.on('photo', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!userId || userStoreStates[userId]?.action !== 'awaiting_image') {
    delete userStoreStates[userId];
    await ctx.reply('Please use /store first to start the storing process.');
    return;
  }

  try {
    // Store the message ID for deletion
    const uploadMessageId = ctx.message.message_id;
    
    const photos = ctx.message.photo;
    const highestResPhoto = photos[photos.length - 1];
    const fileId = highestResPhoto.file_id;
    const fileUrl = await ctx.telegram.getFileLink(fileId);

    const response = await axios.get(fileUrl.href, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const base64Image = buffer.toString('base64');

    userStoreStates[userId].action = 'awaiting_name';
    userStoreStates[userId].imageName = base64Image;
    
    // Delete the original upload message
    await autoDeleteMessage(ctx, uploadMessageId);
    
    await ctx.reply('Image received! Now, please send a name for the image.');
  } catch (error) {
    debug('Error processing image:', error);
    await ctx.reply('An error occurred while processing the image.');
  }
});

bot.on('text', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!userId || userStoreStates[userId]?.action !== 'awaiting_name') {
    delete userStoreStates[userId];
    await ctx.reply('Please start the store process by using the /store command first.');
    return;
  }

  const imageName = ctx.message.text;
  const base64Image = userStoreStates[userId]?.imageName;

  if (!base64Image) {
    return ctx.reply('No image found. Please start again with /store.');
  }

  try {
    const storeId = await storeValue(ctx, userId.toString(), base64Image, imageName);
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
