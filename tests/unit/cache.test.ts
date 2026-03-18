import { describe, it, expect, beforeEach, vi } from "vitest";
import { cache, hashKey } from "@/lib/cache";

describe("cache", () => {
  beforeEach(() => {
    cache.clear();
  });

  it("returns null for missing keys", () => {
    expect(cache.get("nonexistent")).toBeNull();
  });

  it("stores and retrieves values", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns null for expired entries", () => {
    vi.useFakeTimers();
    cache.set("key1", "value1", 1000); // 1 second TTL
    vi.advanceTimersByTime(1001);
    expect(cache.get("key1")).toBeNull();
    vi.useRealTimers();
  });

  it("returns value before TTL expires", () => {
    vi.useFakeTimers();
    cache.set("key1", "value1", 5000);
    vi.advanceTimersByTime(4999);
    expect(cache.get("key1")).toBe("value1");
    vi.useRealTimers();
  });

  it("deletes specific keys", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.delete("key1");
    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBe("value2");
  });

  it("clears all entries", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it("reports correct size", () => {
    expect(cache.size()).toBe(0);
    cache.set("key1", "value1");
    expect(cache.size()).toBe(1);
    cache.set("key2", "value2");
    expect(cache.size()).toBe(2);
  });
});

describe("hashKey", () => {
  it("produces deterministic keys for same input", () => {
    const key1 = hashKey({ a: 1, b: "test" });
    const key2 = hashKey({ a: 1, b: "test" });
    expect(key1).toBe(key2);
  });

  it("produces different keys for different input", () => {
    const key1 = hashKey({ a: 1 });
    const key2 = hashKey({ a: 2 });
    expect(key1).not.toBe(key2);
  });

  it("prefixes keys with 'cache_'", () => {
    const key = hashKey("test");
    expect(key).toMatch(/^cache_/);
  });
});
