import { RequestHandler, Router } from 'express';
import { BadRequestError, CashDrawerOpenResponse } from '../types';
import { attemptToOpenDrawer } from '../utils/cashDrawer';

export const cashDrawerRouter = Router();

const OpenView: RequestHandler = (_, res) => {
  attemptToOpenDrawer()
    .then((_) => {
      const resp: CashDrawerOpenResponse = { message_sent: true };
      res.send(resp);
    })
    .catch((err: Error) => {
      const errorResp: BadRequestError = {
        error_code: 'COM_PORT',
        message: err.message,
        error: err,
      };
      res.status(409).send(errorResp);
    });
};

cashDrawerRouter.post('/open', OpenView);
