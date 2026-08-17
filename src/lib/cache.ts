interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * A minimal in-memory cache with a fixed time-to-live per entry. Intended for
 * short-lived RPC results so repeated tool calls within a few seconds don't
 * hammer the RPC endpoint.
 */
export class TtlCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly ttlMs: number) {}

  /**
   * Return the cached value for `key` if it is still fresh, otherwise run
   * `factory`, cache its result, and return it.
   *
   * @param key Cache key.
   * @param factory Async producer invoked on a miss or expiry.
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = this.store.get(key);
    if (hit && hit.expiresAt > now) {
      return hit.value as T;
    }
    const value = await factory();
    this.store.set(key, { value, expiresAt: now + this.ttlMs });
    return value;
  }
}
