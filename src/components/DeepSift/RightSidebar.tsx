import React, { useRef, useState } from 'react';
import { Settings, Image as ImageIcon, Share2, CheckCircle2, UploadCloud, Layers } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ImageMetadata } from '../../types';

interface RightSidebarProps {
  imageDetails: ImageMetadata | null;
  onUploadFile: (file: File) => void;
  onShare?: () => void;
}

export const RightSidebar = ({
  imageDetails,
  onUploadFile,
  onShare,
}: RightSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const handleShareClick = () => {
    if (!imageDetails) return;
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-72 xl:w-80 flex flex-col gap-3.5 shrink-0 overflow-y-auto pr-0.5 custom-scrollbar">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.pdf,.docx,.txt"
        className="hidden"
      />

      {/* Dashboard & File Drop */}
      <GlassCard className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Dashboard</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Model & detection settings"
            className="p-1.5 bg-white/50 hover:bg-white rounded-lg transition-colors border border-white/60 text-slate-600 cursor-pointer shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-3 p-2.5 bg-white/70 rounded-xl border border-white text-xs space-y-1.5 animate-in fade-in">
            <div className="flex justify-between text-slate-700 font-semibold text-[10px]">
              <span>SVD Truncation Rank (k):</span>
              <span className="text-amber-700 font-mono">k = 24</span>
            </div>
            <div className="flex justify-between text-slate-700 font-semibold text-[10px]">
              <span>Residual Frobenius Error:</span>
              <span className="text-emerald-700 font-mono">Strict (0.85)</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-5 h-5 flex items-center justify-center bg-white/60 rounded-md border border-white/60 shadow-2xs">
            <ImageIcon className="w-3 h-3 text-slate-700" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Image Ingestion</span>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
            isDragOver
              ? 'border-amber-400 bg-amber-50/40 scale-[1.01]'
              : 'border-slate-300/70 bg-white/20 hover:bg-white/30 hover:border-slate-400'
          }`}
        >
          <div className="w-10 h-10 bg-white/70 group-hover:bg-white rounded-xl flex items-center justify-center mb-2.5 shadow-xs border border-white/60 transition-transform group-hover:scale-105">
            {isDragOver ? (
              <UploadCloud className="w-5 h-5 text-amber-500 animate-bounce" />
            ) : (
              <ImageIcon className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-800 mb-0.5">Drop your file here</h4>
          <p className="text-[9px] text-slate-500 mb-3 max-w-[180px]">
            Support for JPG, PNG, WebP & TIFF up to 100 MB
          </p>
          <button
            type="button"
            className="bg-[#fce956] hover:bg-[#fadb2b] text-slate-900 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-xs transition-all pointer-events-none"
          >
            Browse file
          </button>
        </div>
      </GlassCard>

      {/* Image Details */}
      <GlassCard className="p-4 flex-1 relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3 relative z-10">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Image Details</h3>
            <button
              onClick={handleShareClick}
              disabled={!imageDetails}
              title="Share / copy image link"
              className="p-1.5 bg-white/50 hover:bg-white rounded-lg transition-colors border border-white/60 text-slate-600 cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex justify-between items-start relative z-10 gap-2">
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="text-[9px] text-slate-500 font-medium">Dimensions</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{imageDetails?.dimensions || '--'}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-medium">File Format</p>
                <p className="text-xs font-bold text-slate-800">{imageDetails?.fileFormat || '--'}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-medium">Aspect Ratio</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{imageDetails?.aspectRatio || '--'}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-medium">Resolution</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{imageDetails?.resolution || '--'}</p>
              </div>
            </div>

            {/* Stacked 3D Depth Visualizer or Empty Indicator */}
            {imageDetails?.imageUrl ? (
              <div className="relative w-24 h-28 mr-1 mt-1">
                <img
                  src={imageDetails.imageUrl}
                  className="absolute top-4 right-0 w-[60px] h-[75px] object-cover rounded-lg shadow-md rotate-[14deg] border-2 border-white/70 transition-transform hover:rotate-0 hover:z-20"
                  alt="Stacked slice 3"
                />
                <img
                  src={imageDetails.imageUrl}
                  className="absolute top-2 right-2.5 w-[60px] h-[75px] object-cover rounded-lg shadow-md rotate-[5deg] border-2 border-white/70 transition-transform hover:rotate-0 hover:z-20"
                  alt="Stacked slice 2"
                />
                <img
                  src={imageDetails.imageUrl}
                  className="absolute top-0 right-5 w-[60px] h-[75px] object-cover rounded-lg shadow-xl -rotate-[5deg] border-2 border-white transition-transform hover:rotate-0 hover:z-20"
                  alt="Stacked slice 1"
                />
              </div>
            ) : (
              <div className="relative w-24 h-28 mr-1 mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300/60 bg-white/20 text-slate-400">
                <Layers className="w-5 h-5 mb-1 stroke-[1.5] text-slate-400/70" />
                <span className="text-[9px] font-semibold">No Slices</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-white/40 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="truncate max-w-[150px] font-semibold">{imageDetails?.fileName || 'No file selected'}</span>
          <span className="shrink-0">{imageDetails?.fileSize || '--'}</span>
        </div>
      </GlassCard>

      {copied && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Image report link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};

