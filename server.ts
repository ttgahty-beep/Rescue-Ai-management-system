import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { processEmergencyWithGemini } from './src/server/geminiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Endpoints
app.post('/api/ai/process', async (req, res) => {
  try {
    const result = await processEmergencyWithGemini(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal triage error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'RescueLink AI Pakistan', timestamp: new Date().toISOString() });
});

// Serve static assets in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RescueLink AI Server listening on port ${PORT}`);
});
