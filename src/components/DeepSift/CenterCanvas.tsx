import React, { useState, useRef } from 'react';
import { Plus, Sparkles, Mic, MicOff, ArrowRight, Loader2, RefreshCw, Upload, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface CenterCanvasProps {
  imageUrl: string;
  isScanning: boolean;
  scanProgress?: number;
  scanTimeElapsed?: number;
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onRunScan: () => void;
  onUploadFile: (file: File) => void;
  onLoadDemo?: () => void;
  onClear?: () => void;
}

export const CenterCanvas = ({
  imageUrl,
  isScanning,
  scanProgress = 0,
  scanTimeElapsed = 0,
  prompt,
  onPromptChange,
  onRunScan,
  onUploadFile,
  onLoadDemo,
  onClear,
}: CenterCanvasProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleToggleMic = () => {
    setIsListening(!isListening);
    if (!isListening) {
      onPromptChange(
        'Analyzing neural texture entropy, biological eye reflection coherence, and high-frequency GAN artifacts...'
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onRunScan();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 relative flex flex-col items-center justify-center rounded-[32px] overflow-hidden shadow-2xl border-[3px] transition-all duration-300 ${
        isDragging
          ? 'border-yellow-400 bg-yellow-500/10'
          : 'border-white/40 bg-slate-950/20'
      } min-h-[460px]`}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Image or Empty State */}
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="Analysis Target"
            className="absolute inset-0 w-full h-full object-contain bg-slate-950/40 select-none transition-transform duration-700 hover:scale-[1.01]"
          />

          {/* Reset / Clear Button */}
          {onClear && (
            <button
              onClick={onClear}
              title="Clear media"
              className="absolute top-4 right-4 z-30 bg-slate-900/60 hover:bg-slate-900/90 text-white/80 hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Subtle Dark Vignette for contrast */}
          <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/35 pointer-events-none" />

          {/* Intersecting Rings Overlay Effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-45 mix-blend-overlay">
            <div className="w-[78%] h-[115%] border-[7px] border-white/70 rounded-[100%] rotate-45 transform -translate-y-4 blur-[0.5px]"></div>
            <div className="absolute w-[78%] h-[115%] border-[7px] border-white/70 rounded-[100%] -rotate-45 transform -translate-y-4 blur-[0.5px]"></div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 max-w-md">
          {/* Faint Background Geometric Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-80 h-80 border-2 border-dashed border-white/60 rounded-full animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute w-60 h-60 border border-white/40 rounded-full"></div>
          </div>

          <div className="w-20 h-20 bg-white/40 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-5 shadow-lg border border-white/60 text-slate-700">
            <ImageIcon className="w-10 h-10 stroke-[1.5]" />
          </div>

          <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
            No Media Selected
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-6 max-w-sm">
            Drag and drop an image here or browse your system to inspect latent diffusion noise, SVD singular spectrum anomalies, and pixel coherence.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/80 hover:bg-white text-slate-900 text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all border border-white/80 flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-700" />
              <span>Upload Image</span>
            </button>

            {onLoadDemo && (
              <button
                onClick={onLoadDemo}
                className="bg-[#fce956] hover:bg-[#fadb2b] text-slate-900 text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all border border-yellow-300/80 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-slate-800" />
                <span>Load Sample</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Scanning Animation Beam & Progress Overlay */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-center overflow-hidden z-20">
          {/* Laser scanning line */}
          <div
            className="w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] transition-all duration-75"
            style={{
              transform: `translateY(${(scanProgress - 50) * 4}%)`,
            }}
          />

          {/* Top HUD Telemetry Badge */}
          <div className="absolute top-5 left-5 right-5 sm:right-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/85 backdrop-blur-xl px-4 py-3 rounded-2xl border border-cyan-400/50 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white tracking-wide">
                  Deep Matrix & Biological Scan
                </span>
                <span className="text-[9px] font-mono text-cyan-300">
                  Elapsed Time: {scanTimeElapsed.toFixed(2)}s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:pl-3 sm:border-l sm:border-white/10">
              <div className="w-24 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/20">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-yellow-300 to-emerald-400 transition-all duration-75 ease-out rounded-full shadow-[0_0_8px_#22d3ee]"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300 w-10 text-right">
                {scanProgress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Bar */}
      <div className="absolute bottom-4 w-full max-w-xl px-4 z-20">
        <GlassCard className="p-3.5 sm:p-4 flex flex-col gap-2 border border-white/60 bg-white/45 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              Prompt & Query Inspector
            </h4>
            {isScanning && (
              <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                Processing
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-700 leading-relaxed max-w-[95%] line-clamp-1 sm:line-clamp-2">
            Paste your content or upload a document to analyze AI-generated patterns, receive a detailed confidence score, and generate a shareable verification report in seconds
          </p>

          <div className="flex items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload new image or document"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-white/70 hover:bg-white rounded-xl flex items-center justify-center transition-all text-slate-700 shadow-xs border border-white/60 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onRunScan}
              disabled={isScanning}
              title="Trigger deep forensic analysis"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-[#fce956] hover:bg-[#fbdc2a] rounded-xl flex items-center justify-center transition-all text-slate-900 shadow-xs border border-yellow-300/80 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-slate-800 text-slate-800" />
            </button>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask DeepSift to analyze pixel grain, gaze, or lighting..."
                className="w-full bg-white/70 hover:bg-white/90 focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded-xl px-3 py-1.5 sm:py-2 text-xs text-slate-800 placeholder:text-slate-400 border border-white/60 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={handleToggleMic}
              title={isListening ? 'Stop dictation' : 'Voice prompt'}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all shadow-xs border border-white/60 cursor-pointer active:scale-95 shrink-0 ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/70 hover:bg-white text-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onRunScan}
              disabled={isScanning}
              title="Submit prompt & scan"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center transition-all text-slate-900 shadow-xs border border-white/70 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
            >
              <ArrowRight className="w-4 h-4 font-bold" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

