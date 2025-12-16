import React from 'react';
import { DOMAINS } from '../types';

interface StartScreenProps {
  onSelectDomain: (domain: string) => void;
}

// Visual configuration for the start cards
const DOMAIN_CONFIG: Record<string, { emoji: string; color: string; border: string }> = {
  'Space': { emoji: '🚀', color: 'bg-indigo-100 hover:bg-indigo-200', border: 'border-indigo-300' },
  'Animals': { emoji: '🦁', color: 'bg-orange-100 hover:bg-orange-200', border: 'border-orange-300' },
  'Machines': { emoji: '🤖', color: 'bg-slate-100 hover:bg-slate-200', border: 'border-slate-300' },
  'Outdoors': { emoji: '🌲', color: 'bg-emerald-100 hover:bg-emerald-200', border: 'border-emerald-300' },
};

const StartScreen: React.FC<StartScreenProps> = ({ onSelectDomain }) => {
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-6 font-fredoka">
      <div className="max-w-4xl w-full flex flex-col items-center">
        
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="text-6xl mb-4">👋</div>
          <h1 className="text-4xl md:text-5xl font-bold text-sky-900 mb-2">Welcome!</h1>
          <p className="text-xl md:text-2xl text-sky-700 font-medium">Where do you want to start?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-2xl">
          {DOMAINS.map((domain, index) => {
            const config = DOMAIN_CONFIG[domain] || { emoji: '❓', color: 'bg-gray-100', border: 'border-gray-200' };
            const delayClass = index === 0 ? 'delay-0' : index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : 'delay-300';
            
            return (
              <button
                key={domain}
                onClick={() => onSelectDomain(domain)}
                className={`
                  ${config.color} ${config.border} border-b-8 
                  aspect-square md:aspect-[4/3] rounded-3xl 
                  flex flex-col items-center justify-center gap-4
                  shadow-lg bouncy transition-all duration-300
                  animate-in zoom-in-50 fill-mode-backwards ${delayClass}
                `}
              >
                <span className="text-5xl md:text-7xl filter drop-shadow-sm">{config.emoji}</span>
                <span className="text-xl md:text-2xl font-bold text-gray-700 tracking-wide uppercase">
                  {domain}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StartScreen;