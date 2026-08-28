"use client";

import { useCallback, useEffect, useState } from "react";
import { get, set } from "idb-keyval";

export type QueuedItem<T> = {
  tempId: string;
  payload: T;
  createdAt: number;
  status: "pending" | "syncing" | "error";
};

/**
 * Optimistic local-write queue for a single mobile logging form (e.g. lifecycle
 * events, feed logs). Submits are written to IndexedDB immediately so nothing
 * is lost on flaky farm wifi/cellular, then synced in the background and
 * retried on reconnect. Deliberately simple: no conflict resolution, since
 * these are append-only logs written by one person at a time.
 */
export function useOfflineQueue<T>(queueKey: string, syncFn: (payload: T) => Promise<void>) {
  const [items, setItems] = useState<QueuedItem<T>[]>([]);

  const loadQueue = useCallback(async () => {
    const stored = (await get<QueuedItem<T>[]>(queueKey)) ?? [];
    setItems(stored);
    return stored;
  }, [queueKey]);

  const flush = useCallback(async () => {
    const current = await loadQueue();
    for (const item of current) {
      try {
        await syncFn(item.payload);
        const remaining = ((await get<QueuedItem<T>[]>(queueKey)) ?? []).filter(
          (i) => i.tempId !== item.tempId
        );
        await set(queueKey, remaining);
        setItems(remaining);
      } catch {
        // Stay queued; will retry on next flush (mount or "online" event).
        break;
      }
    }
  }, [queueKey, syncFn, loadQueue]);

  useEffect(() => {
    loadQueue();
    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(
    async (payload: T) => {
      const item: QueuedItem<T> = {
        tempId: crypto.randomUUID(),
        payload,
        createdAt: Date.now(),
        status: "pending",
      };
      const current = (await get<QueuedItem<T>[]>(queueKey)) ?? [];
      const next = [...current, item];
      await set(queueKey, next);
      setItems(next);
      await flush();
    },
    [queueKey, flush]
  );

  return { items, submit, pendingCount: items.length };
}
