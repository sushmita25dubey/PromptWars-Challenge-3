import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, 
  Flame, 
  Settings, 
  KeyRound, 
  Volume2, 
  VolumeX, 
  Accessibility, 
  Eye, 
  Type,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Menu,
  Award,
  LogOut,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getNotifications, 
  markNotificationsAsRead, 
  clearNotifications, 
  setApiKey, 
  resetProfile 
} from '../services/db';
import { useVoiceGuidance } from './VoiceGuidance';
import { NotificationMsg, UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  accessibilitySettings: {
    highContrast: boolean;
    dyslexiaFriendly: boolean;
    largeText: boolean;
  };
  setAccessibilitySettings: React.Dispatch<React.SetStateAction<{
    highContrast: boolean;
    dyslexiaFriendly: boolean;
    largeText: boolean;
  }>>;
  onToggleSidebar?: () => void;
}

const ALL_BADGES = [
  { id: 'eco_pioneer', name: 'Eco Pioneer', icon: '🌱', desc: 'Starting badge' },
  { id: 'water_guard', name: 'Water Guard', icon: '💧', desc: 'Conserves hot water' },
  { id: 'green_commuter', name: 'Green Commuter', icon: '🚲', desc: '7 days of transit' },
  { id: 'waste_warrior', name: 'Waste Warrior', icon: '♻️', desc: '30 days zero-waste' },
  { id: 'veggie_hero', name: 'Veggie Hero', icon: '🥗', desc: '1 month plant-based' },
];

export const Header: React.FC<HeaderProps> = ({ 
  profile, 
  setProfile, 
  accessibilitySettings, 
  setAccessibilitySettings,
  onToggleSidebar
}) => {
  const { enabled: voiceEnabled, setEnabled: setVoiceEnabled, speak } = useVoiceGuidance();
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);
  const [activePanel, setActivePanel] = useState<'accessibility' | 'notifications' | 'profile' | 'settings' | null>(null);
  
  // Dispatch activePanel changes for layout content shifting
  useEffect(() => {
    const event = new CustomEvent('ecotracker_panel_change', { detail: activePanel });
    window.dispatchEvent(event);
  }, [activePanel]);

  const [tempApiKey, setTempApiKey] = useState(profile.customApiKey || '');
  const [showApiKeySuccess, setShowApiKeySuccess] = useState(false);
  
  const [profileName, setProfileName] = useState(profile.displayName);
  const [showProfileNameSuccess, setShowProfileNameSuccess] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsReport, setDiagnosticsReport] = useState<string | null>(null);

  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [profileTriggerRect, setProfileTriggerRect] = useState<DOMRect | null>(null);

  const accessibilityPanelRef = useRef<HTMLDivElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const profilePanelRef = useRef<HTMLDivElement>(null);

  const accessibilityToggleRef = useRef<HTMLButtonElement>(null);
  const notifToggleRef = useRef<HTMLButtonElement>(null);
  const settingsToggleRef = useRef<HTMLButtonElement>(null);
  const profileToggleRef = useRef<HTMLButtonElement>(null);

  // Sync notifications on mount/updates
  useEffect(() => {
    setNotifications(getNotifications());
    
    const handleNotifUpdate = () => {
      setNotifications(getNotifications());
    };
    window.addEventListener('ecotracker_notifications_update', handleNotifUpdate);
    return () => {
      window.removeEventListener('ecotracker_notifications_update', handleNotifUpdate);
    };
  }, []);

  // Sync state if profile updates from outside
  useEffect(() => {
    setProfileName(profile.displayName);
    setTempApiKey(profile.customApiKey || '');
  }, [profile.displayName, profile.customApiKey]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulated loading state for notifications drawer
  useEffect(() => {
    if (activePanel === 'notifications') {
      setLoadingNotifs(true);
      const timer = setTimeout(() => {
        setLoadingNotifs(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [activePanel]);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!activePanel) return;

      const target = e.target as Node;
      
      let activeRef = null;
      let toggleRef = null;
      
      if (activePanel === 'accessibility') {
        activeRef = accessibilityPanelRef;
        toggleRef = accessibilityToggleRef;
      } else if (activePanel === 'notifications') {
        activeRef = notifPanelRef;
        toggleRef = notifToggleRef;
      } else if (activePanel === 'settings') {
        activeRef = settingsPanelRef;
        toggleRef = settingsToggleRef;
      } else if (activePanel === 'profile') {
        activeRef = profilePanelRef;
        toggleRef = profileToggleRef;
      }

      if (
        activeRef?.current && 
        !activeRef.current.contains(target) && 
        !toggleRef?.current?.contains(target)
      ) {
        setActivePanel(null);
        speak(`Closed ${activePanel} panel`);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePanel, speak]);

  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activePanel) {
        const panel = activePanel;
        setActivePanel(null);
        speak(`Closed ${panel}`);

        if (panel === 'accessibility') accessibilityToggleRef.current?.focus();
        else if (panel === 'notifications') notifToggleRef.current?.focus();
        else if (panel === 'settings') settingsToggleRef.current?.focus();
        else if (panel === 'profile') profileToggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePanel, speak]);

  // Focus trapping logic for modals/drawers
  useEffect(() => {
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !activePanel) return;

      let activeRef = null;
      if (activePanel === 'accessibility') activeRef = accessibilityPanelRef;
      else if (activePanel === 'notifications') activeRef = notifPanelRef;
      else if (activePanel === 'settings') activeRef = settingsPanelRef;
      else if (activePanel === 'profile') activeRef = profilePanelRef;

      if (!activeRef || !activeRef.current) return;

      const focusableSelectors = 'button, [href], input, select, textarea, [tabIndex]:not([tabIndex="-1"])';
      const focusables = Array.from(activeRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (document.activeElement !== activeRef.current && !activeRef.current.contains(document.activeElement)) {
        first.focus();
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === activeRef.current) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleFocusTrap);
    return () => window.removeEventListener('keydown', handleFocusTrap);
  }, [activePanel]);

  // Focus panel on open
  useEffect(() => {
    if (activePanel) {
      setTimeout(() => {
        if (activePanel === 'accessibility') accessibilityPanelRef.current?.focus();
        else if (activePanel === 'notifications') notifPanelRef.current?.focus();
        else if (activePanel === 'settings') settingsPanelRef.current?.focus();
        else if (activePanel === 'profile') profilePanelRef.current?.focus();
      }, 50);
    }
  }, [activePanel]);

  // Anchor profile trigger rect
  const updateProfileTriggerRect = () => {
    if (profileToggleRef.current) {
      setProfileTriggerRect(profileToggleRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    if (activePanel === 'profile') {
      updateProfileTriggerRect();
      window.addEventListener('resize', updateProfileTriggerRect);
      window.addEventListener('scroll', updateProfileTriggerRect);
    }
    return () => {
      window.removeEventListener('resize', updateProfileTriggerRect);
      window.removeEventListener('scroll', updateProfileTriggerRect);
    };
  }, [activePanel]);

  const handleToggleAccessibility = () => {
    if (activePanel === 'accessibility') {
      setActivePanel(null);
      speak("Closed Accessibility Centre");
      accessibilityToggleRef.current?.focus();
    } else {
      setActivePanel('accessibility');
      speak("Opened Accessibility Centre. Focus moved to accessibility controls.");
    }
  };

  const handleToggleNotifs = () => {
    if (activePanel === 'notifications') {
      setActivePanel(null);
      speak("Closed Notifications panel");
      notifToggleRef.current?.focus();
    } else {
      setActivePanel('notifications');
      speak("Opened Notifications panel. Focus moved to notifications list.");
      if (unreadCount > 0) {
        markNotificationsAsRead();
        setNotifications(getNotifications());
      }
    }
  };

  const handleToggleProfile = () => {
    if (activePanel === 'profile') {
      setActivePanel(null);
      speak("Closed Profile Menu");
      profileToggleRef.current?.focus();
    } else {
      setActivePanel('profile');
      speak("Opened Profile Menu. Focus moved to profile settings.");
    }
  };

  const handleToggleSettings = () => {
    if (activePanel === 'settings') {
      setActivePanel(null);
      speak("Closed Settings menu");
      settingsToggleRef.current?.focus();
    } else {
      setActivePanel('settings');
      speak("Opened Settings menu. Focus moved to account settings.");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleContrast = () => {
    const next = !accessibilitySettings.highContrast;
    setAccessibilitySettings(prev => ({ ...prev, highContrast: next }));
    speak(next ? "High contrast mode enabled." : "High contrast mode disabled.");
  };

  const handleToggleDyslexia = () => {
    const next = !accessibilitySettings.dyslexiaFriendly;
    setAccessibilitySettings(prev => ({ ...prev, dyslexiaFriendly: next }));
    speak(next ? "Dyslexia friendly mode activated." : "Dyslexia friendly mode deactivated.");
  };

  const handleToggleLargeText = () => {
    const next = !accessibilitySettings.largeText;
    setAccessibilitySettings(prev => ({ ...prev, largeText: next }));
    speak(next ? "Large text mode enabled." : "Large text mode disabled.");
  };

  const handleToggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(tempApiKey);
    const updated = { ...profile, customApiKey: tempApiKey };
    setProfile(updated);
    setShowApiKeySuccess(true);
    setTimeout(() => setShowApiKeySuccess(false), 3000);
    speak("Gemini API key saved successfully.");
  };

  const handleSaveProfileName = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...profile, displayName: profileName };
    setProfile(updated);
    // Persist to DB
    localStorage.setItem('ecotracker_user_profile', JSON.stringify(updated));
    window.dispatchEvent(new Event('ecotracker_profile_update'));
    setShowProfileNameSuccess(true);
    setTimeout(() => setShowProfileNameSuccess(false), 3000);
    speak(`Display name updated to ${profileName}`);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your EcoTracker progress?")) {
      const reset = resetProfile();
      setProfile(reset);
      setActivePanel(null);
      speak("Account progress reset successfully.");
    }
  };

  const runDiagnostics = () => {
    setDiagnosticsRunning(true);
    speak("Running system diagnostics checker.");
    setTimeout(() => {
      setDiagnosticsRunning(false);
      setDiagnosticsReport("All 15 system checks passed successfully. System Health: 100%");
      speak("Diagnostics complete. System health is 100%.");
    }, 1200);
  };

  const handleLogout = () => {
    if (window.confirm("Simulate logout? This will sign you out of your current EcoTracker session.")) {
      setActivePanel(null);
      speak("Signed out of session.");
      window.location.reload();
    }
  };

  // XP Progress Calculations
  const xpNeeded = profile.level * 800;
  const xpProgressPct = Math.round((profile.xp / xpNeeded) * 100);

  // Motion variants
  const modalVariants = isMobile
    ? {
        initial: { y: '100%', opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 1 },
      }
    : {
        initial: { opacity: 0, scale: 0.95, y: 15 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 15 },
      };

  const drawerVariants = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  };

  const popoverVariants = isMobile
    ? {
        initial: { y: '100%', opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 1 },
      }
    : {
        initial: { opacity: 0, y: -10, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.95 },
      };

  const profileStyle: React.CSSProperties = (isDesktop || isTablet) && profileTriggerRect
    ? {
        position: 'fixed',
        top: `${profileTriggerRect.bottom + 8}px`,
        left: `${profileTriggerRect.right - 260}px`,
        width: '260px',
      }
    : {};

  return (
    <header 
      className="relative z-40 h-20 bg-dark-900 border-b border-eco-900/40 px-6 sm:px-8 flex justify-between items-center glass-panel shrink-0 select-none"
      aria-label="Application Header"
      id="main-header"
    >
      {/* Search / Context details */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Hamburger Toggle (Tablet & Mobile only) */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl border border-eco-900/30 text-slate-400 hover:text-slate-200 bg-dark-950/60 transition-all focus:outline-none"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Green Streak Tracker */}
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-950/40 border border-orange-700/30 text-orange-400 cursor-help"
          title="Eco-friendly activity streak in days"
          onMouseEnter={() => speak(`Your green streak is ${profile.streakDays} days`)}
        >
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 fill-orange-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold">{profile.streakDays}d Streak</span>
        </div>

        {/* XP Level Progress Indicator */}
        <div className="hidden md:flex items-center gap-3 w-48 lg:w-64">
          <span className="text-xs font-bold text-slate-400 font-mono">XP</span>
          <div className="flex-1 bg-dark-950 rounded-full h-3 border border-eco-955/20 p-0.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-eco-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${xpProgressPct}%` }}
            />
          </div>
          <span className="text-[10px] lg:text-xs font-semibold text-slate-400 whitespace-nowrap">
            {profile.xp}/{xpNeeded}
          </span>
        </div>
      </div>

      {/* Header controls (Voice, Accessibility, Notifications, Settings, Profile) */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Toggle Voice Quickly */}
        <button
          onClick={handleToggleVoice}
          title={voiceEnabled ? "Turn off speech guidance" : "Turn on speech guidance"}
          className={`p-2.5 rounded-xl border transition-all focus:outline-none ${
            voiceEnabled 
              ? 'bg-eco-600/20 border-eco-400 text-eco-400 shadow-md shadow-eco-950/20' 
              : 'bg-dark-950/60 border-eco-900/30 text-slate-400 hover:text-slate-200'
          }`}
          aria-label={voiceEnabled ? "Mute voice guidance" : "Enable voice guidance"}
        >
          {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Accessibility Button */}
        <button
          ref={accessibilityToggleRef}
          onClick={handleToggleAccessibility}
          className={`p-2.5 rounded-xl border transition-all focus:outline-none ${
            activePanel === 'accessibility' 
              ? 'bg-dark-800 border-eco-500 text-eco-400' 
              : 'bg-dark-950/60 border-eco-900/30 text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Accessibility settings"
          aria-haspopup="dialog"
          aria-expanded={activePanel === 'accessibility'}
        >
          <Accessibility className="w-5 h-5" />
        </button>

        {/* Notifications Button */}
        <button
          ref={notifToggleRef}
          onClick={handleToggleNotifs}
          className={`p-2.5 rounded-xl border relative transition-all focus:outline-none ${
            activePanel === 'notifications' 
              ? 'bg-dark-800 border-eco-500 text-eco-400' 
              : 'bg-dark-950/60 border-eco-900/30 text-slate-400 hover:text-slate-200'
          }`}
          aria-label="System notifications"
          aria-haspopup="dialog"
          aria-expanded={activePanel === 'notifications'}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span 
              className="absolute top-1 right-1 w-4 h-4 bg-google-red rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-md border border-dark-955"
              aria-hidden="true"
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          ref={settingsToggleRef}
          onClick={handleToggleSettings}
          className={`p-2.5 rounded-xl border transition-all focus:outline-none ${
            activePanel === 'settings' 
              ? 'bg-dark-800 border-eco-500 text-eco-400' 
              : 'bg-dark-950/60 border-eco-900/30 text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Application settings"
          aria-haspopup="dialog"
          aria-expanded={activePanel === 'settings'}
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Card / Icon button */}
        {/* Desktop Profile Card Toggler */}
        <button
          ref={profileToggleRef}
          onClick={handleToggleProfile}
          className={`hidden lg:flex items-center gap-3 pl-3 border-l border-eco-900/30 text-left transition-all hover:opacity-90 outline-none focus:outline-none rounded-xl py-1 px-1.5 ${
            activePanel === 'profile' ? 'bg-dark-800/60 border border-eco-800/40' : ''
          }`}
          aria-label="User profile settings menu"
          aria-haspopup="dialog"
          aria-expanded={activePanel === 'profile'}
        >
          <div className="text-right">
            <div className="text-xs font-bold text-white leading-none">{profile.displayName}</div>
            <div className="text-[9px] text-emerald-400 font-bold mt-1 font-mono uppercase tracking-wider">Active Warrior</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-eco-950 border border-eco-500 flex items-center justify-center text-eco-400 shadow-inner">
            <User className="w-4.5 h-4.5 text-eco-400" />
          </div>
        </button>

        {/* Mobile/Tablet Profile Icon button Toggler */}
        <button
          onClick={handleToggleProfile}
          className={`lg:hidden p-2.5 rounded-xl border transition-all focus:outline-none ${
            activePanel === 'profile' 
              ? 'bg-dark-800 border-eco-500 text-eco-400' 
              : 'bg-dark-950/60 border-eco-900/30 text-slate-400 hover:text-slate-200'
          }`}
          aria-label="User profile settings menu"
          aria-haspopup="dialog"
          aria-expanded={activePanel === 'profile'}
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* PORTAL LAYER */}
      {createPortal(
        <AnimatePresence>
          {activePanel && (
            <>
              {/* Custom Scrim Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  const panel = activePanel;
                  setActivePanel(null);
                  speak(`Closed ${panel} panel`);
                }}
                className={`fixed bg-black/50 backdrop-blur-xs z-50 
                  ${activePanel === 'notifications' && !isMobile 
                    ? 'inset-x-0 bottom-0 top-20 bg-black/45' 
                    : 'inset-0 bg-black/80'}`}
              />

              {/* 1. Accessibility Center Modal */}
              {activePanel === 'accessibility' && (
                <motion.div
                  ref={accessibilityPanelRef}
                  tabIndex={-1}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="accessibility-modal-title"
                  variants={modalVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`fixed z-60 bg-dark-900 border border-eco-800/60 shadow-2xl text-slate-200 focus:outline-none p-6 flex flex-col justify-between
                    ${isMobile 
                      ? 'bottom-0 left-0 right-0 w-full rounded-t-3xl rounded-b-none border-x-0 border-b-0 max-h-[90vh] overflow-y-auto' 
                      : isTablet
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl w-[90vw]'
                        : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl w-[420px]'}`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-5 border-b border-eco-900/40 pb-3">
                      <h2 id="accessibility-modal-title" className="text-sm font-bold text-white flex items-center gap-2">
                        <Accessibility className="w-4 h-4 text-eco-400" /> Accessibility Centre
                      </h2>
                      <button
                        onClick={handleToggleAccessibility}
                        className="p-1.5 rounded-lg bg-dark-950/60 hover:bg-dark-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all focus:outline-none"
                        aria-label="Close Accessibility Centre"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {/* Contrast Toggle */}
                      <button
                        onClick={handleToggleContrast}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all focus:outline-none ${
                          accessibilitySettings.highContrast 
                            ? 'bg-eco-600/10 border-eco-500 text-eco-400' 
                            : 'border-slate-800 hover:bg-dark-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Eye className="w-4.5 h-4.5" />
                          <div>
                            <div className="text-xs font-bold">High Contrast</div>
                            <div className="text-[10px] text-slate-400">High contrast text overrides</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${accessibilitySettings.highContrast ? 'border-eco-400' : 'border-slate-600'}`}>
                          {accessibilitySettings.highContrast && <div className="w-2 h-2 rounded-full bg-eco-400" />}
                        </div>
                      </button>

                      {/* Dyslexia Friendly */}
                      <button
                        onClick={handleToggleDyslexia}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all focus:outline-none ${
                          accessibilitySettings.dyslexiaFriendly 
                            ? 'bg-eco-600/10 border-eco-500 text-eco-400' 
                            : 'border-slate-800 hover:bg-dark-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Type className="w-4.5 h-4.5" />
                          <div>
                            <div className="text-xs font-bold">Dyslexia Font</div>
                            <div className="text-[10px] text-slate-400">Alternative reader typeface</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${accessibilitySettings.dyslexiaFriendly ? 'border-eco-400' : 'border-slate-600'}`}>
                          {accessibilitySettings.dyslexiaFriendly && <div className="w-2 h-2 rounded-full bg-eco-400" />}
                        </div>
                      </button>

                      {/* Large Text */}
                      <button
                        onClick={handleToggleLargeText}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all focus:outline-none ${
                          accessibilitySettings.largeText 
                            ? 'bg-eco-600/10 border-eco-500 text-eco-400' 
                            : 'border-slate-800 hover:bg-dark-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Type className="w-4.5 h-4.5 font-extrabold" />
                          <div>
                            <div className="text-xs font-bold">Large Text Mode</div>
                            <div className="text-[10px] text-slate-400">Scales sizing up by 15%</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${accessibilitySettings.largeText ? 'border-eco-400' : 'border-slate-600'}`}>
                          {accessibilitySettings.largeText && <div className="w-2 h-2 rounded-full bg-eco-400" />}
                        </div>
                      </button>

                      {/* Voice Guidance Toggle */}
                      <button
                        onClick={handleToggleVoice}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all focus:outline-none ${
                          voiceEnabled 
                            ? 'bg-eco-600/10 border-eco-500 text-eco-400' 
                            : 'border-slate-800 hover:bg-dark-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {voiceEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
                          <div>
                            <div className="text-xs font-bold">Voice Guidance</div>
                            <div className="text-[10px] text-slate-400">Audio narration of layout events</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${voiceEnabled ? 'border-eco-400' : 'border-slate-600'}`}>
                          {voiceEnabled && <div className="w-2 h-2 rounded-full bg-eco-400" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Hotkey Info Footer */}
                  <div className="mt-5 border-t border-eco-900/40 pt-4 text-center">
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      Keyboard shortcuts: <kbd className="bg-dark-950 px-1 py-0.5 rounded text-[9px] text-eco-300 font-mono">Alt + C</kbd> high contrast, <kbd className="bg-dark-950 px-1 py-0.5 rounded text-[9px] text-eco-300 font-mono">Alt + D</kbd> dyslexia font. <kbd className="bg-dark-950 px-1 py-0.5 rounded text-[9px] text-eco-300 font-mono">Esc</kbd> closes modal.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 2. Settings Modal */}
              {activePanel === 'settings' && (
                <motion.div
                  ref={settingsPanelRef}
                  tabIndex={-1}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="settings-modal-title"
                  variants={modalVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`fixed z-60 bg-dark-900 border border-eco-800/60 shadow-2xl text-slate-200 focus:outline-none p-6 flex flex-col justify-between
                    ${isMobile 
                      ? 'bottom-0 left-0 right-0 w-full rounded-t-3xl rounded-b-none border-x-0 border-b-0 max-h-[90vh] overflow-y-auto' 
                      : isTablet
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl w-[90vw]'
                        : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl w-[420px]'}`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-5 border-b border-eco-900/40 pb-3">
                      <h2 id="settings-modal-title" className="text-sm font-bold text-white flex items-center gap-2">
                        <Settings className="w-4 h-4 text-eco-400 animate-spin-slow" /> Application Settings
                      </h2>
                      <button
                        onClick={handleToggleSettings}
                        className="p-1.5 rounded-lg bg-dark-950/60 hover:bg-dark-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all focus:outline-none"
                        aria-label="Close Settings modal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Gemini API Key configuration */}
                      <form onSubmit={handleSaveApiKey} className="space-y-2.5">
                        <label htmlFor="api-key-input" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-eco-400" /> Gemini API Credentials
                        </label>
                        <div className="relative">
                          <input
                            id="api-key-input"
                            type="password"
                            placeholder="AIzaSy... (Empty falls back to Local Coach)"
                            value={tempApiKey}
                            onChange={(e) => setTempApiKey(e.target.value)}
                            className="w-full bg-dark-950 border border-eco-900/40 rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-eco-500 font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-eco-600 hover:bg-eco-500 text-dark-950 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-eco-950/20 active:scale-[0.98] outline-none"
                        >
                          Save API Credentials
                        </button>
                        {showApiKeySuccess && (
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Credentials saved successfully.
                          </div>
                        )}
                      </form>

                      {/* Diagnostic Checker */}
                      <div className="border-t border-eco-900/40 pt-4 space-y-2.5">
                        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-eco-400" /> System Diagnostics
                        </h3>
                        <button
                          onClick={runDiagnostics}
                          disabled={diagnosticsRunning}
                          className="w-full bg-dark-950 hover:bg-dark-800 border border-slate-800 text-slate-300 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 outline-none disabled:opacity-50"
                        >
                          {diagnosticsRunning ? (
                            <div className="w-4 h-4 border-2 border-eco-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Run System Diagnostics"
                          )}
                        </button>
                        {diagnosticsReport && (
                          <div className="p-3 bg-dark-950/80 border border-eco-900/30 rounded-xl text-[10px] text-slate-300 font-semibold leading-relaxed">
                            {diagnosticsReport}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reset Account */}
                  <div className="mt-6 border-t border-slate-800 pt-4">
                    <button
                      onClick={handleReset}
                      className="w-full text-center py-2 text-[10px] text-red-400/80 hover:text-red-400 font-bold border border-red-900/30 rounded-xl hover:bg-red-950/20 transition-all focus:outline-none"
                    >
                      Reset Account Data (Clear Cache)
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 3. User Profile Popover */}
              {activePanel === 'profile' && (
                <motion.div
                  ref={profilePanelRef}
                  tabIndex={-1}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="profile-popover-title"
                  variants={popoverVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={profileStyle}
                  transition={{ duration: 0.18 }}
                  className={`fixed z-80 bg-dark-900 border border-eco-800/60 shadow-2xl text-slate-200 focus:outline-none p-5 flex flex-col justify-between
                    ${isMobile 
                      ? 'bottom-0 left-0 right-0 w-full rounded-t-3xl rounded-b-none border-x-0 border-b-0 max-h-[85vh] overflow-y-auto' 
                      : 'rounded-3xl'}`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-eco-900/40 pb-2">
                      <h2 id="profile-popover-title" className="text-xs font-bold text-white flex items-center gap-1.5">
                        <User className="w-4 h-4 text-eco-400" /> Profile Dashboard
                      </h2>
                      <button
                        onClick={handleToggleProfile}
                        className="p-1 rounded bg-dark-950/60 hover:bg-dark-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all focus:outline-none"
                        aria-label="Close Profile menu"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Level Details */}
                    <div className="p-3 bg-dark-950/60 border border-eco-900/40 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-eco-600 to-emerald-400 flex items-center justify-center font-bold text-dark-950 text-lg shadow-inner">
                        {profile.level}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Rank Title</div>
                        <div className="text-xs font-bold text-white flex items-center gap-1 uppercase tracking-wide">
                          Level {profile.level} Eco Warrior
                        </div>
                      </div>
                    </div>

                    {/* Edit Display Name */}
                    <form onSubmit={handleSaveProfileName} className="space-y-2">
                      <label htmlFor="profile-name-input" className="text-[10px] font-bold text-slate-400">Display Name</label>
                      <div className="flex gap-2">
                        <input
                          id="profile-name-input"
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="flex-1 bg-dark-950 border border-eco-900/40 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-eco-500"
                        />
                        <button
                          type="submit"
                          className="bg-eco-600 hover:bg-eco-500 text-dark-950 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-[0.96] outline-none"
                        >
                          Save
                        </button>
                      </div>
                      {showProfileNameSuccess && (
                        <span className="text-[8px] text-emerald-400 font-bold block text-center">Name updated.</span>
                      )}
                    </form>

                    {/* Unlocked Badges */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-eco-400" /> Unlock Achievements
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {ALL_BADGES.map((b) => {
                          const isUnlocked = profile.badges.includes(b.id);
                          return (
                            <div 
                              key={b.id} 
                              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                                isUnlocked 
                                  ? 'bg-eco-950/40 border-eco-500/30 text-white shadow-sm' 
                                  : 'bg-dark-950/20 border-slate-800 text-slate-600 saturate-50'
                              }`}
                              title={isUnlocked ? `${b.name}: ${b.desc}` : `${b.name} (Locked): ${b.desc}`}
                            >
                              <span className="text-base mb-1">{b.icon}</span>
                              <span className="text-[7px] font-bold truncate w-full">{b.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Simulated Log Out */}
                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-1.5 text-[10px] text-red-400/80 hover:text-red-400 font-bold hover:bg-red-950/20 transition-all py-1.5 rounded-xl border border-red-900/20 outline-none"
                    >
                      <LogOut className="w-3 h-3" /> Log Out Session
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 4. Notifications Slide Drawer */}
              {activePanel === 'notifications' && (
                <motion.div
                  ref={notifPanelRef}
                  tabIndex={-1}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="notifications-drawer-title"
                  variants={drawerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className={`fixed right-0 bg-dark-900 border-eco-800/60 shadow-2xl z-70 flex flex-col focus:outline-none
                    ${isMobile 
                      ? 'top-0 h-screen w-full border-none rounded-none' 
                      : 'top-20 h-[calc(100vh-5rem)] w-[320px] border-l'}`}
                >
                  {/* Drawer Header */}
                  <div className="px-5 py-4 bg-dark-950 border-b border-eco-900/40 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-eco-400" />
                      <span id="notifications-drawer-title" className="text-sm font-bold text-white">Notifications</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          clearNotifications();
                          setNotifications([]);
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-200 font-bold border border-slate-800 px-2 py-1.5 rounded-lg hover:bg-dark-800/40 transition-all mr-1"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={handleToggleNotifs}
                        className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all focus:outline-none"
                        aria-label="Close notifications drawer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Drawer List Content */}
                  <div className="flex-1 overflow-y-auto font-sans p-5 space-y-3 notif-scrollbar">
                    {loadingNotifs ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-[60px] px-3 py-2 rounded-xl border border-slate-850/40 bg-dark-950/20 animate-pulse flex items-center gap-2.5">
                            <div className="w-4 h-4 bg-slate-850 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2 min-w-0">
                              <div className="h-2 bg-slate-850 rounded w-3/4" />
                              <div className="h-1.5 bg-slate-850 rounded w-1/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-16 text-center text-xs text-slate-500 font-semibold">
                        No notifications yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            tabIndex={0}
                            onFocus={() => speak(`Notification: ${notif.message}`)}
                            className={`h-[60px] px-3 py-2 rounded-xl border flex items-center gap-2.5 transition-all select-none focus:outline-none focus:ring-1 focus:ring-eco-400 cursor-pointer ${
                              notif.read 
                                ? 'bg-transparent border-slate-800/60' 
                                : 'bg-eco-950/20 border-eco-800/30 shadow-sm'
                            }`}
                            title={notif.message}
                          >
                            <div className="shrink-0">
                              {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                              {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                              {notif.type === 'info' && <Accessibility className="w-4 h-4 text-eco-400" />}
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="text-[11px] text-slate-200 leading-snug font-semibold truncate">
                                {notif.message}
                              </p>
                              <span className="text-[8px] text-slate-500 font-bold block mt-0.5 font-mono">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {!notif.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-google-red shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};
