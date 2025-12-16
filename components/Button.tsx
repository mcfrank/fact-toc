import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "bouncy py-4 px-6 rounded-2xl font-bold text-lg md:text-xl shadow-md transition-transform duration-200 flex items-center justify-center gap-2 border-b-4";
  
  const variants = {
    primary: "bg-sky-400 hover:bg-sky-500 text-white border-sky-600",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border-gray-200",
    accent: "bg-violet-400 hover:bg-violet-500 text-white border-violet-600",
    danger: "bg-rose-400 hover:bg-rose-500 text-white border-rose-600",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;