import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, ArrowUpDown, Download, ChevronRight, X } from 'lucide-react';
import { VarianceCalculation, Organization, AccountCategory } from '../types/financial';
import { formatCurrency, formatPercent } from '../services/financialEngine';
import { exportVariancesToCSV } from '../services/exportService';

interface VarianceTableProps {
  variances: VarianceCalculation[];
  org: Organization;
  period: string;
}

export const VarianceTable: React.FC<VarianceTableProps> = ({
  variances,
  org,
  period,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Anomalies' | 'Revenue' | 'Cost of Sales' | 'Operating Expenses' | 'Balance Sheet'>('All');
  const [selectedItem, setSelectedItem] = useState<VarianceCalculation | null>(null);

  const sym = org.reportingCurrencySymbol;

  // Filter logic
  const filteredItems = variances.filter((v) => {
    const item = v.lineItem;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === 'Anomalies') return v.isAnomaly;
    if (categoryFilter === 'Revenue') return item.category === 'Revenue';
    if (categoryFilter === 'Cost of Sales') return item.category === 'Cost of Sales';
    if (categoryFilter === 'Operating Expenses') return item.category === 'Operating Expenses';
    if (categoryFilter === 'Balance Sheet') {
      return (
        item.category === 'Current Assets' ||
        item.category === 'Non-Current Assets' ||
        item.category === 'Current Liabilities' ||
        item.category === 'Non-Current Liabilities'
      );
    }
    return true;
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search account code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 w-64"
            />
          </div>

          {/* Segmented Category Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            {(['All', 'Anomalies', 'Revenue', 'Cost of Sales', 'Operating Expenses', 'Balance Sheet'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {cat}
                {cat === 'Anomalies' && (
                  <span className="ml-1 text-[10px] text-rose-600 font-bold">
                    ({variances.filter((v) => v.isAnomaly).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Export Table CSV */}
        <button
          onClick={() => exportVariancesToCSV(org, period, variances)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-neutral-500" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <th className="py-2.5 px-4">Account Code & Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Actual ({period})</th>
              <th className="py-2.5 px-3 text-right">Budget ({period})</th>
              <th className="py-2.5 px-3 text-right">Variance ($)</th>
              <th className="py-2.5 px-3 text-right">Variance (%)</th>
              <th className="py-2.5 px-3 text-right">Prior Year</th>
              <th className="py-2.5 px-3 text-right">YTD Actual</th>
              <th className="py-2.5 px-3 text-right">YTD Budget</th>
              <th className="py-2.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-neutral-400">
                  No accounts matched your search criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((v) => {
                const item = v.lineItem;
                const isSelected = selectedItem?.lineItem.code === item.code;

                return (
                  <tr
                    key={item.code}
                    onClick={() => setSelectedItem(v)}
                    className={`hover:bg-neutral-50/80 cursor-pointer transition-colors ${
                      isSelected ? 'bg-neutral-100/70' : ''
                    } ${v.isAnomaly ? 'bg-rose-50/20' : ''}`}
                  >
                    {/* Account */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-neutral-500 font-medium">
                          {item.code}
                        </span>
                        <span className="font-medium text-neutral-900">{item.name}</span>
                        {v.isAnomaly && (
                          <span title={v.anomalyReason} className="inline-flex items-center">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-neutral-500 text-[11px]">
                      {item.category}
                    </td>

                    {/* Actual */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-neutral-950">
                      {formatCurrency(item.actualMonth, sym)}
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-3 text-right font-mono text-neutral-600">
                      {formatCurrency(item.budgetMonth, sym)}
                    </td>

                    {/* Variance $ */}
                    <td
                      className={`py-3 px-3 text-right font-mono font-medium ${
                        v.isBudgetFavorable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {v.varianceBudgetDollar > 0 ? '+' : ''}
                      {formatCurrency(v.varianceBudgetDollar, sym)}
                    </td>

                    {/* Variance % */}
                    <td
                      className={`py-3 px-3 text-right font-mono font-medium ${
                        v.isBudgetFavorable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatPercent(v.varianceBudgetPercent)}
                    </td>

                    {/* Prior Year */}
                    <td className="py-3 px-3 text-right font-mono text-neutral-500">
                      {formatCurrency(item.priorYearMonth, sym)}
                    </td>

                    {/* YTD Actual */}
                    <td className="py-3 px-3 text-right font-mono text-neutral-800">
                      {formatCurrency(item.actualYTD, sym)}
                    </td>

                    {/* YTD Budget */}
                    <td className="py-3 px-3 text-right font-mono text-neutral-500">
                      {formatCurrency(item.budgetYTD, sym)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {v.isAnomaly ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                          {v.anomalySeverity === 'high' ? 'High Breach' : 'Breach'}
                        </span>
                      ) : (
                        <span
                          className={`text-[11px] font-medium ${
                            v.isBudgetFavorable ? 'text-emerald-600' : 'text-neutral-500'
                          }`}
                        >
                          {v.isBudgetFavorable ? 'Favorable' : 'Within Tol.'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Item Drill-Down Drawer / Modal */}
      {selectedItem && (
        <div className="border-t border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-neutral-500">
                  Account {selectedItem.lineItem.code}
                </span>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="text-xs font-semibold text-neutral-900">
                  {selectedItem.lineItem.name}
                </span>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="text-xs text-neutral-500">
                  {selectedItem.lineItem.category}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                {selectedItem.lineItem.notes ||
                  'No specific journal notes attached. Movement verified through Xero general ledger sync.'}
              </p>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-neutral-200/80 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px]">Monthly Variance</span>
              <span className="font-mono font-semibold text-neutral-900">
                {formatCurrency(selectedItem.varianceBudgetDollar, sym)} ({formatPercent(selectedItem.varianceBudgetPercent)})
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Prior Year Movement</span>
              <span className="font-mono font-semibold text-neutral-900">
                {formatCurrency(selectedItem.variancePYDollar, sym)} ({formatPercent(selectedItem.variancePYPercent)})
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">YTD vs Budget</span>
              <span className="font-mono font-semibold text-neutral-900">
                {formatCurrency(selectedItem.varianceYTDBudgetDollar, sym)} ({formatPercent(selectedItem.varianceYTDBudgetPercent)})
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Anomaly Investigation</span>
              <span className={selectedItem.isAnomaly ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-medium'}>
                {selectedItem.isAnomaly ? 'Flagged for Commentary' : 'Normal Variance'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
