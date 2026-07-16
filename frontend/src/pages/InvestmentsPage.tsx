import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Wallet, CreditCard } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import {
  listInvestments, createInvestment, deleteInvestment, listLoans, createLoan, deleteLoan,
} from "../services/resources";
import type { Investment, Loan } from "../types";

const investmentCategories = ["mutual_fund", "stocks", "fd", "gold", "crypto", "real_estate"];
const loanTypes = ["home", "car", "personal", "education"];

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export default function InvestmentsPage() {
  const [tab, setTab] = useState<"investments" | "loans">("investments");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [invForm, setInvForm] = useState<Investment>({
    name: "", category: "mutual_fund", amount_invested: 0, current_value: 0, expected_annual_return: 10,
  });
  const [loanForm, setLoanForm] = useState<Loan>({
    name: "", loan_type: "personal", principal: 0, outstanding_amount: 0, interest_rate: 9, emi: 0, tenure_months: 12,
  });

  const load = () => {
    setLoading(true);
    Promise.all([listInvestments(), listLoans()])
      .then(([inv, ln]) => {
        setInvestments(inv);
        setLoans(ln);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAddInvestment = async (e: FormEvent) => {
    e.preventDefault();
    await createInvestment(invForm);
    setInvForm({ name: "", category: "mutual_fund", amount_invested: 0, current_value: 0, expected_annual_return: 10 });
    setShowForm(false);
    load();
  };

  const handleAddLoan = async (e: FormEvent) => {
    e.preventDefault();
    await createLoan(loanForm);
    setLoanForm({ name: "", loan_type: "personal", principal: 0, outstanding_amount: 0, interest_rate: 9, emi: 0, tenure_months: 12 });
    setShowForm(false);
    load();
  };

  return (
    <AppLayout title="Investments & Loans">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => { setTab("investments"); setShowForm(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                tab === "investments" ? "bg-grad-primary text-white shadow-glow" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Wallet size={16} /> Investments
            </button>
            <button
              onClick={() => { setTab("loans"); setShowForm(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                tab === "loans" ? "bg-grad-primary text-white shadow-glow" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
              }`}
            >
              <CreditCard size={16} /> Loans
            </button>
          </div>
          <Button size="sm" onClick={() => setShowForm((s) => !s)}>
            <Plus size={16} /> Add {tab === "investments" ? "Investment" : "Loan"}
          </Button>
        </div>

        {showForm && tab === "investments" && (
          <GlassCard>
            <form onSubmit={handleAddInvestment} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <InputField label="Name" value={invForm.name} onChange={(e) => setInvForm((f) => ({ ...f, name: e.target.value }))} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category</label>
                <select
                  value={invForm.category}
                  onChange={(e) => setInvForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                >
                  {investmentCategories.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </div>
              <InputField label="Amount Invested (₹)" type="number" value={invForm.amount_invested} onChange={(e) => setInvForm((f) => ({ ...f, amount_invested: Number(e.target.value) }))} />
              <InputField label="Current Value (₹)" type="number" value={invForm.current_value} onChange={(e) => setInvForm((f) => ({ ...f, current_value: Number(e.target.value) }))} />
              <InputField label="Expected Return (%/yr)" type="number" value={invForm.expected_annual_return} onChange={(e) => setInvForm((f) => ({ ...f, expected_annual_return: Number(e.target.value) }))} />
              <Button type="submit" className="sm:col-span-2 lg:col-span-5">Save Investment</Button>
            </form>
          </GlassCard>
        )}

        {showForm && tab === "loans" && (
          <GlassCard>
            <form onSubmit={handleAddLoan} className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <InputField label="Name" value={loanForm.name} onChange={(e) => setLoanForm((f) => ({ ...f, name: e.target.value }))} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Type</label>
                <select
                  value={loanForm.loan_type}
                  onChange={(e) => setLoanForm((f) => ({ ...f, loan_type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                >
                  {loanTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <InputField label="Principal (₹)" type="number" value={loanForm.principal} onChange={(e) => setLoanForm((f) => ({ ...f, principal: Number(e.target.value) }))} />
              <InputField label="Outstanding (₹)" type="number" value={loanForm.outstanding_amount} onChange={(e) => setLoanForm((f) => ({ ...f, outstanding_amount: Number(e.target.value) }))} />
              <InputField label="Interest Rate (%)" type="number" value={loanForm.interest_rate} onChange={(e) => setLoanForm((f) => ({ ...f, interest_rate: Number(e.target.value) }))} />
              <InputField label="EMI (₹/month)" type="number" value={loanForm.emi} onChange={(e) => setLoanForm((f) => ({ ...f, emi: Number(e.target.value) }))} />
              <Button type="submit" className="sm:col-span-2 lg:col-span-6">Save Loan</Button>
            </form>
          </GlassCard>
        )}

        {loading && <div className="h-48 rounded-xl2 skeleton" />}

        {!loading && tab === "investments" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {investments.length === 0 && (
              <GlassCard className="sm:col-span-2 lg:col-span-3 text-center py-12 text-slate-500 dark:text-slate-400">
                No investments added yet.
              </GlassCard>
            )}
            {investments.map((inv, i) => {
              const gain = inv.current_value - inv.amount_invested;
              return (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl2 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-display font-semibold">{inv.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{inv.category.replace("_", " ")}</span>
                    </div>
                    <button onClick={() => inv.id && deleteInvestment(inv.id).then(load)} className="text-slate-400 hover:text-accent-coral">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="font-display font-bold text-xl mt-3">₹{formatINR(inv.current_value)}</p>
                  <p className={`text-xs font-medium mt-1 ${gain >= 0 ? "text-accent-mint" : "text-accent-coral"}`}>
                    {gain >= 0 ? "+" : ""}₹{formatINR(gain)} since invested
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && tab === "loans" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loans.length === 0 && (
              <GlassCard className="sm:col-span-2 lg:col-span-3 text-center py-12 text-slate-500 dark:text-slate-400">
                No loans added yet.
              </GlassCard>
            )}
            {loans.map((loan, i) => (
              <motion.div key={loan.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl2 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-display font-semibold">{loan.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{loan.loan_type} loan</span>
                  </div>
                  <button onClick={() => loan.id && deleteLoan(loan.id).then(load)} className="text-slate-400 hover:text-accent-coral">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="font-display font-bold text-xl mt-3">₹{formatINR(loan.outstanding_amount)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  EMI ₹{formatINR(loan.emi)}/mo · {loan.interest_rate}% interest
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
