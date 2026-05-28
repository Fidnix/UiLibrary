import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className,
  ...rest
}) => {
  const base = 'px-4 py-2 rounded text-white font-medium';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
    outline: 'border border-gray-500 text-gray-700 bg-transparent',
  };
  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
};
export default Button;