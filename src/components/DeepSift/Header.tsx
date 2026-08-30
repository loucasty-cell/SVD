import { useState } from 'react';
import { Home, Crosshair, FileText, Bookmark, Upload, Sparkles, Crown, Bell, CheckCircle, Download } from 'lucide-react';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUploadClick?: () => void;
}

export const Header = ({ activeTab = 'Home', onTabChange, onUploadClick }: HeaderProps) => {
  const [showNotification, setShowNotification] = useState(false);

  const navItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Scan', icon: Crosshair, label: '' },
    { id: 'Reports', icon: FileText, label: '' },
    { id: 'Saved', icon: Bookmark, label: '' },
    { id: 'Upload', icon: Upload, label: '', onClick: onUploadClick },
    { id: 'Enhance', icon: Sparkles, label: '' },
    { id: 'Pro', icon: Crown, label: '' },
  ];

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 py-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange && onTabChange('Home')}>
        <div className="w-8 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-tl-full rounded-tr-full rounded-bl-full rounded-br-sm shadow-md transform -rotate-12 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-slate-800 leading-none">DeepSift</span>
          <span className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">AI Forensic Studio</span>
        </div>
      </div>

      {/* Center Nav */}
      <div className="flex items-center gap-1.5 bg-white/35 backdrop-blur-xl p-1.5 rounded-full border border-white/50 shadow-sm">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (onTabChange) {
                  onTabChange(item.id);
                }
              }}
              title={item.id}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#fce956] shadow-sm text-slate-900 font-semibold'
                  : 'hover:bg-white/60 text-slate-600'
              }`}
            >
              <item.icon className={`w-[17px] h-[17px] ${isActive ? 'text-slate-900' : 'text-slate-700'}`} />
              {item.label && <span className="text-xs font-semibold text-slate-800">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Right Profile & Alert */}
      <div className="flex items-center gap-3 relative">
        <a
          href="/deepsift-svd-project.zip"
          download="deepsift-svd-project.zip"
          title="Download Complete Codebase ZIP"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold shadow-sm transition-all border border-slate-700 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-yellow-400" />
          <span className="hidden sm:inline">Project ZIP</span>
        </a>

        <button
          onClick={() => setShowNotification(!showNotification)}
          aria-label="Notifications"
          className="w-10 h-10 flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/50 rounded-full text-slate-700 hover:bg-white/70 transition-all shadow-xs cursor-pointer relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
        </button>

        {showNotification && (
          <div className="absolute right-14 top-0 w-72 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl p-3.5 z-50 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 font-semibold text-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Model Audit Engine Ready</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              DeepSift v3.2 model inference is active with multi-scale biological texture auditing.
            </p>
          </div>
        )}

        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

