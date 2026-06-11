import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './views/Dashboard';
import { Assessment } from './views/Assessment';
import { ActionPlan } from './views/ActionPlan';
import { AICoach } from './views/AICoach';
import { MappingView } from './views/MappingView';
import { LearningHub } from './components/LearningHub';
import { TestRunnerView } from './views/TestRunnerView';
import { VoiceProvider } from './components/VoiceGuidance';
import { getProfile, saveProfile } from './services/db';
import { UserProfile } from './types';
import { LayoutDashboard, Leaf, Map, Bot, Menu } from 'lucide-react';

// Error Boundary Mock
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center text-slate-100">
          <div className="max-w-md p-6 bg-dark-900 border border-red-900/50 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
            <p className="text-xs text-slate-400">The application encountered an unexpected runtime error. Your local profile remains safe.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-eco-600 hover:bg-eco-500 text-dark-950 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainApp() {
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handlePanelChange = (e: Event) => {
      const active = (e as CustomEvent).detail;
      setNotifOpen(active === 'notifications');
    };
    window.addEventListener('ecotracker_panel_change', handlePanelChange);
    return () => window.removeEventListener('ecotracker_panel_change', handlePanelChange);
  }, []);
  const [accessibilitySettings, setAccessibilitySettings] = useState(() => {
    const data = localStorage.getItem('ecotracker_accessibility_settings');
    return data ? JSON.parse(data) : {
      highContrast: false,
      dyslexiaFriendly: false,
      largeText: false,
    };
  });

  // Sync profile update events across views
  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfile(getProfile());
    };
    window.addEventListener('ecotracker_profile_update', handleProfileUpdate);
    return () => {
      window.removeEventListener('ecotracker_profile_update', handleProfileUpdate);
    };
  }, []);

  // Write accessibility settings to local storage and document class
  useEffect(() => {
    localStorage.setItem('ecotracker_accessibility_settings', JSON.stringify(accessibilitySettings));
    
    const root = document.documentElement;
    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (accessibilitySettings.dyslexiaFriendly) {
      root.classList.add('dyslexia-friendly');
    } else {
      root.classList.remove('dyslexia-friendly');
    }

    if (accessibilitySettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
  }, [accessibilitySettings]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + C: Toggle Contrast
      if (e.altKey && e.key.toLowerCase() === 'c') {
        setAccessibilitySettings((prev: any) => ({ ...prev, highContrast: !prev.highContrast }));
      }
      // Alt + D: Toggle Dyslexia Font
      if (e.altKey && e.key.toLowerCase() === 'd') {
        setAccessibilitySettings((prev: any) => ({ ...prev, dyslexiaFriendly: !prev.dyslexiaFriendly }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-950 text-slate-100 font-sans flex-col md:flex-row relative">
      
      {/* Sidebar Overlay Backdrop (Tablet/Mobile) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-45 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed lg:relative top-0 left-0 h-screen z-50 lg:z-auto transition-transform duration-300 lg:transition-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          userLevel={profile.level} 
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header metrics */}
        <Header 
          profile={profile}
          setProfile={setProfile}
          accessibilitySettings={accessibilitySettings}
          setAccessibilitySettings={setAccessibilitySettings}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        {/* Primary Page Workspaces */}
        <main 
          className={`flex-1 overflow-y-auto p-8 focus:outline-none pb-24 md:pb-8 transition-all duration-300 ${
            notifOpen ? 'md:pr-[352px] lg:pr-[352px]' : ''
          }`}
          tabIndex={0}
          aria-label="Main content area"
        >
          <ErrorBoundary>
            {currentTab === 'dashboard' && (
              <Dashboard 
                profile={profile} 
                setProfile={setProfile} 
                setCurrentTab={setCurrentTab} 
              />
            )}
            
            {currentTab === 'assessment' && (
              <Assessment 
                profile={profile} 
                setProfile={setProfile} 
                setCurrentTab={setCurrentTab} 
              />
            )}
            
            {currentTab === 'actions' && (
              <ActionPlan 
                profile={profile} 
                setProfile={setProfile} 
              />
            )}
            
            {currentTab === 'coach' && (
              <AICoach profile={profile} />
            )}
            
            {currentTab === 'mapping' && (
              <MappingView />
            )}

            {currentTab === 'learning' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Sustainability Learning Hub</h2>
                  <p className="text-xs text-slate-400">Complete mini modules on climate basics and claim XP by answering trivia.</p>
                </div>
                <LearningHub profile={profile} setProfile={setProfile} />
              </div>
            )}

            {currentTab === 'testing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">System Verification Hub</h2>
                  <p className="text-xs text-slate-400">Run unit, integration and accessibility standard tests directly in-browser.</p>
                </div>
                <TestRunnerView />
              </div>
            )}
          </ErrorBoundary>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden h-16 bg-dark-900 border-t border-eco-900/40 flex justify-around items-center shrink-0 z-40 px-2 select-none">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
            { id: 'assessment', name: 'Assess', icon: Leaf },
            { id: 'mapping', name: 'Transit', icon: Map },
            { id: 'coach', name: 'Coach', icon: Bot },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-2 gap-1 transition-all rounded-xl ${
                  isActive ? 'text-eco-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label={`Navigate to ${item.name}`}
              >
                <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-eco-950 border border-eco-800' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight">{item.name}</span>
              </button>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 px-2 gap-1 text-slate-400 hover:text-slate-200"
            aria-label="Open sidebar menu"
          >
            <div className="p-1.5 rounded-full">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <VoiceProvider>
      <MainApp />
    </VoiceProvider>
  );
}
