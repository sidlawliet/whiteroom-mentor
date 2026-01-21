import React, { useState } from 'react';
import { Button } from './Button';
import { Difficulty } from '../types';

interface LandingPageProps {
  onStart: (difficulty: Difficulty) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('STANDARD');

  const levels: { id: Difficulty; label: string; desc: string }[] = [
    { id: 'BEGINNER', label: 'Eased', desc: 'Guidance & Explanations' },
    { id: 'STANDARD', label: 'Standard', desc: 'Efficient & Direct' },
    { id: 'WHITE_ROOM', label: 'White Room', desc: 'Ruthless & Absolute' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-wr-white text-wr-text relative overflow-hidden">


      <div className="absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>


      <div className="absolute top-8 left-8 flex flex-col gap-1">
        <div className="h-[1px] w-12 bg-black" />
        <span className="font-mono text-[10px] text-gray-400 tracking-widest">SUB. 401</span>
      </div>
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-1">
        <span className="font-mono text-[10px] text-gray-400 tracking-widest">SYSTEM: NOMINAL</span>
        <div className="h-[1px] w-12 bg-black" />
      </div>

      <div className="z-10 text-center max-w-3xl px-6 animate-slide-up flex flex-col items-center bg-white/80 backdrop-blur-sm p-12 border border-wr-border shadow-sm">
        <span className="font-mono text-xs text-red-600 tracking-[0.4em] mb-4 block">PROJECT: DEMON</span>

        <h1 className="font-display text-6xl md:text-8xl mb-6 text-black tracking-tighter">
          WHITE ROOM
        </h1>

        <div className="h-px w-full max-w-[200px] bg-gray-200 mx-auto mb-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rotate-45" />
        </div>

        <p className="text-sm md:text-base text-gray-500 mb-8 font-mono leading-relaxed max-w-lg">
          discard_emotions();<br />
          maximize_efficiency();<br />
          <span className="text-black mt-2 block font-sans">
            I will dismantle your ignorance and reconstruct it into capability.
          </span>
        </p>


        <div className="flex flex-col md:flex-row gap-4 mb-10 w-full max-w-lg">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setDifficulty(lvl.id)}
              className={`flex-1 p-4 border transition-all duration-300 relative group text-left ${difficulty === lvl.id
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 bg-white text-gray-400 hover:border-gray-400'
                }`}
            >
              <div className="text-[10px] font-mono tracking-widest uppercase mb-1 opacity-70">Level: 0{levels.indexOf(lvl) + 1}</div>
              <div className="font-sans font-bold text-sm tracking-wide">{lvl.label}</div>
              <div className={`text-[10px] mt-2 ${difficulty === lvl.id ? 'text-gray-300' : 'text-gray-400'}`}>{lvl.desc}</div>

              {difficulty === lvl.id && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <Button onClick={() => onStart(difficulty)}>
            BEGIN CURRICULUM
          </Button>
        </div>
      </div>
    </div>
  );
};