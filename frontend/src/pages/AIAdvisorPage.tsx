import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, ThumbsUp, ShieldAlert, Lightbulb, Gauge } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { askAdvisor } from "../services/resources";
import type { AdvisorResponse } from "../types";

interface ChatEntry {
  question: string;
  response?: AdvisorResponse;
  loading?: boolean;
}

const suggestedQuestions = [
  "Should I buy a BMW right now?",
  "Should I increase my SIP this year?",
  "Can I retire at 55?",
  "Should I switch jobs for a 20% raise?",
];

export default function AIAdvisorPage() {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setChat((c) => [...c, { question: q, loading: true }]);
    setQuestion("");
    try {
      const response = await askAdvisor(q);
      setChat((c) => c.map((entry) => (entry.question === q && entry.loading ? { question: q, response } : entry)));
    } catch (err: any) {
      setChat((c) =>
        c.map((entry) =>
          entry.question === q && entry.loading
            ? {
                question: q,
                response: {
                  recommendation: "Unable to generate advice right now.",
                  reason: err?.response?.data?.detail || "Please complete your financial profile first.",
                  advantages: [],
                  risks: [],
                  alternative: "Try again after setting up your Digital Twin.",
                  confidence_score: 0,
                },
              }
            : entry
        )
      );
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <AppLayout title="AI Financial Advisor">
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="flex-1 overflow-y-auto flex flex-col gap-5 pb-4">
          {chat.length === 0 && (
            <GlassCard className="text-center py-10">
              <Sparkles className="mx-auto mb-3 text-brand-500" size={28} />
              <h3 className="font-display font-semibold text-lg mb-2">Ask anything about your finances</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Every answer is personalized using your real financial profile and explains its reasoning.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="text-xs px-3 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {chat.map((entry, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="self-end max-w-lg bg-grad-primary text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-glow text-sm">
                {entry.question}
              </div>

              {entry.loading && (
                <div className="self-start flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
                  </div>
                  Thinking through your numbers...
                </div>
              )}

              {entry.response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="self-start max-w-2xl glass rounded-2xl rounded-bl-sm p-5"
                >
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <p className="font-display font-semibold text-slate-800 dark:text-white">
                      {entry.response.recommendation}
                    </p>
                    <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-brand-500 bg-brand-500/10 px-2 py-1 rounded-full">
                      <Gauge size={12} /> {entry.response.confidence_score}%
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{entry.response.reason}</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {entry.response.advantages.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-accent-mint flex items-center gap-1 mb-1.5">
                          <ThumbsUp size={12} /> Advantages
                        </p>
                        <ul className="space-y-1">
                          {entry.response.advantages.map((a, idx) => (
                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-300">• {a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.response.risks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-accent-coral flex items-center gap-1 mb-1.5">
                          <ShieldAlert size={12} /> Risks
                        </p>
                        <ul className="space-y-1">
                          {entry.response.risks.map((r, idx) => (
                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-300">• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {entry.response.alternative && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                      <p className="text-xs font-semibold uppercase text-brand-500 flex items-center gap-1 mb-1">
                        <Lightbulb size={12} /> Alternative
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{entry.response.alternative}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-3 mt-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Can I afford a 2-week trip to Japan?"
            className="flex-1 px-4 py-3 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
          <button
            type="submit"
            className="w-12 h-12 rounded-xl bg-grad-primary text-white flex items-center justify-center shadow-glow shrink-0 hover:brightness-110 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
