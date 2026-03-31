import { Router } from 'express';
import { createSystemController } from './system.controller.js';

export const createSystemRouter = (context) => {
    const router = Router();
    const systemController = createSystemController(context);

    router.get('/settings', systemController.getSettings);
    router.post('/settings', systemController.updateSettings);
    router.get('/skills/available', systemController.getSkills);
    router.post('/system/restart', systemController.restartSystem);

    return router;
};