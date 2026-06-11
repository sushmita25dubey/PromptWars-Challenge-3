import { UserProfile, CarbonAssessment, CarbonResult, ActionPlanTask, Challenge, NotificationMsg } from '../types';
import { calculateCarbonFootprint, DEFAULT_ASSESSMENT } from '../utils/calculator';

const STORAGE_KEY = 'ecotracker_user_profile';
const NOTIFS_KEY = 'ecotracker_notifications';

const INITIAL_TASKS: ActionPlanTask[] = [
  { id: 't1', title: 'Unplug Standby Devices', description: 'Unplug chargers and TVs when not in use to eliminate phantom energy loads.', carbonSavings: 0.8, difficulty: 'Easy', frequency: 'Daily', completed: false, category: 'electricity' },
  { id: 't2', title: 'Use Public Transit or Carpool', description: 'Replace one single-occupancy car trip with public transit, carpooling, or walking.', carbonSavings: 4.5, difficulty: 'Medium', frequency: 'Daily', completed: false, category: 'transportation' },
  { id: 't3', title: 'Eat a Plant-Based Dinner', description: 'Substitute meat with lentils, beans, or a vegetarian alternative for your evening meal.', carbonSavings: 2.1, difficulty: 'Easy', frequency: 'Daily', completed: false, category: 'food' },
  { id: 't4', title: 'Limit Shower to 5 Minutes', description: 'Keep showers short to conserve hot water and reduce water heating emissions.', carbonSavings: 1.2, difficulty: 'Easy', frequency: 'Daily', completed: false, category: 'water' },
  { id: 't5', title: 'Cold Water Laundry Wash', description: 'Wash clothes at 30°C or cold to save electricity used for heating water.', carbonSavings: 0.6, difficulty: 'Easy', frequency: 'Weekly', completed: false, category: 'electricity' },
  { id: 't6', title: 'Complete Zero Waste Day', description: 'Avoid single-use plastics and compost all organic waste today.', carbonSavings: 1.8, difficulty: 'Hard', frequency: 'Weekly', completed: false, category: 'waste' },
  { id: 't7', title: 'Meat-Free Week', description: 'Eat no meat products for seven consecutive days.', carbonSavings: 18.0, difficulty: 'Hard', frequency: 'Weekly', completed: false, category: 'food' },
  { id: 't8', title: 'Install Water-Saving Aerators', description: 'Equip kitchen and bathroom faucets with aerators to restrict flow rate.', carbonSavings: 12.0, difficulty: 'Medium', frequency: 'Monthly', completed: false, category: 'water' },
  { id: 't9', title: 'Plan an Electric-Only Travel Month', description: 'Ensure all personal journeys are done by walking, biking, or electric train/bus.', carbonSavings: 75.0, difficulty: 'Hard', frequency: 'Yearly', completed: false, category: 'transportation' },
  { id: 't10', title: 'Upgrade 10 Bulbs to LED', description: 'Replace old incandescent lightbulbs with energy-efficient LED alternatives.', carbonSavings: 15.0, difficulty: 'Medium', frequency: 'Monthly', completed: false, category: 'electricity' }
];

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: '7-Day Green Commuter',
    description: 'Leave the car key at home. Use transit, walking, or cycling for all trips over 7 days.',
    durationDays: 7,
    xpReward: 350,
    requirements: ['No car trips', 'Log daily transit or walking'],
    progress: 4,
    active: true,
    completed: false,
    badgeId: 'green_commuter'
  },
  {
    id: 'c2',
    title: '30-Day Zero-Waste Warrior',
    description: 'Compost organic waste, recycle all paper/plastics, and completely avoid single-use plastics.',
    durationDays: 30,
    xpReward: 1200,
    requirements: ['Zero single-use plastic', 'Sort all recyclables', 'Compost organic waste'],
    progress: 12,
    active: true,
    completed: false,
    badgeId: 'waste_warrior'
  },
  {
    id: 'c3',
    title: 'Veggie Power Month',
    description: 'Commit to a fully vegetarian diet for a whole month to slash agricultural emissions.',
    durationDays: 30,
    xpReward: 1000,
    requirements: ['Eat plant-based meals only'],
    progress: 0,
    active: false,
    completed: false,
    badgeId: 'veggie_hero'
  }
];

const INITIAL_PROFILE: UserProfile = {
  uid: 'user_firebase_id_123',
  displayName: 'Alex Eco-Warrior',
  level: 3,
  xp: 1450,
  streakDays: 6,
  badges: ['eco_pioneer', 'water_guard'],
  assessmentData: DEFAULT_ASSESSMENT,
  assessmentResult: calculateCarbonFootprint(DEFAULT_ASSESSMENT),
  actions: INITIAL_TASKS,
  activeChallenges: INITIAL_CHALLENGES,
  completedChallenges: [],
  totalCo2Saved: 84.5,
  balanceCo2Offset: 250, // 250 kg offset purchased
  customApiKey: ''
};

const DEFAULT_NOTIFS: NotificationMsg[] = [
  { id: 'n1', message: 'Welcome to EcoTracker AI! Complete your Assessment to start.', type: 'info', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), read: false },
  { id: 'n2', message: 'Green Commuter Challenge: Day 4 of 7 completed! Keep going.', type: 'success', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), read: false },
  { id: 'n3', message: 'Great job! You saved 4.5kg of CO2 today by carpooling.', type: 'success', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), read: true }
];

export function getProfile(): UserProfile {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    saveProfile(INITIAL_PROFILE);
    return INITIAL_PROFILE;
  }
  try {
    const parsed = JSON.parse(data);
    // Ensure nested objects exist
    if (!parsed.actions) parsed.actions = INITIAL_TASKS;
    if (!parsed.activeChallenges) parsed.activeChallenges = INITIAL_CHALLENGES;
    return parsed;
  } catch (e) {
    return INITIAL_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  // Dispatch custom event to notify React components of state changes
  window.dispatchEvent(new Event('ecotracker_profile_update'));
}

export function resetProfile(): UserProfile {
  saveProfile(INITIAL_PROFILE);
  saveNotifications(DEFAULT_NOTIFS);
  return INITIAL_PROFILE;
}

export function updateAssessment(data: CarbonAssessment): UserProfile {
  const profile = getProfile();
  const result = calculateCarbonFootprint(data);
  profile.assessmentData = data;
  profile.assessmentResult = result;
  
  // Award XP for updating footprint
  addXp(profile, 150, 'Updated carbon footprint assessment');
  saveProfile(profile);
  addNotification('Assessment updated! +150 XP awarded.', 'success');
  return profile;
}

export function toggleActionTask(taskId: string): UserProfile {
  const profile = getProfile();
  const task = profile.actions.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    if (task.completed) {
      profile.totalCo2Saved += task.carbonSavings;
      const xpGain = task.difficulty === 'Easy' ? 25 : task.difficulty === 'Medium' ? 50 : 100;
      addXp(profile, xpGain, `Completed task: ${task.title}`);
      
      // Update streak if a daily task is completed
      if (task.frequency === 'Daily') {
        // Increment streak if not already updated today (mocked simplicity)
        // Check if there is already a green streak update today
      }

      addNotification(`Completed: "${task.title}". Saved ${task.carbonSavings.toFixed(1)}kg CO2! +${xpGain} XP`, 'success');
    } else {
      profile.totalCo2Saved = Math.max(0, profile.totalCo2Saved - task.carbonSavings);
    }
    saveProfile(profile);
  }
  return profile;
}

export function updateChallengeProgress(challengeId: string, daysToAdd: number): UserProfile {
  const profile = getProfile();
  const challenge = profile.activeChallenges.find(c => c.id === challengeId);
  if (challenge && !challenge.completed) {
    challenge.progress = Math.min(challenge.durationDays, challenge.progress + daysToAdd);
    if (challenge.progress === challenge.durationDays) {
      challenge.completed = true;
      profile.completedChallenges.push(challenge.id);
      addXp(profile, challenge.xpReward, `Completed challenge: ${challenge.title}`);
      if (challenge.badgeId && !profile.badges.includes(challenge.badgeId)) {
        profile.badges.push(challenge.badgeId);
        addNotification(`New Badge Unlocked: ${challenge.badgeId.replace('_', ' ').toUpperCase()}!`, 'success');
      }
      addNotification(`Challenge Completed: ${challenge.title}! +${challenge.xpReward} XP`, 'success');
    }
    saveProfile(profile);
  }
  return profile;
}

export function buyOffset(projectId: string, amountDollars: number, co2OffsetPerDollar: number): UserProfile {
  const profile = getProfile();
  const co2Offset = amountDollars * co2OffsetPerDollar;
  profile.balanceCo2Offset += co2Offset;
  
  // Award XP for supporting sustainability projects
  const xpReward = Math.round(amountDollars * 10);
  addXp(profile, xpReward, `Offset ${co2Offset.toFixed(0)}kg CO2 through funding`);
  
  saveProfile(profile);
  addNotification(`Successfully contributed $${amountDollars}! Offset ${co2Offset.toFixed(0)}kg CO2. +${xpReward} XP`, 'success');
  return profile;
}

export function addXp(profile: UserProfile, amount: number, reason: string) {
  profile.xp += amount;
  // level system: each level requires level * 1000 XP (e.g. Level 1 needs 1000XP, Level 2 needs 2000XP etc)
  // Let's implement an exponential or linear scale: Level Up at each 1000 XP for simplicity
  const xpRequiredForNextLevel = profile.level * 800;
  if (profile.xp >= xpRequiredForNextLevel) {
    profile.level += 1;
    profile.xp = profile.xp - xpRequiredForNextLevel;
    profile.streakDays += 1; // bonus streak!
    addNotification(`LEVEL UP! You are now Level ${profile.level}! 🎉`, 'success');
  }
}

export function setApiKey(key: string): UserProfile {
  const profile = getProfile();
  profile.customApiKey = key;
  saveProfile(profile);
  addNotification('Gemini API key updated successfully.', 'success');
  return profile;
}

// Notifications API
export function getNotifications(): NotificationMsg[] {
  const notifsStr = localStorage.getItem(NOTIFS_KEY);
  if (!notifsStr) {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(DEFAULT_NOTIFS));
    return DEFAULT_NOTIFS;
  }
  try {
    return JSON.parse(notifsStr);
  } catch (e) {
    return DEFAULT_NOTIFS;
  }
}

export function saveNotifications(notifs: NotificationMsg[]): void {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new Event('ecotracker_notifications_update'));
}

export function addNotification(message: string, type: NotificationMsg['type'] = 'info'): void {
  const notifs = getNotifications();
  const newNotif: NotificationMsg = {
    id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false
  };
  saveNotifications([newNotif, ...notifs].slice(0, 25)); // Cap at 25 notifications
}

export function markNotificationsAsRead(): void {
  const notifs = getNotifications();
  const updated = notifs.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function clearNotifications(): void {
  saveNotifications([]);
}
