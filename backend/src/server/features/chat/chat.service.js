export const chatService = {
    getHistoryData: async (repo, conversationId) => {
        if (!conversationId || !repo) throw new Error("Missing DB or ID");
        const history = await repo.getHistory(conversationId);
        const totalTokens = await repo.getTotalTokens(conversationId);
        const relationship = await repo.getRelationship(conversationId) || {};
        return { history, totalTokens, relationship };
    },

    resetHistory: async (repo, conversationId) => {
        if (!conversationId || !repo) throw new Error("Missing DB or ID");
        await repo.saveHistory(conversationId, []);
    }
};