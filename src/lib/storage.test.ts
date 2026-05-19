import { describe, expect, it } from "vitest";
import {
  HISTORY_LIMIT,
  STORAGE_KEYS,
  addHistoryRecord,
  readFavorites,
  readHistory,
  toggleFavoriteItem,
  writeFavorites,
  writeHistory,
} from "./storage";
import type { FavoriteHook, GenerationRecord } from "./types";

function createStorage() {
  const data = new Map<string, string>();

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  } as Storage;
}

function record(index: number): GenerationRecord {
  return {
    id: `record-${index}`,
    topic: `主题 ${index}`,
    platform: "小红书",
    contentType: "视频",
    createdAt: `2026-05-18T00:00:${String(index).padStart(2, "0")}.000Z`,
    results: [],
  };
}

function favorite(index: number): FavoriteHook {
  return {
    id: `favorite-${index}`,
    sourceRecordId: `record-${index}`,
    topic: "普通人如何开始做自媒体",
    platform: "小红书",
    contentType: "视频",
    createdAt: "2026-05-18T00:00:00.000Z",
    hook: "别再一上来就讲道理了。",
    styleTag: "反差型",
    score: 90,
    reason: "前三秒制造反差。",
  };
}

describe("storage helpers", () => {
  it("stores history newest first and keeps the latest 30 records", () => {
    const storage = createStorage();
    let history: GenerationRecord[] = [];

    for (let index = 0; index < HISTORY_LIMIT + 5; index += 1) {
      history = addHistoryRecord(history, record(index));
    }

    writeHistory(history, storage);
    const saved = readHistory(storage);

    expect(saved).toHaveLength(HISTORY_LIMIT);
    expect(saved[0].id).toBe("record-34");
    expect(saved.at(-1)?.id).toBe("record-5");
    expect(storage.getItem(STORAGE_KEYS.history)).toContain("record-34");
  });

  it("toggles favorites with hook-topic-platform de-duplication", () => {
    const storage = createStorage();
    const first = favorite(1);
    const duplicate = {
      ...favorite(2),
      hook: first.hook,
      topic: first.topic,
      platform: first.platform,
    };

    const added = toggleFavoriteItem([], first);
    const removed = toggleFavoriteItem(added, duplicate);

    writeFavorites(removed, storage);

    expect(added).toHaveLength(1);
    expect(removed).toHaveLength(0);
    expect(readFavorites(storage)).toEqual([]);
  });
});
