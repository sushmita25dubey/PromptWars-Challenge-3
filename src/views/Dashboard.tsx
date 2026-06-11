import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingDown, 
  Activity, 
  Globe, 
  ChevronRight, 
  TreePine, 
  Sun, 
  Wind, 
  HeartHandshake,
  Lightbulb,
  Award
} from 'lucide-react';
import { buyOffset } from '../services/db';
import { getEmissionImprovements } from '../services/gemini';
import { EarthSimulator } from '../components/EarthSimulator';
import { Leaderboard } from '../components/Leaderboard';
import { useVoiceGuidance } from '../components/VoiceGuidance';
import { UserProfile, OffsetProject } from '../types';

interface DashboardProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setCurrentTab: (tab: string) => void;
}

const OFFSET_PROJECTS: OffsetProject[] = [
  { id: 'tree', name: 'Himalayan Reforestation', description: 'Plant native broadleaf trees to capture carbon and support soil stabilization.', costPerKg: 0.05, co2OffsetPerDollar: 20, category: 'forestry', impactText: 'Offsets 20kg CO2 per $1' },
  { id: 'solar', name: 'Saharan Solar Microgrid', description: 'Equip remote off-grid communities with clean, reliable photovoltaic power.', costPerKg: 0.07, co2OffsetPerDollar: 14, category: 'solar', impactText: 'Offsets 14kg CO2 per $1' },
  { id: 'wind', name: 'Offshore Wind Expansion', description: 'Fund multi-megawatt offshore turbine installations to displace coal energy.', costPerKg: 0.06, co2OffsetPerDollar: 17, category: 'wind', impactText: 'Offsets 17kg CO2 per $1' },
  { id: 'community', name: 'Clean Cookstove Initiative', description: 'Provide clean combustion biomass cookstoves to families, cutting wood smoke.', costPerKg: 0.04, co2OffsetPerDollar: 25, category: 'community', impactText: 'Offsets 25kg CO2 per $1' }
];

export const Dashboard: React.FC<DashboardProps> = ({ profile, setProfile, setCurrentTab }) => {
  const { speak } = useVoiceGuidance();
  const [dashTab, setDashTab] = useState<'overview' | 'offsets' | 'moonshot'>('overview');
  const [offsetAmounts, setOffsetAmounts] = useState<Record<string, number>>({
    tree: 10,
    solar: 25,
    wind: 50,
    community: 15
  });

  const assessmentResult = profile.assessmentResult;

  // Chart Data Calculations
  const chartData = [
    { name: 'Transportation', value: assessmentResult?.breakdown.transportation || 240 },
    { name: 'Electricity', value: assessmentResult?.breakdown.electricity || 160 },
    { name: 'Food Habits', value: assessmentResult?.breakdown.food || 130 },
    { name: 'Shopping', value: assessmentResult?.breakdown.shopping || 80 },
    { name: 'Waste', value: assessmentResult?.breakdown.waste || 40 },
    { name: 'Water Usage', value: assessmentResult?.breakdown.water || 30 },
  ];

  const trendData = [
    { month: 'Jan', emissions: 720 },
    { month: 'Feb', emissions: 690 },
    { month: 'Mar', emissions: 650 },
    { month: 'Apr', emissions: 610 },
    { month: 'May', emissions: 570 },
    { month: 'Jun', emissions: assessmentResult?.totalMonthlyEmissions || 680 },
  ];

  const COLORS = ['#34A853', '#4285F4', '#FBBC05', '#EA4335', '#a855f7', '#06b6d4'];

  const handleOffsetAmountChange = (projectId: string, amount: number) => {
    setOffsetAmounts(prev => ({
      ...prev,
      [projectId]: Math.max(1, amount)
    }));
  };

  const handleSupportProject = (project: OffsetProject) => {
    const amount = offsetAmounts[project.id] || 10;
    const updated = buyOffset(project.id, amount, project.co2OffsetPerDollar);
    setProfile(updated);
    speak(`Contributed $${amount} to ${project.name}. Thank you for supporting offsets!`);
  };

  const habits = assessmentResult 
    ? getEmissionImprovements(assessmentResult.breakdown) 
    : [
        { category: 'Transportation', percent: 42, suggestion: 'Switch to transit, walking, or hybrid/electric driving' },
        { category: 'Electricity', percent: 25, suggestion: 'Unplug standby devices, switch to LEDs, and buy clean grid energy' },
        { category: 'Food Habits', percent: 18, suggestion: 'Reduce red meat intake and buy organic/local produce' }
      ];

  const handleSpeakHabitReport = () => {
    const reportText = habits.map(h => `${h.category} accounts for ${h.percent} percent. Suggestion: ${h.suggestion}`).join('. ');
    speak(`AI Habit Detector report: ${reportText}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Subheader Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Carbon Analytics Dashboard</h2>
          <p className="text-xs text-slate-400">View carbon footprint metrics, offsite offset projects, and Earth simulations.</p>
        </div>

        {/* Dash Tabs */}
        <div className="flex bg-dark-950 p-1 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => {
              setDashTab('overview');
              speak("Opened Dashboard Overview tab.");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              dashTab === 'overview' 
                ? 'bg-eco-600/20 text-white border border-eco-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics & Habits
          </button>
          <button
            onClick={() => {
              setDashTab('offsets');
              speak("Opened Carbon Offsets project list tab.");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              dashTab === 'offsets' 
                ? 'bg-eco-600/20 text-white border border-eco-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Carbon Offsets
          </button>
          <button
            onClick={() => {
              setDashTab('moonshot');
              speak("Opened Moonshot Earth Simulator tab.");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              dashTab === 'moonshot' 
                ? 'bg-eco-600/20 text-white border border-eco-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Earth Simulator
          </button>
        </div>
      </div>

      {/* Overview Analytics Tab */}
      {dashTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Metrics Summaries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Score */}
            <div className="bg-dark-900 border border-eco-900/40 rounded-3xl p-5 shadow-lg relative overflow-hidden glass-panel">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sustainability Score</div>
              <div className="text-3xl font-black text-emerald-400 mt-2">
                {assessmentResult?.score || '--'}<span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <div className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                Rating: <span className="text-google-yellow">{assessmentResult?.rating || '--'}</span>
              </div>
            </div>

            {/* Monthly footprint */}
            <div className="bg-dark-900 border border-eco-900/40 rounded-3xl p-5 shadow-lg relative overflow-hidden glass-panel">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Monthly Emissions</div>
              <div className="text-3xl font-black text-white mt-2">
                {assessmentResult ? `${assessmentResult.totalMonthlyEmissions} kg` : '--'}
              </div>
              <div className="text-[9px] text-slate-400 font-bold mt-1.5">
                CO2 equivalent output
              </div>
            </div>

            {/* Saved CO2 */}
            <div className="bg-dark-900 border border-eco-900/40 rounded-3xl p-5 shadow-lg relative overflow-hidden glass-panel">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total CO2 Prevented</div>
              <div className="text-3xl font-black text-emerald-400 mt-2">
                {profile.totalCo2Saved.toFixed(1)} kg
              </div>
              <div className="text-[9px] text-slate-400 font-bold mt-1.5">
                Earned from Eco Action tasks
              </div>
            </div>

            {/* Offset bought */}
            <div className="bg-dark-900 border border-eco-900/40 rounded-3xl p-5 shadow-lg relative overflow-hidden glass-panel">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total CO2 Offset</div>
              <div className="text-3xl font-black text-google-blue mt-2">
                {profile.balanceCo2Offset} kg
              </div>
              <div className="text-[9px] text-slate-400 font-bold mt-1.5">
                Funded project contributions
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Monthly Trend Recharts AreaChart */}
            <div className="glass-panel rounded-3xl p-5 border border-eco-900/40">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Monthly Emissions Trend</h3>
                  <p className="text-[10px] text-slate-400">Carbon equivalent footprint progress over 6 months.</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <TrendingDown className="w-3.5 h-3.5" /> -12% overall
                </div>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity="0.4" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: '#0f140d', borderColor: '#10b981', borderRadius: '12px' }}
                      labelStyle={{ color: '#9ca3af', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'extrabold' }}
                    />
                    <Bar dataKey="emissions" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Recharts PieChart */}
            <div className="glass-panel rounded-3xl p-5 border border-eco-900/40">
              <div>
                <h3 className="text-sm font-bold text-white">Carbon Breakdown By Category</h3>
                <p className="text-[10px] text-slate-400">Distribution of monthly carbon emissions by source.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
                <div className="w-44 h-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        contentStyle={{ backgroundColor: '#0f140d', borderColor: '#10b981', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend Details */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs flex-1 min-w-0">
                  {chartData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <div className="truncate text-slate-300 font-semibold">{item.name}</div>
                      <div className="text-white font-extrabold ml-auto">{item.value}kg</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Habit Detector & Leaderboard Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* AI Habit Detector */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-eco-900/40 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-eco-400" /> AI Habit Detector
                  </h3>
                  <button
                    onClick={handleSpeakHabitReport}
                    className="text-[10px] text-eco-400 hover:text-eco-300 font-bold border border-eco-900/40 px-2.5 py-1 rounded-lg hover:bg-eco-600/5 transition-all"
                  >
                    Speak Report
                  </button>
                </div>

                <div className="space-y-4">
                  {habits.map(h => (
                    <div key={h.category} className="space-y-2 border-b border-slate-900/60 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between text-xs font-bold text-white">
                        <span>{h.category} Emissions</span>
                        <span className={h.percent > 30 ? 'text-red-400' : 'text-slate-400'}>{h.percent}%</span>
                      </div>
                      
                      <div className="bg-dark-950 h-2 rounded-full overflow-hidden border border-slate-900 p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            h.percent > 30 ? 'bg-red-400' : 'bg-eco-600'
                          }`}
                          style={{ width: `${h.percent}%` }}
                        />
                      </div>

                      <p className="text-[10px] text-slate-350 leading-relaxed flex items-start gap-1.5 font-semibold">
                        <Lightbulb className="w-3.5 h-3.5 text-google-yellow shrink-0 mt-0.5" />
                        <span>Suggestion: {h.suggestion}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {!assessmentResult && (
                <div className="mt-4 p-4 rounded-2xl bg-dark-950/60 border border-slate-800/80 text-center text-xs">
                  Please complete the assessment to map personal habits.
                </div>
              )}
            </div>

            {/* Quick Leaderboard Display */}
            <div className="lg:col-span-5">
              <Leaderboard profile={profile} />
            </div>
          </div>
        </div>
      )}

      {/* Offsets Shop Tab */}
      {dashTab === 'offsets' && (
        <div className="space-y-6">
          <div className="p-5 bg-dark-900/40 border border-eco-900/30 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-eco-400" /> Carbon Offsetting Projects
              </h3>
              <p className="text-xs text-slate-400">Balance your ecological footprint by financing certified renewable and environmental initiatives.</p>
            </div>
            
            <div className="bg-eco-950/40 border border-eco-555 border-eco-800/80 px-4 py-2.5 rounded-2xl text-xs">
              <span className="text-slate-400 font-medium">Your Active Offsets:</span>
              <span className="text-white font-extrabold ml-1.5">{profile.balanceCo2Offset} kg CO2</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OFFSET_PROJECTS.map(project => {
              const Icon = project.id === 'tree' ? TreePine : project.id === 'solar' ? Sun : project.id === 'wind' ? Wind : Globe;
              const currentAmount = offsetAmounts[project.id] || 10;
              const expectedOffset = currentAmount * project.co2OffsetPerDollar;
              const xpAward = currentAmount * 10;

              return (
                <div 
                  key={project.id}
                  className="glass-panel rounded-3xl p-5 border border-eco-900/40 flex flex-col justify-between h-[280px]"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-eco-950 border border-eco-800 rounded-2xl text-eco-400">
                        <Icon className="w-6 h-6 text-eco-400" />
                      </div>
                      <span className="text-[10px] text-eco-400 bg-eco-950 border border-eco-850 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {project.impactText}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{project.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">{project.description}</p>
                  </div>

                  <div className="border-t border-slate-900/80 pt-4 flex items-center gap-4 justify-between">
                    {/* Amount input */}
                    <div className="flex items-center gap-2 bg-dark-950 px-3.5 py-2 rounded-2xl border border-slate-800/80">
                      <span className="text-slate-500 font-bold text-xs">$</span>
                      <input
                        type="number"
                        min="1"
                        value={currentAmount}
                        onChange={(e) => handleOffsetAmountChange(project.id, Number(e.target.value))}
                        className="w-12 bg-transparent text-white focus:outline-none text-xs font-bold"
                        aria-label={`Offset dollar contribution amount for ${project.name}`}
                      />
                    </div>

                    <div className="text-right leading-tight">
                      <div className="text-xs font-extrabold text-emerald-400">+{expectedOffset} kg CO2</div>
                      <div className="text-[9px] text-slate-500 font-bold mt-1">+{xpAward} XP points</div>
                    </div>

                    <button
                      onClick={() => handleSupportProject(project)}
                      className="bg-eco-600 hover:bg-eco-500 text-dark-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-eco-950/20"
                    >
                      Fund Offset
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Future Earth Moonshot Tab */}
      {dashTab === 'moonshot' && (
        <EarthSimulator assessmentResult={assessmentResult} />
      )}
    </div>
  );
};
