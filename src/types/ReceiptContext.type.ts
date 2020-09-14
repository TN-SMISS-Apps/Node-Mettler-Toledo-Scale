import { WeightSuccessResponse } from './WeightSuccessResponse.type';

export type ReceiptContext = WeightSuccessResponse & {
  shouldPrintAdditionalText: boolean;
  shouldPrintBarcode: boolean;
  barcode?: string;
};
