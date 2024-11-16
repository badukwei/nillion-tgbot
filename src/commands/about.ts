import { Context } from 'telegraf';
import createDebug from 'debug';

import { author, name, version } from '../../package.json';

const debug = createDebug('bot:about_command');

const about = () => async (ctx: Context) => {
  try {
    const escapedName = name.replace(/-/g, '\\-');

    const message = `*${escapedName} ${version}*\\n\\n` +
      `A secure photo sharing bot powered by Nillion's advanced encryption technology\\. ` +
      `This bot allows users to send photos securely with end\\-to\\-end encryption\\.\n\n` +
      `🔒 *Features*:\\n` +
      `• Secure photo transmission\\n` + // Changed - to •
      `• End\\-to\\-end encryption\\n` + // Changed - to •
      `• Privacy\\-first design\\n\\n` + // Changed - to •
      `Type /help to learn how to use this bot\\.\\n\\n` +
      `Created by: ${author}`;


    console.log('About command triggered:', message); // Add this line
    debug(`Triggered "about" command with message: ${message}`);
    
    await ctx.replyWithMarkdownV2(message);
    debug('About message sent successfully');
  } catch (error) {
    debug('Error in about command:', error);
    await ctx.reply('Sorry, there was an error displaying the about information.');
  }
};

export { about };
