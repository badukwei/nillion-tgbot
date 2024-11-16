import { Context } from 'telegraf';
import createDebug from 'debug';

import { author, name, version } from '../../package.json';

const debug = createDebug('bot:about_command');

const about = () => async (ctx: Context) => {
  const message = `*${name} ${version}*\n\n` +
    `A secure photo sharing bot powered by Nillion's advanced encryption technology\\. ` +
    `This bot allows users to send photos securely with end\\-to\\-end encryption\\.\n\n` +
    `🔒 *Features*:\n` +
    `- Secure photo transmission\n` +
    `- End-to-end encryption\n` +
    `- Privacy-first design\n\n` +
    `Type /help to learn how to use this bot\.\n\n` +
    `Created by: ${author}`;
  debug(`Triggered "about" command with message \n${message}`);
  await ctx.replyWithMarkdownV2(message, { parse_mode: 'Markdown' });
};

export { about };
