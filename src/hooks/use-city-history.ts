'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchDataset, escapeVendor } from '@/lib/socrata/client';
import { getCityVendorName } from '@/lib/socrata/vendor-names';
import type {
  VendorYearRow,
  VendorDeptRow,
  SupplierContractRecord,
  VendorMetrics,
} from '@/lib/socrata/types';

interface CityHistoryData {
  vendorName: string;
  yearData: VendorYearRow[];
  deptData: VendorDeptRow[];
  contracts: SupplierContractRecord[];
  metrics: VendorMetrics | null;
  isLoading: boolean;
  error: string | null;
}

function computeMetrics(
  yearData: VendorYearRow[],
  contracts: SupplierContractRecord[],
  isNonprofit: boolean
): VendorMetrics {
  const years = yearData.map((r) => ({
    fy: r.fiscal_year,
    amount: parseFloat(r.total_paid) || 0,
  }));

  const lifetimeTotal = years.reduce((sum, y) => sum + y.amount, 0);
  const sorted = [...years].sort((a, b) => b.amount - a.amount);
  const peakYear = sorted[0] ?? null;

  const fyNumbers = years.map((y) => parseInt(y.fy)).filter((n) => !isNaN(n));
  const currentFY = fyNumbers.length > 0 ? Math.max(...fyNumbers) : 0;
  const currentYearTotal = years.find((y) => y.fy === String(currentFY))?.amount ?? 0;
  const priorYearTotal = years.find((y) => y.fy === String(currentFY - 1))?.amount ?? 0;
  const yoyChange = priorYearTotal > 0
    ? ((currentYearTotal - priorYearTotal) / priorYearTotal) * 100
    : null;

  return {
    lifetimeTotal,
    fiscalYears: years.length,
    avgAnnual: years.length > 0 ? lifetimeTotal / years.length : 0,
    peakYear: peakYear ? { fy: peakYear.fy, amount: peakYear.amount } : null,
    currentYearTotal,
    priorYearTotal,
    yoyChange,
    contractCount: contracts.length,
    isNonprofit,
  };
}

export function useCityHistory(publisherId: string | null): CityHistoryData {
  const vendorName = publisherId ? getCityVendorName(publisherId) : null;
  const [yearData, setYearData] = useState<VendorYearRow[]>([]);
  const [deptData, setDeptData] = useState<VendorDeptRow[]>([]);
  const [contracts, setContracts] = useState<SupplierContractRecord[]>([]);
  const [isNonprofit, setIsNonprofit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorName) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const escaped = escapeVendor(vendorName);
    const vendorClause = `vendor = '${escaped}'`;
    const contractorClause = escaped.length >= 6
      ? `UPPER(prime_contractor) LIKE '%${escaped.toUpperCase()}%'`
      : `UPPER(prime_contractor) = '${escaped.toUpperCase()}'`;

    Promise.all([
      fetchDataset<VendorYearRow>('vendorPayments', {
        $select: 'fiscal_year, SUM(vouchers_paid) as total_paid, COUNT(*) as payment_count',
        $where: vendorClause,
        $group: 'fiscal_year',
        $order: 'fiscal_year ASC',
        $limit: 50,
      }),
      fetchDataset<VendorDeptRow>('vendorPayments', {
        $select: 'department, SUM(vouchers_paid) as total_paid, COUNT(*) as payment_count',
        $where: vendorClause,
        $group: 'department',
        $order: 'total_paid DESC',
        $limit: 20,
      }),
      fetchDataset<SupplierContractRecord>('supplierContracts', {
        $select: 'contract_no, contract_title, department, agreed_amt, pmt_amt, remaining_amt, term_start_date, term_end_date, scope_of_work',
        $where: contractorClause,
        $order: 'pmt_amt DESC',
        $limit: 20,
      }),
      fetchDataset<{ non_profit_indicator: string }>('vendorPayments', {
        $select: 'non_profit_indicator',
        $where: `${vendorClause} AND non_profit_indicator = 'Y'`,
        $limit: 1,
      }),
    ])
      .then(([years, depts, ctrx, nonprofit]) => {
        if (cancelled) return;
        setYearData(years);
        setDeptData(depts);
        setContracts(ctrx);
        setIsNonprofit(nonprofit.length > 0);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch city history');
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [vendorName]);

  const metrics = useMemo(() => {
    if (yearData.length === 0 && contracts.length === 0) return null;
    return computeMetrics(yearData, contracts, isNonprofit);
  }, [yearData, contracts, isNonprofit]);

  return {
    vendorName: vendorName ?? '',
    yearData,
    deptData,
    contracts,
    metrics,
    isLoading,
    error,
  };
}
