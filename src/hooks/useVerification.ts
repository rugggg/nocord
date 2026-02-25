import { useState, useEffect, useCallback, useRef } from "react";
import {
  MatrixClient,
  CryptoEvent,
} from "matrix-js-sdk";
import {
  VerificationRequest,
  VerificationRequestEvent,
  VerificationPhase,
  Verifier,
  VerifierEvent,
  ShowSasCallbacks,
  EmojiMapping,
} from "matrix-js-sdk/lib/crypto-api";

export type VerificationPhaseState =
  | { type: "idle" }
  | { type: "requested"; request: VerificationRequest }
  | { type: "accepting" }
  | { type: "show_sas"; emojis: EmojiMapping[]; sasCallbacks: ShowSasCallbacks }
  | { type: "confirming" }
  | { type: "done" }
  | { type: "cancelled"; reason?: string }
  | { type: "error"; message: string };

export interface VerificationActions {
  accept: () => Promise<void>;
  decline: () => Promise<void>;
  confirmSas: () => Promise<void>;
  mismatchSas: () => void;
  dismiss: () => void;
}

export function useVerification(client: MatrixClient | null): {
  state: VerificationPhaseState;
  actions: VerificationActions;
} {
  const [state, setState] = useState<VerificationPhaseState>({ type: "idle" });

  // Keep a ref to the current request so callbacks always see the latest value
  const requestRef = useRef<VerificationRequest | null>(null);

  const setupVerifier = useCallback((verifier: Verifier) => {
    verifier.on(VerifierEvent.ShowSas, (sas: ShowSasCallbacks) => {
      setState({ type: "show_sas", emojis: sas.sas.emoji ?? [], sasCallbacks: sas });
    });

    verifier.on(VerifierEvent.Cancel, () => {
      setState({ type: "cancelled", reason: "Cancelled by the other device." });
    });

    // verify() drives the protocol — resolve = done, reject = error/cancel
    verifier.verify().then(() => {
      setState({ type: "done" });
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      // "Cancelled" from the other side surfaces as an error here
      if (msg.toLowerCase().includes("cancel")) {
        setState({ type: "cancelled" });
      } else {
        setState({ type: "error", message: msg });
      }
    });
  }, []);

  // Listen for incoming verification requests
  useEffect(() => {
    if (!client) return;

    const onRequest = (request: VerificationRequest) => {
      requestRef.current = request;
      setState({ type: "requested", request });

      // If the request expires or is cancelled before we act, clean up
      const onRequestChange = () => {
        if (request.phase === VerificationPhase.Cancelled) {
          setState({ type: "cancelled", reason: "Request expired or was cancelled." });
          request.off(VerificationRequestEvent.Change, onRequestChange);
        }
      };
      request.on(VerificationRequestEvent.Change, onRequestChange);
    };

    client.on(
      CryptoEvent.VerificationRequestReceived as Parameters<typeof client.on>[0],
      onRequest as Parameters<typeof client.on>[1]
    );
    return () => {
      client.removeListener(
        CryptoEvent.VerificationRequestReceived as Parameters<typeof client.removeListener>[0],
        onRequest as Parameters<typeof client.removeListener>[1]
      );
    };
  }, [client]);

  const accept = useCallback(async () => {
    const request = requestRef.current;
    if (!request) return;
    setState({ type: "accepting" });

    try {
      await request.accept();
    } catch (err) {
      setState({ type: "error", message: err instanceof Error ? err.message : String(err) });
      return;
    }

    // Try to start SAS — the other side might start it first, so handle both cases.
    let verifier: Verifier | null = null;
    try {
      verifier = await request.startVerification("m.sas.v1");
    } catch {
      // Other side started first; wait for VerificationRequestEvent.Change
    }

    if (verifier) {
      setupVerifier(verifier);
      return;
    }

    // Wait for the other side to start
    const onStarted = () => {
      if (request.verifier) {
        request.off(VerificationRequestEvent.Change, onStarted);
        setupVerifier(request.verifier);
      } else if (request.phase === VerificationPhase.Cancelled) {
        request.off(VerificationRequestEvent.Change, onStarted);
        setState({ type: "cancelled" });
      }
    };
    request.on(VerificationRequestEvent.Change, onStarted);
  }, [setupVerifier]);

  const decline = useCallback(async () => {
    const request = requestRef.current;
    if (!request) return;
    try {
      await request.cancel({ reason: "User declined", code: "m.user" });
    } catch { /* ignore */ }
    setState({ type: "idle" });
    requestRef.current = null;
  }, []);

  const confirmSas = useCallback(async () => {
    if (state.type !== "show_sas") return;
    setState({ type: "confirming" });
    try {
      await state.sasCallbacks.confirm();
    } catch (err) {
      setState({ type: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }, [state]);

  const mismatchSas = useCallback(() => {
    if (state.type !== "show_sas") return;
    state.sasCallbacks.mismatch();
    setState({ type: "cancelled", reason: "Emoji mismatch — verification cancelled." });
  }, [state]);

  const dismiss = useCallback(() => {
    setState({ type: "idle" });
    requestRef.current = null;
  }, []);

  return { state, actions: { accept, decline, confirmSas, mismatchSas, dismiss } };
}
