import React, { useState, useRef } from 'react';
import { Header } from './components/DeepSift/Header';
import { LeftSidebar } from './components/DeepSift/LeftSidebar';
import { RightSidebar } from './components/DeepSift/RightSidebar';
import { CenterCanvas } from './components/DeepSift/CenterCanvas';
import { DetectionScore, FlaggedPattern, ForensicLogEntry, ImageMetadata } from './types';

// ==========================================
// Python / FastAPI Backend Integration TODOs:
// ==========================================
// TODO [Backend]: Connect to FastAPI / PyTorch inference server:
//   - POST /api/v1/detect: Multiscale CNN + ViT deepfake & latent diffusion artifact detector
//   - POST /api/v1/upload: Cloud storage & multipart file processing
//   - WS /api/v1/forensics/live: Streaming telemetry & attention map overlays

const EMPTY_PATTERNS: FlaggedPattern[] = [
  {
    id: 'pat-1',
    name: 'Repetitive Pixel Structure',
    detected: null,
    description: 'High-frequency periodicity check across 4x4 spatial blocks in midtones.',
    confidence: 0,
  },
  {
    id: 'pat-2',
    name: 'Visual Signs of Popular Models',
    detected: null,
    description: 'Latent noise signature correlation with diffusion/transformer priors.',
    confidence: 0,
  },
  {
    id: 'pat-3',
    name: 'Lacks Realistic Biological Details',
    detected: null,
    description: 'Organic pupillary light refraction and skin texture coherence check.',
    confidence: 0,
  },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [score, setScore] = useState<DetectionScore | null>(null);
  const [flaggedPatterns, setFlaggedPatterns] = useState<FlaggedPattern[]>(EMPTY_PATTERNS);
  const [forensicLogs, setForensicLogs] = useState<ForensicLogEntry[]>([]);
  const [imageDetails, setImageDetails] = useState<ImageMetadata | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTimeElapsed, setScanTimeElapsed] = useState(0);
  const [prompt, setPrompt] = useState('');
  const globalFileInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Load sample demo image
  const handleLoadDemo = () => {
    const sampleUrl =
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1200';
    const demoMetadata: ImageMetadata = {
      fileName: 'portrait_sample_049.jpg',
      fileSize: '2.4 MB',
      dimensions: '607 × 1000 px',
      width: 607,
      height: 1000,
      fileFormat: 'JPG',
      aspectRatio: '1:1.65 p/o',
      resolution: '72 DPI w/r',
      imageUrl: sampleUrl,
      baseVariations: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      ],
    };
    setImageDetails(demoMetadata);
    triggerScanSimulation('portrait_sample_049.jpg', true);
  };

  // Handle image upload from any dropzone or file picker
  const handleUploadFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;

    img.onload = () => {
      const width = img.naturalWidth || 800;
      const height = img.naturalHeight || 600;
      const gcdVal = (a: number, b: number): number => (!b ? a : gcdVal(b, a % b));
      const divisor = gcdVal(width, height) || 1;
      const ratioW = (width / divisor);
      const ratioH = (height / divisor);
      const ratioStr =
        ratioW < 100 && ratioH < 100
          ? `${ratioW.toFixed(0)}:${ratioH.toFixed(0)}`
          : `1:${(height / width).toFixed(2)}`;
      
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;

      const formatName = file.type ? file.type.split('/')[1]?.toUpperCase() : 'JPG';

      const newMetadata: ImageMetadata = {
        fileName: file.name,
        fileSize: formattedSize,
        dimensions: `${width} × ${height} px`,
        width,
        height,
        fileFormat: formatName,
        aspectRatio: `${ratioStr} p/o`,
        resolution: '72 DPI w/r',
        imageUrl: objectUrl,
        baseVariations: [objectUrl, objectUrl, objectUrl],
      };

      setImageDetails(newMetadata);
      triggerScanSimulation(file.name);
    };
  };

  const triggerScanSimulation = (name?: string, isDemoTarget?: boolean) => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanTimeElapsed(0);

    const startTime = performance.now();
    const totalDuration = 2200; // 2.2s forensic scan duration
    const isDemo = isDemoTarget || (name && name.includes('portrait_sample_049'));

    scanIntervalRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progressRatio = Math.min(elapsed / totalDuration, 1);
      const currentPercent = Math.floor(progressRatio * 100);

      setScanProgress(currentPercent);
      setScanTimeElapsed(parseFloat((elapsed / 1000).toFixed(2)));

      if (progressRatio >= 1) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }

        // Calibrated score: Exactly 88% for demo image
        const aiScore = isDemo ? 88 : Math.floor(Math.random() * 25) + 70;
        const humanScore = 100 - aiScore;
        const risk: 'Low' | 'Medium' | 'High' | 'Critical' =
          aiScore >= 80 ? 'High' : aiScore >= 60 ? 'Medium' : 'Low';

        setScore({
          aiProbability: aiScore,
          humanAuthorship: humanScore,
          riskLevel: risk,
        });

        setFlaggedPatterns([
          {
            id: 'pat-1',
            name: 'Repetitive Pixel Structure',
            detected: true,
            description: isDemo
              ? 'High-frequency periodicity detected across 4x4 spatial blocks with 88% SVD spectral anomaly.'
              : 'High-frequency periodicity detected across 4x4 spatial blocks.',
            confidence: isDemo ? 0.88 : +(aiScore / 100).toFixed(2),
          },
          {
            id: 'pat-2',
            name: 'Visual Signs of Popular Models',
            detected: true,
            description: isDemo
              ? 'Latent noise signature correlates with Midjourney v6 / SDXL diffusion priors (88% match).'
              : 'Latent noise signature correlates with SDXL / Flux / Midjourney priors.',
            confidence: isDemo ? 0.88 : +((aiScore - 3) / 100).toFixed(2),
          },
          {
            id: 'pat-3',
            name: 'Lacks Realistic Biological Details',
            detected: true,
            description: isDemo
              ? 'Pupillary spherical reflection and micro-porosity lack organic optical depth (88% deviation).'
              : 'Pupillary light refraction lacks organic curvature depth.',
            confidence: isDemo ? 0.88 : +(humanScore / 100).toFixed(2),
          },
        ]);

        const totalSecs = (elapsed / 1000).toFixed(2);
        setForensicLogs([
          {
            id: `log-${Date.now()}-1`,
            timestamp: '00:00.8s',
            stage: 'Surface Scan',
            finding: `Spatial tensor entropy computed on ${name || 'target'}`,
            severity: 'normal',
          },
          {
            id: `log-${Date.now()}-2`,
            timestamp: '00:01.4s',
            stage: 'Ocular Audit',
            finding: 'Micro-reflection Asymmetry & Synthetic Skin Coherence Flagged',
            severity: 'alert',
          },
          {
            id: `log-${Date.now()}-3`,
            timestamp: `00:${totalSecs}s`,
            stage: 'SVD & FFT',
            finding: isDemo
              ? `Singular value decay anomaly confirmed (88% AI Probability in ${totalSecs}s)`
              : `Artifact confidence rated at ${aiScore}% in ${totalSecs}s`,
            severity: 'flagged',
          },
        ]);

        setIsScanning(false);
      }
    }, 30);
  };

  const handleRunScan = () => {
    if (!imageDetails) {
      handleLoadDemo();
    } else {
      triggerScanSimulation(imageDetails.fileName);
    }
  };

  const handleClear = () => {
    setImageDetails(null);
    setScore(null);
    setFlaggedPatterns(EMPTY_PATTERNS);
    setForensicLogs([]);
    setPrompt('');
  };

  return (
    <div className="h-screen w-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#9bdcd3] via-[#b6a8d6] to-[#e4e4a7] font-sans text-slate-800 flex flex-col overflow-hidden">
      {/* Hidden global input */}
      <input
        type="file"
        ref={globalFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUploadFile(e.target.files[0]);
          }
        }}
        accept="image/*"
        className="hidden"
      />

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUploadClick={() => globalFileInputRef.current?.click()}
      />

      <main className="flex-1 flex gap-4 lg:gap-6 px-4 lg:px-8 pb-5 min-h-0 overflow-hidden">
        <LeftSidebar
          score={score}
          flaggedPatterns={flaggedPatterns}
          forensicLogs={forensicLogs}
          imageDetails={imageDetails}
          baseVariations={imageDetails?.baseVariations}
        />

        <CenterCanvas
          imageUrl={imageDetails?.imageUrl || ''}
          isScanning={isScanning}
          scanProgress={scanProgress}
          scanTimeElapsed={scanTimeElapsed}
          prompt={prompt}
          onPromptChange={setPrompt}
          onRunScan={handleRunScan}
          onUploadFile={handleUploadFile}
          onLoadDemo={handleLoadDemo}
          onClear={handleClear}
        />

        <RightSidebar
          imageDetails={imageDetails}
          onUploadFile={handleUploadFile}
        />
      </main>
    </div>
  );
};

export default App;

