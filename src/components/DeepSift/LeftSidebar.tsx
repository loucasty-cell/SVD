import { useState, useRef, useEffect } from 'react';
import { Download, Info, Check, X, ShieldAlert, Sparkles, CheckCircle2, Minus, FileSearch, FileText, Code, ChevronDown } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { DetectionScore, FlaggedPattern, ForensicLogEntry, ImageMetadata } from '../../types';
import { exportReportAsJSON, exportReportAsPDF } from '../../utils/exportReport';

interface LeftSidebarProps {
  score: DetectionScore | null;
  flaggedPatterns: FlaggedPattern[];
  forensicLogs: ForensicLogEntry[];
  imageDetails?: ImageMetadata | null;
  baseVariations?: string[];
  onDownloadReport?: () => void;
}

const PillRow = ({
  count,
  total = 30,
  colorClass,
  label,
  tooltipPos,
}: {
  count: number;
  total?: number;
  colorClass: string;
  label: string;
  tooltipPos: string;
}) => (
  <div className="relative flex gap-1 items-center w-full mb-7 group">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-3 flex-1 rounded-full transition-all duration-500 ${
          i < count ? colorClass : 'bg-white/30 border border-white/20'
        }`}
      />
    ))}
    {/* Tooltip */}
    <div
      className={`absolute ${tooltipPos} bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow-xl whitespace-nowrap z-20 border border-slate-100 flex items-center gap-1.5 pointer-events-none`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </div>
  </div>
);

export const LeftSidebar = ({
  score,
  flaggedPatterns,
  forensicLogs,
  imageDetails,
  baseVariations,
  onDownloadReport,
}: LeftSidebarProps) => {
  const [activePatternInfo, setActivePatternInfo] = useState<string | null>(null);
  const [downloadedNotice, setDownloadedNotice] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPDF = () => {
    setShowExportMenu(false);
    exportReportAsPDF({ imageDetails: imageDetails || null, score, flaggedPatterns, forensicLogs });
    setDownloadedNotice('PDF Forensic Certificate exported');
    setTimeout(() => setDownloadedNotice(null), 3000);
  };

  const handleExportJSON = () => {
    setShowExportMenu(false);
    if (onDownloadReport) {
      onDownloadReport();
    } else {
      exportReportAsJSON({ imageDetails: imageDetails || null, score, flaggedPatterns, forensicLogs });
    }
    setDownloadedNotice('JSON Forensic Audit Data exported');
    setTimeout(() => setDownloadedNotice(null), 3000);
  };

  const hasScore = score !== null;
  const aiPillCount = hasScore ? Math.round((score.aiProbability / 100) * 30) : 0;
  const humanPillCount = hasScore ? Math.round((score.humanAuthorship / 100) * 30) : 0;
  const riskPillCount = hasScore ? 30 : 0;

  return (
    <div className="w-72 xl:w-80 flex flex-col gap-3.5 shrink-0 overflow-y-auto pr-0.5 custom-scrollbar">
      {/* Top Action Bar: Export Report Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={!hasScore && forensicLogs.length === 0}
          title="Export complete forensic analysis as PDF or JSON"
          className="w-full bg-[#fce956] hover:bg-[#fadb2b] active:scale-[0.99] text-slate-900 font-bold text-xs py-2.5 px-4 rounded-2xl shadow-sm border border-yellow-300 flex items-center justify-between transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-slate-900" />
            <span>Export Forensic Report</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
        </button>

        {showExportMenu && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-red-100/80 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">Export as PDF Document</span>
                <span className="text-[10px] text-slate-500 font-normal">Formatted Forensic Certificate (.pdf)</span>
              </div>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Code className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">Export as JSON Data</span>
                <span className="text-[10px] text-slate-500 font-normal">Machine-readable Raw Telemetry (.json)</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* AI Probability Score */}
      <GlassCard className="p-4 transition-all">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Probability Score</h3>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={!hasScore}
            title="Download PDF forensic certificate"
            className="p-1.5 bg-white/50 hover:bg-white rounded-lg transition-colors border border-white/60 text-slate-600 cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-1">
          <PillRow
            count={aiPillCount}
            colorClass="bg-[#ff7b54]"
            label={hasScore ? `${score.aiProbability}% AI Detected` : 'Awaiting Ingestion'}
            tooltipPos="-bottom-7 left-1/2 transform -translate-x-1/2"
          />
          <PillRow
            count={humanPillCount}
            colorClass="bg-[#5cc57a]"
            label={hasScore ? `${score.humanAuthorship}% Human Authorship` : 'Awaiting Ingestion'}
            tooltipPos="-bottom-7 left-1/4 transform -translate-x-1/2"
          />
          <PillRow
            count={riskPillCount}
            colorClass="bg-[#facc15]"
            label={hasScore ? `Risk: ${score.riskLevel}` : 'Risk: Unassessed'}
            tooltipPos="-bottom-7 left-1/2 transform -translate-x-1/2"
          />
        </div>
      </GlassCard>

      {/* Origin Report */}
      <GlassCard className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Origin Report</h3>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={!hasScore}
            title="Download origin report PDF"
            className="p-1.5 bg-white/50 hover:bg-white rounded-lg transition-colors border border-white/60 text-slate-600 cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Base Thumbnails or Empty Placeholder */}
        {baseVariations && baseVariations.length > 0 ? (
          <div className="flex gap-2 mb-3.5">
            {baseVariations.slice(0, 3).map((url, i) => (
              <div key={i} className="flex-1 group cursor-pointer">
                <div className="overflow-hidden rounded-lg border border-white/60 shadow-xs aspect-4/3 bg-slate-100">
                  <img
                    src={url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={`Base reference #${i + 1}`}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1 font-semibold text-center">Base #{i + 1}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 mb-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1">
                <div className="rounded-lg border-2 border-dashed border-slate-300/50 aspect-4/3 flex items-center justify-center bg-white/20 text-slate-400">
                  <span className="text-[10px] font-mono">--</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold text-center">Slot #{i}</p>
              </div>
            ))}
          </div>
        )}

        <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
          Flagged Patterns
        </h4>

        <div className="flex flex-col gap-1.5">
          {flaggedPatterns.map((pattern) => (
            <div
              key={pattern.id}
              onClick={() =>
                setActivePatternInfo(activePatternInfo === pattern.id ? null : pattern.id)
              }
              className="flex flex-col bg-white/40 hover:bg-white/60 transition-colors p-2 rounded-xl border border-white/50 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    pattern.detected === true
                      ? 'bg-emerald-500/20'
                      : pattern.detected === false
                      ? 'bg-red-500/20'
                      : 'bg-slate-300/40'
                  }`}
                >
                  {pattern.detected === true ? (
                    <Check className="w-2.5 h-2.5 text-emerald-700 font-bold" />
                  ) : pattern.detected === false ? (
                    <X className="w-2.5 h-2.5 text-red-600 font-bold" />
                  ) : (
                    <Minus className="w-2.5 h-2.5 text-slate-500" />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-700 flex-1 truncate">
                  {pattern.name}
                </span>
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
              </div>

              {activePatternInfo === pattern.id && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/50 text-[10px] text-slate-600 leading-snug animate-in fade-in">
                  <p>{pattern.description}</p>
                  {pattern.confidence > 0 && (
                    <div className="mt-1 font-mono text-slate-500 text-[9px]">
                      Confidence: {(pattern.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Forensic Log */}
      <GlassCard className="p-4 flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-2.5 shrink-0">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Forensic Log</h3>
          <button
            onClick={handleExportJSON}
            disabled={forensicLogs.length === 0}
            title="Download forensic log as JSON"
            className="p-1.5 bg-white/50 hover:bg-white rounded-lg transition-colors border border-white/60 text-slate-600 cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar flex-1">
          {forensicLogs.length > 0 ? (
            forensicLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-2 bg-white/40 p-2 rounded-xl border border-white/50 text-left"
              >
                <span className="text-[9px] font-mono font-bold bg-white/70 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200/40 shrink-0">
                  {log.timestamp}
                </span>
                <span className="text-[10px] font-semibold text-slate-800 w-20 shrink-0 truncate">
                  {log.stage}
                </span>
                <span className="text-[10px] text-slate-600 flex-1 truncate">{log.finding}</span>
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 text-[11px] gap-1.5">
              <FileSearch className="w-6 h-6 stroke-[1.5] text-slate-400/60" />
              <span>Awaiting image scan stream...</span>
            </div>
          )}
        </div>
      </GlassCard>

      {downloadedNotice && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadedNotice}</span>
        </div>
      )}
    </div>
  );
};

