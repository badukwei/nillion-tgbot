import { Context } from "telegraf";

const deleteImg = () => async (ctx: Context) => {
    await ctx.reply('Delete');
};

export { deleteImg };