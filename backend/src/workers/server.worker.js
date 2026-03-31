import { parentPort } from 'worker_threads';
import { startServer } from '../server/index.js';

// 建立與大腦溝通的橋樑函式 (Context)
const dispatchToBrain = (msg) => {
    parentPort.postMessage(msg);
};

// 啟動 Server，取得用來解析聊天回應的函數
const { resolveChatResponse } = await startServer(dispatchToBrain);

// 聆聽來自大腦的回應，並交給 Server 處理
parentPort.on('message', async (msg) => {
    if (msg.type === 'WEB_CHAT_RESPONSE' || msg.type === 'WEB_CHAT_HEARTBEAT') {
        await resolveChatResponse(msg);
    }
});