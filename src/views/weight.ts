import { RequestHandler } from 'express';
import { scaleCommunicationService } from '../services/scale_communication_service';

export const WeightView: RequestHandler = async (_, res) => {
  scaleCommunicationService.requestCurrentWeight()
  res.send('Hallo');
};
