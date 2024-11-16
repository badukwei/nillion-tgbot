import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:start_command');

const start = () => async (ctx: Context) => {
  debug('Triggered "start" command');

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('Create', 'create'),
      Markup.button.callback('Store', 'store')
    ],
    [
      Markup.button.callback('List', 'list'),
      Markup.button.callback('Delte', 'delete')
    ],
    [
      Markup.button.callback('About', 'about'),
      Markup.button.callback('Help', 'help')
    ]
  ]);

  await ctx.reply(
    'Welcome! Choose an option:',
    keyboard
  );
};

export { start };