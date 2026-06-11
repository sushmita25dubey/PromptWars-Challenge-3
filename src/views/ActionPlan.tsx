import React from 'react';
import { 
  CheckSquare, 
  Flame, 
  Award, 
  Calendar, 
  CheckCircle, 
  ShieldAlert, 
  Zap, 
  ChevronRight,
  TrendingDown,
  Lock
} from 'lucide-react';
import { toggleActionTask, updateChallengeProgress } from '../services/db';
import { useVoiceGuidance } from '../components/VoiceGuidance';
import { UserProfile, ActionPlanTask } from '../types';

interface ActionPlanProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const BADGES = [
  { id: 'eco_pioneer', name: 'Eco Pioneer', desc: 'Completed your first carbon footprint assessment.', icon: '🌱' },
  { id: 'water_guard', name: 'Water Guard', desc: 'Saved 50kg of hot shower carbon emissions.', icon: '💧' },
  { id: 'green_commuter', name: 'Green Commuter', desc: 'Completed the 7-Day commute challenge.', icon: '🚲' },
  { id: 'waste_warrior', name: 'Waste Warrior', desc: 'Completed the 30-Day Zero-Waste challenge.', icon: '♻️' }
];

export const ActionPlan: React.FC<ActionPlanProps> = ({ profile, setProfile }) => {
  const { speak } = useVoiceGuidance();
  
  const tasks = profile.actions || [];
  const activeChallenges = profile.activeChallenges || [];

  const handleToggleTask = (task: ActionPlanTask) => {
    const updated = toggleActionTask(task.id);
    setProfile(updated);
    speak(task.completed 
      ? `Task marked incomplete: ${task.title}` 
      : `Marked task complete: ${task.title}. Saved ${task.carbonSavings} kilograms of carbon.`
    );
  };

  const handleChallengeProgress = (challengeId: string) => {
    const updated = updateChallengeProgress(challengeId, 1);
    setProfile(updated);
    speak(`Logged daily progress for challenge.`);
  };

  // Group tasks by frequency
  const dailyTasks = tasks.filter(t => t.frequency === 'Daily');
  const weeklyTasks = tasks.filter(t => t.frequency === 'Weekly');
  const monthlyTasks = tasks.filter(t => t.frequency === 'Monthly');
  
  // Progress calculations
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const taskCompletionPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6" id="eco-action-plan">
      
      {/* Overview HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Progress Card */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-eco-900/40 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] text-eco-400 bg-eco-950 border border-eco-900/40 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Goal Tracking
            </span>
            <h2 className="text-xl font-bold text-white mt-2">Personalized Action Progression</h2>
            <p className="text-xs text-slate-400 max-w-sm">Complete tasks and challenges to decrease your carbon footprint rating.</p>
          </div>

          {/* Progress Circular HUD */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center relative shadow-inner">
              {/* Simple Text representation or svg circular stroke */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="40" 
                  cy="40" 
                  r="34" 
                  stroke="#10b981" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="213.6"
                  strokeDashoffset={213.6 - (213.6 * taskCompletionPct) / 100}
                />
              </svg>
              <span className="text-sm font-black text-white z-10">{taskCompletionPct}%</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-350">{completedTasksCount}/{totalTasksCount} Goals Met</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">+{profile.totalCo2Saved.toFixed(1)}kg CO2 Saved</div>
            </div>
          </div>
        </div>

        {/* User Streak Helper Box */}
        <div className="lg:col-span-4 bg-orange-950/20 border border-orange-900/45 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-orange-950 border border-orange-850 rounded-2xl text-orange-400">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </div>
            <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider bg-orange-950 border border-orange-900/40 px-2 py-0.5 rounded-full">
              Streak Active
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-black text-white">{profile.streakDays} Days</div>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Keep checking off daily tasks to maintain your Green Streak!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Tasks Lists */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Daily Checklist */}
          <div className="glass-panel rounded-3xl p-5 border border-eco-900/40 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-google-yellow" /> Daily Habit Checklist
            </h3>
            
            <div className="space-y-2.5">
              {dailyTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => handleToggleTask(task)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                    task.completed 
                      ? 'bg-eco-600/10 border-eco-555 border-eco-400/40 text-slate-400' 
                      : 'bg-dark-950/40 border-slate-900/60 hover:bg-dark-950/60 text-slate-200'
                  }`}
                  aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      task.completed ? 'bg-eco-600 border-eco-600 text-dark-950' : 'border-slate-600'
                    }`}>
                      {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    
                    <div className="min-w-0">
                      <div className={`text-xs font-bold ${task.completed ? 'line-through' : ''}`}>{task.title}</div>
                      <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{task.description}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className={`text-[10px] font-extrabold ${task.completed ? 'text-slate-500' : 'text-emerald-400'}`}>
                      -{task.carbonSavings} kg
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Weekly / Monthly Goals */}
          <div className="glass-panel rounded-3xl p-5 border border-eco-900/40 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-google-blue" /> Weekly & Monthly Milestones
            </h3>
            
            <div className="space-y-2.5">
              {[...weeklyTasks, ...monthlyTasks].map(task => (
                <button
                  key={task.id}
                  onClick={() => handleToggleTask(task)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                    task.completed 
                      ? 'bg-eco-600/10 border-eco-555 border-eco-400/40 text-slate-400' 
                      : 'bg-dark-950/40 border-slate-900/60 hover:bg-dark-950/60 text-slate-200'
                  }`}
                  aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      task.completed ? 'bg-eco-600 border-eco-600 text-dark-950' : 'border-slate-600'
                    }`}>
                      {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                        <span className="text-[8px] bg-dark-900 border border-slate-800 text-slate-400 px-1 py-0.2 rounded font-semibold uppercase">{task.frequency}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{task.description}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className={`text-[10px] font-extrabold ${task.completed ? 'text-slate-500' : 'text-emerald-400'}`}>
                      -{task.carbonSavings} kg
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Active Challenges & Badges Showcase */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Challenges */}
          <div className="glass-panel rounded-3xl p-5 border border-eco-900/40 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-eco-400" /> Active Eco Challenges
            </h3>
            
            <div className="space-y-4">
              {activeChallenges.map(c => (
                <div key={c.id} className="p-4 bg-dark-950/60 border border-slate-900/80 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">{c.title}</div>
                      <div className="text-[9px] text-slate-500 mt-1 font-semibold leading-normal">{c.description}</div>
                    </div>
                    <span className="text-[9px] text-google-yellow font-bold uppercase shrink-0">+{c.xpReward} XP</span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Days Logged</span>
                      <span>{c.progress} / {c.durationDays} days</span>
                    </div>

                    <div className="bg-dark-900 h-2 rounded-full overflow-hidden border border-slate-900/80 p-0.5">
                      <div 
                        className="bg-gradient-to-r from-eco-555 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(c.progress / c.durationDays) * 100}%` }}
                      />
                    </div>
                  </div>

                  {!c.completed ? (
                    <button
                      onClick={() => handleChallengeProgress(c.id)}
                      className="w-full bg-dark-900 hover:bg-dark-800 border border-slate-800 text-[10px] text-white font-bold py-1.5 px-3 rounded-lg transition-all"
                    >
                      Log Daily Action Progress
                    </button>
                  ) : (
                    <div className="text-center text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Challenge Completed! Badge unlocked.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Badges Unlock Gallery */}
          <div className="glass-panel rounded-3xl p-5 border border-eco-900/40 space-y-4">
            <h3 className="text-sm font-bold text-white">Unlocked Achievement Badges</h3>
            
            <div className="grid grid-cols-4 gap-2.5">
              {BADGES.map(badge => {
                const isUnlocked = profile.badges.includes(badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 relative group ${
                      isUnlocked 
                        ? 'bg-eco-600/10 border-eco-400 text-white' 
                        : 'bg-dark-950/20 border-slate-900/60 opacity-30 text-slate-600'
                    }`}
                    title={`${badge.name}: ${badge.desc} (${isUnlocked ? 'Unlocked' : 'Locked'})`}
                  >
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="text-[8px] font-bold truncate w-full">{badge.name}</div>
                    
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-dark-950/65 rounded-2xl flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
