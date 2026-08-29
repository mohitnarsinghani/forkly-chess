import React, { useState, useEffect, useCallback } from 'react';
import { SplashScreen } from './components/Splash/SplashScreen';
import { AuthModal } from './components/Auth/AuthModal';
import { OnboardingModal } from './components/Onboarding/OnboardingModal';
import { HomeView } from './components/Views/HomeView';
import { PuzzlesMapView } from './components/Views/PuzzlesMapView';
import { CoachPlayView } from './components/Views/CoachPlayView';
import { GameReviewView } from './components/Views/GameReviewView';
import { AnalysisView } from './components/Views/AnalysisView';
import { ProfileView } from './components/Views/ProfileView';
import { FeaturesView } from './components/Views/FeaturesView';
import { PassPlayView } from './components/Views/PassPlayView';
import { BottomNav } from './components/Navigation/BottomNav';
import { Sidebar } from './components/Navigation/Sidebar';
import { Menu, X, Volume2, VolumeX, User, HelpCircle, Sparkles } from 'lucide-react';
import { audio } from './services/audioService';

export default function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'puzzlesMap', 'coach', 'review', 'analysis', 'profile', 'features'
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('chess_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    // Open First-Time Onboarding Modal if user has not completed onboarding
    const hasSeenOnboarding = localStorage.getItem('forkly_onboarding_seen');
    if (!hasSeenOnboarding) {
      setOnboardingOpen(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('chess_user');
    setUser(null);
    setActiveTab('home');
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <div className="min-h-screen bg-[#262421] text-white flex flex-col md:flex-row select-none font-['Nunito',sans-serif]">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          onOpenFeatures={() => setActiveTab('features')}
        />
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#161512] border-b border-[#262421] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-lg shadow font-black text-black">
            ♟️
          </div>
          <h1 className="font-black text-xl text-white tracking-tight">
            Fork<span className="text-[#81b64c]">ly</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('features')}
            className="flex items-center gap-1 bg-[#1c3614] border border-[#395e28] px-2.5 py-1 rounded-full text-xs font-black text-lime-400"
            title="Features & Guide"
          >
            <Sparkles size={14} />
            <span>Features</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className="p-1.5 rounded-lg bg-[#262421] text-white border border-[#3e3b38]"
          >
            <User size={18} />
          </button>
          <button
            onClick={() => {
              const newMute = !isMuted;
              setIsMuted(newMute);
              audio.muted = newMute;
              if (!newMute) audio.playMove();
            }}
            className="p-1.5 rounded-lg bg-[#262421] text-white border border-[#3e3b38]"
          >
            {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-[#81b64c]" />}
          </button>
        </div>
      </div>

      {/* Main Screen Content View */}
      <main className="flex-1 flex flex-col pb-20 md:pb-6 bg-[#262421] min-h-screen">
        <div className="flex-1">
          {activeTab === 'home' && (
            <HomeView
              onNavigate={setActiveTab}
              user={user}
              onOpenProfile={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'puzzlesMap' && (
            <PuzzlesMapView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'coach' && (
            <CoachPlayView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'review' && <GameReviewView onBack={() => setActiveTab('home')} />}
          {activeTab === 'analysis' && <AnalysisView />}
          {activeTab === 'passplay' && <PassPlayView onBack={() => setActiveTab('home')} />}

          {activeTab === 'features' && (
            <FeaturesView
              onNavigate={setActiveTab}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              user={user}
              onLogout={handleLogout}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Mobile 5-Tab Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* First-Time Onboarding Modal Dialog */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onNavigate={setActiveTab}
      />

      {/* Auth Modal Dialog */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
