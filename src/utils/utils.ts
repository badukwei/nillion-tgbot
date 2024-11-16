import { Context } from 'telegraf';
import createDebug from 'debug';
import sharp from 'sharp';

import { saveUserStoreId, getUserStoreIds } from '../core/database';

import { author, name, version } from '../../package.json';

const debug = createDebug('bot:about_command');

export const about = () => async (ctx: Context) => {
  const message = `*${name} ${version}*\n${author}`;
  debug(`Triggered "about" command with message \n${message}`);
  await ctx.replyWithMarkdownV2(message, { parse_mode: 'Markdown' });
  await autoDeleteMessage(ctx);
};

export const createUserStoreID = () => async (ctx: Context) => {
  try {
    debug('Creating new user store ID');
    
    const telegramId = ctx.from?.id;
    
    if (!telegramId) {
      await ctx.reply('Could not identify user');
      return;
    }

    const response = await fetch('https://nillion-storage-apis-v0.onrender.com/api/apps/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    // Save to database
    await saveUserStoreId(telegramId, result.app_id);
    
    // Get all user's store IDs
    const allStoreIds = await getUserStoreIds(telegramId);
    const storeIdsList = allStoreIds
      .map(entry => `- ${entry.storeId} (created: ${new Date(entry.createdAt).toLocaleString()})`)
      .join('\n');
    
    await ctx.reply(
      `New store ID created: ${result.app_id}\n\nAll your store IDs:\n${storeIdsList}`
    );
  } catch (error) {
    debug('Error creating store ID:', error);
    await ctx.reply('Error creating store ID: ' + (error as Error).message);
  }
};

export const autoDeleteMessage = async (ctx: Context, timeoutMs: number = 5000) => {
  const message = await ctx.update;
  if ('message' in message && message.message) {
    setTimeout(async () => {
      try {
        await ctx.deleteMessage(message.message.message_id);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }, timeoutMs);
  }
};

export async function compressImage(base64Image: string, secretName: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // First resize the image to get its dimensions
    const resizedImage = await sharp(imageBuffer)
      .resize(100, 100, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    // Get dimensions of the resized image
    const { width, height } = await sharp(resizedImage).metadata();
    
    if (!width || !height) {
      throw new Error('Failed to get image dimensions');
    }

    // Create a text overlay buffer with matching dimensions
    const textSvg = Buffer.from(`
      <svg width="${width}" height="${height}">
        <style>
          text {
            font-family: Arial;
            font-size: ${Math.max(8, Math.floor(height / 8))}px;
            fill: white;
            opacity: 0.7;
            text-shadow: 2px 2px 2px rgba(0,0,0,0.5);
          }
        </style>
        <text x="50%" y="90%" text-anchor="middle">${secretName}</text>
      </svg>
    `);

    // Process image with sharp
    const processedBuffer = await sharp(resizedImage)
      .composite([{
        input: textSvg,
        gravity: 'south'
      }])
      .jpeg({
        quality: 20,
        progressive: true
      })
      .toBuffer();

    // Convert back to base64
    return processedBuffer.toString('base64');
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}