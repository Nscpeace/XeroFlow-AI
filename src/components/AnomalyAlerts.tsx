import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { AnomalyAlert, Organization } from '../types/financial';
import { formatCurrency, formatPercent } from '../services/financialEngine';

interface AnomalyAlertsProps {
  anomalies: AnomalyAlert[];
  org: Organization;
  onNavigateToReview: () => void;
}

export const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({
  anomalies,
  org,
  onNavigateToReview,
}) => {
  const [resolvedIds, setResolvedIds] = useState<Record<string, 'pending' | 'verified' | 'reconciled'>>({});

  const sym = org.reportingCurrencySymbol;

  const toggleStatus = (id: string) => {
    setResolvedIds((prev) => {
      const current = prev[id] || 'pending';
      const next = current === 'pending' ? 'verified' : current === 'verified' ? 'reconciled' : 'pending';
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-950">Deterministic Anomaly Engine</span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="text-xs text-neutral-500 font-medium">
                {anomalies.length} items breached tolerance thresholds
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-600 max-w-2xl leading-relaxed">
              These line items exceed both the dollar value threshold and percentage tolerance rules. 
              They are automatically highlighted for CPA journal audit and passed directly into the AI commentary prompt.
            </p>
          </div>
          <button
            onClick={onNavigateToReview}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <span>Review Management Commentary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Anomalies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {anomalies.map((alert) => {
          const status = resolvedIds[alert.id] || 'pending';

          return (
            <div
              key={alert.id}
              className={`bg-white border rounded-xl p-4.5 shadow-xs transition-colors ${
                status === 'reconciled'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : alert.severity === 'high'
                  ? 'border-rose-200'
                  : 'border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-neutral-600">
                      {alert.accountCode}
                    </span>
                    <span aria-hidden="true" className="text-neutral-300">·</span>
                    <span className="text-xs font-bold text-neutral-950">
                      {alert.accountName}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-medium">{alert.category}</span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    alert.severity === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {alert.severity} Priority
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-neutral-50 rounded-lg text-xs">
                <div>
                  <span className="text-[11px] text-neutral-500 block">Actual</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {formatCurrency(alert.actualAmount, sym)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Budget</span>
                  <span className="font-mono text-neutral-600">
                    {formatCurrency(alert.budgetAmount, sym)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Variance</span>
                  <span className={`font-mono font-bold ${alert.varianceDollar > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {alert.varianceDollar > 0 ? '+' : ''}{formatCurrency(alert.varianceDollar, sym)} ({formatPercent(alert.variancePercent)})
                  </span>
                </div>
              </div>

              {/* Reason & Action */}
              <div className="space-y-1.5 text-xs text-neutral-700">
                <p>
                  <strong className="font-semibold text-neutral-900">Observation: </strong>
                  {alert.narrativeReason}
                </p>
                <p className="text-neutral-600">
                  <strong className="font-semibold text-neutral-900">Recommended Action: </strong>
                  {alert.suggestedAction}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  Status: <strong className="text-neutral-800 uppercase">{status.replace('_', ' ')}</strong>
                </span>
                <button
                  onClick={() => toggleStatus(alert.id)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    status === 'reconciled'
                      ? 'bg-emerald-100 text-emerald-800'
                      : status === 'verified'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {status === 'reconciled'
                    ? 'Reconciled & Audited'
                    : status === 'verified'
                    ? 'Verified Timing Shift'
                    : 'Mark Verified'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
