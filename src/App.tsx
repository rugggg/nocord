import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "./store";
import { SessionLoader } from "./components/auth/SessionLoader";
import { LoginPage } from "./screens/LoginPage";
import { MainPage } from "./screens/MainPage";

export default function App() {
  const authStatus = useStore((s) => s.authStatus);
  const restoreSession = useStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession().catch(console.error);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {authStatus === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <SessionLoader />
        </motion.div>
      )}

      {authStatus === "unauthenticated" && (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-screen"
        >
          <LoginPage />
        </motion.div>
      )}

      {authStatus === "authenticated" && (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-screen"
        >
          <MainPage />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
