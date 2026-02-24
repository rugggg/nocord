import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GifResult, searchGifs, getFeaturedGifs } from "../../lib/tenor/api";
import { GifGrid } from "./GifGrid";

interface GifPickerProps {
  open: boolean;
  onSelect: (gif: GifResult) => void;
  onClose: () => void;
}

export function GifPicker({ open, onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getFeaturedGifs(20).then((results) => {
      setGifs(results);
      setLoading(false);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      getFeaturedGifs(20).then(setGifs);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchGifs(query, 20).then((results) => {
        setGifs(results);
        setLoading(false);
      });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

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
          className="absolute bottom-full mb-2 left-0 z-40 w-80 paper-card p-3 flex flex-col gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs…"
            className="paper-input w-full text-sm"
            autoFocus
          />

          {loading ? (
            <div className="flex items-center justify-center h-32 text-pm-gray text-sm">
              Loading…
            </div>
          ) : (
            <GifGrid
              gifs={gifs}
              onSelect={(gif) => {
                onSelect(gif);
                onClose();
              }}
            />
          )}

          <p className="text-xs text-pm-gray text-right">Powered by Tenor</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
