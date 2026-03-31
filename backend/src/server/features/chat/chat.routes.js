import { Router } from 'express';
import { createChatController } from './chat.controller.js';

export const createChatRouter = (context) => {
    const router = Router();
    const chatController = createChatController(context);

    // 掛載在 /api/chat (因為在 routes.js 會設定根目錄為 /chat，但原本有 /history 和 /history/reset 等邏輯)
    // 我們把它拆解得更漂亮，為了相容原版 URL，我們這樣掛載：
    router.get('/history', chatController.getHistory);
    router.post('/history/reset', chatController.resetHistory);
    router.post('/', chatController.postChat);

    return router;
};