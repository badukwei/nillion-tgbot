import { Context, Markup } from "telegraf";
import { getUserStoreIds } from '../core/database';
import createDebug from 'debug';

const debug = createDebug('bot:list_command');
const APP_ID = process.env.NILLION_APP_ID || '';
const API_BASE = 'https://nillion-storage-apis-v0.onrender.com';

type StoreItem = {
    store_id: string;
    secret_name: string;
    content_type?: 'image' | 'text';
};

const ITEMS_PER_PAGE = 5;

const generateButtons = (data: StoreItem[], page: number, hasNextPage: boolean) => {
  // Generate buttons for each item
  const itemButtons = data.map((item) =>
    Markup.button.callback(item.secret_name, `store_${item.store_id}`)
  );

  // Add navigation buttons
  const navigationButtons = [];
  if (page > 0) {
    navigationButtons.push(Markup.button.callback('⬅️ Previous', `page_${page - 1}`));
  }
  if (hasNextPage) {
    navigationButtons.push(Markup.button.callback('➡️ Next', `page_${page + 1}`));
  }

  return Markup.inlineKeyboard([...itemButtons.map((btn) => [btn]), navigationButtons]);
};

const fetchPageData = async (page: number, pageSize: number): Promise<{ items: StoreItem[], hasNextPage: boolean }> => {
  const url = `${API_BASE}/api/apps/${APP_ID}/store_ids?page=${page + 1}&page_size=${pageSize}`;
  const response = await fetch(url);
  const result = await response.json();

  return {
    items: result.store_ids || [],
    hasNextPage: (result.store_ids || []).length === pageSize, // 如果结果数量等于 pageSize，说明可能还有下一页
  };
};

const list = () => async (ctx: Context) => {
  try {
    const userSeed = ctx.from?.id.toString();
    if (!userSeed) {
      await ctx.reply('Could not identify user');
      return;
    }

    // 1. Fetch API store objects
    const page = 0;
    const { items, hasNextPage } = await fetchPageData(page, ITEMS_PER_PAGE);

    if (!items || items.length === 0) {
      return ctx.reply('No stored items found.');
    }

    // Display store objects with pagination
    const buttons = generateButtons(items, page, hasNextPage);
    await ctx.reply('📋 Store IDs:', buttons);

    // 2. Separately handle local thumbnails
    const userStoreEntries = await getUserStoreIds(Number(userSeed));
    const images = userStoreEntries.filter(entry => entry.contentType === 'image');

    if (images.length > 0) {
      await ctx.reply('🖼️ Your stored image thumbnails:');

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
    await ctx.reply('An error occurred while listing stored items.');
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
      const { items, hasNextPage } = await fetchPageData(page, ITEMS_PER_PAGE);

      if (!items || items.length === 0) {
        return ctx.reply('No more items found.');
      }

      const buttons = generateButtons(items, page, hasNextPage);
      await ctx.editMessageReplyMarkup(buttons.reply_markup);
    } catch (error) {
      console.error('Error fetching paginated data:', error);
      await ctx.reply('An error occurred while navigating pages.');
    }
  }

    // Handle store selection
    if (data.startsWith('store_')) {
        const storeId = data.split('_')[1];
        
        try {
            // Get the store entry to determine if it's an image or text
            const userStoreEntries = await getUserStoreIds(Number(userSeed));
            const selectedEntry = userStoreEntries.find(entry => entry.storeId === storeId);
            
            if (!selectedEntry) {
                await ctx.reply('Store ID not found');
                return;
            }

            // Extract the actual secret name from the button text
            const secretName = selectedEntry.secretName; // Fallback to storeId if no secretName

            const response = await fetch(
                `${API_BASE}/api/secret/retrieve/${storeId}?retrieve_as_nillion_user_seed=${userSeed}&secret_name=${secretName}`
            );
            const result = await response.json();

            if (!result.secret) {
                await ctx.reply('Error: No data found for this store ID');
                return;
            }

            // Check if it's an image or text based on the content type
            if (selectedEntry.contentType === 'image') {
                const imageBuffer = Buffer.from(result.secret, 'base64');
                await ctx.replyWithPhoto(
                    { source: imageBuffer },
                    { caption: `Retrieved image: ${secretName}` }
                );
            } else {
                await ctx.reply(`Retrieved text: ${result.secret}`);
            }

            // Answer the callback query to remove loading state
            await ctx.answerCbQuery();
        } catch (error) {
            debug('Error retrieving value:', error);
            await ctx.reply('Error retrieving value: ' + (error as Error).message);
            await ctx.answerCbQuery();
        }
    }
};

export { list, handleCallbackQuery };
