import React from 'react';
import { X, ShieldCheck, Database, Cpu, Lock, CheckCircle2, FileSpreadsheet, KeyRound } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-neutral-950">
                System Architecture & Safeguard Principles
              </span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="text-xs text-neutral-500 font-medium">Upwork Portfolio Specification</span>
            </div>
            <p className="mt-1 text-xs text-neutral-600">
              Enterprise financial reporting system integrating Xero API with deterministic code calculation and grounded AI commentary.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Architectural Image */}
          <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-950 shadow-inner">
            <img
              src="/src/assets/images/xero_financial_hub_1791818171279.jpg"
              alt="Interconnected Financial Ledger Architecture"
              className="w-full h-56 object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-transparent flex items-end p-5">
              <div className="text-white">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Deterministic Pipeline
                </span>
                <h4 className="text-lg font-bold">Code-Enforced Financial Precision</h4>
                <p className="text-xs text-neutral-300 max-w-xl">
                  AI models never perform arithmetic or calculate ledger variances. All variance numbers, ratios, and anomaly detections are computed deterministically in TypeScript.
                </p>
              </div>
            </div>
          </div>

          {/* 4-Stage Architectural Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Stage 1 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs mb-2.5">
                01
              </div>
              <h5 className="font-bold text-neutral-950">Xero Ingestion</h5>
              <p className="mt-1 text-neutral-600 leading-normal text-[11px]">
                OAuth 2.0 PKCE connection pulls P&L, Balance Sheet, and Trial Balance. Multi-tenant token isolation per organization.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs mb-2.5">
                02
              </div>
              <h5 className="font-bold text-neutral-950">Variance & KPI Engine</h5>
              <p className="mt-1 text-neutral-600 leading-normal text-[11px]">
                100% deterministic code calculations: Month vs Budget, YoY, YTD, Gross Margin, Net Burn, Cash Runway, DSO.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs mb-2.5">
                03
              </div>
              <h5 className="font-bold text-neutral-950">Grounded AI Narrative</h5>
              <p className="mt-1 text-neutral-600 leading-normal text-[11px]">
                Calculated figures and flagged anomalies feed into constrained AI prompts. AI drafts commentary strictly citing ground truth numbers.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs mb-2.5">
                04
              </div>
              <h5 className="font-bold text-neutral-950">CPA Review & Board Pack</h5>
              <p className="mt-1 text-neutral-600 leading-normal text-[11px]">
                Accountants review, edit inline, verify anomalies, and stamp approval. Multi-format export: Board Pack, Excel/CSV, JSON.
              </p>
            </div>
          </div>

          {/* Accuracy & Security Safeguards Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h5 className="text-xs font-bold text-neutral-950 uppercase tracking-wider mb-3">
              Accuracy & Security Safeguards Matrix
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-semibold">Zero Math Hallucination</strong>
                  <span className="text-neutral-600 leading-normal text-[11px]">
                    The prompt system instruction explicitly prohibits LLM arithmetic. Commentary only formats and narrates verified figures.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-semibold">Multi-Tenant Isolation</strong>
                  <span className="text-neutral-600 leading-normal text-[11px]">
                    Ledger records, tokens, and commentary drafts are strictly segregated by Xero Tenant ID (`xer-xxxxx`).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-semibold">Configurable Anomaly Engine</strong>
                  <span className="text-neutral-600 leading-normal text-[11px]">
                    Automated dual-threshold checks ($ dollar and % movement) flag abnormal spikes for accountant sign-off.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-semibold">Immutable Audit Trail</strong>
                  <span className="text-neutral-600 leading-normal text-[11px]">
                    Cryptographic signature hash generated on review sign-off with CPA credentials and timestamp.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors"
          >
            Close Architecture Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
