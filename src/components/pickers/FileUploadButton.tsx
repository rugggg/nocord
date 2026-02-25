import { useRef, useState, ChangeEvent } from "react";
import { MsgType } from "matrix-js-sdk";
import { useStore } from "../../store";

interface FileUploadButtonProps {
  roomId: string;
}

export function FileUploadButton({ roomId }: FileUploadButtonProps) {
  const matrixClient = useStore((s) => s.matrixClient);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !matrixClient) return;

    setUploading(true);
    setError("");
    try {
      const uploadResponse = await matrixClient.uploadContent(file);
      const mxcUrl = uploadResponse.content_uri;

      const isImage = file.type.startsWith("image/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (matrixClient.sendMessage as (roomId: string, content: any) => Promise<unknown>)(roomId, {
        msgtype: isImage ? MsgType.Image : MsgType.File,
        body: file.name,
        url: mxcUrl,
        info: {
          mimetype: file.type,
          size: file.size,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setTimeout(() => setError(""), 4000);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="*/*"
      />
      <div className="relative">
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          className={`p-2 rounded-lg transition-colors ${
            uploading
              ? "text-sky-blue animate-pulse cursor-wait"
              : "text-pm-gray hover:text-sky-blue hover:bg-parchment"
          }`}
          title={uploading ? "Uploading…" : "Upload file"}
        >
          {uploading ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="animate-spin">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 010 20" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          )}
        </button>
        {error && (
          <div className="absolute bottom-full left-0 mb-1 bg-mario-red text-white text-xs font-bold rounded-lg px-2 py-1 whitespace-nowrap z-10">
            {error}
          </div>
        )}
      </div>
    </>
  );
}
