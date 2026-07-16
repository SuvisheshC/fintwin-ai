import { type ReactNode } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={clsx(
        "glass rounded-xl2 shadow-glass p-6 text-slate-800 dark:text-slate-100",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
