import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:nillion_command');

const APP_ID = process.env.NILLION_APP_ID || '';
const API_BASE = 'https://nillion-storage-apis-v0.onrender.com';

const retrieveValue = () => async (ctx: Context) => {
    try {
        const storeIds = await fetch(`${API_BASE}/api/apps/${APP_ID}/store_ids`)
            .then((res) => res.json())
            .then((data) => data.store_ids);
        const userSeed = ctx.from?.id.toString();

        const response = await fetch(
            `${API_BASE}/api/secret/retrieve/${storeIds[0].store_id}?retrieve_as_nillion_user_seed=${userSeed}&secret_name=${storeIds[0].secret_name}`
        );
        const result = await response.json();
        await ctx.reply(`Retrieved value: ${result.secret}`);
    } catch (error) {
        debug('Error retrieving value:', error);
        await ctx.reply('Error retrieving value: ' + (error as Error).message);
    }
};

export { retrieveValue };