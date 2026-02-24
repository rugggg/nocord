import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { useStore } from "../../store";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

export function LoginScreen() {
  const login = useStore((s) => s.login);
  const [homeserver, setHomeserver] = useState("https://matrix.org");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(homeserver.trim(), username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 280 }}
        className="w-full max-w-sm"
      >
        <div className="paper-card p-8">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-mario-red border-3 border-[#c04040] rounded-2xl shadow-paper mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-extrabold">N</span>
            </div>
            <h1 className="text-3xl font-extrabold text-pm-dark">nocord</h1>
            <p className="text-pm-gray text-sm mt-1 font-medium">Matrix chat, Paper Mario style</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Homeserver"
              type="url"
              value={homeserver}
              onChange={(e) => setHomeserver(e.target.value)}
              placeholder="https://matrix.org"
              required
            />
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@you:matrix.org"
              required
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-mario-red/10 border-2 border-mario-red rounded-lg p-3 text-mario-red text-sm font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size={18} className="border-white border-t-mario-red/40" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
