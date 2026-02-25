import { AnimatePresence, motion } from "framer-motion";
import { EmojiMapping } from "matrix-js-sdk/lib/crypto-api";
import { VerificationPhaseState, VerificationActions } from "../../hooks/useVerification";
import { Button } from "../ui/Button";

interface VerificationModalProps {
  state: VerificationPhaseState;
  actions: VerificationActions;
}

function EmojiGrid({ emojis }: { emojis: EmojiMapping[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 my-4">
      {emojis.map(([emoji, name], i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 bg-parchment border-2 border-paper-border rounded-xl p-3"
        >
          <span className="text-3xl">{emoji}</span>
          <span className="text-xs text-pm-gray font-medium capitalize">{name}</span>
        </div>
      ))}
    </div>
  );
}

function ModalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="bg-paper border-3 border-paper-border rounded-2xl shadow-paper p-6 w-full max-w-sm mx-4 flex flex-col gap-4"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function VerificationModal({ state, actions }: VerificationModalProps) {
  const visible = state.type !== "idle";

  return (
    <AnimatePresence>
      {visible && (
        <ModalShell>
          {/* Requested */}
          {state.type === "requested" && (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-pm-dark">🔐 Verify Device</h2>
                <p className="text-sm text-pm-gray mt-1">
                  <span className="font-bold text-pm-dark">{state.request.otherUserId}</span> wants
                  to verify this session. Accept to compare emojis and unlock your encrypted
                  message history.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" onClick={actions.accept} className="flex-1">
                  Accept
                </Button>
                <Button variant="secondary" onClick={actions.decline} className="flex-1">
                  Decline
                </Button>
              </div>
            </>
          )}

          {/* Accepting / waiting for SAS to start */}
          {(state.type === "accepting") && (
            <>
              <h2 className="text-lg font-extrabold text-pm-dark">🔐 Verify Device</h2>
              <p className="text-sm text-pm-gray">Starting verification…</p>
            </>
          )}

          {/* Show SAS emojis */}
          {state.type === "show_sas" && (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-pm-dark">🔐 Compare Emojis</h2>
                <p className="text-sm text-pm-gray mt-1">
                  Check that these 7 emojis match the ones shown on your other device, then
                  confirm.
                </p>
              </div>
              <EmojiGrid emojis={state.emojis} />
              <div className="flex gap-2">
                <Button variant="primary" onClick={actions.confirmSas} className="flex-1">
                  They match ✓
                </Button>
                <Button variant="danger" onClick={actions.mismatchSas} className="flex-1">
                  No match ✗
                </Button>
              </div>
            </>
          )}

          {/* Confirming */}
          {state.type === "confirming" && (
            <>
              <h2 className="text-lg font-extrabold text-pm-dark">🔐 Verify Device</h2>
              <p className="text-sm text-pm-gray">Confirming with the other device…</p>
            </>
          )}

          {/* Done */}
          {state.type === "done" && (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-leaf-green">✅ Verified!</h2>
                <p className="text-sm text-pm-gray mt-1">
                  Your devices are now verified. Encrypted message history will decrypt
                  automatically.
                </p>
              </div>
              <Button variant="primary" onClick={actions.dismiss} className="self-start">
                Done
              </Button>
            </>
          )}

          {/* Cancelled */}
          {state.type === "cancelled" && (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-mario-red">Verification Cancelled</h2>
                <p className="text-sm text-pm-gray mt-1">
                  {state.reason ?? "The verification was cancelled."}
                </p>
              </div>
              <Button variant="secondary" onClick={actions.dismiss} className="self-start">
                Dismiss
              </Button>
            </>
          )}

          {/* Error */}
          {state.type === "error" && (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-mario-red">Verification Failed</h2>
                <p className="text-sm text-pm-gray mt-1">{state.message}</p>
              </div>
              <Button variant="secondary" onClick={actions.dismiss} className="self-start">
                Dismiss
              </Button>
            </>
          )}
        </ModalShell>
      )}
    </AnimatePresence>
  );
}
