import Joi from '@hapi/joi';
import { ValidatedSettings } from '../types';

export const SettingSchema = Joi.object({
  tare: Joi.number()
    .precision(3)
    .min(0)
    .max(9.999)
    .required(),
  unit_price: Joi.number()
    .precision(2)
    .min(0)
    .max(9999)
    .required(),
  description_text: Joi.string().required(),
} as ValidatedSettings);