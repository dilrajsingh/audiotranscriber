
import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ProgressIndicator } from './ProgressIndicator';
import { processAudioWithGemini } from '../services/geminiService';
import { ProcessingStage, TranscriptionResponse, TranscriptionOptions } from '../types';
import { Settings2, Users, Clock, Info, AlertTriangle } from 'lucide-react';

interface TranscriptionAppProps {
  userCredits: number;
}

export const TranscriptionApp: React.FC<TranscriptionAppProps> = ({ userCredits }) => {
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<TranscriptionOptions>({
    speakerCount: 'auto',
    showTimestamps: true,
  });
  const [result, setResult] = useState<TranscriptionResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number>(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    
    // Get audio duration
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      setFileDuration(Math.ceil(audio.duration / 60)); // Round up to nearest minute
    };
  };

  const hasEnoughCredits = userCredits >= fileDuration;

  const startProcessing = async () => {
    if (!selectedFile || !hasEnoughCredits) return;

    try {
      setError(null);
      setStage('uploading');
      
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      });

      setStage('diarizing');
      
      const transcriptionResult = await processAudioWithGemini(
        fileData.split(',')[1],
        selectedFile.type,
        options,
        (currentStage) => setStage(currentStage)
      );

      // Deduct locally for immediate UI feedback (In prod, backend does this)
      const savedUser = JSON.parse(localStorage.getItem('audio_transcribe_user') || '{}');
      savedUser.credits = Math.max(0, savedUser.credits - fileDuration);
      localStorage.setItem('audio_transcribe_user', JSON.stringify(savedUser));
      // Note: Re-sync state would usually happen here via a context provider or re-render

      setResult(transcriptionResult);
      setStage('completed');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during processing.');
      setStage('error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Settings2 size={18} className="text-indigo-600" />
              Configure Processing
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <Users size={14} />
                  Number of speakers
                </label>
                <select
                  value={options.speakerCount}
                  onChange={(e) => setOptions({ ...options, speakerCount: e.target.value === 'auto' ? 'auto' : parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="auto">Auto-detect</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} Speakers</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Show timestamps</span>
                </div>
                <button
                  onClick={() => setOptions({ ...options, showTimestamps: !options.showTimestamps })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    options.showTimestamps ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${options.showTimestamps ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <FileUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} />
            
            {selectedFile && !hasEnoughCredits && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Required: {fileDuration} mins. <br/>
                  Your balance: {userCredits} mins. <br/>
                  Please top up to proceed.
                </p>
              </div>
            )}

            <button
              onClick={startProcessing}
              disabled={!selectedFile || !hasEnoughCredits || (stage !== 'idle' && stage !== 'completed' && stage !== 'error')}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold text-white transition-all shadow-md active:scale-[0.98] ${
                !selectedFile || !hasEnoughCredits || (stage !== 'idle' && stage !== 'completed' && stage !== 'error')
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {!hasEnoughCredits && selectedFile ? 'Insufficient Credits' : stage === 'idle' || stage === 'completed' || stage === 'error' ? 'Start Transcription' : 'Processing...'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {stage !== 'idle' && stage !== 'completed' && stage !== 'error' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <ProgressIndicator stage={stage} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-start gap-3">
              <Info size={16} className="mt-1" />
              <div>
                <h4 className="font-bold">An error occurred</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && stage === 'completed' && (
            <TranscriptDisplay result={result} showTimestamps={options.showTimestamps} />
          )}

          {stage === 'idle' && !result && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">Ready to transcribe</h3>
              <p className="text-slate-500 max-w-sm mt-2">
                Upload an audio file to see the neural diarization in action. Cost is 1 credit per minute of audio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
