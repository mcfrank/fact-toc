import React from 'react';

const ExitScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl border-b-8 border-indigo-100 max-w-lg w-full">
        <div className="text-8xl mb-6">🌟</div>
        <h1 className="text-4xl font-bold text-indigo-900 mb-4">Great Job!</h1>
        <p className="text-xl text-indigo-700 mb-8">
          You learned some amazing things today. Keep being curious!
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="text-indigo-400 font-semibold hover:text-indigo-600 underline"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ExitScreen;