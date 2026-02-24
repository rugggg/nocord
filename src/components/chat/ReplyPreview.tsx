import { MatrixEvent } from "matrix-js-sdk";
import { motion, AnimatePresence } from "framer-motion";

interface ReplyPreviewProps {
  event: MatrixEvent | null;
  onDismiss: () => void;
}

export function ReplyPreview({ event, onDismiss }: ReplyPreviewProps) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-parchment border-t-2 border-paper-border">
            <div className="w-1 h-8 bg-sky-blue rounded-full flex-shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-sky-blue">
                Replying to {event.getSender()}
              </span>
              <span className="text-xs text-pm-gray truncate">
                {event.getContent()?.body ?? ""}
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="text-pm-gray hover:text-mario-red p-1 rounded transition-colors"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 14 14">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
