import { Router } from 'express';
import { fsController } from './fs.controller.js';

export const fsRouter = Router();
fsRouter.get('/list', fsController.list);
fsRouter.get('/read', fsController.read);
fsRouter.post('/write', fsController.write);
fsRouter.post('/extract', fsController.extract);
fsRouter.post('/delete', fsController.delete);