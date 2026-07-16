import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate("/digital-twin");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed. Try a different email.");
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

        <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-slate-300 text-sm mb-6">Start building your financial digital twin.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
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
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
          {error && <p className="text-accent-coral text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-2">
            <UserPlus size={16} /> {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-300 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
