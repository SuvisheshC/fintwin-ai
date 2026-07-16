import { type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function InputField({ label, className, ...rest }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10
          text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2
          focus:ring-brand-500/50 transition-all ${className ?? ""}`}
        {...rest}
      />
    </div>
  );
}
