import { Context } from 'telegraf';
import createDebug from 'debug';

import { author, name, version } from '../../package.json';

const debug = createDebug('bot:about_command');

const about = () => async (ctx: Context) => {
  try {
    const message = `*${name} ${version}*\\n\\n` +
      `A secure photo sharing bot powered by Nillion's advanced encryption technology\\. ` +
      `This bot allows users to send photos securely with end\\-to\\-end encryption\\.\n\n` +
      `🔒 *Features*:\\n` +
      `\\- Secure photo transmission\\n` +
      `\\- End\\-to\\-end encryption\\n` +
      `\\- Privacy\\-first design\\n\\n` +
      `Type /help to learn how to use this bot\\.\\n\\n` +
      `Created by: ${author}`;

    debug(`Triggered "about" command with message: ${message}`);
    
    await ctx.replyWithMarkdownV2(message);
    debug('About message sent successfully');
  } catch (error) {
    debug('Error in about command:', error);
    await ctx.reply('Sorry, there was an error displaying the about information.');
  }
};

export { about };
