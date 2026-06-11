import { CarbonAssessment, CarbonResult, CarbonBreakdown } from '../types';

export const DEFAULT_ASSESSMENT: CarbonAssessment = {
  carKm: 800,
  fuelEfficiencyMpg: 25,
  publicTransitKm: 300,
  flightHours: 1.5, // 18 hours per year
  bicycleKm: 100,
  monthlyKwh: 350,
  cleanEnergyPct: 15,
  meatDaysPerWeek: 4,
  dairyServingsPerWeek: 10,
  organicFoodPct: 10,
  clothingItems: 3,
  electronicsItems: 0.2, // ~2 items a year
  otherGoodsSpent: 200,
  wasteVolumeKg: 30,
  recyclingPct: 30,
  showerDurationMin: 10,
  waterSavingFaucets: false,
  washingLoadsPerWeek: 4
};

export function calculateCarbonFootprint(data: CarbonAssessment): CarbonResult {
  // 1. Transportation
  // US Gallon of gas = ~8.887 kg CO2. 1 mile = 1.609 km.
  const carMiles = (data.carKm * 0.621371);
  const gallonsUsed = data.fuelEfficiencyMpg > 0 ? (carMiles / data.fuelEfficiencyMpg) : 0;
  const carCO2 = gallonsUsed * 8.887;
  
  const transitCO2 = data.publicTransitKm * 0.04; // average 0.04 kg CO2 per passenger-km
  const flightCO2 = data.flightHours * 90.0; // average short/long haul mix ~90 kg CO2 per hour
  const transportation = Math.round(carCO2 + transitCO2 + flightCO2);

  // 2. Electricity
  // Average US grid carbon intensity = ~0.4 kg CO2 / kWh
  const rawElectricityCO2 = data.monthlyKwh * 0.38;
  const cleanEnergySavings = rawElectricityCO2 * (data.cleanEnergyPct / 100);
  const electricity = Math.round(Math.max(0, rawElectricityCO2 - cleanEnergySavings));

  // 3. Food
  // High meat diet = ~8kg/day. Vegetarian = ~3kg/day. Beef is major polluter (~15kg per serving). Dairy is ~1.5kg.
  // We approximate monthly food emissions based on weekly habits
  const baseMeatCO2 = data.meatDaysPerWeek * 7.5 * 4.3; // 7.5 kg CO2 per meat day
  const baseVegCO2 = (7 - data.meatDaysPerWeek) * 2.8 * 4.3; // 2.8 kg CO2 per veg day
  const dairyCO2 = data.dairyServingsPerWeek * 1.4 * 4.3; // 1.4 kg per serving
  
  let rawFoodCO2 = baseMeatCO2 + baseVegCO2 + dairyCO2;
  // Organic farming saves ~12% carbon emissions
  const organicSavings = rawFoodCO2 * (data.organicFoodPct / 100) * 0.12;
  const food = Math.round(Math.max(0, rawFoodCO2 - organicSavings));

  // 4. Shopping
  const clothingCO2 = data.clothingItems * 14.2; // 14.2 kg CO2 per garment
  const electronicsCO2 = data.electronicsItems * 180.0; // 180 kg CO2 per device (manufacture + transport)
  const servicesCO2 = data.otherGoodsSpent * 0.12; // 0.12 kg CO2 per $ spent
  const shopping = Math.round(clothingCO2 + electronicsCO2 + servicesCO2);

  // 5. Waste
  // Average municipal solid waste = ~1.1 kg CO2 per kg
  const rawWasteCO2 = data.wasteVolumeKg * 1.15;
  const recyclingSavings = rawWasteCO2 * (data.recyclingPct / 100) * 0.65; // recycling reduces footprint by 65%
  const waste = Math.round(Math.max(0, rawWasteCO2 - recyclingSavings));

  // 6. Water
  // Hot shower heating is ~0.18 kg CO2 per min. Laundry washing is ~0.4 kg CO2 per load.
  const showerCO2 = data.showerDurationMin * 30 * 0.18;
  const laundryCO2 = data.washingLoadsPerWeek * 4.3 * 0.45;
  let rawWaterCO2 = showerCO2 + laundryCO2;
  if (data.waterSavingFaucets) {
    rawWaterCO2 *= 0.78; // 22% reduction in water energy
  }
  const water = Math.round(rawWaterCO2);

  // Totals
  const totalMonthlyEmissions = transportation + electricity + food + shopping + waste + water;
  const totalAnnualEmissions = totalMonthlyEmissions * 12;

  const breakdown: CarbonBreakdown = {
    transportation,
    electricity,
    food,
    shopping,
    waste,
    water
  };

  // Sustainability score (0 to 100)
  // Average world citizen monthly footprint is ~400 kg CO2 (4.8 tonnes/yr), US is ~1300 kg CO2 (16 tonnes/yr).
  // Let's set a target baseline of 300 kg CO2 as a 100 score, and 1500 kg CO2 as a 10 score.
  let score = 100 - ((totalMonthlyEmissions - 200) / 13);
  score = Math.round(Math.max(5, Math.min(100, score)));

  // Letter Rating
  let rating: CarbonResult['rating'] = 'F';
  if (score >= 92) rating = 'A+';
  else if (score >= 82) rating = 'A';
  else if (score >= 70) rating = 'B';
  else if (score >= 52) rating = 'C';
  else if (score >= 35) rating = 'D';

  return {
    score,
    totalMonthlyEmissions,
    totalAnnualEmissions,
    breakdown,
    rating
  };
}

export function sanitizeAssessmentInput(raw: Partial<CarbonAssessment>): CarbonAssessment {
  return {
    carKm: Math.max(0, Number(raw.carKm) || 0),
    fuelEfficiencyMpg: Math.max(1, Number(raw.fuelEfficiencyMpg) || 25),
    publicTransitKm: Math.max(0, Number(raw.publicTransitKm) || 0),
    flightHours: Math.max(0, Number(raw.flightHours) || 0),
    bicycleKm: Math.max(0, Number(raw.bicycleKm) || 0),
    monthlyKwh: Math.max(0, Number(raw.monthlyKwh) || 0),
    cleanEnergyPct: Math.min(100, Math.max(0, Number(raw.cleanEnergyPct) || 0)),
    meatDaysPerWeek: Math.min(7, Math.max(0, Number(raw.meatDaysPerWeek) || 0)),
    dairyServingsPerWeek: Math.max(0, Number(raw.dairyServingsPerWeek) || 0),
    organicFoodPct: Math.min(100, Math.max(0, Number(raw.organicFoodPct) || 0)),
    clothingItems: Math.max(0, Number(raw.clothingItems) || 0),
    electronicsItems: Math.max(0, Number(raw.electronicsItems) || 0),
    otherGoodsSpent: Math.max(0, Number(raw.otherGoodsSpent) || 0),
    wasteVolumeKg: Math.max(0, Number(raw.wasteVolumeKg) || 0),
    recyclingPct: Math.min(100, Math.max(0, Number(raw.recyclingPct) || 0)),
    showerDurationMin: Math.max(0, Number(raw.showerDurationMin) || 0),
    waterSavingFaucets: !!raw.waterSavingFaucets,
    washingLoadsPerWeek: Math.max(0, Number(raw.washingLoadsPerWeek) || 0),
  };
}
