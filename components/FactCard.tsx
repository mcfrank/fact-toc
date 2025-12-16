import React, { useState, useRef, useEffect } from 'react';
import { FactData } from '../types';
import { Volume2, Loader2, Square } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface FactCardProps {
  data: FactData;
}

const FactCard: React.FC<FactCardProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Refs to manage audio context and source
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Stop audio if the data (fact) changes or component unmounts
  useEffect(() => {
    stopAudio();
    return () => stopAudio();
  }, [data]);

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoadingAudio(true);
    try {
      const base64Audio = await generateSpeech(data.fact);
      
      if (!base64Audio) {
        throw new Error("No audio data received");
      }

      // Initialize Audio Context (must be done after user interaction)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Gemini TTS standard rate
      });
      audioContextRef.current = audioContext;

      // Decode raw PCM
      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioContext,
        24000,
        1
      );

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };

      sourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio playback failed:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col justify-center items-center p-8 md:p-12 rounded-3xl shadow-xl border-4 border-white/50 ${data.backgroundColor} transition-colors duration-500 relative`}>
      
      {/* Play Audio Button */}
      <button 
        onClick={handlePlayAudio}
        disabled={isLoadingAudio}
        className="absolute top-6 right-6 p-3 bg-white/60 hover:bg-white/90 rounded-full shadow-sm backdrop-blur-sm transition-all text-gray-700 disabled:opacity-50"
        aria-label={isPlaying ? "Stop audio" : "Read fact aloud"}
      >
        {isLoadingAudio ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : isPlaying ? (
          <Square className="w-8 h-8 fill-current" />
        ) : (
          <Volume2 className="w-8 h-8" />
        )}
      </button>

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

// --- Helpers for Raw PCM Decoding ---

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize Int16 to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default FactCard;