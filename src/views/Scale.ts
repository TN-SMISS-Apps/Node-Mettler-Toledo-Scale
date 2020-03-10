import { RequestHandler, Router } from 'express';
import { scaleCommunicationService } from '../services/ScaleCommunicationService';
import { BadRequestError, WeightSuccessResponse } from '../types';

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

// set unit price, tare, text
const SettingsView: RequestHandler = (req, res) => {
  console.log(req.body);
  res.send(200);
};

const WeightView: RequestHandler = async (_, res) => {
  scaleCommunicationService
    .getWeight()
    .then((resp: WeightSuccessResponse) => res.send(resp))
    .catch((err: BadRequestError) => {
      res.status(409).send(err);
    });
};

scaleRouter.post('/settings', SettingsView);
scaleRouter.get('/weight', WeightView);
