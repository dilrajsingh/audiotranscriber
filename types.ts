
export interface TranscriptSegment {
  start: number;
  end: number;
  speaker: string;
  text: string;
}

export interface TranscriptionResponse {
  speakersDetected: number;
  segments: TranscriptSegment[];
}

export type ProcessingStage = 'idle' | 'uploading' | 'diarizing' | 'transcribing' | 'merging' | 'completed' | 'error';

export interface TranscriptionOptions {
  speakerCount: number | 'auto';
  showTimestamps: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  credits: number; // minutes
}
