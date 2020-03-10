import Joi from '@hapi/joi';

export type Settings = {
  unit_price: string;
  tare: string;
  description_text: string;
};

export type ValidatedSettings = {
  unit_price: number | Joi.NumberSchema;
  tare: number | Joi.NumberSchema;
  description_text: string | Joi.StringSchema;
};
