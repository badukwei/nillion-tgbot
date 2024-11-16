import { Context } from "telegraf";

const autoDeleteMessage = async (ctx: Context, timeoutMs: number = 5000) => {
    const message = await ctx.update;
    if ('message' in message && message.message) {
        setTimeout(async () => {
            try {
                await ctx.deleteMessage(message.message.message_id);
            } catch (error) {
                console.error('Failed to delete message:', error);
            }
        }, timeoutMs);
    }
};

export { autoDeleteMessage };