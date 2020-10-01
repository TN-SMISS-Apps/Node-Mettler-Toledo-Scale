import express from 'express';
import { connectionRouter } from './Connection';
import { scaleRouter } from './Scale';
import { windowRouter } from './Window';

export const router = express.Router();

router.use('/pipes', connectionRouter);
router.use('/scale', scaleRouter);
router.use('/window', windowRouter);
