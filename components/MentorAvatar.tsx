import React from 'react';

interface MentorAvatarProps {
  isThinking: boolean;
}

export const MentorAvatar: React.FC<MentorAvatarProps> = ({ isThinking }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white overflow-hidden border-b md:border-b-0 md:border-r border-wr-border">


      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className={`relative z-10 h-[90%] w-full flex items-center justify-center transition-all duration-1000 ${isThinking ? 'scale-105 contrast-110' : 'scale-100 grayscale-[10%]'}`}>

        <img
          src="/ayanokoji.jpg"
          alt="Ayanokoji Kiyotaka"
          className="h-full w-auto object-contain max-w-full drop-shadow-xl"
          style={{
            filter: isThinking ? 'none' : 'brightness(0.95) saturate(0.8)',
            maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)'
          }}
        />


        {isThinking && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-[15%] w-full animate-scan pointer-events-none mix-blend-multiply" />
        )}
      </div>


      {isThinking && (
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(255,255,255,0.8)]" />
      )}
    </div>
  );
};