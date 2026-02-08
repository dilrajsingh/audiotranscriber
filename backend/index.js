
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
// Cloud Run and Heroku provide the port via process.env.PORT
const PORT = process.env.PORT || 8080;

app.use(helmet());

// Production CORS: Only allow your frontend URL
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  'http://localhost:3000' // Local dev
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Increased limit for larger audio files

// MOCK DATABASE - In production, use MongoDB or PostgreSQL
const users = {
  'user_01': { email: 'guest@example.com', credits: 60 }
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  
  // In production, verify the actual JWT here
  if (token === 'mock_jwt_token_123') {
    req.user = users['user_01']; 
    next();
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP
  message: { error: 'Too many requests, please try again later.' }
});

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/api/transcribe', authenticate, limiter, async (req, res) => {
  try {
    const { audioData, mimeType, options, durationMins } = req.body;
    
    if (req.user.credits < durationMins) {
      return res.status(402).json({ error: 'Insufficient credits.' });
    }

    const prompt = `
      Analyze the audio. Perform speaker diarization and transcription.
      Return a JSON object with:
      - speakersDetected (number)
      - segments (array of {start, end, speaker, text})
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ 
        parts: [
          { inlineData: { data: audioData, mimeType } }, 
          { text: prompt }
        ] 
      }],
      config: { responseMimeType: "application/json" }
    });

    req.user.credits -= durationMins;
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error('Transcription Error:', error);
    res.status(500).json({ error: 'AI Processing failed' });
  }
});

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend live on port ${PORT}`);
});
