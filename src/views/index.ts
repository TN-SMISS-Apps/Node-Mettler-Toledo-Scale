import express from 'express';
import { cashDrawerRouter } from './CashDrawer';
import { connectionRouter } from './Connection';
import { scaleRouter } from './Scale';

export const router = express.Router();

router.use('/pipes', connectionRouter);
router.use('/scale', scaleRouter);
router.use('/cash-drawer', cashDrawerRouter)
