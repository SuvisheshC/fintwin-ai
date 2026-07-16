import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  gradient?: string;
  delay?: number;
}

export function StatCard({ label, value, icon, trend, trendUp, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className="glass rounded-xl2 shadow-glass p-5 relative overflow-hidden group"
    >
      <div
        className={`absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-20 blur-2xl ${gradient ?? "bg-grad-primary"}`}
      />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-300 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-display font-bold text-slate-800 dark:text-white">{value}</div>
      {trend && (
        <div className={`text-xs mt-1 font-medium ${trendUp ? "text-accent-mint" : "text-accent-coral"}`}>
          {trend}
        </div>
      )}
    </motion.div>
  );
}
