import { useRef, ChangeEvent } from "react";
import { MsgType } from "matrix-js-sdk";
import { useStore } from "../../store";

interface FileUploadButtonProps {
  roomId: string;
}

export function FileUploadButton({ roomId }: FileUploadButtonProps) {
  const matrixClient = useStore((s) => s.matrixClient);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !matrixClient) return;

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
      console.error("Upload failed:", err);
    }

    if (inputRef.current) inputRef.current.value = "";
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="p-2 rounded-lg text-pm-gray hover:text-sky-blue hover:bg-parchment transition-colors"
        title="Upload file"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
      </button>
    </>
  );
}
