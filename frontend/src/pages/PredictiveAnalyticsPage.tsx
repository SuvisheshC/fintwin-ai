import { useEffect, useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { getPredictions } from "../services/resources";
import type { PredictionResponse } from "../types";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

const horizons = [1, 5, 10, 20, 30];

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export default function PredictiveAnalyticsPage() {
  const [horizon, setHorizon] = useState(10);
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getPredictions(horizon)
      .then(setData)
      .catch((err) => setError(err?.response?.data?.detail || "Complete your financial profile first."))
      .finally(() => setLoading(false));
  }, [horizon]);

  return (
    <AppLayout title="Predictive Analytics">
      <div className="flex flex-col gap-6">
        <GlassCard>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Forecast Horizon</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Projections use your income growth, inflation, and investment return assumptions.
              </p>
            </div>
            <div className="flex gap-2">
              {horizons.map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    horizon === h
                      ? "bg-grad-primary text-white shadow-glow"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {h}Y
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {loading && <div className="h-96 rounded-xl2 skeleton" />}

        {!loading && error && (
          <GlassCard className="text-center py-12 text-slate-500 dark:text-slate-400">{error}</GlassCard>
        )}

        {!loading && data && (
          <>
            <div className="grid sm:grid-cols-2 gap-5">
              <GlassCard>
                <p className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-1">Estimated Retirement Corpus</p>
                <p className="font-display font-bold text-2xl text-slate-800 dark:text-white">
                  ₹{formatINR(data.retirement_corpus_estimate)}
                </p>
              </GlassCard>
              <GlassCard delay={0.05}>
                <p className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-1">Emergency Fund Target</p>
                <p className="font-display font-bold text-2xl text-slate-800 dark:text-white">
                  ₹{formatINR(data.emergency_fund_target)}
                </p>
              </GlassCard>
            </div>

            <GlassCard delay={0.1}>
              <h3 className="font-display font-semibold text-lg mb-4">Net Worth & Investment Growth</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} stroke="#94a3b8" fontSize={12} />
                  <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`₹${formatINR(value)}`, name]}
                    labelFormatter={(y) => `Year ${y}`}
                    contentStyle={{ background: "#131826", border: "none", borderRadius: 12, color: "#fff" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="net_worth" name="Net Worth" stroke="#2f63ff" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="investment_value" name="Investments" stroke="#3ee8b5" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="savings" name="Savings" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard delay={0.15}>
              <h3 className="font-display font-semibold text-lg mb-4">Income vs Expenses</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} stroke="#94a3b8" fontSize={12} />
                  <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`₹${formatINR(value)}`, name]}
                    labelFormatter={(y) => `Year ${y}`}
                    contentStyle={{ background: "#131826", border: "none", borderRadius: 12, color: "#fff" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Annual Income" stroke="#3ee8b5" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expenses" name="Annual Expenses" stroke="#ff6b6b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </>
        )}
      </div>
    </AppLayout>
  );
}
