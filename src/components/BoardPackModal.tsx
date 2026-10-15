import React from 'react';
import { X, Printer, Download, FileCode, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Organization, FinancialKPIs, VarianceCalculation, AnomalyAlert, AICommentaryReport, AuditSignoff } from '../types/financial';
import { formatCurrency, formatPercent } from '../services/financialEngine';
import { exportAuditPackJSON, exportVariancesToCSV, generateBoardPackPrintView } from '../services/exportService';

interface BoardPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  org: Organization;
  period: string;
  kpis: FinancialKPIs;
  variances: VarianceCalculation[];
  anomalies: AnomalyAlert[];
  commentary: AICommentaryReport;
  signoff: AuditSignoff;
}

export const BoardPackModal: React.FC<BoardPackModalProps> = ({
  isOpen,
  onClose,
  org,
  period,
  kpis,
  variances,
  anomalies,
  commentary,
  signoff,
}) => {
  if (!isOpen) return null;

  const sym = org.reportingCurrencySymbol;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Controls (Hidden on Print) */}
        <div className="p-5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 bg-neutral-50 no-print">
          <div>
            <span className="text-sm font-bold text-neutral-950">
              Executive Board Pack & Management Accounts
            </span>
            <span className="ml-2 text-xs text-neutral-500 font-mono">
              {org.name} · {period}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportVariancesToCSV(org, period, variances)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Excel / CSV</span>
            </button>

            <button
              onClick={() => exportAuditPackJSON(org, period, kpis, variances, anomalies, commentary, signoff)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-neutral-500" />
              <span>Audit JSON</span>
            </button>

            <button
              onClick={generateBoardPackPrintView}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Board Pack Content */}
        <div className="p-8 sm:p-10 space-y-8 max-h-[82vh] overflow-y-auto text-neutral-900 bg-white">
          {/* Corporate Header */}
          <div className="border-b-2 border-neutral-900 pb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                Monthly Financial Review & Variance Analysis
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-neutral-950">
                {org.name}
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                Legal Entity: {org.legalEntity} · Industry: {org.industry} · Functional Currency: {org.currency} ({sym})
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-800 font-mono text-xs font-semibold rounded-md">
                Reporting Period: {period}
              </span>
              <p className="text-[11px] text-neutral-500 mt-1">
                Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* KPI Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Key Performance Indicator Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <div>
                <span className="text-[11px] text-neutral-500 block">Total Revenue</span>
                <span className="text-lg font-bold font-mono text-neutral-950">{formatCurrency(kpis.revenue, sym)}</span>
                <span className="block text-[11px] text-emerald-600 font-medium">{formatPercent(kpis.revenueGrowthYoY)} YoY</span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">Gross Profit Margin</span>
                <span className="text-lg font-bold font-mono text-neutral-950">{kpis.grossMarginPercent.toFixed(1)}%</span>
                <span className="block text-[11px] text-neutral-600 font-medium">{formatCurrency(kpis.grossProfit, sym)} GP</span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">Net Operating Income</span>
                <span className="text-lg font-bold font-mono text-neutral-950">{formatCurrency(kpis.netOperatingIncome, sym)}</span>
                <span className="block text-[11px] text-neutral-600 font-medium">{kpis.netMarginPercent.toFixed(1)}% margin</span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">Cash Runway</span>
                <span className="text-lg font-bold font-mono text-neutral-950">{kpis.cashRunwayMonths.toFixed(1)} mos</span>
                <span className="block text-[11px] text-blue-600 font-medium">{formatCurrency(kpis.cashAndEquivalents, sym)} reserve</span>
              </div>
            </div>
          </div>

          {/* Management Commentary Narrative */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-2">
              Management Commentary & Operational Narrative
            </h3>

            <div>
              <h4 className="text-sm font-bold text-neutral-950 mb-1.5">1. Executive Overview</h4>
              <p className="text-xs leading-relaxed text-neutral-700 whitespace-pre-line bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">
                {commentary.executiveSummary}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-neutral-950 mb-1.5">2. Revenue Streams & Margin Performance</h4>
              <p className="text-xs leading-relaxed text-neutral-700 whitespace-pre-line bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">
                {commentary.revenueAndMargins}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-neutral-950 mb-1.5">3. Operating Expenses & Variance Drivers</h4>
              <p className="text-xs leading-relaxed text-neutral-700 whitespace-pre-line bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">
                {commentary.opexDrivers}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-neutral-950 mb-1.5">4. Working Capital & Cash Runway</h4>
              <p className="text-xs leading-relaxed text-neutral-700 whitespace-pre-line bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">
                {commentary.workingCapitalAndRunway}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-neutral-950 mb-1.5">5. Governance & Audit Recommendations</h4>
              <p className="text-xs leading-relaxed text-neutral-700 whitespace-pre-line bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">
                {commentary.riskAndAuditNotes}
              </p>
            </div>
          </div>

          {/* Anomaly Audit Section */}
          {anomalies.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 border-b border-neutral-200 pb-2">
                Flagged Variances Breaching Thresholds ({anomalies.length} items)
              </h3>
              <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 text-[11px] font-semibold text-neutral-600">
                    <tr>
                      <th className="p-2.5">Account</th>
                      <th className="p-2.5 text-right">Actual</th>
                      <th className="p-2.5 text-right">Budget</th>
                      <th className="p-2.5 text-right">Variance</th>
                      <th className="p-2.5">Investigative Finding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {anomalies.map((a) => (
                      <tr key={a.id}>
                        <td className="p-2.5 font-medium">
                          {a.accountCode} - {a.accountName}
                        </td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(a.actualAmount, sym)}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(a.budgetAmount, sym)}</td>
                        <td className={`p-2.5 text-right font-mono font-semibold ${a.varianceDollar > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(a.varianceDollar, sym)} ({formatPercent(a.variancePercent)})
                        </td>
                        <td className="p-2.5 text-neutral-600 text-[11px]">{a.narrativeReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CPA Audit Sign-Off Stamp */}
          <div className="border-t-2 border-neutral-900 pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/avatar_cpa_director_1791818160601.jpg"
                alt="CPA Signoff"
                className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-xs font-bold text-neutral-950 block">{signoff.reviewedBy}</span>
                <span className="text-[11px] text-neutral-600 block">{signoff.reviewerRole}</span>
                <span className="font-mono text-[10px] text-neutral-400 block mt-0.5">
                  Approval Signature: {signoff.signatureHash}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>IFRS / GAAP Reviewed & Certified</span>
              </span>
              <span className="block text-[11px] text-neutral-500 mt-1">
                Timestamp: {new Date(signoff.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
