import { useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { motion, AnimatePresence } from "framer-motion";

interface EmojiPickerProps {
  open: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ open, onSelect, onClose }: EmojiPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 10, scaleY: 0.9 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: 10, scaleY: 0.9 }}
          style={{ transformOrigin: "bottom" }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full mb-2 right-0 z-40"
        >
          <Picker
            data={data}
            onEmojiSelect={(emoji: { native: string }) => {
              onSelect(emoji.native);
              onClose();
            }}
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
