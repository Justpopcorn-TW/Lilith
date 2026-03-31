import { chatService } from './chat.service.js';

export const createChatController = (context) => ({
    getHistory: async (req, res) => {
        try {
            const data = await chatService.getHistoryData(context.repo, req.query.conversationId);
            res.json(data);
        } catch (e) { res.status(e.message.includes("Missing") ? 400 : 500).json({ error: e.message }); }
    },
    resetHistory: async (req, res) => {
        try {
            await chatService.resetHistory(context.repo, req.body.conversationId);
            res.json({ success: true });
        } catch (e) { res.status(e.message.includes("Missing") ? 400 : 500).json({ error: e.message }); }
    },
    postChat: (req, res) => {
        req.setTimeout(0);
        const { message, attachments = [], conversationId = 'web_user', userName = 'User' } = req.body;
        const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const setupTimeout = () => setTimeout(() => {
            if (context.pendingRequests.has(requestId)) {
                const entry = context.pendingRequests.get(requestId);
                if (entry && !entry.res.headersSent) entry.res.status(504).json({ messages: ["[System] Execution timeout."] });
                context.pendingRequests.delete(requestId);
            }
        }, context.REQUEST_TIMEOUT);

        context.pendingRequests.set(requestId, { res, timeoutId: setupTimeout(), conversationId });

        context.dispatchToBrain({ 
            type: 'WEB_CHAT_REQUEST', 
            requestId, 
            payload: { conversationId, userName, content: message, attachments } 
        });
    }
});