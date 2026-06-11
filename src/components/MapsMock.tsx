import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Car, Bus, Eye, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { getProfile, saveProfile, addNotification } from '../services/db';
import { useVoiceGuidance } from './VoiceGuidance';

interface RouteOption {
  mode: 'driving' | 'transit' | 'walking';
  name: string;
  duration: string;
  distanceKm: number;
  co2Kg: number;
  savingsKg: number;
  xpReward: number;
  color: string;
}

const DESTINATIONS = [
  { id: 'office', name: 'Tech Park (Office)', distanceKm: 12 },
  { id: 'store', name: 'Organic Supermarket', distanceKm: 4.5 },
  { id: 'park', name: 'Central Nature Reserve', distanceKm: 8 },
  { id: 'gym', name: 'Community Eco Gym', distanceKm: 2.8 }
];

export const MapsMock: React.FC = () => {
  const { speak } = useVoiceGuidance();
  const [targetDest, setTargetDest] = useState(DESTINATIONS[0]);
  const [selectedMode, setSelectedMode] = useState<'driving' | 'transit' | 'walking'>('transit');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simComplete, setSimComplete] = useState(false);

  // Recalculate options based on selected distance
  const getRoutes = (distance: number): RouteOption[] => [
    {
      mode: 'driving',
      name: 'Solo Driving',
      duration: `${Math.round(distance * 2 + 5)} mins`,
      distanceKm: distance,
      co2Kg: parseFloat((distance * 0.22).toFixed(1)),
      savingsKg: 0,
      xpReward: 10,
      color: '#EA4335'
    },
    {
      mode: 'transit',
      name: 'Public Transit',
      duration: `${Math.round(distance * 2.8 + 8)} mins`,
      distanceKm: distance,
      co2Kg: parseFloat((distance * 0.05).toFixed(1)),
      savingsKg: parseFloat((distance * 0.17).toFixed(1)),
      xpReward: 80,
      color: '#4285F4'
    },
    {
      mode: 'walking',
      name: 'Walk / Cycle',
      duration: `${Math.round(distance * 4.5)} mins`,
      distanceKm: distance,
      co2Kg: 0,
      savingsKg: parseFloat((distance * 0.22).toFixed(1)),
      xpReward: 150,
      color: '#34A853'
    }
  ];

  const routes = getRoutes(targetDest.distanceKm);
  const activeRoute = routes.find(r => r.mode === selectedMode)!;

  useEffect(() => {
    let timer: any;
    if (isSimulating) {
      setSimComplete(false);
      timer = setInterval(() => {
        setSimProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsSimulating(false);
            setSimComplete(true);
            handleSimulationComplete();
            return 100;
          }
          return prev + 4;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isSimulating]);

  const handleStartSimulation = () => {
    setSimProgress(0);
    setSimComplete(false);
    setIsSimulating(true);
    speak(`Simulating commute route of ${targetDest.name} by ${activeRoute.name}. Distance: ${targetDest.distanceKm} kilometers.`);
  };

  const handleSimulationComplete = () => {
    const profile = getProfile();
    // Complete savings write
    if (activeRoute.savingsKg > 0) {
      profile.totalCo2Saved += activeRoute.savingsKg;
      // Award XP
      profile.xp += activeRoute.xpReward;
      const xpNeeded = profile.level * 800;
      if (profile.xp >= xpNeeded) {
        profile.level += 1;
        profile.xp -= xpNeeded;
        addNotification(`LEVEL UP! You are now Level ${profile.level}! 🎉`, 'success');
      }
      saveProfile(profile);
      addNotification(`Commute simulation complete! You saved ${activeRoute.savingsKg}kg CO2 and gained +${activeRoute.xpReward} XP.`, 'success');
      speak(`Commute simulation completed. You saved ${activeRoute.savingsKg} kilograms of carbon dioxide and earned ${activeRoute.xpReward} experience points!`);
    } else {
      addNotification(`Commute simulation finished. Solo driving emitted ${activeRoute.co2Kg}kg CO2. Try using transit or biking to earn XP!`, 'warning');
      speak(`Commute simulation finished. Solo driving emitted ${activeRoute.co2Kg} kilograms of carbon dioxide.`);
    }
  };

  // SVG Coordinates for the route map based on destination
  const getRoutePath = () => {
    switch (targetDest.id) {
      case 'office':
        return "M 40 180 C 120 180, 150 70, 240 70 S 320 220, 420 220";
      case 'store':
        return "M 40 180 C 80 120, 180 140, 220 230 S 300 120, 420 120";
      case 'park':
        return "M 40 180 C 60 260, 160 260, 200 140 S 340 60, 420 60";
      default:
        return "M 40 180 C 100 180, 120 180, 200 180 S 300 240, 420 240";
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row gap-6 border border-eco-900/40 relative overflow-hidden" id="maps-navigator">
      
      {/* Route Selector Dashboard */}
      <div className="flex-1 space-y-4 z-10">
        <div>
          <span className="text-xs font-bold text-google-blue bg-google-blue/10 px-2.5 py-1 rounded-full border border-google-blue/20">
            Google Maps API Emulator
          </span>
          <h2 className="text-xl font-bold text-white mt-2">Intelligent Eco Route Planner</h2>
          <p className="text-xs text-slate-400">Calculate transit impact comparison and commute offsets.</p>
        </div>

        {/* Destination Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">Select Commute Destination</label>
          <div className="grid grid-cols-2 gap-2">
            {DESTINATIONS.map(d => (
              <button
                key={d.id}
                onClick={() => {
                  setTargetDest(d);
                  setSimComplete(false);
                  setSimProgress(0);
                }}
                className={`px-3 py-2 rounded-xl text-left border text-xs font-semibold transition-all ${
                  targetDest.id === d.id 
                    ? 'bg-eco-600/20 border-eco-500 text-white' 
                    : 'bg-dark-950/40 border-slate-800/80 text-slate-400 hover:bg-dark-800/40'
                }`}
              >
                <div className="font-bold">{d.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{d.distanceKm} km commute</div>
              </button>
            ))}
          </div>
        </div>

        {/* Transit Mode Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">Choose Mode of Transport</label>
          <div className="space-y-2">
            {routes.map(r => (
              <button
                key={r.mode}
                onClick={() => {
                  setSelectedMode(r.mode);
                  setSimComplete(false);
                  setSimProgress(0);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  selectedMode === r.mode 
                    ? 'bg-dark-950/80 border-eco-500 text-white' 
                    : 'bg-dark-950/20 border-slate-800/40 text-slate-400 hover:bg-dark-850/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                    {r.mode === 'driving' && <Car className="w-5 h-5" />}
                    {r.mode === 'transit' && <Bus className="w-5 h-5" />}
                    {r.mode === 'walking' && <Navigation className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{r.name}</div>
                    <div className="text-[10px] text-slate-400">{r.duration} • {r.distanceKm} km</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-extrabold ${r.mode === 'driving' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {r.co2Kg} kg CO2
                  </div>
                  {r.savingsKg > 0 ? (
                    <div className="text-[9px] text-emerald-500 font-bold">Saved {r.savingsKg}kg • +{r.xpReward} XP</div>
                  ) : (
                    <div className="text-[9px] text-slate-500 font-bold">No carbon savings</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Control */}
        <button
          onClick={handleStartSimulation}
          disabled={isSimulating}
          className="w-full bg-eco-600 hover:bg-eco-500 disabled:bg-slate-700 text-dark-950 font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-eco-950/20"
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
              Simulating Trip ({simProgress}%)
            </>
          ) : simComplete ? (
            <>
              <CheckCircle className="w-5 h-5" /> Trip Completed!
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-dark-950" /> Simulate Green Journey
            </>
          )}
        </button>
      </div>

      {/* Interactive Vector Map Screen */}
      <div className="flex-1 h-80 md:h-auto min-h-[300px] bg-dark-950/80 rounded-2xl border border-slate-800/80 relative overflow-hidden flex flex-col justify-end p-4 shadow-inner">
        
        {/* Map Grid Vector Background */}
        <svg className="absolute inset-0 w-full h-full text-slate-900/60" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Custom Decorative Topography Rivers/Parks */}
          <path d="M-20 80 Q 80 50 140 110 T 320 60 T 500 120" fill="none" stroke="#064e3b" strokeWidth="20" strokeLinecap="round" opacity="0.15" />
          <circle cx="380" cy="180" r="45" fill="#047857" opacity="0.08" />

          {/* Draw Route Path */}
          <path
            id="map-trip-path"
            d={getRoutePath()}
            fill="none"
            stroke={activeRoute.color}
            strokeWidth="3.5"
            strokeDasharray="6 6"
            className="transition-all duration-300"
          />

          {/* Animated vehicle along path */}
          {isSimulating && (
            <path
              d={getRoutePath()}
              fill="none"
              stroke="#ffffff"
              strokeWidth="6"
              strokeDasharray="100"
              strokeDashoffset={100 - simProgress}
              pathLength="100"
              opacity="0.3"
            />
          )}

          {/* Home Node */}
          <g transform="translate(40, 180)">
            <circle r="8" fill="#10b981" className="animate-ping" opacity="0.5" />
            <circle r="5" fill="#10b981" stroke="#000" strokeWidth="1" />
            <text y="-14" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">Start (Home)</text>
          </g>

          {/* Destination Node */}
          <g transform="translate(420, 220)">
            <circle r="8" fill={activeRoute.color} className="animate-ping" opacity="0.5" />
            <circle r="5" fill={activeRoute.color} stroke="#000" strokeWidth="1" />
            <text y="-14" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">{targetDest.name}</text>
          </g>
        </svg>

        {/* Live HUD Dashboard overlay */}
        <div className="z-10 bg-dark-900/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-eco-400" />
            <div>
              <div className="font-bold text-white">{targetDest.name}</div>
              <div className="text-[10px] text-slate-500 font-semibold">{activeRoute.name} Mode</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-white">{activeRoute.duration}</div>
            <div className="text-[9px] text-slate-400 font-semibold">{targetDest.distanceKm} km GPS route</div>
          </div>
        </div>
      </div>
    </div>
  );
};
