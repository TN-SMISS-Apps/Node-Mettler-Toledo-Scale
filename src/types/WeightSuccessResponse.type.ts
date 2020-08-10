export type WeightSuccessResponse = {
  scale_status: string;
  weight: number;
  unit_price: number;
  selling_price: number;
};

export type WithReceiptInfo = {
  receipt_printed: boolean;
  receipt_print_errors?: any;
};

export type WeightSuccessResponseWithReceiptInfo = WeightSuccessResponse & WithReceiptInfo;
