import Joi from '@hapi/joi';

export type Settings = {
  unit_price: string;
  tare: string;
  ean: string;
  description_text: string;
  should_print_barcode: boolean,
  should_print_additional_text: boolean
};

export type ValidatedSettings = {
  unit_price: number | Joi.NumberSchema;
  tare: number | Joi.NumberSchema;
  ean:  string | Joi.StringSchema;
  description_text: string | Joi.StringSchema;
  should_print_barcode: boolean | Joi.BooleanSchema;
  should_print_additional_text: boolean | Joi.BooleanSchema;
};
