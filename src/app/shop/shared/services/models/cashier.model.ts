export interface Cashier {
  id?: string;
  initialCash?: number;
  cashSales?: number;
  cardSales?: number;
  usedVouchers?: number;
  deposit?: number;
  withdrawal?: number;
  comment?: string;
  lostCard?: number;
  lostCash?: number;
  finalCash?: number;
  finalCard?: number;
  openingDate?: Date;
  closureDate?: Date;
}
