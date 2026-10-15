import {
  Organization,
  FinancialKPIs,
  VarianceCalculation,
  AnomalyAlert,
  AICommentaryReport,
  AuditSignoff
} from '../types/financial';
import { formatCurrency, formatPercent } from './financialEngine';

export function exportVariancesToCSV(
  org: Organization,
  period: string,
  variances: VarianceCalculation[]
): void {
  const sym = org.currency;
  const headers = [
    'Account Code',
    'Account Name',
    'Category',
    `Actual (${period})`,
    `Budget (${period})`,
    `Variance ($)`,
    `Variance (%)`,
    'Status',
    'Prior Year',
    'PY Variance ($)',
    'PY Variance (%)',
    'YTD Actual',
    'YTD Budget',
    'YTD Variance ($)',
    'Notes',
  ];

  const rows = variances.map(v => {
    const item = v.lineItem;
    return [
      `"${item.code}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.actualMonth.toFixed(2),
      item.budgetMonth.toFixed(2),
      v.varianceBudgetDollar.toFixed(2),
      `${v.varianceBudgetPercent.toFixed(2)}%`,
      v.isBudgetFavorable ? 'Favorable' : 'Unfavorable',
      item.priorYearMonth.toFixed(2),
      v.variancePYDollar.toFixed(2),
      `${v.variancePYPercent.toFixed(2)}%`,
      item.actualYTD.toFixed(2),
      item.budgetYTD.toFixed(2),
      v.varianceYTDBudgetDollar.toFixed(2),
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadBlob(csvContent, `${org.name.replace(/\s+/g, '_')}_Variance_Report_${period}_${sym}.csv`, 'text/csv');
}

export function exportAuditPackJSON(
  org: Organization,
  period: string,
  kpis: FinancialKPIs,
  variances: VarianceCalculation[],
  anomalies: AnomalyAlert[],
  commentary: AICommentaryReport,
  signoff: AuditSignoff
): void {
  const auditBundle = {
    metadata: {
      generatedAt: new Date().toISOString(),
      clientOrganization: org,
      reportingPeriod: period,
      systemVersion: 'Xero AI Reporting Assistant 2.4.0',
      complianceFramework: 'IFRS / US GAAP Management Accounting',
    },
    executiveKPIs: kpis,
    commentaryReport: commentary,
    cpaSignoff: signoff,
    anomalyAuditLog: anomalies,
    ledgerVariances: variances.map(v => ({
      code: v.lineItem.code,
      name: v.lineItem.name,
      category: v.lineItem.category,
      actual: v.lineItem.actualMonth,
      budget: v.lineItem.budgetMonth,
      varianceDollar: v.varianceBudgetDollar,
      variancePercent: v.varianceBudgetPercent,
      isFavorable: v.isBudgetFavorable,
      isAnomaly: v.isAnomaly,
      notes: v.lineItem.notes || null,
    })),
  };

  const jsonStr = JSON.stringify(auditBundle, null, 2);
  downloadBlob(
    jsonStr,
    `${org.name.replace(/\s+/g, '_')}_Board_Pack_Audit_${period}.json`,
    'application/json'
  );
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateBoardPackPrintView(): void {
  window.print();
}
