const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * In-memory TTL cache for AI responses.
 * Entries expire after the specified TTL (default 15 minutes).
 */
export const cache = {
  /** Get a cached value. Returns null if missing or expired. */
  get<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value as T;
  },

  /** Set a value with a TTL in milliseconds. */
  set<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
    store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  },

  /** Delete a specific key. */
  delete(key: string): void {
    store.delete(key);
  },

  /** Clear all entries. */
  clear(): void {
    store.clear();
  },

  /** Get current cache size (for testing). */
  size(): number {
    return store.size;
  },
};

/**
 * Create a hash key from input data for cache lookups.
 * Uses a simple string-based hash for deterministic keys.
 */
export function hashKey(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return `cache_${hash.toString(36)}`;
}
