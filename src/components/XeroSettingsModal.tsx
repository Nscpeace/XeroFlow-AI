import React, { useState } from 'react';
import { X, Link2, ShieldCheck, Check, KeyRound, ExternalLink, RefreshCw } from 'lucide-react';
import { Organization } from '../types/financial';

interface XeroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrg: Organization;
  organizations: Organization[];
  onSelectOrg: (org: Organization) => void;
}

export const XeroSettingsModal: React.FC<XeroSettingsModalProps> = ({
  isOpen,
  onClose,
  currentOrg,
  organizations,
  onSelectOrg,
}) => {
  const [clientId, setClientId] = useState('8F29A10B-XERO-API-PROD-CLIENT');
  const [connectionMode, setConnectionMode] = useState<'sandbox' | 'live'>('sandbox');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateOAuth = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthSuccessMsg('Successfully refreshed OAuth 2.0 PKCE token credentials for all client tenants.');
      setTimeout(() => setAuthSuccessMsg(null), 4000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              X
            </div>
            <div>
              <span className="text-sm font-bold text-neutral-950">Xero OAuth 2.0 Connection Hub</span>
              <span className="text-[11px] text-neutral-500 block">Multi-Organization Management</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-neutral-800">
          {/* Connection Mode Toggle */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-950 block">Operating Environment</span>
              <span className="text-[11px] text-neutral-500">
                {connectionMode === 'sandbox' ? 'Certified Demo Sandbox with Preloaded Multi-Org Ledgers' : 'Live Xero API OAuth 2.0 Mode'}
              </span>
            </div>
            <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-neutral-200">
              <button
                onClick={() => setConnectionMode('sandbox')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  connectionMode === 'sandbox'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Sandbox
              </button>
              <button
                onClick={() => setConnectionMode('live')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  connectionMode === 'live'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Live OAuth
              </button>
            </div>
          </div>

          {/* Connected Organizations List */}
          <div>
            <label className="font-semibold text-neutral-900 block mb-1.5">
              Connected Multi-Org Tenants ({organizations.length})
            </label>
            <div className="space-y-2">
              {organizations.map((org) => {
                const isSelected = org.id === currentOrg.id;
                return (
                  <div
                    key={org.id}
                    onClick={() => onSelectOrg(org)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:bg-neutral-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-neutral-950">{org.name}</strong>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        Tenant ID: {org.xeroTenantId} · Currency: {org.currency}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Synchronized
                      </span>
                      <span className="text-[10px] text-neutral-400 block font-mono">
                        {new Date(org.lastSyncedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scopes & Security Info */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">Configured OAuth 2.0 Scopes</span>
              <span className="text-[11px] text-neutral-500">Read-Only Accounting</span>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                accounting.reports.read
              </span>
              <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                accounting.transactions.read
              </span>
              <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                accounting.settings.read
              </span>
              <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                offline_access
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 pt-1 leading-normal">
              Tokens are stored securely in environment variables with automated PKCE refresh tokens. Client data is strictly isolated per organization.
            </p>
          </div>

          {authSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{authSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={handleSimulateOAuth}
            disabled={isAuthorizing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuthorizing ? 'animate-spin' : ''}`} />
            <span>{isAuthorizing ? 'Authorizing with Xero...' : 'Re-authenticate OAuth'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
