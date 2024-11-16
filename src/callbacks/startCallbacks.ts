import { Context } from 'telegraf';

function isDataCallbackQuery(query: any): query is { data: string } {
  return query && 'data' in query;
}

// Handler for button clicks
const handleCallbackQuery = () => async (ctx: Context) => {
  if (!ctx.callbackQuery || !isDataCallbackQuery(ctx.callbackQuery)) return;

  const action = ctx.callbackQuery.data;
  const userId = ctx.from?.id.toString() || '';

  switch (action) {
    case 'create':
      await ctx.answerCbQuery();
      await ctx.reply('Create your Storage');
      break;

    case 'store':
      await ctx.answerCbQuery();
      await ctx.reply('Store an image');
      break;

    case 'list':
      await ctx.answerCbQuery();
      await ctx.reply('Get all stored images');
      break;

    case 'delete':
      await ctx.answerCbQuery();
      await ctx.reply('Delete an image');
      break;

    default:
      await ctx.answerCbQuery();
      break;
  }
};

export { handleCallbackQuery };
