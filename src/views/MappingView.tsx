import React, { useState } from 'react';
import { Map, Layers, Navigation } from 'lucide-react';
import { MapsMock } from '../components/MapsMock';
import { HeatmapMock } from '../components/HeatmapMock';
import { useVoiceGuidance } from '../components/VoiceGuidance';

export const MappingView: React.FC = () => {
  const { speak } = useVoiceGuidance();
  const [activeSubTab, setActiveSubTab] = useState<'routes' | 'heatmap'>('routes');

  const handleSubTabChange = (tab: 'routes' | 'heatmap') => {
    setActiveSubTab(tab);
    speak(tab === 'routes' 
      ? "Switched to transit routes simulator" 
      : "Switched to eco emission heat map"
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-eco-400" /> Google Maps & Heatmap Grid
          </h2>
          <p className="text-xs text-slate-400">Map custom travel commutes or review regional industrial emissions.</p>
        </div>

        {/* Subtabs */}
        <div className="flex bg-dark-950 p-1.5 rounded-2xl border border-slate-800/80 shrink-0">
          <button
            onClick={() => handleSubTabChange('routes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'routes' 
                ? 'bg-eco-600/20 text-white border border-eco-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" /> Commute Simulator
          </button>
          
          <button
            onClick={() => handleSubTabChange('heatmap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'heatmap' 
                ? 'bg-eco-600/20 text-white border border-eco-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Eco Heatmap
          </button>
        </div>
      </div>

      {/* Conditional Rendering */}
      {activeSubTab === 'routes' ? <MapsMock /> : <HeatmapMock />}
      
    </div>
  );
};
