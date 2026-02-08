
import React, { useState } from 'react';
import { Headphones, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: { name: string; email: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const simulateLogin = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin({
        name: 'Guest User',
        email: 'guest@example.com'
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="p-8 pb-4 text-center">
            <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white mb-6 shadow-lg shadow-indigo-200">
              <Headphones size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              AudioTranscribe <span className="text-indigo-600">Pro</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Enterprise-grade diarization & transcription
            </p>
          </div>

          <div className="px-8 pb-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="mt-1 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Secure Backend</h4>
                  <p className="text-xs text-slate-500">Your data is processed in a protected environment with encrypted transit.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="mt-1 p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Neural Diarization</h4>
                  <p className="text-xs text-slate-500">Industry-leading multi-speaker identification powered by Gemini Flash.</p>
                </div>
              </div>
            </div>

            <button
              onClick={simulateLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-[0.98] group disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Get Started for Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-[1px] bg-slate-100"></div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Enterprise Ready</span>
              <div className="flex-1 h-[1px] bg-slate-100"></div>
            </div>

            <p className="text-center text-[10px] text-slate-400">
              By continuing, you agree to our Terms of Service and Privacy Policy. All audio is processed according to data safety standards.
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-500 text-sm flex items-center justify-center gap-1.5">
          <Globe size={14} />
          Available in 40+ languages
        </p>
      </div>
    </div>
  );
};
