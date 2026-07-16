import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grad-dark px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-xl2 p-8 text-white"
      >
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">FinTwin AI</span>
        </div>

        <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-slate-300 text-sm mb-6">Log in to access your financial digital twin.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-accent-coral text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-2">
            <LogIn size={16} /> {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-300 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
