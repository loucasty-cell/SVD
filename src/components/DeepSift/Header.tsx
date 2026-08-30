import { useState } from 'react';
import {
  Home,
  Crosshair,
  FileText,
  Bookmark,
  Upload,
  Sparkles,
  Crown,
  Bell,
  CheckCircle,
  Download,
  X,
  ShieldCheck,
  Zap,
  Database,
  History,
  FileCheck2
} from 'lucide-react';
import { DetectionScore, ImageMetadata, FlaggedPattern } from '../../types';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUploadClick?: () => void;
  onRunScan?: () => void;
  score?: DetectionScore | null;
  imageDetails?: ImageMetadata | null;
  flaggedPatterns?: FlaggedPattern[];
}

// Clean default avatar SVG matching the user's uploaded neutral silhouette
const DEFAULT_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <circle cx="50" cy="50" r="50" fill="#BDC3C7"/>
  <circle cx="50" cy="40" r="14" fill="#FFFFFF"/>
  <path d="M24 78 C24 62, 36 55, 50 55 C64 55, 76 62, 76 78 Z" fill="#FFFFFF"/>
</svg>
`)}`;

export const Header = ({
  activeTab = 'Home',
  onTabChange,
  onUploadClick,
  onRunScan,
  score,
  imageDetails,
  flaggedPatterns = [],
}: HeaderProps) => {
  const [showNotification, setShowNotification] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Enhancement tool states
  const [denoiseLevel, setDenoiseLevel] = useState(65);
  const [contrastGamma, setContrastGamma] = useState(1.15);
  const [ocularBoost, setOcularBoost] = useState(true);
  const [fftFilterActive, setFftFilterActive] = useState(false);

  const handleNavClick = (id: string, customAction?: () => void) => {
    if (customAction) {
      customAction();
      return;
    }
    if (onTabChange) onTabChange(id);

    // Modal triggers based on button clicked
    if (id === 'Reports') {
      setShowReportsModal(true);
    } else if (id === 'Saved') {
      setShowSavedModal(true);
    } else if (id === 'Enhance') {
      setShowEnhanceModal(true);
    } else if (id === 'Pro') {
      setShowProModal(true);
    } else if (id === 'Scan') {
      if (onRunScan) onRunScan();
    }
  };

  const navItems = [
    { id: 'Home', icon: Home, label: 'Home', action: () => onTabChange && onTabChange('Home') },
    {
      id: 'Scan',
      icon: Crosshair,
      label: '',
      action: () => {
        if (onTabChange) onTabChange('Scan');
        if (onRunScan) onRunScan();
      },
    },
    { id: 'Reports', icon: FileText, label: '', action: () => setShowReportsModal(true) },
    { id: 'Saved', icon: Bookmark, label: '', action: () => setShowSavedModal(true) },
    { id: 'Upload', icon: Upload, label: '', action: onUploadClick },
    { id: 'Enhance', icon: Sparkles, label: '', action: () => setShowEnhanceModal(true) },
    { id: 'Pro', icon: Crown, label: '', action: () => setShowProModal(true) },
  ];

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 shrink-0 gap-3">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => onTabChange && onTabChange('Home')}
        >
          <div className="w-7 h-9 sm:w-8 sm:h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-tl-full rounded-tr-full rounded-bl-full rounded-br-sm shadow-md transform -rotate-12 flex items-center justify-center shrink-0">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/60 rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 leading-none">DeepSift</span>
            <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
              AI Forensic Studio
            </span>
          </div>
        </div>

        {/* Center Nav Buttons (Smooth, Light & Responsive) */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-white/40 backdrop-blur-xl p-1 sm:p-1.5 rounded-full border border-white/60 shadow-sm overflow-x-auto max-w-[70vw]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.action)}
                title={item.id}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#fce956] shadow-sm text-slate-900 font-semibold scale-105'
                    : 'hover:bg-white/70 active:scale-95 text-slate-700'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 sm:w-[17px] sm:h-[17px] transition-transform ${
                    isActive ? 'text-slate-900 scale-110' : 'text-slate-700 hover:text-slate-900'
                  }`}
                />
                {item.label && <span className="text-xs font-semibold text-slate-800 hidden md:inline">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Right Profile & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 relative">
          <a
            href="/deepsift-svd-project.zip"
            download="deepsift-svd-project.zip"
            title="Download Complete Codebase ZIP"
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-full text-xs font-semibold shadow-sm transition-all border border-slate-700 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Project ZIP</span>
          </a>

          <button
            onClick={() => setShowNotification(!showNotification)}
            aria-label="Notifications"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/50 rounded-full text-slate-700 hover:bg-white/70 active:scale-95 transition-all shadow-xs cursor-pointer relative shrink-0"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
          </button>

          {showNotification && (
            <div className="absolute right-0 sm:right-14 top-12 sm:top-0 w-64 sm:w-72 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl p-3.5 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Model Audit Engine Active</span>
                </div>
                <button onClick={() => setShowNotification(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                DeepSift v3.2 inference model is operational with calibrated singular value decay and 2D-FFT anomaly sensors.
              </p>
            </div>
          )}

          {/* User Profile Avatar with Default Silhouette Photo */}
          <div
            onClick={() => setShowProfileModal(true)}
            title="User Profile & Settings"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white shadow-xs cursor-pointer hover:ring-2 hover:ring-yellow-400 active:scale-95 transition-all shrink-0 bg-slate-200"
          >
            <img
              src={DEFAULT_AVATAR}
              alt="Default Profile Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* 1. REPORTS MODAL (Triggered smoothly by FileText / Reports button) */}
      {showReportsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-800 font-bold">
                  <FileText className="w-4 h-4 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Forensic Audit Dossier</h3>
                  <p className="text-[10px] text-slate-500">Case #{imageDetails?.fileName ? 'DS-8924' : 'DS-INIT'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportsModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Integrity Verdict</span>
                  <span className="font-bold text-sm text-slate-900">
                    {score ? `${score.aiProbability}% Synthetic Probability` : 'Awaiting Inspection'}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    (score?.aiProbability || 0) > 60
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {score?.riskLevel || 'Nominal'} Risk
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Audited Checkpoints</span>
                {flaggedPatterns.map((pat) => (
                  <div key={pat.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                    <span className="text-slate-700 font-medium text-[11px]">{pat.name}</span>
                    <span className={`text-[10px] font-bold ${pat.detected ? 'text-amber-600' : 'text-slate-400'}`}>
                      {pat.detected ? 'Flagged' : 'Passed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-[#fce956] hover:bg-[#f8e33b] text-slate-900 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Export PDF Certificate</span>
              </button>
              <button
                onClick={() => setShowReportsModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SAVED BOOKMARKS MODAL (Triggered smoothly by Bookmark button) */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center text-slate-900 font-bold">
                  <Bookmark className="w-4 h-4 fill-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Saved Cases & History</h3>
                  <p className="text-[10px] text-slate-500">Quick Access to Forensic Audits</p>
                </div>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-all cursor-pointer flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">portrait_sample_049.jpg</span>
                    <span className="text-[10px] text-slate-500">78% AI • High Confidence</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Just now</span>
              </div>

              <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-all cursor-pointer flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">panda_bicycle_gen_v2.png</span>
                    <span className="text-[10px] text-slate-500">92% AI • Diffusion Lattice</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">10m ago</span>
              </div>
            </div>

            <button
              onClick={() => setShowSavedModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 3. ENHANCE / AI TOOLS MODAL (Triggered smoothly by Sparkles button) */}
      {showEnhanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-slate-950 font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Forensic Enhancements</h3>
                  <p className="text-[10px] text-slate-500">Signal Filters & Subspace Tuning</p>
                </div>
              </div>
              <button
                onClick={() => setShowEnhanceModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-700 text-[11px]">SVD Subspace Denoising</span>
                  <span className="font-mono text-slate-500 text-[10px]">{denoiseLevel}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={95}
                  value={denoiseLevel}
                  onChange={(e) => setDenoiseLevel(+e.target.value)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-700 text-[11px]">Contrast Gamma Stretch</span>
                  <span className="font-mono text-slate-500 text-[10px]">{contrastGamma.toFixed(2)}γ</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.2}
                  step={0.05}
                  value={contrastGamma}
                  onChange={(e) => setContrastGamma(+e.target.value)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700 text-[11px]">Pupillary Specular Vector Zoom</span>
                <input
                  type="checkbox"
                  checked={ocularBoost}
                  onChange={(e) => setOcularBoost(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700 text-[11px]">2D-FFT Annular Lattice Notch</span>
                <input
                  type="checkbox"
                  checked={fftFilterActive}
                  onChange={(e) => setFftFilterActive(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setShowEnhanceModal(false)}
              className="w-full py-2.5 bg-[#fce956] hover:bg-[#f8e33b] text-slate-900 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Apply Enhancements
            </button>
          </div>
        </div>
      )}

      {/* 4. PRO TIER MODAL (Triggered smoothly by Crown button) */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-bold">
                  <Crown className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">DeepSift Enterprise Pro</h3>
                  <p className="text-[10px] text-emerald-600 font-semibold">Active Studio License</p>
                </div>
              </div>
              <button
                onClick={() => setShowProModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[11px]">Unlimited SVD Decomposition & Rank Truncation</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[11px]">Direct Python Webhook & FastAPI Client Integration</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
                <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[11px]">Batch Image Ingestion up to 100 MB / file</span>
              </div>
            </div>

            <button
              onClick={() => setShowProModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 5. USER PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs bg-slate-200">
                  <img src={DEFAULT_AVATAR} alt="Default Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Forensic Analyst</h3>
                  <p className="text-[10px] text-slate-500">Security Clearance Level 4</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
                <span>Inference Engine</span>
                <span className="font-mono font-bold text-slate-900 text-[11px]">SVD-FFT-v3.2</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
                <span>Hardware Acceleration</span>
                <span className="font-bold text-emerald-600 text-[11px]">WebGL 2.0 / GPU</span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-2.5 bg-[#fce956] hover:bg-[#f8e33b] text-slate-900 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
