import { Context, Markup } from "telegraf";

const APP_ID = process.env.NILLION_APP_ID || '';
const API_BASE = 'https://nillion-storage-apis-v0.onrender.com';

type StoreItem = {
  store_id: string;
  secret_name: string;
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
    const page = 0;
    const { items, hasNextPage } = await fetchPageData(page, ITEMS_PER_PAGE);

    if (!items || items.length === 0) {
      return ctx.reply('No stored images found.');
    }

    const buttons = generateButtons(items, page, hasNextPage);
    await ctx.reply('List of stored images:', buttons);
  } catch (error) {
    console.error('Error fetching initial data:', error);
    await ctx.reply('An error occurred while listing stored images.');
  }
};

function isDataCallbackQuery(query: any): query is { data: string } {
  return query && 'data' in query;
}

const handleCallbackQuery = () => async (ctx: Context) => {
  if (!ctx.callbackQuery || !isDataCallbackQuery(ctx.callbackQuery)) return;

  const data = ctx.callbackQuery.data;

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
    await ctx.reply(`You selected store ID: ${storeId}`);
  }
};

export { list, handleCallbackQuery };
