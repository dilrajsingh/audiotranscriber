
import React from 'react';
import { ProcessingStage } from '../types';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  stage: ProcessingStage;
}

const STAGES: { id: ProcessingStage; label: string; description: string }[] = [
  { id: 'uploading', label: 'Uploading', description: 'Preparing audio data for processing' },
  { id: 'diarizing', label: 'Diarizing', description: 'Identifying distinct voices in the audio' },
  { id: 'transcribing', label: 'Transcribing', description: 'Converting speech into text segments' },
  { id: 'merging', label: 'Merging', description: 'Cleaning and finalizing transcript data' },
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ stage }) => {
  const currentIndex = STAGES.findIndex(s => s.id === stage);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-800">Processing Audio</h3>
        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-semibold">
          <Loader2 size={16} className="animate-spin" />
          <span>Stage {Math.max(1, currentIndex + 1)} of {STAGES.length}</span>
        </div>
      </div>

      <div className="space-y-6">
        {STAGES.map((s, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={s.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' :
                  isActive ? 'border-indigo-600 text-indigo-600' :
                  'border-slate-200 text-slate-300'
                }`}>
                  {isCompleted ? <CheckCircle2 size={18} /> : 
                   isActive ? <Loader2 size={18} className="animate-spin" /> : 
                   <Circle size={18} />}
                </div>
                {index !== STAGES.length - 1 && (
                  <div className={`w-0.5 h-10 mt-2 rounded-full ${isCompleted ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                )}
              </div>
              <div className="flex-1 pb-4">
                <h4 className={`font-bold ${isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {s.label}
                </h4>
                <p className="text-sm text-slate-500">{s.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Animated Progress Bar */}
      <div className="mt-8">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-700 ease-out"
            style={{ width: `${((currentIndex + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
