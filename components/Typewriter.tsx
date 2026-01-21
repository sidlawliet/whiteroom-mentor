import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 15, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const index = useRef(0);
  const onCompleteRef = useRef(onComplete);


  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {

    setDisplayedText('');
    setIsTyping(true);
    index.current = 0;

    const intervalId = setInterval(() => {
      if (index.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index.current));
        index.current++;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-2 h-4 bg-wr-accent ml-1 align-middle animate-pulse" />
      )}
    </span>
  );
};