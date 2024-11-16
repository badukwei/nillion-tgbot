import { Context } from "vm";

export const help = () => async (ctx: Context) => {
    await ctx.reply('Help');
};