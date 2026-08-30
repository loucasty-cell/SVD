import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini client (Lazy initialization)
  let ai: GoogleGenAI | null = null;
  function getGemini() {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/diagnose', async (req, res) => {
    try {
      const {
        reconError,
        tauThresh,
        isAnomaly,
        kComp,
        retainedEnergy,
      } = req.body;

      const aiClient = getGemini();

      const prompt = `An image was processed through an SVD Subspace Reconstruction pipeline.
Calculated Metrics:
- Retained Components (k): ${kComp}
- Retained Energy: ${retainedEnergy.toFixed(2)}%
- Calculated SVD Reconstruction Error (Frobenius Norm): ${reconError.toFixed(4)}
- Anomaly Threshold (τ): ${tauThresh}
- Is Anomaly Condition Met: ${isAnomaly}

Analyze these linear algebra metrics and provide a diagnostic evaluation of this potential defect. Keep it concise, analytical, and interpret the quality of the subspace projection.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert Linear Algebra and Computer Vision AI Assistant. Evaluate SVD reconstruction errors and explain if the object is an anomaly based on the subspace projection.',
          temperature: 0.2,
        },
      });

      res.json({ diagnosis: response.text });
    } catch (error: any) {
      console.error('Error in /api/diagnose:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
