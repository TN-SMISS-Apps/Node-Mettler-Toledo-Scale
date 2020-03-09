import express from 'express';
import { connectionRouter } from './Connection';
import { scaleRouter } from './Scale';

export const router = express.Router();

router.use('/pipes', connectionRouter);
router.use('/scale', scaleRouter);
