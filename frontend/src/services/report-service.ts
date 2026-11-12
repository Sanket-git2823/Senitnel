import { apiClient } from './api-client';
import { ReportConfig } from '../types/sentinel';

export interface GeneratedReportData {
  config: ReportConfig;
  summaryMetrics: { label: string; value: string; variance?: string }[];
  rows: Record<string, string | number>[];
  csvContent: string;
}

export class ReportService {
  /**
   * Generate report data based on user configuration
   */
  public async generateReport(config: ReportConfig): Promise<GeneratedReportData> {
    // Generate appropriate data rows based on report type
    let rows: Record<string, string | number>[] = [];
    let summaryMetrics: { label: string; value: string; variance?: string }[] = [];

    if (config.type === 'Energy Performance' || config.type === 'Building Comparison') {
      summaryMetrics = [
        { label: 'Campus Total Consumption', value: '10.36 MWh', variance: '+1.4% vs Baseline' },
        { label: 'Peak Demand Recorded', value: '1,390 kW', variance: 'Within 1,400 kW Cap' },
        { label: 'Net Energy Expenditure', value: '$4,820.00' },
        { label: 'Carbon Intensity', value: '2.84 tCO2e' }
      ];
      rows = [
        { Building: 'Academic Block A', Subsystem: 'HVAC & Lighting', Consumption_kWh: 520, Peak_kW: 42.5, Baseline_kWh: 550, Deviation_Pct: '-5.5%', Status: 'Optimal' },
        { Building: 'Academic Block B', Subsystem: 'Lighting & Labs', Consumption_kWh: 1180, Peak_kW: 96.2, Baseline_kWh: 720, Deviation_Pct: '+33.6%', Status: 'Overconsumption' },
        { Building: 'Lab Complex (Lab 204)', Subsystem: 'HVAC Reheat & Power', Consumption_kWh: 2310, Peak_kW: 184.8, Baseline_kWh: 1100, Deviation_Pct: '+68.0%', Status: 'Critical Anomaly' },
        { Building: 'Central Library', Subsystem: 'Chiller Loop', Consumption_kWh: 280, Peak_kW: 28.3, Baseline_kWh: 300, Deviation_Pct: '-5.6%', Status: 'Optimal' },
        { Building: 'Hostel A', Subsystem: 'Residential Power', Consumption_kWh: 1020, Peak_kW: 88.4, Baseline_kWh: 650, Deviation_Pct: '+36.0%', Status: 'Warning' },
        { Building: 'Hostel B', Subsystem: 'Residential Power', Consumption_kWh: 950, Peak_kW: 76.1, Baseline_kWh: 780, Deviation_Pct: '-2.4%', Status: 'Optimal' },
        { Building: 'Utility Plant & Substation', Subsystem: 'Distribution', Consumption_kWh: 3120, Peak_kW: 245.0, Baseline_kWh: 2400, Deviation_Pct: '+2.1%', Status: 'Nominal' }
      ];
    } else if (config.type === 'Incident Summary') {
      summaryMetrics = [
        { label: 'Total Flagged Incidents', value: '7 Active' },
        { label: 'Critical Severity', value: '2 Incidents' },
        { label: 'Mean Time to Detect (MTTD)', value: '3.4 minutes' },
        { label: 'Predicted Waste Cost', value: '$198.50 / day' }
      ];
      rows = [
        { Incident_ID: 'ANO-101', Asset: 'Lab 204 (Block A)', Severity: 'Critical', Detected_At: '23:08:33', Duration: '31m', Confidence: '92%', Category: 'High Power Draw', Status: 'New' },
        { Incident_ID: 'ANO-102', Asset: 'Hostel A – Rm 105', Severity: 'High', Detected_At: '22:45:10', Duration: '54m', Confidence: '89%', Category: 'AC Continuous Run', Status: 'Investigating' },
        { Incident_ID: 'ANO-103', Asset: 'Academic Block B L2', Severity: 'High', Detected_At: '22:15:08', Duration: '1h 24m', Confidence: '95%', Category: 'Over-illumination', Status: 'New' },
        { Incident_ID: 'ANO-104', Asset: 'Library Chiller', Severity: 'Medium', Detected_At: '21:30:22', Duration: '2h 09m', Confidence: '81%', Category: 'Low Delta-T Inefficiency', Status: 'Investigating' },
        { Incident_ID: 'ANO-105', Asset: 'Auditorium Main', Severity: 'Medium', Detected_At: '20:12:44', Duration: '3h 27m', Confidence: '84%', Category: 'Standby Vampire Draw', Status: 'Monitoring' }
      ];
    } else {
      summaryMetrics = [
        { label: 'Target Reduction', value: '15% by Q4' },
        { label: 'Achieved Reduction', value: '11.8% to date' },
        { label: 'Scope 2 Emissions', value: '2.84 tCO2e/day' },
        { label: 'Solar Offset', value: '420 kWh generated' }
      ];
      rows = [
        { Scope: 'Scope 2 (Purchased Electricity)', MWh: 9.94, MetricTonsCO2: 2.73, Cost: '$4,622.00', TargetVariance: '-4.2%' },
        { Scope: 'Renewable Solar Generation', MWh: 0.42, MetricTonsCO2: -0.11, Cost: 'Offset', TargetVariance: '+8.0%' }
      ];
    }

    // Convert rows to CSV string
    const headers = Object.keys(rows[0] || {});
    const csvLines = [
      `# SENTINEL CAMPUS INFRASTRUCTURE OPERATIONAL REPORT`,
      `# Report: ${config.title}`,
      `# Scope: ${config.buildingScope} | Timeframe: ${config.dateRange} | Generated: ${new Date().toISOString()}`,
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${r[h]}"`).join(','))
    ];
    const csvContent = csvLines.join('\n');

    const result: GeneratedReportData = {
      config: {
        ...config,
        generatedAt: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST',
        recordsCount: rows.length
      },
      summaryMetrics,
      rows,
      csvContent
    };

    return result;
  }

  /**
   * Trigger native browser download of generated CSV
   */
  public downloadCsv(reportData: GeneratedReportData): void {
    const blob = new Blob([reportData.csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SENTINEL_${reportData.config.title.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const reportService = new ReportService();
