import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePoll — runs an async fetcher immediately and then on an interval,
 * powering the live request loop. Returns the latest data, a loading flag
 * for the first load, and a manual refresh trigger.
 */
export function usePoll<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const tick = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch {
      // swallow — next tick retries
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    tick();
    const safeInterval = Math.max(1000, intervalMs || 3000);
    const id = setInterval(tick, safeInterval);
    return () => clearInterval(id);
  }, [intervalMs, tick, ...deps]);

  return { data, loading, refresh: tick };
}
