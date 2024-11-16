import { Context, Markup } from "telegraf";
import { getUserStoreIds } from '../core/database';
import createDebug from 'debug';

const debug = createDebug('bot:list_command');
const APP_ID = process.env.NILLION_APP_ID || '';
const API_BASE = 'https://nillion-storage-apis-v0.onrender.com';

type StoreItem = {
  store_id: string;
  secret_name: string;
};

const ITEMS_PER_PAGE = 5;

const generateButtons = (data: StoreItem[], page: number) => {
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = data.slice(start, end);

  // Generate buttons for each item
  const itemButtons = pageItems.map((item) =>
    Markup.button.callback(item.secret_name, `store_${item.store_id}`)
  );

  // Add navigation buttons
  const navigationButtons = [];
  if (page > 0) {
    navigationButtons.push(Markup.button.callback('⬅️ Previous', `page_${page - 1}`));
  }
  if (end < data.length) {
    navigationButtons.push(Markup.button.callback('➡️ Next', `page_${page + 1}`));
  }

  return Markup.inlineKeyboard([...itemButtons.map((btn) => [btn]), navigationButtons]);
};

const list = () => async (ctx: Context) => {
    try {
        const userSeed = ctx.from?.id.toString();
        if (!userSeed) {
            await ctx.reply('Could not identify user');
            return;
        }

        const data = await fetch(`${API_BASE}/api/apps/${APP_ID}/store_ids`)
            .then((res) => res.json())
            .then((data) => data.store_ids);

        if (!data || data.length === 0) {
            return ctx.reply('No stored images found.');
        }

        // Get all store entries from database
        const userStoreEntries = await getUserStoreIds(Number(userSeed));
        
        // Group by type using database entries
        const images = userStoreEntries.filter(entry => entry.contentType === 'image');
        const texts = userStoreEntries.filter(entry => !entry.contentType || entry.contentType === 'text');

        // First send text values if any exist
        if (texts.length > 0) {
            const textButtons = generateButtons(
                texts.map(txt => ({ store_id: txt.storeId, secret_name: `Text: ${txt.storeId}` })),
                0
            );
            await ctx.reply('📝 Text store IDs:', textButtons);
        }

        // Send list of image store IDs with interactive buttons
        if (images.length > 0) {
            const page = 0;
            const buttons = generateButtons(
                images.map(img => ({ store_id: img.storeId, secret_name: `Image: ${img.storeId}` })),
                page
            );
            await ctx.reply('🖼️ Image store IDs and the blurred thumbnails:', buttons);

            // Handle thumbnails
            const mediaGroup = [];
            for (const img of images) {
                if (img.thumbnail) {
                    const imageBuffer = Buffer.from(img.thumbnail, 'base64');
                    mediaGroup.push({
                        type: 'photo' as const,
                        media: { source: imageBuffer },
                        caption: `ID: ${img.storeId}`
                    });
                }
            }

            if (mediaGroup.length > 0) {
                await ctx.replyWithMediaGroup(mediaGroup);
            }

            // List any images without thumbnails
            const imagesWithoutThumbnails = images.filter(img => !img.thumbnail);
            if (imagesWithoutThumbnails.length > 0) {
                let noThumbMessage = '📸 Images without thumbnails:\n';
                imagesWithoutThumbnails.forEach(img => {
                    noThumbMessage += `- ${img.storeId}\n`;
                });
                await ctx.reply(noThumbMessage);
            }
        }
    } catch (error) {
        debug('Error listing store IDs:', error);
        await ctx.reply('An error occurred while listing stored images.');
    }
};

function isDataCallbackQuery(query: any): query is { data: string } {
    return query && 'data' in query;
}

const handleCallbackQuery = () => async (ctx: Context) => {
    if (!ctx.callbackQuery || !isDataCallbackQuery(ctx.callbackQuery)) return;

    const data = ctx.callbackQuery.data;
    const userSeed = ctx.from?.id.toString();
    if (!userSeed) return;

    // Handle page navigation
    if (data.startsWith('page_')) {
        const page = parseInt(data.split('_')[1], 10);

        try {
            const userStoreEntries = await getUserStoreIds(Number(userSeed));
            const images = userStoreEntries.filter(entry => entry.contentType === 'image');
            
            const buttons = generateButtons(
                images.map(img => ({ store_id: img.storeId, secret_name: `Image: ${img.storeId}` })),
                page
            );
            await ctx.editMessageReplyMarkup(buttons.reply_markup);
        } catch (error) {
            debug('Error fetching paginated data:', error);
        }
    }

    // Handle store selection
    if (data.startsWith('store_')) {
        const storeId = data.split('_')[1];
        await ctx.reply(`You selected store ID: ${storeId}`);
    }
};

export { list, handleCallbackQuery };