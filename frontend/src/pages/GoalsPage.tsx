import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Target } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { listGoals, createGoal, deleteGoal } from "../services/resources";
import type { Goal } from "../types";

const priorityColor: Record<string, string> = {
  high: "bg-accent-coral/15 text-accent-coral",
  medium: "bg-amber-400/15 text-amber-500",
  low: "bg-accent-mint/15 text-accent-mint",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Goal>({
    title: "", target_amount: 0, current_amount: 0, priority: "medium",
  });

  const load = () => {
    setLoading(true);
    listGoals().then(setGoals).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createGoal(form);
    setForm({ title: "", target_amount: 0, current_amount: 0, priority: "medium" });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await deleteGoal(id);
    load();
  };

  return (
    <AppLayout title="Financial Goals">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track progress toward what matters — a home, a wedding, financial freedom.
          </p>
          <Button size="sm" onClick={() => setShowForm((s) => !s)}>
            <Plus size={16} /> New Goal
          </Button>
        </div>

        {showForm && (
          <GlassCard>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <InputField
                label="Goal Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <InputField
                label="Target Amount (₹)"
                type="number"
                value={form.target_amount}
                onChange={(e) => setForm((f) => ({ ...f, target_amount: Number(e.target.value) }))}
              />
              <InputField
                label="Current Amount (₹)"
                type="number"
                value={form.current_amount}
                onChange={(e) => setForm((f) => ({ ...f, current_amount: Number(e.target.value) }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Goal["priority"] }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <Button type="submit" className="sm:col-span-2 lg:col-span-4">Save Goal</Button>
            </form>
          </GlassCard>
        )}

        {loading && <div className="h-48 rounded-xl2 skeleton" />}

        {!loading && goals.length === 0 && (
          <GlassCard className="text-center py-12">
            <Target className="mx-auto mb-3 text-slate-400" size={28} />
            <p className="text-slate-500 dark:text-slate-400">No goals yet. Add your first financial goal above.</p>
          </GlassCard>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g, i) => {
            const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0;
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl2 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-display font-semibold">{g.title}</h4>
                  <button onClick={() => handleDelete(g.id)} className="text-slate-400 hover:text-accent-coral transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColor[g.priority]}`}>
                  {g.priority} priority
                </span>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      ₹{g.current_amount.toLocaleString("en-IN")} / ₹{g.target_amount.toLocaleString("en-IN")}
                    </span>
                    <span className="font-semibold">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-grad-mint rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
