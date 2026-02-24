import { GifResult } from "../../lib/tenor/api";

interface GifGridProps {
  gifs: GifResult[];
  onSelect: (gif: GifResult) => void;
}

export function GifGrid({ gifs, onSelect }: GifGridProps) {
  if (gifs.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-pm-gray text-sm">
        No GIFs found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 overflow-y-auto max-h-64">
      {gifs.map((gif) => (
        <button
          key={gif.id}
          onClick={() => onSelect(gif)}
          className="relative rounded-lg overflow-hidden border-2 border-paper-border hover:border-sky-blue
                     transition-colors group aspect-video bg-parchment"
        >
          <img
            src={gif.previewUrl}
            alt={gif.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-pm-dark/0 group-hover:bg-pm-dark/20 transition-colors" />
        </button>
      ))}
    </div>
  );
}
