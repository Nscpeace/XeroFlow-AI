export interface Organization {
  id: string;
  name: string;
  legalEntity: string;
  currency: string;
  industry: 'SaaS / Tech' | 'E-Commerce & Retail' | 'Professional Services';
  xeroTenantId: string;
  connectedAt: string;
  lastSyncedAt: string;
  reportingCurrencySymbol: string;
}

export type ReportingPeriod = '2026-09' | '2026-08' | '2026-07' | '2026-Q3';

export type AccountCategory = 
  | 'Revenue'
  | 'Cost of Sales'
  | 'Operating Expenses'
  | 'Current Assets'
  | 'Non-Current Assets'
  | 'Current Liabilities'
  | 'Non-Current Liabilities'
  | 'Equity';

export interface FinancialLineItem {
  code: string;
  name: string;
  category: AccountCategory;
  subCategory?: string;
  actualMonth: number;
  budgetMonth: number;
  priorYearMonth: number;
  actualYTD: number;
  budgetYTD: number;
  priorYearYTD: number;
  notes?: string;
}

export interface VarianceCalculation {
  lineItem: FinancialLineItem;
  // Month vs Budget
  varianceBudgetDollar: number;
  varianceBudgetPercent: number;
  isBudgetFavorable: boolean;
  // Month vs Prior Year
  variancePYDollar: number;
  variancePYPercent: number;
  isPYFavorable: boolean;
  // YTD vs Budget
  varianceYTDBudgetDollar: number;
  varianceYTDBudgetPercent: number;
  isYTDBudgetFavorable: boolean;
  // Anomaly status
  isAnomaly: boolean;
  anomalySeverity?: 'high' | 'medium' | 'info';
  anomalyReason?: string;
}

export interface FinancialKPIs {
  revenue: number;
  revenueGrowthMoM: number;
  revenueGrowthYoY: number;
  grossProfit: number;
  grossMarginPercent: number;
  grossMarginBudgetDelta: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  netProfit: number;
  netMarginPercent: number;
  // Cash & Liquidity
  cashAndEquivalents: number;
  monthlyNetBurn: number;
  cashRunwayMonths: number;
  // Working Capital Ratios
  accountsReceivable: number;
  accountsPayable: number;
  debtorDaysDSO: number; // Days Sales Outstanding
  creditorDaysDPO: number; // Days Payable Outstanding
  workingCapital: number;
  currentRatio: number;
  quickRatio: number;
}

export interface AnomalyAlert {
  id: string;
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  severity: 'high' | 'medium' | 'info';
  metric: string;
  actualAmount: number;
  budgetAmount: number;
  varianceDollar: number;
  variancePercent: number;
  narrativeReason: string;
  suggestedAction: string;
}

export interface CommentarySection {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'reviewed' | 'approved';
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface AICommentaryReport {
  executiveSummary: string;
  revenueAndMargins: string;
  opexDrivers: string;
  workingCapitalAndRunway: string;
  riskAndAuditNotes: string;
  generatedAt: string;
  modelUsed: string;
  tokenCount?: number;
  isGroundedVerified: boolean;
}

export type ReviewStatus = 'draft' | 'under_review' | 'approved';

export interface AuditSignoff {
  status: ReviewStatus;
  reviewedBy: string;
  reviewerRole: string;
  timestamp: string;
  signatureHash: string;
  notes: string;
}
