import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle2 } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { getProfile, updateProfile } from "../services/resources";
import type { FinancialProfile } from "../types";

const defaultProfile: FinancialProfile = {
  age: 28,
  monthly_income: 0,
  monthly_expenses: 0,
  current_savings: 0,
  emergency_fund: 0,
  total_investments: 0,
  total_loans: 0,
  insurance_cover: 0,
  retirement_age_goal: 60,
  risk_appetite: "moderate",
};

export default function DigitalTwinPage() {
  const [profile, setProfile] = useState<FinancialProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof FinancialProfile, value: string) => {
    setProfile((p) => ({
      ...p,
      [field]: field === "risk_appetite" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateProfile(profile);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof FinancialProfile; label: string; suffix?: string }[] = [
    { key: "age", label: "Age" },
    { key: "monthly_income", label: "Monthly Income (₹)" },
    { key: "monthly_expenses", label: "Monthly Expenses (₹)" },
    { key: "current_savings", label: "Current Savings (₹)" },
    { key: "emergency_fund", label: "Emergency Fund (₹)" },
    { key: "total_investments", label: "Total Investments (₹)" },
    { key: "total_loans", label: "Total Loans Outstanding (₹)" },
    { key: "insurance_cover", label: "Insurance Cover (₹)" },
    { key: "retirement_age_goal", label: "Target Retirement Age" },
  ];

  return (
    <AppLayout title="Financial Digital Twin">
      {loading ? (
        <div className="h-96 rounded-xl2 skeleton" />
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-6"
        >
          <GlassCard>
            <h3 className="font-display font-semibold text-lg mb-1">Build Your Digital Twin</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              These numbers power every prediction, score, and simulation in FinTwin AI. Keep them up to date.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {fields.map((f) => (
                <InputField
                  key={f.key}
                  label={f.label}
                  type="number"
                  value={profile[f.key] as number}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  min={0}
                />
              ))}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Risk Appetite
                </label>
                <select
                  value={profile.risk_appetite}
                  onChange={(e) => handleChange("risk_appetite", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <Button type="submit" disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : "Save Digital Twin"}
              </Button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-accent-mint text-sm font-medium flex items-center gap-1"
                >
                  <CheckCircle2 size={16} /> Saved
                </motion.span>
              )}
            </div>
          </GlassCard>

          <GlassCard delay={0.1} className="bg-grad-primary text-white">
            <p className="text-sm opacity-90">
              Tip: add your investments and loans in detail on the Investments page for more accurate
              scenario simulations and predictions — these top-level totals are used as a fallback only.
            </p>
          </GlassCard>
        </motion.form>
      )}
    </AppLayout>
  );
}
