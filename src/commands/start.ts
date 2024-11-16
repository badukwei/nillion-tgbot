import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:start_command');

export const start = () => async (ctx: Context) => {
    try {
        const userId = ctx.message?.from.id;
        if (!userId) {
            await ctx.reply('Could not identify user');
            return;
        }

        const welcomeMessage =
            '👋 *Welcome to Nillion Secure Photo Bot\\!*\n\n' +
            'This bot allows you to securely store and share your photos using Nillion\n\n' +
            '🔒 *Getting Started:*\n' +
            'Type /create to set up your account';

        debug(`Sending welcome message to user ${userId}`);
        await ctx.replyWithMarkdownV2(welcomeMessage);

    } catch (error) {
        debug('Error in start command:', error);
        await ctx.reply('An error occurred while starting the bot. Please try again.');
    }
};

export default start;
