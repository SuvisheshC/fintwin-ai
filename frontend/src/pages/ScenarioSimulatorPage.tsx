import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Car, GraduationCap, Briefcase, Hourglass, Rocket, Plane, Heart, Loader2,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { runSimulation } from "../services/resources";
import type { SimulationResult } from "../types";

const scenarioTypes = [
  { id: "buy_home", label: "Buy a Home", icon: Home },
  { id: "buy_car", label: "Buy a Car", icon: Car },
  { id: "higher_education", label: "Higher Education", icon: GraduationCap },
  { id: "job_change", label: "Change Jobs", icon: Briefcase },
  { id: "retirement", label: "Retirement", icon: Hourglass },
  { id: "start_business", label: "Start a Business", icon: Rocket },
  { id: "vacation", label: "International Vacation", icon: Plane },
  { id: "marriage", label: "Marriage", icon: Heart },
];

const paramFieldsByType: Record<string, { key: string; label: string; default: number }[]> = {
  buy_home: [
    { key: "home_price", label: "Home Price (₹)", default: 5000000 },
    { key: "tenure_years", label: "Loan Tenure (years)", default: 20 },
    { key: "interest_rate", label: "Interest Rate (%)", default: 8.5 },
  ],
  buy_car: [
    { key: "car_price", label: "Car Price (₹)", default: 1200000 },
    { key: "tenure_years", label: "Loan Tenure (years)", default: 5 },
    { key: "interest_rate", label: "Interest Rate (%)", default: 9.5 },
  ],
  higher_education: [
    { key: "course_cost", label: "Course Cost (₹)", default: 2000000 },
    { key: "tenure_years", label: "Loan Tenure (years)", default: 7 },
    { key: "interest_rate", label: "Interest Rate (%)", default: 9.0 },
  ],
  job_change: [{ key: "salary_change_pct", label: "Salary Change (%)", default: 20 }],
  retirement: [{ key: "target_retirement_age", label: "Target Retirement Age", default: 55 }],
  start_business: [
    { key: "capital_needed", label: "Capital Needed (₹)", default: 1000000 },
    { key: "interest_rate", label: "Loan Interest Rate (%) (if loan-funded)", default: 14 },
    { key: "tenure_years", label: "Loan Tenure (years)", default: 5 },
  ],
  vacation: [{ key: "trip_cost", label: "Trip Cost (₹)", default: 300000 }],
  marriage: [{ key: "wedding_cost", label: "Wedding Cost (₹)", default: 1500000 }],
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

const riskColor: Record<string, string> = {
  Low: "text-accent-mint",
  Medium: "text-amber-400",
  High: "text-accent-coral",
};

export default function ScenarioSimulatorPage() {
  const [selectedType, setSelectedType] = useState("buy_home");
  const [params, setParams] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fields = paramFieldsByType[selectedType] || [];

  const getParamValue = (key: string, fallback: number) => params[key] ?? fallback;

  const handleSimulate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const finalParams: Record<string, number> = {};
      fields.forEach((f) => {
        finalParams[f.key] = getParamValue(f.key, f.default);
      });
      const res = await runSimulation(selectedType, finalParams);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Simulation failed. Complete your financial profile first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Scenario Simulator">
      <div className="flex flex-col gap-6">
        <GlassCard>
          <h3 className="font-display font-semibold text-lg mb-4">What decision are you weighing?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {scenarioTypes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setSelectedType(id);
                  setParams({});
                  setResult(null);
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  selectedType === id
                    ? "bg-grad-primary text-white border-transparent shadow-glow"
                    : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium text-center">{label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <h3 className="font-display font-semibold text-lg mb-4">Scenario Parameters</h3>
          <div className="grid sm:grid-cols-3 gap-5 mb-6">
            {fields.map((f) => (
              <InputField
                key={f.key}
                label={f.label}
                type="number"
                value={getParamValue(f.key, f.default)}
                onChange={(e) => setParams((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
              />
            ))}
          </div>
          <Button onClick={handleSimulate} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            {loading ? "Simulating..." : "Run Simulation"}
          </Button>
          {error && <p className="text-accent-coral text-sm mt-3">{error}</p>}
        </GlassCard>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <GlassCard className="bg-grad-primary text-white">
                <p className="text-sm uppercase tracking-wide opacity-80 mb-1">AI Recommendation</p>
                <p className="font-display font-semibold text-lg">{result.explanation}</p>
              </GlassCard>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.scenarios.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass rounded-xl2 p-5 ${
                      s.label === result.best_option ? "ring-2 ring-brand-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-display font-semibold">{s.label}</h4>
                      {s.label === result.best_option && (
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-grad-primary text-white px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Future Net Worth</span>
                        <span className="font-semibold">₹{formatINR(s.future_net_worth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Future Savings</span>
                        <span className="font-semibold">₹{formatINR(s.future_savings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Monthly Cash Flow</span>
                        <span className="font-semibold">₹{formatINR(s.monthly_cash_flow)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Health Score</span>
                        <span className="font-semibold">{s.financial_health_score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Risk Level</span>
                        <span className={`font-semibold ${riskColor[s.risk_level] ?? ""}`}>{s.risk_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Retirement Impact</span>
                        <span className="font-semibold">{s.retirement_impact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Goal Achievement</span>
                        <span className="font-semibold">{s.goal_achievement}</span>
                      </div>
                    </div>
                    {s.notes.length > 0 && (
                      <ul className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-1.5">
                        {s.notes.map((n, idx) => (
                          <li key={idx} className="text-xs text-slate-500 dark:text-slate-400 flex gap-1.5">
                            <span className="text-brand-500">•</span> {n}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
