import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { getHealthScore } from "../services/resources";
import type { FinancialHealth } from "../types";
import { Lightbulb, AlertCircle } from "lucide-react";

const ratingColor: Record<string, string> = {
  excellent: "#3ee8b5",
  good: "#2f63ff",
  fair: "#f59e0b",
  poor: "#ff6b6b",
};

function CircularGauge({ score, rating }: { score: number; rating: string }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = ratingColor[rating] ?? "#2f63ff";

  return (
    <div className="relative w-52 h-52 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} strokeWidth="14" className="stroke-slate-200 dark:stroke-white/10" fill="none" />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="14"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-extrabold text-4xl text-slate-800 dark:text-white">{score}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">out of 100</span>
        <span className="mt-1 text-xs font-semibold capitalize px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}20` }}>
          {rating}
        </span>
      </div>
    </div>
  );
}

function MetricBar({ label, value, max = 100, suffix = "%" }: { label: string; value: number; max?: number; suffix?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-semibold text-slate-800 dark:text-white">{value}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-grad-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

export default function FinancialHealthPage() {
  const [health, setHealth] = useState<FinancialHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHealthScore()
      .then(setHealth)
      .catch((err) => setError(err?.response?.data?.detail || "Complete your financial profile first."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Financial Health Score">
      {loading && <div className="h-96 rounded-xl2 skeleton" />}
      {!loading && error && (
        <GlassCard className="text-center py-12 text-slate-500 dark:text-slate-400">{error}</GlassCard>
      )}
      {!loading && health && (
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="flex flex-col items-center justify-center py-10">
            <CircularGauge score={health.score} rating={health.rating} />
          </GlassCard>

          <GlassCard delay={0.05}>
            <h3 className="font-display font-semibold text-lg mb-5">Score Breakdown</h3>
            <div className="flex flex-col gap-4">
              <MetricBar label="Savings Ratio" value={health.savings_ratio} />
              <MetricBar label="Debt Ratio" value={health.debt_ratio} />
              <MetricBar label="Emergency Fund Coverage" value={Math.min((health.emergency_fund_months / 6) * 100, 100)} />
              <MetricBar label="Investment Diversity" value={health.investment_diversity_score} />
              <MetricBar label="Goal Progress" value={health.goal_progress} />
              <MetricBar label="Insurance Adequacy" value={health.insurance_adequacy} />
            </div>
          </GlassCard>

          <GlassCard delay={0.1}>
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-brand-500" /> Insights
            </h3>
            <ul className="space-y-2.5">
              {health.insights.map((insight, i) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                  <span className="text-brand-500">•</span> {insight}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard delay={0.15}>
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-accent-mint" /> Recommendations
            </h3>
            {health.recommendations.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">You're in great shape — keep it up!</p>
            ) : (
              <ul className="space-y-2.5">
                {health.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                    <span className="text-accent-mint">•</span> {rec}
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      )}
    </AppLayout>
  );
}
