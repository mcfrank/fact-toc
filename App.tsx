import React, { useState, useCallback } from 'react';
import { FactData, AppState, InteractionStage, FactComplexity } from './types';
import { fetchFact } from './services/geminiService';
import FactCard from './components/FactCard';
import Button from './components/Button';
import ExitScreen from './components/ExitScreen';
import StartScreen from './components/StartScreen';
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, XCircle, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  // Start at the START_SCREEN
  const [appState, setAppState] = useState<AppState>(AppState.START_SCREEN);
  const [factData, setFactData] = useState<FactData | null>(null);
  const [interactionStage, setInteractionStage] = useState<InteractionStage>(InteractionStage.DID_YOU_KNOW);
  const [userKnewIt, setUserKnewIt] = useState<boolean>(false);
  
  // Track current topic to request "more" about it
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const loadFact = useCallback(async (topic: string | null, complexity: FactComplexity) => {
    setAppState(AppState.LOADING);
    const data = await fetchFact(topic, complexity);
    setFactData(data);
    setCurrentTopic(data.domain);
    setInteractionStage(InteractionStage.DID_YOU_KNOW);
    setAppState(AppState.SHOWING_FACT);
  }, []);

  const handleStartSelection = (domain: string) => {
    loadFact(domain, FactComplexity.SIMPLE);
  };

  const handleKnowledgeCheck = (knewIt: boolean) => {
    setUserKnewIt(knewIt);
    setInteractionStage(InteractionStage.WHAT_NEXT);
  };

  const handleNextStep = (action: 'more' | 'new' | 'done') => {
    if (action === 'done') {
      setAppState(AppState.EXIT);
    } else if (action === 'new') {
      // "New topic" loads a random domain (passing null)
      loadFact(null, FactComplexity.SIMPLE);
    } else if (action === 'more') {
      // If they knew it (Yes), give a complex fact.
      // If they didn't know it (No), give another simple/regular fact.
      const complexity = userKnewIt ? FactComplexity.COMPLEX : FactComplexity.SIMPLE;
      loadFact(currentTopic, complexity);
    }
  };

  if (appState === AppState.START_SCREEN) {
    return <StartScreen onSelectDomain={handleStartSelection} />;
  }

  if (appState === AppState.EXIT) {
    return <ExitScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-6 font-fredoka">
      <div className="max-w-2xl w-full h-[85vh] md:h-[90vh] flex flex-col gap-4">
        
        {/* Top Slot: Fact Card */}
        <div className="flex-grow relative basis-2/3">
          {appState === AppState.LOADING ? (
            <div className="w-full h-full flex flex-col justify-center items-center bg-white rounded-3xl shadow-lg animate-pulse">
              <Sparkles className="w-16 h-16 text-yellow-400 animate-spin mb-4" />
              <p className="text-2xl text-gray-400 font-bold">Thinking...</p>
            </div>
          ) : (
             factData && <FactCard data={factData} />
          )}
        </div>

        {/* Bottom Slot: Question/Control */}
        <div className="basis-1/3 min-h-[220px] bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          {appState === AppState.LOADING ? (
            <div className="text-gray-400">Wait for it...</div>
          ) : (
            <div className="w-full h-full flex flex-col justify-center">
              {interactionStage === InteractionStage.DID_YOU_KNOW ? (
                // Step 1: Did you know?
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Did you know that?
                  </h2>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="primary" 
                      onClick={() => handleKnowledgeCheck(true)}
                      className="flex-1 max-w-[160px]"
                    >
                      <ThumbsUp size={24} /> Yes!
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleKnowledgeCheck(false)}
                      className="flex-1 max-w-[160px]"
                    >
                      <ThumbsDown size={24} /> No
                    </Button>
                  </div>
                </div>
              ) : (
                // Step 2: What Next?
                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300 w-full">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    What next?
                  </h2>
                  <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
                    <Button 
                      variant="accent" 
                      fullWidth 
                      onClick={() => handleNextStep('more')}
                    >
                      <BookOpen size={24} /> More about this topic
                    </Button>
                    <div className="flex gap-3">
                      <Button 
                        variant="primary" 
                        fullWidth 
                        onClick={() => handleNextStep('new')}
                        className="bg-emerald-400 hover:bg-emerald-500 border-emerald-600"
                      >
                        <RefreshCw size={24} /> New Topic
                      </Button>
                      <Button 
                        variant="danger" 
                        fullWidth 
                        onClick={() => handleNextStep('done')}
                      >
                        <XCircle size={24} /> Done
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;