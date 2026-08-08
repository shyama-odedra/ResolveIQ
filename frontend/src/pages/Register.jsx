import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import AuroraBackground from "../components/AuroraBackground";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AuroraBackground />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm glass-panel rounded-xl2 p-8 shadow-soft"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl">TicketFlow AI</span>
        </div>

        <h1 className="text-xl font-semibold mb-1">Create your account</h1>
        <p className="text-sm text-text-secondary mb-6">
          New accounts start as employees — an admin can grant access to more roles.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" required value={form.name} onChange={update("name")} />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={update("email")}
          />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={update("password")}
            placeholder="At least 6 characters"
          />
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="text-sm text-text-secondary mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
