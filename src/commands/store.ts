import { Context } from 'telegraf';
import createDebug from 'debug';
import { compressImage } from '../utils/utils';
import { saveUserStoreId } from '../core/database';

const debug = createDebug('bot:store_command');

const APP_ID = process.env.NILLION_APP_ID || '';
const API_BASE = 'https://nillion-storage-apis-v0.onrender.com';

export const storeValue = async (userSeed: string, base64Image: string, secretName: string) => {
    try {
        // Create compressed thumbnail
        const thumbnail = await compressImage(base64Image, secretName);

        const response = await fetch(`${API_BASE}/api/apps/${APP_ID}/secrets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: {
                    nillion_seed: userSeed,
                    secret_value: base64Image,
                    secret_name: secretName,
                    content_type: 'image'
                },
                permissions: {
                    retrieve: [],
                    update: [],
                    delete: [],
                    compute: {},
                },
            }),
        });

        const result = await response.json();
        
        // Save to local database with thumbnail
        await saveUserStoreId(Number(userSeed), result.store_id, thumbnail, 'image');
        
        return result.store_id;
    } catch (error) {
        debug('Error storing value:', error);
        throw error;
    }
};