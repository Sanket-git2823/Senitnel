import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { reportService, GeneratedReportData } from '../../services/report-service';
import { ReportConfig } from '../../types/sentinel';

export const ReportsWorkspace: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ReportConfig['type']>('Energy Performance');
  const [selectedRange, setSelectedRange] = useState<ReportConfig['dateRange']>('Today');
  const [selectedScope, setSelectedScope] = useState<ReportConfig['buildingScope']>('All Campus');
  const [reportData, setReportData] = useState<GeneratedReportData | null>(null);

  React.useEffect(() => {
    handleGenerate();
  }, [selectedType, selectedRange, selectedScope]);

  const handleGenerate = async () => {
    const config: ReportConfig = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      title: `${selectedType} — ${selectedScope}`,
      type: selectedType,
      dateRange: selectedRange,
      buildingScope: selectedScope,
      format: 'CSV'
    };
    const data = await reportService.generateReport(config);
    setReportData(data);
  };

  const handleDownloadCsv = () => {
    if (reportData) {
      reportService.downloadCsv(reportData);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151719] overflow-y-auto select-none p-5 space-y-4 text-xs custom-scrollbar">
      {/* 1. Header */}
      <div className="bg-[#1C1F22] rounded-md p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-[#B1A078]" />
          <div>
            <h2 className="font-medium text-[#E3E5E6] text-sm">
              Operational report generator
            </h2>
            <p className="text-xs text-[#969DA2]">
              Generate institutional audit reports and export to CSV or PDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#B1A078] hover:bg-[#C5B58D] text-[#151719] font-medium text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#24282B] hover:bg-[#2A2F33] text-[#E3E5E6] transition-colors cursor-pointer text-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#969DA2]" />
            <span>Print report</span>
          </button>
        </div>
      </div>

      {/* 2. Parameters Configuration Matrix */}
      <div className="bg-[#1C1F22] rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div>
          <span className="text-xs text-[#969DA2] block mb-2 font-medium">
            Report template
          </span>
          <div className="space-y-1">
            {[
              'Energy Performance',
              'Incident Summary',
              'Building Comparison',
              'Carbon Audit',
              'Maintenance Efficiency'
            ].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${
                  selectedType === type
                    ? 'bg-[#B1A078] text-[#151719] font-medium'
                    : 'bg-[#151719] text-[#969DA2] hover:text-[#E3E5E6]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs text-[#969DA2] block mb-2 font-medium">
            Audit timeframe
          </span>
          <div className="space-y-1">
            {['Today', 'Last 7 Days', 'Last 30 Days', 'Current Quarter', 'Year to Date'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range as any)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${
                  selectedRange === range
                    ? 'bg-[#B1A078] text-[#151719] font-medium'
                    : 'bg-[#151719] text-[#969DA2] hover:text-[#E3E5E6]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs text-[#969DA2] block mb-2 font-medium">
            Spatial scope
          </span>
          <div className="space-y-1">
            {['All Campus', 'Academic Buildings', 'Laboratories', 'Hostels'].map((scope) => (
              <button
                key={scope}
                onClick={() => setSelectedScope(scope as any)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${
                  selectedScope === scope
                    ? 'bg-[#B1A078] text-[#151719] font-medium'
                    : 'bg-[#151719] text-[#969DA2] hover:text-[#E3E5E6]'
                }`}
              >
                {scope}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Live Preview & Summary Metrics */}
      {reportData && (
        <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col space-y-4 shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/40">
            <div>
              <h3 className="font-medium text-[#E3E5E6] text-sm">
                Report preview: {reportData.config.title}
              </h3>
              <p className="text-xs text-[#969DA2]">
                Generated {reportData.config.generatedAt} · {reportData.config.recordsCount} records
              </p>
            </div>
            <div className="text-xs text-[#638D7D] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Export ready</span>
            </div>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reportData.summaryMetrics.map((metric) => (
              <div key={metric.label} className="bg-[#151719] rounded-md p-3">
                <span className="text-xs text-[#969DA2] block">{metric.label}</span>
                <span className="text-lg font-medium text-[#E3E5E6] font-mono tabular-nums block mt-1">
                  {metric.value}
                </span>
                {metric.variance && (
                  <span className="text-xs text-[#B1A078] mt-0.5 block">{metric.variance}</span>
                )}
              </div>
            ))}
          </div>

          {/* Data Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#969DA2] border-b border-[#34393D]/40">
                <tr>
                  {Object.keys(reportData.rows[0] || {}).map((header) => (
                    <th key={header} className="pb-2 font-normal">
                      {header.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34393D]/30">
                {reportData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#24282B]/50 text-[#E3E5E6]">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="py-2.5 font-mono">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
