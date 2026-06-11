import React, { useState } from 'react';
import { BookOpen, HelpCircle, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { getProfile, saveProfile, addNotification } from '../services/db';
import { useVoiceGuidance } from './VoiceGuidance';
import { UserProfile } from '../types';

interface LearningCard {
  id: string;
  title: string;
  excerpt: string;
  details: string;
  quizQuestion: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const CARDS: LearningCard[] = [
  {
    id: 'l1',
    title: 'Climate Change Basics',
    excerpt: 'Understand greenhouse gases and how human activity drives temperature rises.',
    details: 'Greenhouse gases like CO2 and methane trap solar heat in Earth\'s atmosphere. Carbon dioxide concentrations have risen from 280ppm to over 420ppm since the industrial revolution, driving global temperature increases.',
    quizQuestion: 'Which greenhouse gas is primarily released by burning fossil fuels like coal, oil, and gas?',
    options: ['Nitrous Oxide', 'Carbon Dioxide', 'Argon'],
    correctIndex: 1,
    explanation: 'Carbon Dioxide (CO2) accounts for about 76% of global greenhouse gas emissions, mostly from combustion.'
  },
  {
    id: 'l2',
    title: 'Carbon Footprint Explained',
    excerpt: 'Learn about direct and indirect emissions from daily consumption choices.',
    details: 'A carbon footprint is the total greenhouse gas emissions caused by an individual, event, or product. It is split into Scope 1 (direct burning like driving a car) and Scope 2/3 (indirect like electricity or goods production).',
    quizQuestion: 'What is typically the highest carbon footprint category for an average commuter?',
    options: ['Daily Transportation', 'Waste Generation', 'Water Consumption'],
    correctIndex: 0,
    explanation: 'Transportation averages over 40% of individual carbon footprints due to gasoline burning in passenger vehicles.'
  },
  {
    id: 'l3',
    title: 'Renewable Energy Systems',
    excerpt: 'Discover the carbon savings from solar, wind, and smart battery grids.',
    details: 'Renewable energy systems harness natural flows (solar radiation, wind currents) to produce power without burning carbon. Switching to clean energy grid options reduces household Scope 2 emissions to virtually zero.',
    quizQuestion: 'Which clean energy resource utilizes photovoltaic cells to capture solar radiation?',
    options: ['Geothermal', 'Solar Power', 'Nuclear Fission'],
    correctIndex: 1,
    explanation: 'Solar photovoltaic grids convert sunlight directly into clean grid electricity, bypassing carbon combustion.'
  },
  {
    id: 'l4',
    title: 'Sustainable Living Habits',
    excerpt: 'Quick actions you can take today to conserve heat and electricity.',
    details: 'Small micro-habits collectively have massive carbon savings. Using cold water cycles for laundry, turning off heating in empty rooms, and unplugging standby chargers eliminates unnecessary phantom loads.',
    quizQuestion: 'What laundry wash setting saves the most carbon heating energy?',
    options: ['Hot Wash (60°C)', 'Warm Wash (40°C)', 'Cold Wash (30°C or below)'],
    correctIndex: 2,
    explanation: 'Up to 90% of washing machine energy is consumed heating water. Cold wash cycles eliminate this carbon draw.'
  },
  {
    id: 'l5',
    title: 'Waste Reduction & Circularity',
    excerpt: 'Prevent methane leaks in local landfills through compost and sorting.',
    details: 'When organic waste (food scraps, paper) degrades in oxygen-poor landfills, it releases methane (CH4), a greenhouse gas 28x more potent than CO2. Composting ensures aerobic decomposition, venting only biogenic CO2.',
    quizQuestion: 'Approximately how long does a plastic water bottle take to decompose in a landfill?',
    options: ['10 Years', '450 Years', '100 Years'],
    correctIndex: 1,
    explanation: 'Petroleum-based plastics do not biodegrade. They break into microplastics over 450+ years, leaking carbon.'
  },
  {
    id: 'l6',
    title: 'Water Conservation Energy',
    excerpt: 'Conserving water saves chemical treatment and carbon energy costs.',
    details: 'Pumping, treating, and heating municipal water demands massive grid electricity. Using low-flow showerheads and fixing leaky pipes reduces the utility load, directly saving energy carbon.',
    quizQuestion: 'Installing a water-saving faucet aerator reduces bathroom water consumption by about what percent?',
    options: ['5%', '10%', '20% to 30%'],
    correctIndex: 2,
    explanation: 'Faucet aerators mix air with water stream, reducing flow rate by 20-30% without affecting output pressure.'
  }
];

interface LearningHubProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const LearningHub: React.FC<LearningHubProps> = ({ profile, setProfile }) => {
  const { speak } = useVoiceGuidance();
  const [selectedCard, setSelectedCard] = useState<LearningCard | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>(() => {
    const data = localStorage.getItem('ecotracker_completed_quizzes');
    return data ? JSON.parse(data) : [];
  });

  const handleOpenCard = (card: LearningCard) => {
    setSelectedCard(card);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    speak(`Opened article: ${card.title}. Read the details and test your knowledge with the mini-quiz.`);
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    speak(`Selected answer: ${selectedCard?.options[index]}`);
  };

  const handleSubmitQuiz = () => {
    if (!selectedCard || selectedAnswer === null) return;
    setQuizSubmitted(true);
    
    if (selectedAnswer === selectedCard.correctIndex) {
      speak(`Correct answer! ${selectedCard.explanation}`);
      if (!completedQuizzes.includes(selectedCard.id)) {
        const nextCompleted = [...completedQuizzes, selectedCard.id];
        setCompletedQuizzes(nextCompleted);
        localStorage.setItem('ecotracker_completed_quizzes', JSON.stringify(nextCompleted));

        // Award XP
        const updatedProfile = { ...profile };
        updatedProfile.xp += 50;
        const xpNeeded = updatedProfile.level * 800;
        if (updatedProfile.xp >= xpNeeded) {
          updatedProfile.level += 1;
          updatedProfile.xp -= xpNeeded;
          addNotification(`LEVEL UP! You are now Level ${updatedProfile.level}! 🎉`, 'success');
        }
        saveProfile(updatedProfile);
        setProfile(updatedProfile);
        addNotification(`Quiz Passed! +50 XP awarded for: ${selectedCard.title}`, 'success');
      }
    } else {
      speak(`Incorrect answer. The correct answer was ${selectedCard.options[selectedCard.correctIndex]}. ${selectedCard.explanation}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quiz / Details Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-eco-800/80 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-sm bg-dark-950 px-3 py-1.5 rounded-xl border border-slate-800"
              aria-label="Close dialog"
            >
              Close
            </button>

            <div>
              <span className="text-[10px] font-bold text-eco-400 uppercase tracking-widest flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Educational Card
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{selectedCard.title}</h2>
            </div>

            <div className="bg-dark-950/60 p-4 rounded-2xl border border-slate-800/60 text-slate-300 text-xs leading-relaxed font-semibold">
              {selectedCard.details}
            </div>

            {/* Quiz Section */}
            <div className="border-t border-slate-800/80 pt-4 space-y-3">
              <h3 className="text-xs font-bold text-google-yellow flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Mini-Quiz Challenge
              </h3>
              
              <p className="text-xs font-bold text-white">{selectedCard.quizQuestion}</p>

              <div className="space-y-2">
                {selectedCard.options.map((opt, idx) => (
                  <button
                    key={opt}
                    disabled={quizSubmitted}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedAnswer === idx 
                        ? 'bg-eco-600/20 border-eco-500 text-white' 
                        : 'bg-dark-950/30 border-slate-800/50 text-slate-450 text-slate-400 hover:bg-dark-950/50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswer === null}
                  className="w-full bg-eco-600 hover:bg-eco-500 disabled:bg-slate-700 text-dark-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-eco-950/20"
                >
                  Submit Answer (+50 XP)
                </button>
              ) : (
                <div className="space-y-3">
                  {selectedAnswer === selectedCard.correctIndex ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4 shrink-0" /> Correct! {selectedCard.explanation}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/30 border border-red-900/30 text-red-400 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" /> Incorrect. {selectedCard.explanation}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="w-full bg-dark-950 hover:bg-dark-800 text-white border border-slate-800 font-bold py-2.5 rounded-xl text-xs transition-all"
                  >
                    Finish Article
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CARDS.map(card => {
          const isPassed = completedQuizzes.includes(card.id);
          return (
            <div
              key={card.id}
              onClick={() => handleOpenCard(card)}
              className="glass-panel glass-panel-hover rounded-3xl p-5 border border-eco-900/40 cursor-pointer flex flex-col justify-between h-52 group relative"
            >
              {isPassed && (
                <div className="absolute top-4 right-4 bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Award className="w-3 h-3" /> Passed
                </div>
              )}

              <div className="space-y-2.5">
                <span className="text-[9px] font-extrabold text-eco-400 uppercase tracking-widest">
                  Topic Module
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-eco-400 transition-colors leading-tight">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {card.excerpt}
                </p>
              </div>

              <div className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1 mt-3">
                Click to Read & Quiz <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
