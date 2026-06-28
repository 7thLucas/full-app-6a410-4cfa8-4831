import { useCallback, useEffect, useState } from "react";

const KEY = "cinq.guestName";

/**
 * useGuestName — persists the guest's display name across visits so a
 * Customer or VIP can track their own live requests on return.
 */
export function useGuestName() {
  const [name, setName] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setName(window.localStorage.getItem(KEY) ?? "");
    setReady(true);
  }, []);

  const save = useCallback((value: string) => {
    const trimmed = value.trim();
    setName(trimmed);
    if (typeof window !== "undefined") {
      if (trimmed) window.localStorage.setItem(KEY, trimmed);
      else window.localStorage.removeItem(KEY);
    }
  }, []);

  return { name, ready, save };
}
