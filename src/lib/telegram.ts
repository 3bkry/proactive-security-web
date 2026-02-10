
import axios from 'axios';

export async function sendCloudTelegramNotification(token: string, chatId: string, message: string) {
    if (!token || !chatId) return;

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (error: any) {
        console.error("[Telegram Cloud] Failed to send notification:", error?.response?.data || error.message);
    }
}
