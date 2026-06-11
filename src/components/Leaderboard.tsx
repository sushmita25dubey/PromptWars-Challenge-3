import React, { useState } from 'react';
import { Trophy, ArrowUp, RefreshCw, Star, Medal } from 'lucide-react';
import { UserProfile, LeaderboardUser } from '../types';
import { useVoiceGuidance } from './VoiceGuidance';

interface LeaderboardProps {
  profile: UserProfile;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ profile }) => {
  const { speak } = useVoiceGuidance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate dynamic leaderboard listing current user dynamically
  const getLeaderboardData = (): LeaderboardUser[] => {
    const list: Omit<LeaderboardUser, 'rank'>[] = [
      { name: 'Sophia Green', level: 5, xp: 3950, co2SavedKg: 210.5 },
      { name: 'Ethan Solars', level: 4, xp: 2850, co2SavedKg: 145.0 },
      { 
        name: `${profile.displayName} (You)`, 
        level: profile.level, 
        xp: profile.xp + (profile.level - 1) * 2000, // normalized rank XP
        co2SavedKg: parseFloat((profile.totalCo2Saved + profile.balanceCo2Offset).toFixed(1)),
        isCurrentUser: true
      },
      { name: 'Liam Wind-Power', level: 2, xp: 1200, co2SavedKg: 72.0 },
      { name: 'Mia Bicycle-Hero', level: 2, xp: 950, co2SavedKg: 44.5 }
    ];

    // Sort by CO2 saved + XP score
    return list
      .sort((a, b) => b.co2SavedKg - a.co2SavedKg || b.xp - a.xp)
      .map((user, idx) => ({
        ...user,
        rank: idx + 1
      }));
  };

  const users = getLeaderboardData();

  const handleRefresh = () => {
    setIsRefreshing(true);
    speak("Refreshing community leaderboard.");
    setTimeout(() => {
      setIsRefreshing(false);
      const myRank = users.find(u => u.isCurrentUser)?.rank || 3;
      speak(`Leaderboard synchronized. You are currently ranked number ${myRank} out of 5 eco warriors.`);
    }, 800);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-eco-900/40">
      <div className="flex justify-between items-center border-b border-eco-900/40 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-google-yellow" /> Community Eco Leaderboard
          </h3>
          <p className="text-xs text-slate-400">Compare carbon savings and XP with local community members.</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 bg-dark-950 hover:bg-dark-800 rounded-xl border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-all focus:outline-none"
          aria-label="Refresh leaderboard rankings"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.name}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
              user.isCurrentUser
                ? 'bg-eco-600/10 border-eco-555 border-eco-400 text-white font-bold'
                : 'bg-dark-950/45 border-slate-900/60 text-slate-300'
            }`}
          >
            {/* Rank & Profile Photo Badge */}
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-dark-900/80 border border-slate-800/60 flex items-center justify-center font-extrabold text-xs">
                {user.rank === 1 && <Medal className="w-4 h-4 text-google-yellow" />}
                {user.rank === 2 && <Medal className="w-4 h-4 text-slate-350" />}
                {user.rank === 3 && !user.isCurrentUser && <Medal className="w-4 h-4 text-orange-400" />}
                {((user.rank > 3) || (user.rank === 3 && user.isCurrentUser)) && <span>{user.rank}</span>}
              </div>

              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  {user.name} 
                  {user.isCurrentUser && <span className="text-[9px] bg-eco-600 text-dark-950 font-extrabold px-1.5 py-0.2 rounded uppercase">You</span>}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Level {user.level} Eco-Expert</div>
              </div>
            </div>

            {/* Savings & XP */}
            <div className="text-right">
              <div className="text-xs font-extrabold text-emerald-400">{user.co2SavedKg.toFixed(1)} kg CO2 saved</div>
              <div className="text-[9px] text-slate-500 font-bold mt-0.5">{user.xp.toLocaleString()} Total XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
