import { useEffect } from "react";
import { useStore } from "../../store";
import { Spinner } from "../ui/Spinner";

export function SessionLoader() {
  const restoreSession = useStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession().catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-mario-red border-3 border-[#c04040] rounded-2xl shadow-paper flex items-center justify-center">
          <span className="text-white text-2xl font-extrabold">N</span>
        </div>
        <Spinner size={32} />
        <p className="text-pm-gray font-medium text-sm">Loading session…</p>
      </div>
    </div>
  );
}
