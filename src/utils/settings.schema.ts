import Joi from '@hapi/joi';
import { ValidatedSettings } from '../types';

export const SettingSchema = Joi.object({
  tare: Joi.number().precision(3).min(0).max(5.999).optional().default(0),
  unit_price: Joi.number().precision(2).min(0).max(9999).required(),
  description_text: Joi.string().required(),
  ean: Joi.string().optional(),
  should_print_barcode: Joi.boolean().optional().default(false),
  should_print_additional_text: Joi.boolean().optional().default(true)
} as ValidatedSettings);
