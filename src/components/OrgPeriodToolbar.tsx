import React, { useState } from 'react';
import { Building2, Calendar, RefreshCw, SlidersHorizontal, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import { Organization, ReportingPeriod } from '../types/financial';
import { AnomalyConfig } from '../services/financialEngine';

interface OrgPeriodToolbarProps {
  organizations: Organization[];
  currentOrg: Organization;
  onSelectOrg: (org: Organization) => void;
  period: ReportingPeriod;
  onSelectPeriod: (period: ReportingPeriod) => void;
  anomalyConfig: AnomalyConfig;
  onUpdateAnomalyConfig: (config: AnomalyConfig) => void;
  isSyncing: boolean;
  onRefreshSync: () => void;
  onOpenXeroSettings: () => void;
}

export const OrgPeriodToolbar: React.FC<OrgPeriodToolbarProps> = ({
  organizations,
  currentOrg,
  onSelectOrg,
  period,
  onSelectPeriod,
  anomalyConfig,
  onUpdateAnomalyConfig,
  isSyncing,
  onRefreshSync,
  onOpenXeroSettings,
}) => {
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);

  return (
    <div className="bg-white border-b border-neutral-200 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Organization & Period Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Org Selector */}
          <div className="relative">
            <label htmlFor="org-select" className="sr-only">Select Organization</label>
            <div className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg px-3 py-1.5 transition-colors">
              <Building2 className="w-4 h-4 text-neutral-500 shrink-0" />
              <select
                id="org-select"
                value={currentOrg.id}
                onChange={(e) => {
                  const found = organizations.find((o) => o.id === e.target.value);
                  if (found) onSelectOrg(found);
                }}
                className="bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none cursor-pointer pr-2"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.industry})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg px-3 py-1.5 transition-colors">
            <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
            <select
              value={period}
              onChange={(e) => onSelectPeriod(e.target.value as ReportingPeriod)}
              className="bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none cursor-pointer pr-2"
            >
              <option value="2026-09">September 2026 (Month-End)</option>
              <option value="2026-08">August 2026 (Prior Month)</option>
              <option value="2026-07">July 2026 (Historical)</option>
              <option value="2026-Q3">Q3 2026 (Full Quarter)</option>
            </select>
          </div>

          {/* Xero Connection Pill */}
          <button
            onClick={onOpenXeroSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-medium transition-colors"
            title="Click to view Xero OAuth connection details"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Xero Connected:</span>
            <span className="text-neutral-500 font-mono text-[11px]">{currentOrg.xeroTenantId}</span>
            <ExternalLink className="w-3 h-3 text-neutral-400 ml-0.5" />
          </button>
        </div>

        {/* Right: Sync Status & Threshold Controls */}
        <div className="flex items-center gap-3">
          {/* Threshold Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowThresholdSettings(!showThresholdSettings)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showThresholdSettings
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Anomaly Tolerance: ${anomalyConfig.thresholdDollar.toLocaleString()} / {anomalyConfig.thresholdPercent}%</span>
            </button>

            {showThresholdSettings && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-xl shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-900">Variance Anomaly Rules</span>
                  <span className="text-[11px] text-neutral-500">Deterministic Engine</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-600">Dollar Threshold ($)</span>
                      <span className="font-mono font-medium">${anomalyConfig.thresholdDollar.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="25000"
                      step="1000"
                      value={anomalyConfig.thresholdDollar}
                      onChange={(e) =>
                        onUpdateAnomalyConfig({
                          ...anomalyConfig,
                          thresholdDollar: Number(e.target.value),
                        })
                      }
                      className="w-full accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-600">Percentage Variance (%)</span>
                      <span className="font-mono font-medium">{anomalyConfig.thresholdPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={anomalyConfig.thresholdPercent}
                      onChange={(e) =>
                        onUpdateAnomalyConfig({
                          ...anomalyConfig,
                          thresholdPercent: Number(e.target.value),
                        })
                      }
                      className="w-full accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-neutral-500 leading-normal">
                  Items exceeding both criteria are flagged for accountant investigation and prioritized in the AI commentary prompt.
                </p>
              </div>
            )}
          </div>

          {/* Sync Xero Button */}
          <button
            onClick={onRefreshSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors disabled:opacity-50"
            title="Pull latest live journal entries from Xero"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-neutral-500'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Xero'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
