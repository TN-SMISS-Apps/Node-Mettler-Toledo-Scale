import { Settings } from './Settings.type';
import { WeightSuccessResponse } from './WeightSuccessResponse.type';

export type ReceiptContext = WeightSuccessResponse &
  Omit<Settings, 'unit_price' | 'tare'> & {
    barcode?: string;
    date?: string;
    crc?:string;
  };
