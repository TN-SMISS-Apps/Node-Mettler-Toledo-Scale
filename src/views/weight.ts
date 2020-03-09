import { RequestHandler } from 'express';
import { scaleCommunicationService } from '../services/ScaleCommunicationService';

export const WeightView: RequestHandler = async (_, res) => {
  scaleCommunicationService.requestCurrentWeight()
  res.send('Hallo');
};
