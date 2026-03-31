import { Router } from 'express';
import { createChatRouter } from './features/chat/chat.routes.js';
import { fsRouter } from './features/fs/fs.routes.js';
import { createSystemRouter } from './features/system/system.routes.js';

export const setupAppRoutes = (app, context) => {
    const mainRouter = Router();

    // 掛載各功能模組路由
    mainRouter.use('/chat', createChatRouter(context)); 
    mainRouter.use('/fs', fsRouter);                    
    mainRouter.use('/system', createSystemRouter(context)); 

    app.use('/api', mainRouter);
};