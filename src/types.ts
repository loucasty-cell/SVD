export interface DetectionScore {
  aiProbability: number; // 0 - 100
  humanAuthorship: number; // 0 - 100
  riskLevel: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface FlaggedPattern {
  id: string;
  name: string;
  detected: boolean | null;
  description: string;
  confidence: number;
}

export interface ForensicLogEntry {
  id: string;
  timestamp: string;
  stage: string;
  finding: string;
  severity: 'normal' | 'flagged' | 'alert';
}

export interface ImageMetadata {
  fileName: string;
  fileSize: string;
  dimensions: string;
  width: number;
  height: number;
  fileFormat: string;
  aspectRatio: string;
  resolution: string;
  imageUrl: string;
  baseVariations?: string[];
}

export interface DeepSiftState {
  score: DetectionScore | null;
  flaggedPatterns: FlaggedPattern[];
  forensicLogs: ForensicLogEntry[];
  imageDetails: ImageMetadata | null;
  isScanning: boolean;
  activeNav: string;
  prompt: string;
}


