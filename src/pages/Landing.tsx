import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { signInWithOtp, user } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // When user is signed in (e.g. returned from magic link), redirect to chat
  useEffect(() => {
    if (user && !loading && !submitted) navigate("/chat", { replace: true });
  }, [user, loading, submitted, navigate]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { error: err } = await signInWithOtp(email.trim());
      if (err) {
        setError(err.message || "Something went wrong. Try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <StarField />

      {/* Subtle radial glow behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(246, 90%, 70%) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold tracking-[-0.05em] uppercase text-foreground mb-2">
                VALLAR
              </h1>
              <p className="text-muted-foreground text-[15px] mb-8">
                Someone to talk to. Anytime. No judgment.
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground tracking-wider uppercase">
                  3AM Buddy
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-[15px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    <>Continue with email →</>
                  )}
                </button>
              </form>

              {error && (
                <p className="text-destructive text-sm mt-3">{error}</p>
              )}

              <p className="text-muted-foreground text-[12px] mt-4">
                No password. Just a link in your inbox.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold tracking-[-0.05em] uppercase text-foreground mb-2">
                VALLAR
              </h1>
              <p className="text-2xl mb-3">🌙</p>
              <p className="text-foreground text-lg font-medium mb-2">
                Check your inbox
              </p>
              <p className="text-muted-foreground text-sm">
                We sent a magic link to
              </p>
              <p className="text-primary text-sm font-medium mt-1">{email}</p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-muted-foreground text-xs mt-6 hover:text-foreground transition-colors underline underline-offset-2"
              >
                Use a different email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Landing;
