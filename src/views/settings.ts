import { RequestHandler } from 'express';

// set unit price, tare, text
export const SettingsView: RequestHandler = (req, res) => {
  console.log(req.body);
  res.send(200);
};
