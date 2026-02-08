
import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptionResponse, TranscriptionOptions, ProcessingStage, TranscriptSegment } from "../types";

const MAX_GAP_TO_MERGE = 0.4;

/**
 * Defaults to backend mode for production safety.
 * Set USE_BACKEND=false in .env.local to run direct browser mode.
 */
const USE_BACKEND = (process.env.USE_BACKEND ?? 'true').toLowerCase() !== 'false';
const BACKEND_ENDPOINT = process.env.BACKEND_ENDPOINT || 'http://localhost:3001/api/transcribe';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

export const processAudioWithGemini = async (
  base64Data: string,
  mimeType: string,
  options: TranscriptionOptions,
  onStageChange: (stage: ProcessingStage) => void,
  durationMins: number
): Promise<TranscriptionResponse> => {
  
  if (USE_BACKEND) {
    onStageChange('diarizing');
    const token = localStorage.getItem('audio_transcribe_token');
    if (!token) {
      throw new Error('Missing auth token. Please log in again.');
    }
    
    const response = await fetch(BACKEND_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // This ensures the backend knows WHO is asking
      },
      body: JSON.stringify({ audioData: base64Data, mimeType, options, durationMins })
    });
    
    if (response.status === 401) {
       throw new Error('Your session has expired. Please log in again.');
    }

    if (response.status === 402) {
      throw new Error('Insufficient credits for this file.');
    }
    
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || 'Backend processing failed');
    }

    const result = await response.json();
    return finalizeResult(result, onStageChange);
  }

  // --- Direct Client Logic (Simplified for brevity) ---
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY for direct browser mode.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  onStageChange('diarizing');
  
  const speakerDirective = options.speakerCount === 'auto' 
    ? "Detect all unique speakers automatically." 
    : `There are exactly ${options.speakerCount} speakers in this audio. Identify them as Speaker 1, Speaker 2, etc.`;

  const prompt = `Analyze the attached audio. 1. Perform speaker diarization. 2. Transcribe accurately. 3. ${speakerDirective} 4. Provide JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speakersDetected: { type: Type.INTEGER },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.NUMBER },
                  end: { type: Type.NUMBER },
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["start", "end", "speaker", "text"]
              }
            }
          },
          required: ["speakersDetected", "segments"]
        }
      }
    });

    const result: TranscriptionResponse = JSON.parse(response.text || '{"speakersDetected": 0, "segments": []}');
    return finalizeResult(result, onStageChange);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("The AI processing failed.");
  }
};

const finalizeResult = (result: TranscriptionResponse, onStageChange: (stage: ProcessingStage) => void) => {
  onStageChange('transcribing');
  onStageChange('merging');
  
  if (result.segments && result.segments.length > 1) {
    const merged: TranscriptSegment[] = [];
    let current = result.segments[0];
    for (let i = 1; i < result.segments.length; i++) {
      const next = result.segments[i];
      const gap = next.start - current.end;
      if (next.speaker === current.speaker && gap < MAX_GAP_TO_MERGE) {
        current = { ...current, end: next.end, text: `${current.text} ${next.text}` };
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);
    result.segments = merged;
  }
  return result;
};
