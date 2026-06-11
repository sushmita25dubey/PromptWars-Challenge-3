import React, { useState } from 'react';
import { Leaf, ArrowLeft, ArrowRight, CheckCircle, Calculator, Sparkles, RefreshCw } from 'lucide-react';
import { getProfile, updateAssessment } from '../services/db';
import { sanitizeAssessmentInput } from '../utils/calculator';
import { useVoiceGuidance } from '../components/VoiceGuidance';
import { UserProfile, CarbonAssessment } from '../types';

interface AssessmentProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setCurrentTab: (tab: string) => void;
}

const STEPS = [
  { id: 'transport', title: 'Transportation', desc: 'Commutes, fuel efficiency, flights & biking' },
  { id: 'energy', title: 'Home Energy', desc: 'Electricity bills and clean power shares' },
  { id: 'food', title: 'Food & Diet', desc: 'Meat consumption and organic ratios' },
  { id: 'shopping', title: 'Goods & Retail', desc: 'Clothing purchases and electronics' },
  { id: 'waste', title: 'Waste Management', desc: 'Garbage volumes and recycling habits' },
  { id: 'water', title: 'Water Footprint', desc: 'Showers and washing machine usage' },
];

export const Assessment: React.FC<AssessmentProps> = ({ profile, setProfile, setCurrentTab }) => {
  const { speak } = useVoiceGuidance();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<CarbonAssessment>(() => {
    return profile.assessmentData || {
      carKm: 500,
      fuelEfficiencyMpg: 25,
      publicTransitKm: 150,
      flightHours: 1.0,
      bicycleKm: 50,
      monthlyKwh: 250,
      cleanEnergyPct: 0,
      meatDaysPerWeek: 3,
      dairyServingsPerWeek: 7,
      organicFoodPct: 0,
      clothingItems: 2,
      electronicsItems: 0.1,
      otherGoodsSpent: 100,
      wasteVolumeKg: 20,
      recyclingPct: 20,
      showerDurationMin: 8,
      waterSavingFaucets: false,
      washingLoadsPerWeek: 3
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof CarbonAssessment, val: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleNext = () => {
    // Basic step validation
    const errors: string[] = [];
    if (currentStepIdx === 0) {
      if (formData.carKm < 0 || formData.publicTransitKm < 0 || formData.flightHours < 0 || formData.bicycleKm < 0) {
        errors.push("Distances and hours must be positive numbers.");
      }
      if (formData.fuelEfficiencyMpg <= 0) {
        errors.push("Fuel efficiency must be greater than zero.");
      }
    }
    if (currentStepIdx === 1) {
      if (formData.monthlyKwh < 0) errors.push("Monthly power usage cannot be negative.");
      if (formData.cleanEnergyPct < 0 || formData.cleanEnergyPct > 100) errors.push("Clean energy percent must be between 0 and 100.");
    }
    if (currentStepIdx === 2) {
      if (formData.meatDaysPerWeek < 0 || formData.meatDaysPerWeek > 7) errors.push("Meat consumption days must be between 0 and 7.");
      if (formData.dairyServingsPerWeek < 0) errors.push("Dairy servings cannot be negative.");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      speak(`Form validation error: ${errors.join(', ')}`);
      return;
    }

    setValidationErrors([]);
    if (currentStepIdx < STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      speak(`Proceeded to Step ${nextIdx + 1}: ${STEPS[nextIdx].title}. ${STEPS[nextIdx].desc}`);
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      speak(`Returned to Step ${prevIdx + 1}: ${STEPS[prevIdx].title}`);
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    speak("Analyzing assessment metrics. Running carbon coefficient simulator.");
    
    setTimeout(() => {
      const sanitized = sanitizeAssessmentInput(formData);
      const updatedProfile = updateAssessment(sanitized);
      setProfile(updatedProfile);
      setIsLoading(false);
      setShowResults(true);
      speak(`Carbon footprint calculations complete! Your sustainability rating is ${updatedProfile.assessmentResult?.rating}. Score ${updatedProfile.assessmentResult?.score} out of 100.`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Wizard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-eco-400" /> AI Carbon Assessment
          </h2>
          <p className="text-xs text-slate-400">Complete the metrics to generate your carbon footprint score.</p>
        </div>
      </div>

      {showResults && profile.assessmentResult ? (
        /* Results View */
        <div className="glass-panel rounded-3xl p-8 border border-eco-900/40 text-center space-y-6 max-w-2xl mx-auto">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-eco-950 border-2 border-eco-555 flex items-center justify-center text-eco-400 animate-bounce">
              <Sparkles className="w-10 h-10 text-eco-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Assessment Complete!</h3>
            <p className="text-sm text-slate-400">Your ecological footprint calculations have been computed.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {/* Score box */}
            <div className="bg-dark-950/60 border border-slate-800/80 rounded-2xl p-5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Eco Score</span>
              <div className="text-4xl font-black text-emerald-400 mt-2">{profile.assessmentResult.score}<span className="text-xs text-slate-500 font-normal">/100</span></div>
            </div>

            {/* Rating box */}
            <div className="bg-dark-950/60 border border-slate-800/80 rounded-2xl p-5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rating</span>
              <div className="text-4xl font-black text-google-yellow mt-2">{profile.assessmentResult.rating}</div>
            </div>
          </div>

          {/* Emissions details */}
          <div className="p-4 bg-dark-950/40 border border-eco-900/20 rounded-2xl max-w-md mx-auto text-xs text-slate-300 font-semibold space-y-2.5">
            <div className="flex justify-between">
              <span>Monthly Carbon Footprint:</span>
              <span className="text-white">{profile.assessmentResult.totalMonthlyEmissions.toLocaleString()} kg CO2</span>
            </div>
            <div className="flex justify-between border-t border-slate-900 pt-2">
              <span>Annual Carbon Emissions:</span>
              <span className="text-white">{profile.assessmentResult.totalAnnualEmissions.toLocaleString()} kg CO2</span>
            </div>
          </div>

          <div className="flex gap-3 max-w-md mx-auto pt-4">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentStepIdx(0);
              }}
              className="flex-1 py-3 rounded-2xl border border-slate-800 hover:bg-dark-800/40 font-bold text-xs text-slate-300 transition-all"
            >
              Re-take Assessment
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex-1 bg-eco-600 hover:bg-eco-500 text-dark-950 font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-eco-950/20"
            >
              View Analytics Dashboard
            </button>
          </div>
        </div>
      ) : isLoading ? (
        /* Loading Skeletons State */
        <div className="glass-panel rounded-3xl p-8 border border-eco-900/40 text-center space-y-6 max-w-lg mx-auto">
          <div className="flex justify-center">
            <RefreshCw className="w-10 h-10 text-eco-400 animate-spin" />
          </div>
          <div className="space-y-3">
            <div className="h-5 bg-dark-800 rounded w-2/3 mx-auto animate-pulse" />
            <div className="h-3 bg-dark-800 rounded w-1/2 mx-auto animate-pulse" />
          </div>
          <p className="text-xs text-slate-400">Loading coefficients and checking offsets databases...</p>
        </div>
      ) : (
        /* Wizard Form Step View */
        <div className="glass-panel rounded-3xl p-6 border border-eco-900/40 max-w-xl mx-auto space-y-6">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Step {currentStepIdx + 1} of {STEPS.length}</span>
            <span className="text-white">{STEPS[currentStepIdx].title}</span>
          </div>
          <div className="bg-dark-950 rounded-full h-2 overflow-hidden border border-slate-900 p-0.5">
            <div 
              className="bg-eco-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIdx + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-950/30 border border-red-900/35 text-red-400 rounded-xl text-xs font-bold space-y-1">
              {validationErrors.map(e => <div key={e}>{e}</div>)}
            </div>
          )}

          {/* Form Step Contents */}
          <div className="space-y-4 pt-2">
            {currentStepIdx === 0 && (
              /* Step 0: Transport */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="input-car" className="text-xs font-bold text-slate-300 block">Monthly Car Driving (km)</label>
                  <input
                    id="input-car"
                    type="number"
                    value={formData.carKm}
                    onChange={(e) => handleInputChange('carKm', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-efficiency" className="text-xs font-bold text-slate-300 block">Car Fuel Efficiency (Miles Per Gallon)</label>
                  <input
                    id="input-efficiency"
                    type="number"
                    value={formData.fuelEfficiencyMpg}
                    onChange={(e) => handleInputChange('fuelEfficiencyMpg', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-transit" className="text-xs font-bold text-slate-300 block">Monthly Public Transit (km)</label>
                  <input
                    id="input-transit"
                    type="number"
                    value={formData.publicTransitKm}
                    onChange={(e) => handleInputChange('publicTransitKm', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-flights" className="text-xs font-bold text-slate-300 block">Average Monthly Flight Hours</label>
                  <input
                    id="input-flights"
                    type="number"
                    step="0.1"
                    value={formData.flightHours}
                    onChange={(e) => handleInputChange('flightHours', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>
              </div>
            )}

            {currentStepIdx === 1 && (
              /* Step 1: Energy */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="input-electricity" className="text-xs font-bold text-slate-300 block">Monthly Electricity Consumption (kWh)</label>
                  <input
                    id="input-electricity"
                    type="number"
                    value={formData.monthlyKwh}
                    onChange={(e) => handleInputChange('monthlyKwh', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-clean" className="text-xs font-bold text-slate-300 block">Clean / Renewable Share (%)</label>
                  <input
                    id="input-clean"
                    type="number"
                    max="100"
                    min="0"
                    value={formData.cleanEnergyPct}
                    onChange={(e) => handleInputChange('cleanEnergyPct', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>
              </div>
            )}

            {currentStepIdx === 2 && (
              /* Step 2: Food */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="input-meat" className="text-xs font-bold text-slate-300 block">Meat Consumption (Days Per Week)</label>
                  <input
                    id="input-meat"
                    type="number"
                    max="7"
                    min="0"
                    value={formData.meatDaysPerWeek}
                    onChange={(e) => handleInputChange('meatDaysPerWeek', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-dairy" className="text-xs font-bold text-slate-300 block">Dairy Servings (Per Week)</label>
                  <input
                    id="input-dairy"
                    type="number"
                    value={formData.dairyServingsPerWeek}
                    onChange={(e) => handleInputChange('dairyServingsPerWeek', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-organic" className="text-xs font-bold text-slate-300 block">Organic / Local Food Share (%)</label>
                  <input
                    id="input-organic"
                    type="number"
                    max="100"
                    min="0"
                    value={formData.organicFoodPct}
                    onChange={(e) => handleInputChange('organicFoodPct', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>
              </div>
            )}

            {currentStepIdx === 3 && (
              /* Step 3: Shopping */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="input-clothes" className="text-xs font-bold text-slate-300 block">New Clothing Purchased (Garments Per Month)</label>
                  <input
                    id="input-clothes"
                    type="number"
                    value={formData.clothingItems}
                    onChange={(e) => handleInputChange('clothingItems', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-electronics" className="text-xs font-bold text-slate-300 block">New Electronics Purchased (Devices Per Month)</label>
                  <input
                    id="input-electronics"
                    type="number"
                    step="0.01"
                    value={formData.electronicsItems}
                    onChange={(e) => handleInputChange('electronicsItems', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-goods" className="text-xs font-bold text-slate-300 block">Monthly Spent on Other Goods ($)</label>
                  <input
                    id="input-goods"
                    type="number"
                    value={formData.otherGoodsSpent}
                    onChange={(e) => handleInputChange('otherGoodsSpent', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>
              </div>
            )}

            {currentStepIdx === 4 && (
              /* Step 4: Waste */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="input-waste" className="text-xs font-bold text-slate-300 block">Estimated Household Waste (kg Per Month)</label>
                  <input
                    id="input-waste"
                    type="number"
                    value={formData.wasteVolumeKg}
                    onChange={(e) => handleInputChange('wasteVolumeKg', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-recycling" className="text-xs font-bold text-slate-300 block">Recycled or Composted Share (%)</label>
                  <input
                    id="input-recycling"
                    type="number"
                    max="100"
                    min="0"
                    value={formData.recyclingPct}
                    onChange={(e) => handleInputChange('recyclingPct', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>
              </div>
            )}

            {currentStepIdx === 5 && (
              /* Step 5: Water */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="input-shower" className="text-xs font-bold text-slate-300 block">Average Daily Shower Duration (Minutes)</label>
                  <input
                    id="input-shower"
                    type="number"
                    value={formData.showerDurationMin}
                    onChange={(e) => handleInputChange('showerDurationMin', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="input-washing" className="text-xs font-bold text-slate-300 block">Laundry Washing Loads (Per Week)</label>
                  <input
                    id="input-washing"
                    type="number"
                    value={formData.washingLoadsPerWeek}
                    onChange={(e) => handleInputChange('washingLoadsPerWeek', Number(e.target.value))}
                    className="w-full bg-dark-950 border border-eco-900/60 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-eco-555"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    id="input-faucets"
                    type="checkbox"
                    checked={formData.waterSavingFaucets}
                    onChange={(e) => handleInputChange('waterSavingFaucets', e.target.checked)}
                    className="w-4 h-4 text-eco-500 focus:ring-eco-400 bg-dark-950 border-eco-900 rounded"
                  />
                  <label htmlFor="input-faucets" className="text-xs font-bold text-slate-300 cursor-pointer">
                    We use low-flow water saving aerators / showerheads
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-900">
            <button
              onClick={handleBack}
              disabled={currentStepIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-800 disabled:opacity-30 text-xs font-bold text-slate-300 hover:bg-dark-800/40 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {currentStepIdx < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-eco-600 hover:bg-eco-500 text-dark-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-eco-950/20"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-950/20"
              >
                Compute Carbon Index <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
