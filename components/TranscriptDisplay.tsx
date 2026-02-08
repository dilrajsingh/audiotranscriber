
import React, { useState } from 'react';
import { TranscriptionResponse, TranscriptSegment } from '../types';
import { Copy, Download, FileJson, FileText, Check, Users } from 'lucide-react';

interface TranscriptDisplayProps {
  result: TranscriptionResponse;
  showTimestamps: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ result, showTimestamps }) => {
  const [copied, setCopied] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const handleCopy = () => {
    const text = result.segments
      .map(s => `${showTimestamps ? `[${formatTime(s.start)} - ${formatTime(s.end)}] ` : ''}${s.speaker}: ${s.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const text = result.segments
      .map(s => `${showTimestamps ? `[${formatTime(s.start)} - ${formatTime(s.end)}] ` : ''}${s.speaker}: ${s.text}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    a.click();
  };

  const downloadJson = () => {
    const data = JSON.stringify(result, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.json';
    a.click();
  };

  // Group by speaker for a cleaner UI view
  const groupedSegments: TranscriptSegment[][] = [];
  let currentGroup: TranscriptSegment[] = [];

  result.segments.forEach((seg, i) => {
    if (i === 0 || seg.speaker === result.segments[i - 1].speaker) {
      currentGroup.push(seg);
    } else {
      groupedSegments.push(currentGroup);
      currentGroup = [seg];
    }
  });
  if (currentGroup.length) groupedSegments.push(currentGroup);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <Users size={12} />
            {result.speakersDetected} Speakers
          </div>
          <h3 className="text-lg font-bold text-slate-800">Transcription Result</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
          <button
            onClick={downloadTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <FileText size={14} />
            TXT
          </button>
          <button
            onClick={downloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <FileJson size={14} />
            JSON
          </button>
        </div>
      </div>

      {/* Transcript Area */}
      <div className="p-6 overflow-y-auto max-h-[600px] bg-white space-y-8">
        {groupedSegments.map((group, groupIdx) => (
          <div key={groupIdx} className="relative pl-10">
            {/* Speaker Indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-100 rounded-full"></div>
            <div className="absolute left-[-6px] top-0 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-sm"></div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                {group[0].speaker}
              </span>
              {showTimestamps && (
                <span className="text-[10px] font-medium text-slate-400 font-mono">
                  {formatTime(group[0].start)} - {formatTime(group[group.length - 1].end)}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {group.map((seg, segIdx) => (
                <div key={segIdx} className="group relative">
                  <p className="text-slate-700 leading-relaxed">
                    {seg.text}
                  </p>
                  {showTimestamps && group.length > 1 && (
                    <span className="opacity-0 group-hover:opacity-100 absolute -right-4 top-0 text-[9px] font-mono text-slate-400 bg-white px-1 transition-opacity">
                      {formatTime(seg.start)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-center italic">
        Analysis complete. All segments identified and transcribed using neural speaker diarization.
      </div>
    </div>
  );
};
