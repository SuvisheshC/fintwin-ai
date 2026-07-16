import { type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ children, variant = "primary", size = "md", className, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        "font-medium rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-grad-primary text-white shadow-glow hover:brightness-110 active:scale-[0.98]",
        variant === "secondary" &&
          "bg-white/70 dark:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/20",
        variant === "ghost" &&
          "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10",
        variant === "danger" && "bg-accent-coral/10 text-accent-coral hover:bg-accent-coral/20",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
