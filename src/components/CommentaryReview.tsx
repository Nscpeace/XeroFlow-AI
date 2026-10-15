import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Edit3, ShieldCheck, Download, RefreshCw, FileText, Check, AlertCircle } from 'lucide-react';
import { AICommentaryReport, Organization, FinancialKPIs, AuditSignoff, ReviewStatus } from '../types/financial';
import { formatCurrency, formatPercent } from '../services/financialEngine';

interface CommentaryReviewProps {
  commentary: AICommentaryReport;
  onUpdateCommentary: (updated: AICommentaryReport) => void;
  org: Organization;
  period: string;
  kpis: FinancialKPIs;
  signoff: AuditSignoff;
  onUpdateSignoff: (signoff: AuditSignoff) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onOpenBoardPack: () => void;
}

export const CommentaryReview: React.FC<CommentaryReviewProps> = ({
  commentary,
  onUpdateCommentary,
  org,
  period,
  kpis,
  signoff,
  onUpdateSignoff,
  onRegenerate,
  isRegenerating,
  onOpenBoardPack,
}) => {
  const [activeSection, setActiveSection] = useState<'exec' | 'rev' | 'opex' | 'runway' | 'risks'>('exec');
  const [copiedMetric, setCopiedMetric] = useState<string | null>(null);

  const sym = org.reportingCurrencySymbol;

  const quickMetrics = [
    { label: 'Revenue', value: formatCurrency(kpis.revenue, sym) },
    { label: 'YoY Growth', value: formatPercent(kpis.revenueGrowthYoY) },
    { label: 'Gross Margin', value: `${kpis.grossMarginPercent.toFixed(1)}%` },
    { label: 'Net Income', value: formatCurrency(kpis.netOperatingIncome, sym) },
    { label: 'Cash Balance', value: formatCurrency(kpis.cashAndEquivalents, sym) },
    { label: 'Runway', value: `${kpis.cashRunwayMonths.toFixed(1)} mos` },
    { label: 'DSO', value: `${kpis.debtorDaysDSO.toFixed(1)} days` },
  ];

  const handleCopyMetric = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedMetric(val);
    setTimeout(() => setCopiedMetric(null), 2000);
  };

  const handleSectionTextChange = (field: keyof AICommentaryReport, text: string) => {
    onUpdateCommentary({
      ...commentary,
      [field]: text,
    });
  };

  const handleSignOff = () => {
    const nextStatus: ReviewStatus = signoff.status === 'approved' ? 'draft' : 'approved';
    onUpdateSignoff({
      ...signoff,
      status: nextStatus,
      timestamp: new Date().toISOString(),
      signatureHash: `CPA-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-neutral-950">Management Commentary Review Station</span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="text-xs text-neutral-500 font-mono">
                {commentary.modelUsed}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed max-w-3xl">
              Deterministic figures from Xero are locked as ground truth. The AI draft synthesizes movements into 
              board-ready prose. As the CPA / Controller, review, edit, and append your audit sign-off below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-blue-600' : 'text-neutral-500'}`} />
              <span>{isRegenerating ? 'Drafting Commentary...' : 'Regenerate Draft'}</span>
            </button>

            <button
              onClick={handleSignOff}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                signoff.status === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{signoff.status === 'approved' ? 'Signed Off & Approved (Click to Unlock)' : 'Approve & Sign Off'}</span>
            </button>
          </div>
        </div>

        {/* Quick Grounded Metric Insertion Toolbar */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mr-1">
            Grounded Figures (Click to copy):
          </span>
          {quickMetrics.map((m) => (
            <button
              key={m.label}
              onClick={() => handleCopyMetric(`${m.label}: ${m.value}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[11px] transition-colors"
              title="Click to copy verified figure to clipboard"
            >
              <span>{m.label}:</span>
              <strong className="text-neutral-950">{m.value}</strong>
              {copiedMetric === `${m.label}: ${m.value}` && (
                <Check className="w-3 h-3 text-emerald-600 ml-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Modular Commentary Sections */}
      <div className="space-y-4">
        {/* Section 1: Executive Summary */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
                01. Executive Financial Summary
              </span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="text-[11px] text-neutral-500">Board Overview</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              {commentary.executiveSummary.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={4}
            value={commentary.executiveSummary}
            onChange={(e) => handleSectionTextChange('executiveSummary', e.target.value)}
            className="w-full text-xs text-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 leading-relaxed font-normal transition-colors"
            placeholder="Edit executive summary..."
          />
        </div>

        {/* Section 2: Revenue & Margin Analysis */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
                02. Revenue Streams & Gross Margin Performance
              </span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="text-[11px] text-neutral-500">Unit Economics</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              {commentary.revenueAndMargins.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={4}
            value={commentary.revenueAndMargins}
            onChange={(e) => handleSectionTextChange('revenueAndMargins', e.target.value)}
            className="w-full text-xs text-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 leading-relaxed font-normal transition-colors"
            placeholder="Edit revenue and margin narrative..."
          />
        </div>

        {/* Section 3: OpEx Drivers & Anomalies */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
                03. Operating Expenditure Drivers & Variances
              </span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="text-[11px] text-neutral-500">Cost Centers</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              {commentary.opexDrivers.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={4}
            value={commentary.opexDrivers}
            onChange={(e) => handleSectionTextChange('opexDrivers', e.target.value)}
            className="w-full text-xs text-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 leading-relaxed font-normal transition-colors"
            placeholder="Edit OpEx narrative..."
          />
        </div>

        {/* Section 4: Working Capital & Cash Runway */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
                04. Working Capital, DSO & Cash Runway Outlook
              </span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="text-[11px] text-neutral-500">Liquidity & Solvency</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              {commentary.workingCapitalAndRunway.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={4}
            value={commentary.workingCapitalAndRunway}
            onChange={(e) => handleSectionTextChange('workingCapitalAndRunway', e.target.value)}
            className="w-full text-xs text-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 leading-relaxed font-normal transition-colors"
            placeholder="Edit working capital and runway narrative..."
          />
        </div>

        {/* Section 5: Risk & Audit Notes */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
                05. Audit Notes & Recommended Controller Actions
              </span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="text-[11px] text-neutral-500">Governance</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              {commentary.riskAndAuditNotes.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={4}
            value={commentary.riskAndAuditNotes}
            onChange={(e) => handleSectionTextChange('riskAndAuditNotes', e.target.value)}
            className="w-full text-xs text-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 leading-relaxed font-normal transition-colors"
            placeholder="Edit audit recommendations..."
          />
        </div>
      </div>

      {/* CPA Sign-Off Station Box */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/src/assets/images/avatar_cpa_director_1791818160601.jpg"
              alt="CPA Reviewer"
              className="w-12 h-12 rounded-full object-cover border border-neutral-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-950">{signoff.reviewedBy}</span>
                <span className="text-[11px] text-neutral-500 font-medium">{signoff.reviewerRole}</span>
              </div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                <span>Timestamp: {new Date(signoff.timestamp).toLocaleString()}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[10px] text-neutral-400">{signoff.signatureHash}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                signoff.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {signoff.status === 'approved' ? 'Audit Approved' : 'Draft In Review'}
            </span>
            <button
              onClick={onOpenBoardPack}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              Preview & Export Board Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
