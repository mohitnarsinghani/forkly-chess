import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    // Use entered username or fallback to email prefix
    const finalUsername = username.trim() || email.split('@')[0];
    const userObj = {
      username: finalUsername,
      email: email.trim(),
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      puzzlesSolved: parseInt(localStorage.getItem('chess_puzzles_solved') || '0', 10)
    };

    localStorage.setItem('chess_user', JSON.stringify(userObj));
    onLoginSuccess(userObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#161512] border border-[#3e3b38] p-6 rounded-3xl shadow-2xl max-w-sm w-full relative animate-in fade-in zoom-in duration-200 select-none font-['Nunito',sans-serif]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-2xl mx-auto mb-2.5 shadow text-white">
            ♟️
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {isSignUp ? 'Create Forkly Account' : 'Log In to Forkly'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-bold">
            Enter your custom username and credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Custom Username Input Field */}
          <div>
            <label className="text-xs font-black text-gray-300 block mb-1">
              Username <span className="text-[#81b64c]">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Grandmaster77"
                className="w-full bg-[#262421] border border-[#3e3b38] text-white text-xs rounded-full pl-10 pr-4 py-2.5 outline-none focus:border-[#81b64c] transition font-bold"
              />
            </div>
          </div>

          {/* Email Address Input Field */}
          <div>
            <label className="text-xs font-black text-gray-300 block mb-1">
              Email Address <span className="text-[#81b64c]">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#262421] border border-[#3e3b38] text-white text-xs rounded-full pl-10 pr-4 py-2.5 outline-none focus:border-[#81b64c] transition font-bold"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div>
            <label className="text-xs font-black text-gray-300 block mb-1">
              Password <span className="text-[#81b64c]">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#262421] border border-[#3e3b38] text-white text-xs rounded-full pl-10 pr-4 py-2.5 outline-none focus:border-[#81b64c] transition font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-3 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black rounded-full text-xs uppercase border-b-4 border-[#3f5c20] shadow-lg tracking-wider transition-all active:scale-95"
          >
            {isSignUp ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-t border-[#262421]">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-extrabold text-[#81b64c] hover:underline"
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
