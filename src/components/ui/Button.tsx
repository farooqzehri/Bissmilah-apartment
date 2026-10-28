import { motion } from "motion/react";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "accent";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyle = "relative inline-flex items-center justify-center font-display tracking-tight transition-all duration-500 ease-out focus:outline-none focus:ring-1 focus:ring-luxury-accent/50 selection:bg-luxury-accent/30 rounded-full select-none overflow-hidden cursor-pointer";

  const sizeStyles = {
    sm: "px-5 py-2 text-xs",
    md: "px-7 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  const variantStyles = {
    primary: "bg-luxury-text text-luxury-bg hover:opacity-90 active:scale-98",
    secondary: "bg-white border border-luxury-muted/30 text-luxury-text shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-luxury-text/20 active:scale-98",
    outline: "bg-transparent border border-luxury-text/20 text-luxury-text hover:bg-luxury-text hover:text-luxury-bg active:scale-98",
    accent: "bg-luxury-accent text-luxury-text font-medium hover:bg-opacity-90 active:scale-98 shadow-sm",
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      {/* Background elegant shimmer/reveal on primary hover */}
      {variant === "primary" && (
        <span className="absolute inset-0 block bg-gradient-to-r from-luxury-accent/20 via-transparent to-luxury-accent/10 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      )}
    </motion.button>
  );
};
