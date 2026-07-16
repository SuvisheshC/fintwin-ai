import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet, TrendingUp, PiggyBank, CreditCard, ShieldAlert, HeartPulse, Target, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { StatCard } from "../components/ui/StatCard";
import { GlassCard } from "../components/ui/GlassCard";
import { getDashboard, getPredictions } from "../services/resources";
import type { DashboardSummary, PredictionResponse } from "../types";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [forecast, setForecast] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getPredictions(10)])
      .then(([dash, pred]) => {
        setSummary(dash);
        setForecast(pred);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || "Complete your financial profile to see your dashboard.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Dashboard">
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl2 skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <GlassCard className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
          <Link to="/digital-twin" className="text-brand-500 font-medium inline-flex items-center gap-1 hover:underline">
            Set up your Digital Twin <ArrowRight size={16} />
          </Link>
        </GlassCard>
      )}

      {!loading && summary && (
        <div className="flex flex-col gap-6">
          {/* Stat cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Net Worth"
              value={`₹${formatINR(summary.net_worth)}`}
              icon={<Wallet size={18} />}
              gradient="bg-grad-primary"
              delay={0}
            />
            <StatCard
              label="Monthly Cash Flow"
              value={`₹${formatINR(summary.monthly_cash_flow)}`}
              icon={<TrendingUp size={18} />}
              trend={summary.monthly_cash_flow >= 0 ? "Positive" : "Negative"}
              trendUp={summary.monthly_cash_flow >= 0}
              gradient="bg-grad-mint"
              delay={0.05}
            />
            <StatCard
              label="Savings Ratio"
              value={`${summary.savings_ratio}%`}
              icon={<PiggyBank size={18} />}
              gradient="bg-grad-primary"
              delay={0.1}
            />
            <StatCard
              label="Debt Ratio"
              value={`${summary.debt_ratio}%`}
              icon={<CreditCard size={18} />}
              trend={summary.debt_ratio > 40 ? "High" : "Healthy"}
              trendUp={summary.debt_ratio <= 40}
              gradient="bg-grad-mint"
              delay={0.15}
            />
            <StatCard
              label="Emergency Fund"
              value={`${summary.emergency_fund_months} mo`}
              icon={<ShieldAlert size={18} />}
              gradient="bg-grad-primary"
              delay={0.2}
            />
            <StatCard
              label="Total Investments"
              value={`₹${formatINR(summary.total_investments)}`}
              icon={<TrendingUp size={18} />}
              gradient="bg-grad-mint"
              delay={0.25}
            />
            <StatCard
              label="Total Loans"
              value={`₹${formatINR(summary.total_loans)}`}
              icon={<CreditCard size={18} />}
              gradient="bg-grad-primary"
              delay={0.3}
            />
            <StatCard
              label="Health Score"
              value={`${summary.financial_health_score}/100`}
              icon={<HeartPulse size={18} />}
              gradient="bg-grad-mint"
              delay={0.35}
            />
          </div>

          {/* Wealth forecast chart */}
          <GlassCard delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">10-Year Wealth Forecast</h3>
              <Link to="/predictions" className="text-sm text-brand-500 hover:underline">View full analytics</Link>
            </div>
            {forecast && (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={forecast.timeline}>
                  <defs>
                    <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f63ff" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#2f63ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} stroke="#94a3b8" fontSize={12} />
                  <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [`₹${formatINR(value)}`, "Net Worth"]}
                    labelFormatter={(y) => `Year ${y}`}
                    contentStyle={{ background: "#131826", border: "none", borderRadius: 12, color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="net_worth" stroke="#2f63ff" strokeWidth={2.5} fill="url(#netWorthGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>

          {/* Recent recommendations */}
          <GlassCard delay={0.15}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Recent AI Recommendations</h3>
              <Link to="/advisor" className="text-sm text-brand-500 hover:underline">Ask the advisor</Link>
            </div>
            {summary.recent_recommendations.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No recommendations yet — ask the AI Advisor a question to get started.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {summary.recent_recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl bg-slate-50 dark:bg-white/5 p-4"
                  >
                    <p className="text-sm font-medium text-slate-800 dark:text-white mb-1">{rec.recommendation}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{rec.reason}</p>
                    <span className="text-xs font-semibold text-brand-500">
                      Confidence: {rec.confidence_score}%
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-5">
            <Link to="/simulator">
              <GlassCard className="hover:shadow-glow transition-shadow cursor-pointer h-full">
                <Target className="text-brand-500 mb-3" size={22} />
                <h4 className="font-display font-semibold mb-1">Run a Scenario</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Should you buy a home, switch jobs, or retire early?
                </p>
              </GlassCard>
            </Link>
            <Link to="/health-score">
              <GlassCard className="hover:shadow-glow transition-shadow cursor-pointer h-full">
                <HeartPulse className="text-brand-500 mb-3" size={22} />
                <h4 className="font-display font-semibold mb-1">Check Financial Health</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  See your score out of 100 with detailed insights.
                </p>
              </GlassCard>
            </Link>
            <Link to="/goals">
              <GlassCard className="hover:shadow-glow transition-shadow cursor-pointer h-full">
                <PiggyBank className="text-brand-500 mb-3" size={22} />
                <h4 className="font-display font-semibold mb-1">Track Your Goals</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Monitor progress toward what matters most.
                </p>
              </GlassCard>
            </Link>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
