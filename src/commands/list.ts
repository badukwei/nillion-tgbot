import { Context, Markup } from "telegraf";

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
        const data = await fetch(`${API_BASE}/api/apps/${APP_ID}/store_ids`)
            .then((res) => res.json())
            .then((data) => data.store_ids);

        console.log(data);
        if (!data || data.length === 0) {
            return ctx.reply('No stored images found.');
        }

        // Render the first page
        const page = 0;
        const buttons = generateButtons(data, page);

        await ctx.reply('List of stored images:', buttons);
    } catch (error) {
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
            const items = await fetch(`${API_BASE}/api/apps/${APP_ID}/store_ids`)
                .then((res) => res.json())
                .then((data) => data.store_ids);

            const buttons = generateButtons(items, page);
            await ctx.editMessageReplyMarkup(buttons.reply_markup);
        } catch (error) {
            console.error('Error fetching paginated data:', error);
        }
    }

    // Handle store selection
    if (data.startsWith('store_')) {
        const storeId = data.split('_')[1];
        await ctx.reply(`You selected store ID: ${storeId}`);
    }
};

export { list, handleCallbackQuery };