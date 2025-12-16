import React from 'react';
import { FactData } from '../types';

interface FactCardProps {
  data: FactData;
}

const FactCard: React.FC<FactCardProps> = ({ data }) => {
  return (
    <div className={`w-full h-full flex flex-col justify-center items-center p-8 md:p-12 rounded-3xl shadow-xl border-4 border-white/50 ${data.backgroundColor} transition-colors duration-500`}>
      <div className="text-6xl md:text-8xl mb-6 animate-bounce">
        {data.emoji}
      </div>
      <div className="bg-white/60 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider text-gray-600 mb-4 backdrop-blur-sm">
        {data.domain}
      </div>
      <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-800 leading-snug">
        {data.fact}
      </h1>
    </div>
  );
};

export default FactCard;