import React, { useState } from 'react';
import { ShieldAlert, Globe, Thermometer, Droplets, Info } from 'lucide-react';
import { CarbonResult } from '../types';
import { useVoiceGuidance } from './VoiceGuidance';

interface EarthSimulatorProps {
  assessmentResult: CarbonResult | null;
}

export const EarthSimulator: React.FC<EarthSimulatorProps> = ({ assessmentResult }) => {
  const { speak } = useVoiceGuidance();
  const [selectedYear, setSelectedYear] = useState<2030 | 2040 | 2050>(2050);
  const [lifestyle, setLifestyle] = useState<'current' | 'improved'>('current');

  const annualEmissionsTons = assessmentResult 
    ? parseFloat((assessmentResult.totalAnnualEmissions / 1000).toFixed(1)) 
    : 8.5; // default 8.5 metric tons

  const calculateSimulationData = (year: number, isImproved: boolean) => {
    // Math model: Temperature increases, ice cover reduces.
    // If improved, projections flatten or cool. If current, projections escalate.
    const baseTons = isImproved ? 2.2 : annualEmissionsTons;
    
    // Scale coefficient based on lifestyle tonnage
    const impactCoeff = (baseTons - 3.0) / 10.0; // 3 tons is sustainable threshold

    let tempRise = 1.1; // base 2026 rise
    let iceCoverage = 75; // base 2026 cover %
    
    const yearsElapsed = year - 2026;

    if (isImproved) {
      tempRise += yearsElapsed * 0.012; // slow increase: +0.28C in 2050
      iceCoverage -= yearsElapsed * 0.15; // slow melt: 71% ice coverage
    } else {
      // Current lifestyle scaling
      tempRise += yearsElapsed * (0.02 + impactCoeff * 0.035);
      iceCoverage -= yearsElapsed * (0.35 + impactCoeff * 0.7);
    }

    tempRise = parseFloat(Math.max(0.8, tempRise).toFixed(2));
    iceCoverage = Math.max(5, Math.round(iceCoverage));

    // Calculate number of Earths needed ("One Earth" Mode)
    // 1 Earth capacity = ~2.8 tons CO2 per capita per year.
    const earthsNeeded = parseFloat((baseTons / 2.8).toFixed(1));

    return {
      tempRise,
      iceCoverage,
      earthsNeeded: Math.max(0.8, earthsNeeded)
    };
  };

  const currentData = calculateSimulationData(selectedYear, lifestyle === 'improved');
  const years = [2030, 2040, 2050];

  const handleYearChange = (year: 2030 | 2040 | 2050) => {
    setSelectedYear(year);
    speak(`Simulating global environmental impact for year ${year} based on ${lifestyle} lifestyle.`);
  };

  const handleLifestyleChange = (type: 'current' | 'improved') => {
    setLifestyle(type);
    speak(`Switched projection to ${type} lifestyle patterns.`);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-eco-900/40" id="sim-slider">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-eco-900/40 pb-5 mb-6">
        <div>
          <span className="text-[10px] font-bold text-google-yellow bg-google-yellow/10 border border-google-yellow/20 px-2.5 py-1 rounded-full">
            Moonshot Earth Simulator
          </span>
          <h2 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
            Future Earth Projection <Globe className="w-5 h-5 text-eco-400" />
          </h2>
          <p className="text-xs text-slate-400">See the generational impact of your daily choices.</p>
        </div>

        {/* Lifestyle Switcher */}
        <div className="flex bg-dark-950 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => handleLifestyleChange('current')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              lifestyle === 'current'
                ? 'bg-eco-600/20 text-white border border-eco-500/20 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Current Lifestyle
          </button>
          <button
            onClick={() => handleLifestyleChange('improved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              lifestyle === 'improved'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Eco-Optimized Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Stats Detail Grid */}
        <div className="lg:col-span-5 space-y-5">
          {/* Temperature HUD */}
          <div className="bg-dark-950/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-red-950/40 border border-red-900/40 rounded-xl text-red-400 shrink-0">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">Global Temperature Rise</div>
              <div className="text-2xl font-extrabold text-white mt-1">+{currentData.tempRise}°C</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Deviation from pre-industrial average</p>
            </div>
          </div>

          {/* Ice Coverage HUD */}
          <div className="bg-dark-950/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-xl text-blue-400 shrink-0">
              <Droplets className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-400">Polar Ice Coverage</div>
              <div className="text-2xl font-extrabold text-white mt-1">{currentData.iceCoverage}%</div>
              
              {/* Progress bar of melt */}
              <div className="bg-dark-900 rounded-full h-2 mt-2 p-0.5 overflow-hidden">
                <div 
                  className="bg-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentData.iceCoverage}%` }}
                />
              </div>
            </div>
          </div>

          {/* One Earth Mode Indicator */}
          <div className="bg-gradient-to-br from-eco-950/40 to-dark-950/40 border border-eco-900/30 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-eco-400">One Earth Capacity Limit</span>
                <div className="text-2xl font-black text-white mt-1.5">{currentData.earthsNeeded} Earths</div>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Required if the global population lived with your {lifestyle === 'current' ? 'current' : 'eco-optimized'} footprint.
                </p>
              </div>

              {/* Earth visualization indicator */}
              <div className="flex flex-wrap gap-1 w-14 shrink-0 justify-end">
                {Array.from({ length: Math.ceil(currentData.earthsNeeded) }).map((_, idx) => (
                  <Globe 
                    key={idx} 
                    className={`w-4 h-4 ${
                      idx < Math.floor(currentData.earthsNeeded) 
                        ? currentData.earthsNeeded > 2 ? 'text-red-400' : 'text-eco-400' 
                        : 'text-slate-700'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {currentData.earthsNeeded > 1.5 && (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-xl bg-red-950/30 border border-red-900/30 text-[10px] font-semibold text-red-400">
                <ShieldAlert className="w-3.5 h-3.5" /> High Ecological Deficit: Planet capacity exceeded.
              </div>
            )}
          </div>
        </div>

        {/* Right Interactive Globe Projection Display */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Virtual Globe Sphere Canvas Simulator */}
          <div className="w-64 h-64 rounded-full border border-eco-800/40 relative shadow-2xl shadow-eco-900/20 bg-radial flex items-center justify-center overflow-hidden">
            {/* Visual globe atmosphere effect depending on lifestyle */}
            <div className={`absolute inset-0 transition-colors duration-500 opacity-25 ${
              lifestyle === 'improved' 
                ? 'bg-gradient-to-t from-emerald-600 via-sky-600 to-transparent' 
                : currentData.tempRise > 2.2 
                  ? 'bg-gradient-to-t from-red-600 via-orange-600 to-transparent'
                  : 'bg-gradient-to-t from-yellow-600 via-eco-600 to-transparent'
            }`} />

            <div className="z-10 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">PROJECTION</span>
              <span className="text-5xl font-black text-white block tracking-tighter">{selectedYear}</span>
              <span className="text-[10px] text-eco-400 font-bold bg-dark-950/80 px-2 py-0.5 rounded-full border border-eco-900/30">
                {lifestyle === 'current' ? 'CURRENT PATH' : 'CLEAN EARTH'}
              </span>
            </div>

            {/* Earth lines decorations */}
            <div className="absolute w-56 h-28 border-t border-dashed border-slate-700/30 rounded-full rotate-12" />
            <div className="absolute w-28 h-56 border-l border-dashed border-slate-700/30 rounded-full -rotate-12" />
          </div>

          {/* Timeline Slider */}
          <div className="w-full mt-6 space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Simulation Target Year</span>
              <span className="text-white">{selectedYear}</span>
            </div>
            
            <div className="flex items-center gap-4 bg-dark-950 p-2.5 rounded-2xl border border-slate-800/80">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => handleYearChange(y as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedYear === y 
                      ? 'bg-eco-600/20 border-eco-500 text-white' 
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
