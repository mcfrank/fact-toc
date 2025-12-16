import React, { useState, useCallback } from 'react';
import { FactData, AppState, InteractionStage, FactComplexity, DOMAINS, HistoryItem } from './types';
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
  
  // History and Session State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [visitedDomains, setVisitedDomains] = useState<Set<string>>(new Set());
  
  // Track current topic to request "more" about it
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const loadFact = useCallback(async (topic: string, complexity: FactComplexity, currentHistory: HistoryItem[]) => {
    setAppState(AppState.LOADING);
    const data = await fetchFact(topic, complexity, currentHistory);
    
    setFactData(data);
    setCurrentTopic(data.domain);
    setInteractionStage(InteractionStage.DID_YOU_KNOW);
    setAppState(AppState.SHOWING_FACT);
  }, []);

  const handleStartSelection = (domain: string) => {
    const newVisited = new Set(visitedDomains);
    newVisited.add(domain);
    setVisitedDomains(newVisited);
    loadFact(domain, FactComplexity.SIMPLE, history);
  };

  const handleKnowledgeCheck = (knewIt: boolean) => {
    setUserKnewIt(knewIt);
    
    // Add current fact to history now that we have user feedback
    if (factData) {
      setHistory(prev => [
        ...prev, 
        { 
          fact: factData.fact, 
          domain: factData.domain, 
          userKnewIt: knewIt 
        }
      ]);
    }

    setInteractionStage(InteractionStage.WHAT_NEXT);
  };

  const handleNextStep = (action: 'more' | 'new' | 'done') => {
    if (action === 'done') {
      setAppState(AppState.EXIT);
    } else if (action === 'new') {
      // Find domains we haven't visited yet
      const availableDomains = DOMAINS.filter(d => !visitedDomains.has(d));
      
      if (availableDomains.length > 0) {
        // Pick a random available domain
        const nextDomain = availableDomains[Math.floor(Math.random() * availableDomains.length)];
        
        // Mark as visited
        const newVisited = new Set(visitedDomains);
        newVisited.add(nextDomain);
        setVisitedDomains(newVisited);

        loadFact(nextDomain, FactComplexity.SIMPLE, history);
      } else {
        // Should not happen if button is disabled, but fallback just in case
        console.warn("All domains visited");
      }
    } else if (action === 'more') {
      if (currentTopic) {
        // If they knew it (Yes), give a complex fact.
        // If they didn't know it (No), give another simple/regular fact.
        const complexity = userKnewIt ? FactComplexity.COMPLEX : FactComplexity.SIMPLE;
        loadFact(currentTopic, complexity, history);
      }
    }
  };

  // Check if "New Topic" should be enabled
  const hasMoreDomains = visitedDomains.size < DOMAINS.length;

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
                        disabled={!hasMoreDomains}
                        className={`
                          ${hasMoreDomains 
                            ? 'bg-emerald-400 hover:bg-emerald-500 border-emerald-600' 
                            : 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed transform-none'}
                        `}
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