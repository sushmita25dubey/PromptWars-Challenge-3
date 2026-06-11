import React from 'react';
import { 
  LayoutDashboard, 
  Leaf, 
  CheckSquare, 
  Bot, 
  Map, 
  GraduationCap, 
  Settings, 
  TestTube,
  Sparkles,
  X
} from 'lucide-react';
import { useVoiceGuidance } from './VoiceGuidance';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userLevel: number;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, userLevel, onClose }) => {
  const { speak } = useVoiceGuidance();
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, desc: 'View carbon analytics and trends' },
    { id: 'assessment', name: 'AI Assessment', icon: Leaf, desc: 'Calculate carbon footprint score' },
    { id: 'actions', name: 'Eco Action Plan', icon: CheckSquare, desc: 'View tasks and active challenges' },
    { id: 'coach', name: 'AI Carbon Coach', icon: Bot, desc: 'Ask Gemini sustainability advice' },
    { id: 'mapping', name: 'Eco Transit & Heatmap', icon: Map, desc: 'Google Maps travel routes and impact hot zones' },
    { id: 'learning', name: 'Learning Hub', icon: GraduationCap, desc: 'Read eco cards and complete quizzes' },
    { id: 'testing', name: 'Validation Hub', icon: TestTube, desc: 'Run automated tests and system check' },
  ];

  const handleTabChange = (tabId: string, name: string) => {
    setCurrentTab(tabId);
    speak(`Navigated to ${name} page`);
    onClose?.();
  };

  return (
    <aside 
      className="w-72 bg-dark-900 border-r border-eco-900/40 p-6 flex flex-col justify-between shrink-0 glass-panel"
      aria-label="Sidebar Navigation"
    >
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between gap-3 mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-eco-900/60 border border-eco-500/30 rounded-xl">
              <Leaf className="w-8 h-8 text-eco-400 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                EcoTracker <span className="text-eco-400 font-mono text-xs bg-eco-950 border border-eco-800/80 px-1.5 py-0.5 rounded">AI</span>
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">PromptWars Champion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl bg-dark-950/60 border border-eco-900/30 text-slate-400 hover:text-slate-200"
            aria-label="Close sidebar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Rank Indicator */}
        <div className="mb-6 p-4 rounded-xl bg-dark-950/60 border border-eco-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-eco-600 to-emerald-400 flex items-center justify-center font-bold text-dark-950 text-lg shadow-inner">
            {userLevel}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Eco Warrior Rank</div>
            <div className="text-sm font-bold text-white flex items-center gap-1">
              Level {userLevel} <Sparkles className="w-3.5 h-3.5 text-eco-400" />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" aria-label="Main navigation links">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id, item.name)}
                onMouseEnter={() => speak(item.desc)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none ${
                  isActive 
                    ? 'bg-eco-600/20 text-eco-300 border-l-4 border-eco-400 shadow-md shadow-eco-950/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.name}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-eco-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Powered by Google Section */}
      <div className="pt-4 border-t border-eco-900/30">
        <div className="p-3.5 bg-dark-950/40 border border-eco-900/20 rounded-xl text-center">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Powered by Google
          </div>
          <div className="flex justify-center items-center gap-2">
            <span className="text-[11px] font-bold text-google-blue font-sans">Gemini AI</span>
            <span className="text-slate-600 text-[10px]">•</span>
            <span className="text-[11px] font-bold text-google-red font-sans">Maps</span>
            <span className="text-slate-600 text-[10px]">•</span>
            <span className="text-[11px] font-bold text-google-yellow font-sans">Firebase</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
