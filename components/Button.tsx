import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden font-mono text-xs tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-wr-text text-white hover:bg-black px-10 py-4 border border-black shadow-[4px_4px_0px_rgba(0,0,0,0.1)] active:translate-y-[1px] active:shadow-none",
    secondary: "bg-transparent border border-gray-300 text-gray-500 hover:border-black hover:text-black px-6 py-2",
    ghost: "text-gray-400 hover:text-black p-2",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
          <div className="w-4 h-4 border border-gray-400 border-t-black rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
};