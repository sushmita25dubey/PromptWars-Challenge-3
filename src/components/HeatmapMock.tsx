import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, Info, Layers, RefreshCw } from 'lucide-react';
import { useVoiceGuidance } from './VoiceGuidance';

interface HeatmapRegion {
  id: string;
  name: string;
  cx: number;
  cy: number;
  carbonDensity: 'Low' | 'Medium' | 'High' | 'Critical';
  color: string;
  primaryEmissions: string;
  initiatives: string[];
}

export const HeatmapMock: React.FC = () => {
  const { speak } = useVoiceGuidance();
  const [activeFilter, setActiveFilter] = useState<'transport' | 'industry' | 'residential'>('transport');
  const [selectedRegion, setSelectedRegion] = useState<string>('na');

  const filterLabels = {
    transport: 'Transportation Density',
    industry: 'Industrial Carbon Output',
    residential: 'Residential Power Grid'
  };

  const getRegions = (filter: string): HeatmapRegion[] => [
    {
      id: 'na',
      name: 'North America',
      cx: 120,
      cy: 110,
      carbonDensity: filter === 'transport' ? 'Critical' : filter === 'residential' ? 'High' : 'High',
      color: filter === 'transport' ? '#f87171' : '#facc15',
      primaryEmissions: filter === 'transport' ? 'Gasoline SUVs and heavy logistics freight' : 'Heating, HVAC and high grid intensity',
      initiatives: ['Transition freight to rail', 'Incentivize heat pumps', 'Upgrade grid grids to solar']
    },
    {
      id: 'sa',
      name: 'South America',
      cx: 180,
      cy: 220,
      carbonDensity: 'Low',
      color: '#4ade80',
      primaryEmissions: 'Land clearing and older diesel public vehicles',
      initiatives: ['Reforestation buffer zones', 'Bio-diesel transit programs']
    },
    {
      id: 'eu',
      name: 'Europe',
      cx: 280,
      cy: 90,
      carbonDensity: filter === 'residential' ? 'Medium' : 'Medium',
      color: '#facc15',
      primaryEmissions: 'Heavy manufacturing emissions and old building heating',
      initiatives: ['Zero-emission industrial clusters', 'High-speed rail connections']
    },
    {
      id: 'as',
      name: 'East & South Asia',
      cx: 390,
      cy: 130,
      carbonDensity: filter === 'industry' ? 'Critical' : 'High',
      color: filter === 'industry' ? '#f87171' : '#facc15',
      primaryEmissions: 'Coal power generation and heavy metallurgical complexes',
      initiatives: ['Decommission older coal grids', 'Accelerate EV motorcycle programs']
    },
    {
      id: 'af',
      name: 'Africa',
      cx: 290,
      cy: 190,
      carbonDensity: 'Low',
      color: '#4ade80',
      primaryEmissions: 'Off-grid generators and agricultural cooking fires',
      initiatives: ['Microgrid solar integration', 'Clean biomass cookstoves']
    },
    {
      id: 'oc',
      name: 'Oceania',
      cx: 440,
      cy: 230,
      carbonDensity: 'Medium',
      color: '#facc15',
      primaryEmissions: 'Grid reliance on gas and high agriculture footprint',
      initiatives: ['Install utility battery storage', 'Methane reduction feed supplements']
    }
  ];

  const regions = getRegions(activeFilter);
  const activeRegion = regions.find(r => r.id === selectedRegion) || regions[0];

  const handleFilterChange = (filter: 'transport' | 'industry' | 'residential') => {
    setActiveFilter(filter);
    speak(`Filtered heat map by ${filterLabels[filter]}`);
  };

  const handleSelectRegion = (region: HeatmapRegion) => {
    setSelectedRegion(region.id);
    speak(`${region.name} selected. Carbon density is ${region.carbonDensity}. Primary source is ${region.primaryEmissions}.`);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-eco-900/40 flex flex-col xl:flex-row gap-6">
      
      {/* Map Graphic Panel */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              🌍 Global Eco Impact Heatmap
            </h3>
            <p className="text-xs text-slate-400">View carbon intensity hotspots across global grids.</p>
          </div>
          
          {/* Filters */}
          <div className="flex bg-dark-950 p-1 rounded-xl border border-slate-800/80">
            {(['transport', 'industry', 'residential'] as const).map(f => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeFilter === f 
                    ? 'bg-eco-600/20 text-white border border-eco-500/20' 
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Map Vector Art Box */}
        <div className="bg-dark-950/80 border border-slate-800/60 rounded-2xl p-4 h-64 relative overflow-hidden flex items-center justify-center">
          
          {/* Abstract SVG Continents and hot zones */}
          <svg className="w-full h-full text-slate-800" viewBox="0 0 500 300">
            {/* World Grid Dotted Map */}
            <defs>
              <pattern id="dot-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid)" />

            {/* Custom SVG Path Continent Emulations */}
            {/* Americas */}
            <path d="M 60 40 L 160 50 L 170 120 L 120 140 L 140 180 L 190 260 L 170 280 L 150 220 L 120 190 Z" fill="#1b2e1b" opacity="0.4" stroke="#0f1f0f" strokeWidth="1" />
            {/* Eurasia / Africa */}
            <path d="M 230 40 L 320 30 L 450 40 L 460 110 L 400 160 L 350 140 L 300 240 L 260 210 L 250 160 L 200 120 Z" fill="#1b2e1b" opacity="0.4" stroke="#0f1f0f" strokeWidth="1" />
            {/* Australia */}
            <path d="M 410 200 L 460 210 L 450 250 L 400 240 Z" fill="#1b2e1b" opacity="0.4" stroke="#0f1f0f" strokeWidth="1" />

            {/* Heatmap Ring Highlights */}
            {regions.map(r => (
              <g 
                key={r.id}
                className="cursor-pointer transition-all duration-300 hover:scale-110 origin-center"
                transform={`translate(${r.cx}, ${r.cy})`}
                onClick={() => handleSelectRegion(r)}
              >
                {/* Glowing Radar Rings */}
                <circle 
                  r={r.carbonDensity === 'Critical' ? 22 : r.carbonDensity === 'High' ? 18 : 14} 
                  fill={r.color} 
                  opacity="0.18" 
                  className={r.carbonDensity === 'Critical' || r.carbonDensity === 'High' ? 'animate-ping' : ''}
                />
                <circle 
                  r={r.carbonDensity === 'Critical' ? 12 : r.carbonDensity === 'High' ? 9 : 6} 
                  fill={r.color} 
                  stroke="#000" 
                  strokeWidth="1.5"
                  className={selectedRegion === r.id ? 'stroke-white' : 'stroke-black'}
                />
              </g>
            ))}
          </svg>

          {/* HUD Overlay Map Info */}
          <div className="absolute bottom-3 left-3 bg-dark-900/95 border border-slate-800/80 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-eco-400" /> Layer: {filterLabels[activeFilter]}
          </div>
        </div>
      </div>

      {/* Region Analytics Sidebar */}
      <div className="w-full xl:w-80 bg-dark-950/40 border border-eco-900/30 rounded-2xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-bold text-white">{activeRegion.name} Data</h4>
            <span 
              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                activeRegion.carbonDensity === 'Critical' 
                  ? 'bg-red-950/40 border-red-700/40 text-red-400 animate-pulse' 
                  : activeRegion.carbonDensity === 'High'
                    ? 'bg-amber-950/45 border-amber-800/40 text-amber-400'
                    : 'bg-emerald-950/45 border-emerald-800/40 text-emerald-400'
              }`}
            >
              {activeRegion.carbonDensity} Carbon
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Primary Output Source</span>
            <p className="text-xs text-slate-350 leading-relaxed font-medium">
              {activeRegion.primaryEmissions}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Reduction Initiatives</span>
            <ul className="space-y-2">
              {activeRegion.initiatives.map((init, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-eco-400 shrink-0" />
                  <span>{init}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-900 flex items-center gap-2 text-[10px] text-slate-500 leading-normal font-semibold">
          <Info className="w-4 h-4 text-slate-400 shrink-0" /> Click mapping markers to inspect local details.
        </div>
      </div>
    </div>
  );
};
