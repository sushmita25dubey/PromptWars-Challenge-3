import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, AlertCircle, Trash2, HelpCircle } from 'lucide-react';
import { askGeminiCoach, ChatMessage } from '../services/gemini';
import { useVoiceGuidance } from '../components/VoiceGuidance';
import { UserProfile } from '../types';

interface AICoachProps {
  profile: UserProfile;
}

const RECOMMENDATIONS = [
  'How can I reduce emissions?',
  'What habits hurt the environment?',
  'Best sustainability practices?',
  'Give me personalized eco advice!'
];

export const AICoach: React.FC<AICoachProps> = ({ profile }) => {
  const { speak } = useVoiceGuidance();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const data = localStorage.getItem('ecotracker_coach_chat');
    if (data) {
      try { return JSON.parse(data); } catch(e) {}
    }
    return [
      {
        role: 'model',
        content: `### Welcome to EcoCoach AI! 🤖🌱

I am your personalized sustainability mentor, powered by **Google Gemini**. 

I can analyze your carbon footprint assessment scores, suggest specific daily tasks, and coach you on climate conservation.

**Try asking me a question or click one of the suggested prompts below!**`
      }
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ecotracker_coach_chat', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;
    
    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputVal('');
    setIsThinking(true);
    speak("Consulting Gemini AI coach");

    try {
      const reply = await askGeminiCoach(
        textToSend,
        messages,
        profile.customApiKey,
        profile.assessmentResult
      );
      setMessages([...nextMessages, { role: 'model', content: reply }]);
      // Optionally speak the introduction of the reply
      const shortSpeech = reply.replace(/[#*`]/g, '').substring(0, 150);
      speak(shortSpeech + "...");
    } catch (e: any) {
      setMessages([...nextMessages, { 
        role: 'model', 
        content: `Sorry, I encountered an issue: ${e.message || 'Unknown network error'}. Please verify your network or Gemini API Key.` 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear chat history?")) {
      const resetMsg: ChatMessage[] = [
        {
          role: 'model',
          content: 'Chat cleared. Ask me any sustainability questions!'
        }
      ];
      setMessages(resetMsg);
      speak("Chat history cleared.");
    }
  };

  // Simple Markdown to HTML formatter
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} className="text-sm font-extrabold text-white mt-4 mb-2 first:mt-0">{trimmed.replace('###', '').trim()}</h4>;
      }
      if (trimmed.startsWith('##')) {
        return <h3 key={idx} className="text-base font-black text-white mt-5 mb-2.5 first:mt-0">{trimmed.replace('##', '').trim()}</h3>;
      }
      if (trimmed.startsWith('#')) {
        return <h2 key={idx} className="text-lg font-black text-white mt-6 mb-3 first:mt-0">{trimmed.replace('#', '').trim()}</h2>;
      }

      // Bullets
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const bulletText = trimmed.substring(1).trim();
        return (
          <li key={idx} className="list-disc list-inside text-xs text-slate-300 ml-2.5 my-1 leading-relaxed font-semibold">
            {formatInlineBold(bulletText)}
          </li>
        );
      }

      // Numbers
      if (/^\d+\./.test(trimmed)) {
        return (
          <div key={idx} className="text-xs text-slate-350 ml-2.5 my-1.5 leading-relaxed font-semibold">
            {formatInlineBold(trimmed)}
          </div>
        );
      }

      // Blank lines
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Normal paragraph
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1.5 font-semibold">
          {formatInlineBold(trimmed)}
        </p>
      );
    });
  };

  const formatInlineBold = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-emerald-400 font-extrabold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="glass-panel rounded-3xl border border-eco-900/40 h-[calc(100vh-12rem)] flex flex-col justify-between overflow-hidden">
      
      {/* Top HUD */}
      <div className="px-6 py-4 bg-dark-950 border-b border-eco-900/40 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-google-blue/15 border border-google-blue/20 rounded-xl text-google-blue animate-pulse-slow">
            <Bot className="w-5 h-5 text-google-blue" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              EcoCoach AI Mentor <Sparkles className="w-3.5 h-3.5 text-eco-400" />
            </h3>
            <p className="text-[10px] text-slate-400">Powered by Google Gemini 1.5 Flash</p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 bg-dark-900 hover:bg-red-950/20 hover:border-red-900/40 text-slate-500 hover:text-red-400 rounded-xl border border-slate-900 transition-all"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat scroll workspace */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* API key fallback notice */}
        {(!profile.customApiKey || profile.customApiKey.length < 10) && (
          <div className="p-3 bg-google-yellow/10 border border-google-yellow/20 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-350 leading-relaxed font-semibold">
            <AlertCircle className="w-4 h-4 text-google-yellow shrink-0 mt-0.5" />
            <div>
              Using local sustainability model. To enable live web replies, configure a custom <strong className="text-white">Gemini API Key</strong> in settings (Accessibility cog in header).
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((m, idx) => {
          const isModel = m.role === 'model';
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-3.5 ${isModel ? 'justify-start' : 'justify-end'}`}
            >
              {isModel && (
                <div className="w-8 h-8 rounded-lg bg-google-blue/15 border border-google-blue/20 text-google-blue flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-google-blue" />
                </div>
              )}

              <div 
                className={`max-w-[75%] rounded-2xl p-4 border text-left ${
                  isModel 
                    ? 'bg-dark-950/40 border-eco-900/35 text-slate-300' 
                    : 'bg-eco-600/10 border-eco-500 text-white'
                }`}
              >
                {isModel ? renderMessageContent(m.content) : <p className="text-xs font-semibold leading-relaxed">{m.content}</p>}
              </div>
            </div>
          );
        })}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex items-start gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-lg bg-google-blue/15 border border-google-blue/20 text-google-blue flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-google-blue" />
            </div>
            <div className="max-w-[100px] rounded-2xl p-3 border bg-dark-950/40 border-eco-900/35 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input controls */}
      <div className="p-4 bg-dark-950 border-t border-eco-900/40 shrink-0 space-y-3">
        {/* Recommended Prompts */}
        {messages.length < 3 && (
          <div className="flex flex-wrap gap-2">
            {RECOMMENDATIONS.map(rec => (
              <button
                key={rec}
                onClick={() => handleSendMessage(rec)}
                className="px-3 py-1.5 bg-dark-900 hover:bg-dark-800 rounded-lg border border-slate-900 text-[10px] text-slate-400 font-bold transition-all"
              >
                {rec}
              </button>
            ))}
          </div>
        )}

        {/* Text Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask EcoCoach: 'How do I cut down electricity?'"
            className="flex-1 bg-dark-900 border border-eco-900/60 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-eco-555"
            aria-label="EcoCoach query text"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isThinking}
            className="bg-eco-600 hover:bg-eco-500 disabled:bg-slate-700 text-dark-950 p-2.5 rounded-xl transition-all shadow-md"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
