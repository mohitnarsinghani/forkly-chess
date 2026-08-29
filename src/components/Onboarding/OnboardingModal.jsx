import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Trophy, Bot, Search, Puzzle, Play } from 'lucide-react';

export function OnboardingModal({ isOpen, onClose, onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-3xl shadow-lg text-white">
          ⏱️
        </div>
      ),
      badge: "Play Online",
      title: "Play Online & Time Controls",
      desc: "Challenge players worldwide with customizable blitz, bullet, or daily time controls (10 min, 5 min, 3 days)."
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-3xl shadow-lg text-white">
          🤖
        </div>
      ),
      badge: "AI Opponents",
      title: "Stockfish 18 & Personality Bots",
      desc: "Play against Stockfish 18 or 20+ personality bots organized into 5 skill tiers from Beginner to Grandmaster."
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-3xl shadow-lg text-white">
          🔍
        </div>
      ),
      badge: "Deep Analysis",
      title: "Position & FEN/PGN Analysis",
      desc: "Analyze any position or full game by uploading PGN/FEN files with live Stockfish engine evaluations."
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-3xl shadow-lg text-white">
          🧩
        </div>
      ),
      badge: "Tactics & Local Play",
      title: "Tactics Puzzles & Pass & Play",
      desc: "Solve 40,000+ tactical puzzles along a winding garden path, or play local matches with a friend on one device."
    }
  ];

  const handleFinish = () => {
    localStorage.setItem('forkly_onboarding_seen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-['Nunito',sans-serif]">
      <div className="relative w-full max-w-md bg-[#161512] border border-[#3e3b38] rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[440px] animate-in zoom-in-95 select-none">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 bg-[#1c3614] border border-[#395e28] px-3 py-1 rounded-full text-[11px] font-black text-lime-400">
            <Sparkles size={12} />
            <span>Welcome to Forkly</span>
          </div>

          <button
            onClick={handleFinish}
            className="text-xs font-black text-neutral-400 hover:text-white bg-[#262421] border border-[#3e3b38] px-3.5 py-1 rounded-full transition"
          >
            Skip
          </button>
        </div>

        {/* Slide Content */}
        <div className="my-6 text-center flex flex-col items-center space-y-4 z-10">
          <div className="transform transition-transform duration-300 hover:scale-105">
            {slides[currentSlide].icon}
          </div>

          <span className="text-xs font-black uppercase tracking-wider text-lime-400 bg-[#1c3614] border border-[#395e28] px-3 py-0.5 rounded-full">
            {slides[currentSlide].badge}
          </span>

          <h2 className="font-black text-2xl text-white tracking-tight leading-tight">
            {slides[currentSlide].title}
          </h2>

          <p className="text-xs text-neutral-400 font-bold leading-relaxed max-w-xs">
            {slides[currentSlide].desc}
          </p>
        </div>

        {/* Bottom Slide Indicators & Navigation Buttons */}
        <div className="space-y-4 z-10">
          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-8 bg-[#81b64c]' : 'w-2.5 bg-[#262421]'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                onClick={() => setCurrentSlide((prev) => prev - 1)}
                className="w-12 h-12 rounded-full bg-[#262421] border border-[#3e3b38] text-white flex items-center justify-center transition hover:bg-[#302e2b] shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {currentSlide < slides.length - 1 ? (
              <button
                onClick={() => setCurrentSlide((prev) => prev + 1)}
                className="flex-1 py-3.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black rounded-full text-sm uppercase border-b-4 border-[#3f5c20] shadow-lg tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>NEXT</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex-1 py-3.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black rounded-full text-base uppercase border-b-4 border-[#3f5c20] shadow-lg tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Play size={18} className="fill-white" />
                <span>GET STARTED</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
