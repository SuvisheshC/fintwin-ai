import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, Brain, FlaskConical, ShieldCheck, ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";

const features = [
  {
    icon: Brain,
    title: "AI Financial Digital Twin",
    desc: "A living model of your money — income, debts, investments, and goals — that updates in real time.",
  },
  {
    icon: FlaskConical,
    title: "Scenario Simulation",
    desc: "Test buying a home, switching jobs, or retiring early before you commit, with side-by-side outcomes.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    desc: "Forecast your net worth, savings, and investments 1 to 30 years into the future.",
  },
  {
    icon: ShieldCheck,
    title: "Explainable AI Advisor",
    desc: "Every recommendation comes with reasoning, risks, alternatives, and a confidence score.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-dark text-white overflow-x-hidden">
      {/* Ambient gradient backdrop */}
      <div className="fixed inset-0 bg-grad-dark pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-violet/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 sm:px-12 py-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">FinTwin AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-white">Log in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 sm:px-12 pt-16 sm:pt-24 pb-20 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-200 mb-6"
          >
            <Sparkles size={14} /> Your money, modeled before you decide
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight"
          >
            Simulate your financial future
            <span className="block bg-clip-text text-transparent bg-grad-mint">before you live it.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-slate-300 text-lg max-w-2xl mx-auto"
          >
            FinTwin AI builds a digital twin of your finances and lets you test life's biggest
            decisions — buying a home, changing jobs, retiring early — with AI-powered, explainable
            recommendations grounded in your real numbers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg">
                Build Your Digital Twin <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="text-white border-white/20 bg-white/5">
                Log in
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features */}
        <section className="px-6 sm:px-12 py-16 max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-xl2 p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-grad-primary flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 sm:px-12 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto glass rounded-xl2 p-10"
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
              Ready to meet your financial twin?
            </h2>
            <p className="text-slate-300 mb-6">Free to start. Your data stays on your own local instance.</p>
            <Link to="/register">
              <Button size="lg">Create Your Account</Button>
            </Link>
          </motion.div>
        </section>

        <footer className="px-6 sm:px-12 py-8 text-center text-xs text-slate-500">
          FinTwin AI — Financial Digital Twin · Built for demonstration purposes.
        </footer>
      </div>
    </div>
  );
}
