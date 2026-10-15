import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, ShieldAlert, Activity } from 'lucide-react';
import { FinancialKPIs, Organization } from '../types/financial';
import { formatCurrency, formatPercent } from '../services/financialEngine';

interface KPICardsProps {
  kpis: FinancialKPIs;
  org: Organization;
  anomalyCount: number;
  onViewAnomalies: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  kpis,
  org,
  anomalyCount,
  onViewAnomalies,
}) => {
  const sym = org.reportingCurrencySymbol;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* 1. Total Revenue */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1.5">
          <span>Total Monthly Revenue</span>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {formatPercent(kpis.revenueGrowthYoY)} YoY
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono">
          {formatCurrency(kpis.revenue, sym)}
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
          <span>MoM {formatPercent(kpis.revenueGrowthMoM)}</span>
          <span aria-hidden="true">·</span>
          <span>ARR Run-rate {formatCurrency(kpis.revenue * 12, sym)}</span>
        </div>
      </div>

      {/* 2. Gross Margin */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1.5">
          <span>Gross Margin</span>
          <span className={`text-[11px] font-semibold ${kpis.grossMarginBudgetDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {kpis.grossMarginBudgetDelta >= 0 ? '+' : ''}{kpis.grossMarginBudgetDelta.toFixed(1)}% vs Bgt
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono">
          {kpis.grossMarginPercent.toFixed(1)}%
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
          <span>Gross Profit {formatCurrency(kpis.grossProfit, sym)}</span>
          <span aria-hidden="true">·</span>
          <span>COGS {formatCurrency(kpis.revenue - kpis.grossProfit, sym)}</span>
        </div>
      </div>

      {/* 3. Net Operating Income */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1.5">
          <span>Net Operating Income</span>
          <span className={`text-[11px] font-semibold ${kpis.netOperatingIncome >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {kpis.netMarginPercent.toFixed(1)}% margin
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono">
          {formatCurrency(kpis.netOperatingIncome, sym)}
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
          <span>OpEx {formatCurrency(kpis.operatingExpenses, sym)}</span>
          <span aria-hidden="true">·</span>
          <span>EBITDA Breakeven</span>
        </div>
      </div>

      {/* 4. Cash Runway */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1.5">
          <span>Cash Runway</span>
          <span className="text-[11px] text-blue-600 font-semibold">
            {formatCurrency(kpis.cashAndEquivalents, sym)} reserves
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono">
          {kpis.cashRunwayMonths.toFixed(1)} <span className="text-sm font-normal text-neutral-500">months</span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
          <span>Burn {formatCurrency(kpis.monthlyNetBurn, sym)}/mo</span>
          <span aria-hidden="true">·</span>
          <span>Liquidity Solid</span>
        </div>
      </div>

      {/* 5. Debtor Days (DSO) & Anomaly Alerts */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1.5">
          <span>Debtor Days (DSO)</span>
          <button
            onClick={onViewAnomalies}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            {anomalyCount} {anomalyCount === 1 ? 'Anomaly' : 'Anomalies'}
          </button>
        </div>
        <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono">
          {kpis.debtorDaysDSO.toFixed(1)} <span className="text-sm font-normal text-neutral-500">days</span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
          <span>AR {formatCurrency(kpis.accountsReceivable, sym)}</span>
          <span aria-hidden="true">·</span>
          <span>Quick {kpis.quickRatio.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};
