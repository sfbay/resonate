/** SoQL query parameters for Socrata SODA API */
export interface SoQLParams {
  $select?: string;
  $where?: string;
  $order?: string;
  $group?: string;
  $limit?: number;
  $offset?: number;
}

/** Raw vendor payment record from dataset n9pm-xkyq */
export interface VendorPaymentRecord {
  fiscal_year: string;
  vendor: string;
  department: string;
  character: string;
  object: string;
  sub_object: string;
  vouchers_paid: string;
  voucher: string;
  purchase_order: string;
  contract_number: string;
  non_profit_indicator: string;
  vouchers_paid_distribution_date: string;
}

/** Raw supplier contract record from dataset cqi5-hm2d */
export interface SupplierContractRecord {
  contract_no: string;
  contract_title: string;
  department: string;
  prime_contractor: string;
  term_start_date: string;
  term_end_date: string;
  agreed_amt: string;
  pmt_amt: string;
  remaining_amt: string;
  scope_of_work: string;
}

/** Aggregated annual spending row */
export interface VendorYearRow {
  fiscal_year: string;
  total_paid: string;
  payment_count: string;
}

/** Aggregated department breakdown row */
export interface VendorDeptRow {
  department: string;
  total_paid: string;
  payment_count: string;
}

/** Computed metrics for a vendor */
export interface VendorMetrics {
  lifetimeTotal: number;
  fiscalYears: number;
  avgAnnual: number;
  peakYear: { fy: string; amount: number } | null;
  currentYearTotal: number;
  priorYearTotal: number;
  yoyChange: number | null;
  contractCount: number;
  isNonprofit: boolean;
}
