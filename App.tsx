
import React, { useState, useEffect } from 'react';
import { TranscriptionApp } from './components/TranscriptionApp';
import { LoginView } from './components/LoginView';
import { Headphones, Info, LogOut, Coins, PlusCircle } from 'lucide-react';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('audio_transcribe_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: { name: string; email: string }) => {
    const newUser: User = { ...userData, credits: 60 }; // Give 60 free minutes for new users
    localStorage.setItem('audio_transcribe_user', JSON.stringify(newUser));
    localStorage.setItem('audio_transcribe_token', 'mock_jwt_token_123');
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('audio_transcribe_user');
    localStorage.removeItem('audio_transcribe_token');
    setUser(null);
  };

  const addCredits = () => {
    if (!user) return;
    // Simulate Stripe Checkout Success
    const updatedUser = { ...user, credits: user.credits + 500 };
    localStorage.setItem('audio_transcribe_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert("Payment Successful! 500 Minutes added to your balance.");
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-700">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Headphones size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
              AudioTranscribe <span className="text-indigo-600">Pro</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Credit Balance */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full group cursor-default">
              <Coins size={16} className="text-amber-600 group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold text-amber-900">{user.credits}m remaining</span>
              <button 
                onClick={addCredits}
                className="ml-1 text-amber-600 hover:text-amber-700" 
                title="Add Credits"
              >
                <PlusCircle size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
              <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-700 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <TranscriptionApp userCredits={user.credits} />
      </main>

      <footer className="border-t border-slate-200 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            Secure Billing via Stripe • {user.email}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
