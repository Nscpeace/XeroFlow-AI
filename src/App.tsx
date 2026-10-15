/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { OrgPeriodToolbar } from './components/OrgPeriodToolbar';
import { KPICards } from './components/KPICards';
import { VarianceTable } from './components/VarianceTable';
import { AnomalyAlerts } from './components/AnomalyAlerts';
import { CommentaryReview } from './components/CommentaryReview';
import { ArchitectureModal } from './components/ArchitectureModal';
import { BoardPackModal } from './components/BoardPackModal';
import { XeroSettingsModal } from './components/XeroSettingsModal';

import {
  Organization,
  ReportingPeriod,
  FinancialLineItem,
  AuditSignoff,
  AICommentaryReport
} from './types/financial';
import { DEMO_ORGANIZATIONS, getLedgerForOrg } from './services/demoData';
import {
  calculateLineVariance,
  calculateKPIs,
  extractAnomalyAlerts,
  DEFAULT_ANOMALY_CONFIG,
  AnomalyConfig,
  formatCurrency,
  formatPercent
} from './services/financialEngine';
import {
  fetchAICommentary,
  generateDeterministicCommentary,
  CommentaryPayload
} from './services/commentaryEngine';
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
  Cpu
} from 'lucide-react';
import { exportVariancesToCSV, exportAuditPackJSON } from './services/exportService';

export default function App() {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'overview' | 'variance' | 'anomalies' | 'review' | 'architecture'>('overview');
  const [isBoardPackOpen, setIsBoardPackOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isXeroSettingsOpen, setIsXeroSettingsOpen] = useState(false);

  // Financial State
  const [organizations, setOrganizations] = useState<Organization[]>(DEMO_ORGANIZATIONS);
  const [currentOrg, setCurrentOrg] = useState<Organization>(DEMO_ORGANIZATIONS[0]);
  const [period, setPeriod] = useState<ReportingPeriod>('2026-09');
  const [anomalyConfig, setAnomalyConfig] = useState<AnomalyConfig>(DEFAULT_ANOMALY_CONFIG);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // CPA Audit Signoff State
  const [signoff, setSignoff] = useState<AuditSignoff>({
    status: 'draft',
    reviewedBy: 'Sarah Jenkins, CPA',
    reviewerRole: 'Senior Financial Controller & Fractional CFO',
    timestamp: new Date().toISOString(),
    signatureHash: 'CPA-SHA256-D8A9F102B4',
    notes: 'Management accounts reconciled with Xero general ledger.',
  });

  // Calculate Deterministic Variances & KPIs
  const lineItems = useMemo<FinancialLineItem[]>(() => {
    return getLedgerForOrg(currentOrg.id);
  }, [currentOrg.id]);

  const variances = useMemo(() => {
    return lineItems.map((item) => calculateLineVariance(item, anomalyConfig));
  }, [lineItems, anomalyConfig]);

  const kpis = useMemo(() => {
    return calculateKPIs(lineItems, 30);
  }, [lineItems]);

  const anomalies = useMemo(() => {
    return extractAnomalyAlerts(variances);
  }, [variances]);

  // Commentary Payload
  const commentaryPayload = useMemo<CommentaryPayload>(() => {
    const topOver = [...variances]
      .filter((v) => !v.isBudgetFavorable)
      .sort((a, b) => Math.abs(b.varianceBudgetDollar) - Math.abs(a.varianceBudgetDollar))
      .slice(0, 3);

    const topUnder = [...variances]
      .filter((v) => v.isBudgetFavorable)
      .sort((a, b) => Math.abs(b.varianceBudgetDollar) - Math.abs(a.varianceBudgetDollar))
      .slice(0, 3);

    return {
      org: currentOrg,
      period,
      kpis,
      topOverBudget: topOver,
      topUnderBudget: topUnder,
      anomalies,
    };
  }, [currentOrg, period, kpis, variances, anomalies]);

  // Initial Commentary
  const [commentary, setCommentary] = useState<AICommentaryReport>(() => {
    return generateDeterministicCommentary(commentaryPayload);
  });

  // Re-generate commentary when org or period changes
  useEffect(() => {
    setCommentary(generateDeterministicCommentary(commentaryPayload));
  }, [currentOrg.id, period]);

  // Refresh sync with Xero simulation
  const handleRefreshSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setCurrentOrg((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toISOString(),
      }));
    }, 1000);
  };

  // Re-run AI Commentary Generation
  const handleRegenerateCommentary = async () => {
    setIsRegenerating(true);
    try {
      const generated = await fetchAICommentary(commentaryPayload);
      setCommentary(generated);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans">
      {/* 3-Zone Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'architecture') {
            setIsArchitectureOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenBoardPack={() => setIsBoardPackOpen(true)}
        reviewStatus={signoff.status}
      />

      {/* Multi-Org & Period Selector Toolbar */}
      <OrgPeriodToolbar
        organizations={organizations}
        currentOrg={currentOrg}
        onSelectOrg={(org) => {
          setCurrentOrg(org);
          setSignoff((prev) => ({ ...prev, status: 'draft' }));
        }}
        period={period}
        onSelectPeriod={setPeriod}
        anomalyConfig={anomalyConfig}
        onUpdateAnomalyConfig={setAnomalyConfig}
        isSyncing={isSyncing}
        onRefreshSync={handleRefreshSync}
        onOpenXeroSettings={() => setIsXeroSettingsOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top KPI Cards (Always visible for executive overview) */}
        <KPICards
          kpis={kpis}
          org={currentOrg}
          anomalyCount={anomalies.length}
          onViewAnomalies={() => setActiveTab('anomalies')}
        />

        {/* Tab 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions & Status Card */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-neutral-950">
                      Monthly Reporting & Variance Analysis Overview
                    </span>
                    <span aria-hidden="true" className="text-neutral-300">·</span>
                    <span className="text-xs text-neutral-500 font-mono">
                      {currentOrg.name} ({period})
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600 max-w-3xl leading-relaxed">
                    Live ledger data retrieved from Xero. Variances and KPIs are calculated deterministically in TypeScript.
                    First draft management narrative has been generated from the calculated ground truth.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('variance')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <span>View P&L Variances</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setActiveTab('review')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Review AI Commentary</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Split Screen: Executive Commentary Preview & Top Anomalies */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: AI First Draft Commentary Preview */}
              <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Generated Management Narrative
                    </span>
                    <span aria-hidden="true" className="text-neutral-300">·</span>
                    <span className="text-[11px] text-emerald-600 font-medium">100% Grounded Figures</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('review')}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Edit & Sign-off →
                  </button>
                </div>

                <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-neutral-950 mb-1">Executive Summary</h4>
                    <p className="bg-neutral-50/60 p-3 rounded-lg border border-neutral-100">
                      {commentary.executiveSummary}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-950 mb-1">Revenue & Gross Margin Performance</h4>
                    <p className="bg-neutral-50/60 p-3 rounded-lg border border-neutral-100">
                      {commentary.revenueAndMargins}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-950 mb-1">OpEx Drivers & Budget Variances</h4>
                    <p className="bg-neutral-50/60 p-3 rounded-lg border border-neutral-100">
                      {commentary.opexDrivers}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Col: Top Flagged Anomaly Breaches */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Flagged Movements ({anomalies.length})
                    </span>
                    <button
                      onClick={() => setActiveTab('anomalies')}
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Audit All →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {anomalies.slice(0, 4).map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-neutral-900">
                          <span>{a.accountName}</span>
                          <span className={a.varianceDollar > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                            {a.varianceDollar > 0 ? '+' : ''}{formatCurrency(a.varianceDollar, currentOrg.reportingCurrencySymbol)}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1 leading-normal line-clamp-2">
                          {a.narrativeReason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>Audit Status:</span>
                    <span className="font-semibold text-neutral-900 uppercase">
                      {signoff.status.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsBoardPackOpen(true)}
                    className="w-full mt-3 py-2 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
                  >
                    Preview Board Pack
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Variance Engine */}
        {activeTab === 'variance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-950">
                  Deterministic Variance Engine & General Ledger
                </h2>
                <p className="text-xs text-neutral-500">
                  Compares Month vs Budget, Month vs Prior Year, and YTD Actuals across P&L and Balance Sheet accounts.
                </p>
              </div>
            </div>
            <VarianceTable
              variances={variances}
              org={currentOrg}
              period={period}
            />
          </div>
        )}

        {/* Tab 3: Anomaly Alerts */}
        {activeTab === 'anomalies' && (
          <AnomalyAlerts
            anomalies={anomalies}
            org={currentOrg}
            onNavigateToReview={() => setActiveTab('review')}
          />
        )}

        {/* Tab 4: Accountant Review Dashboard */}
        {activeTab === 'review' && (
          <CommentaryReview
            commentary={commentary}
            onUpdateCommentary={setCommentary}
            org={currentOrg}
            period={period}
            kpis={kpis}
            signoff={signoff}
            onUpdateSignoff={setSignoff}
            onRegenerate={handleRegenerateCommentary}
            isRegenerating={isRegenerating}
            onOpenBoardPack={() => setIsBoardPackOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">XeroFlow AI</span>
            <span aria-hidden="true">·</span>
            <span>Monthly Reporting and Variance Analysis Assistant</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Architecture & Safeguards
            </button>
            <button
              onClick={() => setIsXeroSettingsOpen(true)}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Xero OAuth Status
            </button>
            <button
              onClick={() => exportAuditPackJSON(currentOrg, period, kpis, variances, anomalies, commentary, signoff)}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Download JSON Audit Pack
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BoardPackModal
        isOpen={isBoardPackOpen}
        onClose={() => setIsBoardPackOpen(false)}
        org={currentOrg}
        period={period}
        kpis={kpis}
        variances={variances}
        anomalies={anomalies}
        commentary={commentary}
        signoff={signoff}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <XeroSettingsModal
        isOpen={isXeroSettingsOpen}
        onClose={() => setIsXeroSettingsOpen(false)}
        currentOrg={currentOrg}
        organizations={organizations}
        onSelectOrg={setCurrentOrg}
      />
    </div>
  );
}
