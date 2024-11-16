import createDebug from 'debug';

const debug = createDebug('bot:store_command');

const APP_ID = process.env.NILLION_APP_ID || '';
const API_BASE = 'https://nillion-storage-apis-v0.onrender.com';

const storeValue = async (userSeed: string, base64Image: string, secretName: string) => {
    try {
        const secretValue = base64Image;

        const response = await fetch(`${API_BASE}/api/apps/${APP_ID}/secrets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: {
                    nillion_seed: userSeed,
                    secret_value: secretValue,
                    secret_name: secretName,
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
        return result.store_id;
    } catch (error) {
        debug('Error storing value:', error);
        return null;
    }
};

export { storeValue };