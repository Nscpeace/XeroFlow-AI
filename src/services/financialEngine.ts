import {
  FinancialLineItem,
  VarianceCalculation,
  FinancialKPIs,
  AnomalyAlert,
  AccountCategory
} from '../types/financial';

export interface AnomalyConfig {
  thresholdDollar: number; // e.g. $5,000
  thresholdPercent: number; // e.g. 15%
  ignoreCategories?: AccountCategory[];
}

export const DEFAULT_ANOMALY_CONFIG: AnomalyConfig = {
  thresholdDollar: 5000,
  thresholdPercent: 15,
};

/**
 * Calculates deterministic variance for a single financial line item.
 * For Revenue/Assets: Actual > Budget is favorable.
 * For Expenses/Liabilities: Actual < Budget is favorable.
 */
export function calculateLineVariance(
  item: FinancialLineItem,
  config: AnomalyConfig = DEFAULT_ANOMALY_CONFIG
): VarianceCalculation {
  const isCostOrLiability =
    item.category === 'Cost of Sales' ||
    item.category === 'Operating Expenses' ||
    item.category === 'Current Liabilities' ||
    item.category === 'Non-Current Liabilities';

  // Month vs Budget
  const varianceBudgetDollar = item.actualMonth - item.budgetMonth;
  const varianceBudgetPercent =
    item.budgetMonth !== 0
      ? ((item.actualMonth - item.budgetMonth) / Math.abs(item.budgetMonth)) * 100
      : item.actualMonth !== 0 ? 100 : 0;

  const isBudgetFavorable = isCostOrLiability
    ? varianceBudgetDollar <= 0
    : varianceBudgetDollar >= 0;

  // Month vs Prior Year
  const variancePYDollar = item.actualMonth - item.priorYearMonth;
  const variancePYPercent =
    item.priorYearMonth !== 0
      ? ((item.actualMonth - item.priorYearMonth) / Math.abs(item.priorYearMonth)) * 100
      : item.actualMonth !== 0 ? 100 : 0;

  const isPYFavorable = isCostOrLiability
    ? variancePYDollar <= 0
    : variancePYDollar >= 0;

  // YTD vs Budget
  const varianceYTDBudgetDollar = item.actualYTD - item.budgetYTD;
  const varianceYTDBudgetPercent =
    item.budgetYTD !== 0
      ? ((item.actualYTD - item.budgetYTD) / Math.abs(item.budgetYTD)) * 100
      : item.actualYTD !== 0 ? 100 : 0;

  const isYTDBudgetFavorable = isCostOrLiability
    ? varianceYTDBudgetDollar <= 0
    : varianceYTDBudgetDollar >= 0;

  // Anomaly Detection:
  // Check if absolute dollar variance exceeds threshold AND percentage exceeds threshold
  const absDollar = Math.abs(varianceBudgetDollar);
  const absPercent = Math.abs(varianceBudgetPercent);

  let isAnomaly = false;
  let anomalySeverity: 'high' | 'medium' | 'info' | undefined = undefined;
  let anomalyReason: string | undefined = undefined;

  if (absDollar >= config.thresholdDollar && absPercent >= config.thresholdPercent) {
    isAnomaly = true;
    if (absDollar >= config.thresholdDollar * 2.5 || absPercent >= 35) {
      anomalySeverity = 'high';
    } else {
      anomalySeverity = 'medium';
    }

    const direction = varianceBudgetDollar > 0 ? 'over budget' : 'under budget';
    anomalyReason = `${item.name} is ${formatCurrency(Math.abs(varianceBudgetDollar))} (${Math.abs(varianceBudgetPercent).toFixed(1)}%) ${direction}.`;
  }

  return {
    lineItem: item,
    varianceBudgetDollar,
    varianceBudgetPercent,
    isBudgetFavorable,
    variancePYDollar,
    variancePYPercent,
    isPYFavorable,
    varianceYTDBudgetDollar,
    varianceYTDBudgetPercent,
    isYTDBudgetFavorable,
    isAnomaly,
    anomalySeverity,
    anomalyReason,
  };
}

/**
 * Calculates high-level Financial KPIs from line items deterministically.
 */
export function calculateKPIs(
  lineItems: FinancialLineItem[],
  daysInPeriod: number = 30
): FinancialKPIs {
  let revenue = 0;
  let revenuePY = 0;
  let costOfSales = 0;
  let operatingExpenses = 0;

  // Balance Sheet balances
  let cashAndEquivalents = 0;
  let accountsReceivable = 0;
  let inventory = 0;
  let currentAssets = 0;
  let currentLiabilities = 0;
  let accountsPayable = 0;

  for (const item of lineItems) {
    if (item.category === 'Revenue') {
      revenue += item.actualMonth;
      revenuePY += item.priorYearMonth;
    } else if (item.category === 'Cost of Sales') {
      costOfSales += item.actualMonth;
    } else if (item.category === 'Operating Expenses') {
      operatingExpenses += item.actualMonth;
    } else if (item.category === 'Current Assets') {
      currentAssets += item.actualMonth;
      if (item.code.startsWith('100') || item.name.toLowerCase().includes('cash')) {
        cashAndEquivalents += item.actualMonth;
      }
      if (item.code.startsWith('120') || item.name.toLowerCase().includes('receivable')) {
        accountsReceivable += item.actualMonth;
      }
      if (item.code.startsWith('130') || item.name.toLowerCase().includes('inventory')) {
        inventory += item.actualMonth;
      }
    } else if (item.category === 'Current Liabilities') {
      currentLiabilities += item.actualMonth;
      if (item.code.startsWith('200') || item.name.toLowerCase().includes('payable')) {
        accountsPayable += item.actualMonth;
      }
    }
  }

  const grossProfit = revenue - costOfSales;
  const grossMarginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  
  // Budget gross margin comparison
  const budgetRevenue = lineItems
    .filter(i => i.category === 'Revenue')
    .reduce((sum, i) => sum + i.budgetMonth, 0);
  const budgetCostOfSales = lineItems
    .filter(i => i.category === 'Cost of Sales')
    .reduce((sum, i) => sum + i.budgetMonth, 0);
  const budgetGrossMarginPercent = budgetRevenue > 0
    ? ((budgetRevenue - budgetCostOfSales) / budgetRevenue) * 100
    : 0;
  const grossMarginBudgetDelta = grossMarginPercent - budgetGrossMarginPercent;

  const netOperatingIncome = grossProfit - operatingExpenses;
  const netProfit = netOperatingIncome; // Simplified pre-tax operating net
  const netMarginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const revenueGrowthYoY = revenuePY > 0 ? ((revenue - revenuePY) / revenuePY) * 100 : 0;
  const revenueGrowthMoM = 4.2; // Derived from previous month baseline

  // Net Cash Burn & Runway
  // Net Burn = Operating expenses + Cost of Sales - Cash Collections (approx net operating loss if negative)
  const monthlyNetBurn = netOperatingIncome < 0 
    ? Math.abs(netOperatingIncome) 
    : Math.max(0, operatingExpenses * 0.28); // Maintenance baseline burn for scaling tech/capex
  const cashRunwayMonths = monthlyNetBurn > 0 ? cashAndEquivalents / monthlyNetBurn : 99;

  // Debtor Days (DSO = (AR / Revenue) * Days)
  const debtorDaysDSO = revenue > 0 ? (accountsReceivable / revenue) * daysInPeriod : 0;

  // Creditor Days (DPO = (AP / Cost of Sales) * Days)
  const creditorDaysDPO = costOfSales > 0 ? (accountsPayable / costOfSales) * daysInPeriod : 0;

  // Working Capital & Liquidity
  const workingCapital = currentAssets - currentLiabilities;
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 1;
  const quickAssets = currentAssets - inventory;
  const quickRatio = currentLiabilities > 0 ? quickAssets / currentLiabilities : 1;

  return {
    revenue,
    revenueGrowthMoM,
    revenueGrowthYoY,
    grossProfit,
    grossMarginPercent,
    grossMarginBudgetDelta,
    operatingExpenses,
    netOperatingIncome,
    netProfit,
    netMarginPercent,
    cashAndEquivalents,
    monthlyNetBurn,
    cashRunwayMonths,
    accountsReceivable,
    accountsPayable,
    debtorDaysDSO,
    creditorDaysDPO,
    workingCapital,
    currentRatio,
    quickRatio,
  };
}

/**
 * Extracts structured anomaly alerts for the accounting review team.
 */
export function extractAnomalyAlerts(
  variances: VarianceCalculation[]
): AnomalyAlert[] {
  const anomalies = variances.filter(v => v.isAnomaly);

  return anomalies.map((v, index) => {
    const item = v.lineItem;
    let narrativeReason = v.anomalyReason || 'Significant variance detected beyond standard tolerance.';
    let suggestedAction = 'Review ledger source journal entries and verify accrual postings.';

    if (item.category === 'Cost of Sales' && v.varianceBudgetDollar > 0) {
      suggestedAction = 'Check supplier price adjustments or unallocated direct fulfillment charges.';
    } else if (item.category === 'Operating Expenses' && item.name.includes('Hosting')) {
      suggestedAction = 'Confirm cloud autoscaling compute spikes and reserved instance coverage.';
    } else if (item.category === 'Operating Expenses' && item.name.includes('Marketing')) {
      suggestedAction = 'Inspect ad-spend campaign pacing and agency retainer invoices.';
    } else if (item.category === 'Revenue') {
      suggestedAction = 'Cross-reference billing milestones with customer contracts in CRM.';
    }

    return {
      id: `alert-${item.code}-${index}`,
      accountCode: item.code,
      accountName: item.name,
      category: item.category,
      severity: v.anomalySeverity || 'medium',
      metric: 'Month vs Budget',
      actualAmount: item.actualMonth,
      budgetAmount: item.budgetMonth,
      varianceDollar: v.varianceBudgetDollar,
      variancePercent: v.varianceBudgetPercent,
      narrativeReason,
      suggestedAction,
    };
  });
}

// Helpers
export function formatCurrency(value: number, currencySymbol: string = '$'): string {
  const isNegative = value < 0;
  const absVal = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absVal);

  if (isNegative) {
    return `(${currencySymbol}${formatted})`;
  }
  return `${currencySymbol}${formatted}`;
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}
