import express from 'express';
import { SettingsView } from './settings';
import { WeightView } from './weight';
import { connectionRouter } from './connection';

export const router = express.Router();

router.post('/settings', SettingsView);
router.get('/weight', WeightView);

router.use('/pipes', connectionRouter);
