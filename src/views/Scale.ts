import { RequestHandler, Router } from 'express';
import { scaleCommunicationService } from '../services/ScaleCommunicationService';
import { BadRequestError, WeightSuccessResponseWithReceiptInfo } from '../types';
import { SettingSchema } from '../utils/settings.schema';

export const scaleRouter = Router();

const IsScaleConnectedMiddleware: RequestHandler = (_, res, next) => {
  if (!scaleCommunicationService.isConnected) {
    const response: BadRequestError = {
      message: 'App is not connected to scale (pipes)',
      error_code: 'ENOENT',
    };
    res.status(400).send(response);
  } else next();
};

scaleRouter.use(IsScaleConnectedMiddleware);

const SettingsView: RequestHandler = async (req, res) => {
  const data = SettingSchema.validate(req.body);
  if (data.error || data.errors) {
    const err: BadRequestError = {
      message: 'Validation failed',
      error_code: 'VALIDATION',
      error: { ...data.error, ...data.errors },
    };
    res.send(err);
  } else {
    scaleCommunicationService
      .setSettings(data.value)
      .then((_) => res.sendStatus(200))
      .catch((err: BadRequestError) => {
        res.status(409).send(err);
      });
  }
};

const WeightView: RequestHandler = async (_, res) => {
  scaleCommunicationService
    .getWeight()
    .then((resp: WeightSuccessResponseWithReceiptInfo) => res.send(resp))
    .catch((err: BadRequestError) => {
      res.status(409).send(err);
    });
};

scaleRouter.post('/settings', SettingsView);
scaleRouter.get('/weight', WeightView);
