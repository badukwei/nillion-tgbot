import { Context } from 'telegraf';

export const help = () => async (ctx: Context) => {
    const helpMessage = 
        '📖 *How to Use This Bot*\n\n' +
        '*Available Commands:*\n\n' +
        '1️⃣ */create* \\- Create your secure account first\n' +
        '    This is required before you can store any photos\n\n' +
        '2️⃣ */store* \\- Store your photos securely\n' +
        '    After using this command:\n' +
        '    \\- Send the photo you want to encrypt' +
        '    \\- Then choose a name for your photo\n\n' +
        '3️⃣ */list* \\- View all your stored photos\n' +
        '    Shows a list of all your encrypted photos\n\n' +
        '4️⃣ */retrieve* \\[photo\\_name\\] \\- Decrypt and view a specific photo\n' +
        '    Use the name you gave when storing the photo\n\n' +
        '5️⃣ */about* \\- Learn more about this bot\n\n' +
        '*Usage Flow:*\n' +
        '1\\. Start by using /create to set up your account\n' +
        '2\\. Use /store to encrypt and save your photos\n' +
        '3\\. Use /list to see your stored photos\n' +
        '4\\. Use /retrieve to decrypt and view photos\n\n' 

    await ctx.replyWithMarkdownV2(helpMessage);
};