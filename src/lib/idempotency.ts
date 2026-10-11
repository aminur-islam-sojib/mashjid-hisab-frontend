import * as React from "react";

/**
 * Generates a unique UUID v4 string.
 * Uses crypto.randomUUID() when available, with a random fallback.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * React hook that holds an idempotency key ref for a modal/form session.
 * Generates a new key every time isOpen transitions from false to true,
 * or on initial mount.
 */
export function useIdempotencyKey(isOpen: boolean = true): {
  key: string;
  regenerate: () => string;
} {
  const keyRef = React.useRef<string>(generateIdempotencyKey());
  const prevOpenRef = React.useRef<boolean>(isOpen);

  React.useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      keyRef.current = generateIdempotencyKey();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  const regenerate = React.useCallback(() => {
    keyRef.current = generateIdempotencyKey();
    return keyRef.current;
  }, []);

  return { key: keyRef.current, regenerate };
}

