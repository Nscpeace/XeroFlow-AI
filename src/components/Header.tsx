import React from 'react';
import { FileSpreadsheet, Layers, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'variance' | 'anomalies' | 'review' | 'architecture';
  setActiveTab: (tab: 'overview' | 'variance' | 'anomalies' | 'review' | 'architecture') => void;
  onOpenBoardPack: () => void;
  reviewStatus: 'draft' | 'under_review' | 'approved';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBoardPack,
  reviewStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
                XF
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-neutral-950 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                  XeroFlow AI
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-neutral-500 font-normal">
                  Reporting & Variance Engine
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-neutral-950 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('variance')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'variance'
                  ? 'border-neutral-950 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600'
              }`}
            >
              Variance Engine
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'anomalies'
                  ? 'border-neutral-950 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600'
              }`}
            >
              Anomaly Alerts
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'review'
                  ? 'border-neutral-950 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600'
              }`}
            >
              <span>Accountant Review</span>
              {reviewStatus === 'approved' ? (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Approved" />
              ) : reviewStatus === 'under_review' ? (
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="In Review" />
              ) : null}
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'architecture'
                  ? 'border-neutral-950 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-600'
              }`}
            >
              Architecture & Safeguards
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenBoardPack}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap shrink-0 active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Generate Board Pack</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
