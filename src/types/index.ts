export interface CarbonAssessment {
  // Transportation (monthly)
  carKm: number;
  fuelEfficiencyMpg: number; // Miles per gallon (or equivalent)
  publicTransitKm: number;
  flightHours: number; // Yearly flight hours / 12
  bicycleKm: number;

  // Electricity (monthly)
  monthlyKwh: number;
  cleanEnergyPct: number;

  // Food (weekly habits)
  meatDaysPerWeek: number;
  dairyServingsPerWeek: number;
  organicFoodPct: number;

  // Shopping (monthly)
  clothingItems: number;
  electronicsItems: number; // yearly / 12
  otherGoodsSpent: number;

  // Waste (monthly)
  wasteVolumeKg: number;
  recyclingPct: number;

  // Water (daily/weekly)
  showerDurationMin: number;
  waterSavingFaucets: boolean;
  washingLoadsPerWeek: number;
}

export interface CarbonBreakdown {
  transportation: number;
  electricity: number;
  food: number;
  shopping: number;
  waste: number;
  water: number;
}

export interface CarbonResult {
  score: number; // 0 - 100 sustainability index (higher is better)
  totalMonthlyEmissions: number; // kg CO2
  totalAnnualEmissions: number; // kg CO2
  breakdown: CarbonBreakdown;
  rating: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ActionPlanTask {
  id: string;
  title: string;
  description: string;
  carbonSavings: number; // kg CO2 saved per completion
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  completed: boolean;
  category: keyof CarbonBreakdown;
}

export interface OffsetProject {
  id: string;
  name: string;
  description: string;
  costPerKg: number; // in USD
  co2OffsetPerDollar: number; // kg CO2 offset per $1
  category: 'forestry' | 'solar' | 'wind' | 'community';
  impactText: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  xpReward: number;
  requirements: string[];
  progress: number; // number of days completed
  active: boolean;
  completed: boolean;
  badgeId?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  level: number;
  co2SavedKg: number;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  level: number;
  xp: number;
  streakDays: number;
  badges: string[];
  assessmentData: CarbonAssessment | null;
  assessmentResult: CarbonResult | null;
  actions: ActionPlanTask[];
  activeChallenges: Challenge[];
  completedChallenges: string[]; // Challenge IDs
  totalCo2Saved: number; // kg CO2 saved by doing tasks
  balanceCo2Offset: number; // kg CO2 offset bought
  customApiKey?: string;
}

export interface NotificationMsg {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
}

export interface TestResult {
  name: string;
  suite: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: string;
}
