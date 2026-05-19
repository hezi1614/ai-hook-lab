import type { FavoriteHook, GenerationRecord } from "./types";

export const HISTORY_LIMIT = 30;

export const STORAGE_KEYS = {
  history: "ai-hook-lab:history",
  favorites: "ai-hook-lab:favorites",
} as const;

function safeParseArray<T>(value: string | null): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function canUseStorage(storage?: Storage): storage is Storage {
  return typeof storage !== "undefined";
}

function currentStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

export function readHistory(storage = currentStorage()): GenerationRecord[] {
  if (!canUseStorage(storage)) {
    return [];
  }

  return safeParseArray<GenerationRecord>(storage.getItem(STORAGE_KEYS.history));
}

export function writeHistory(
  history: GenerationRecord[],
  storage = currentStorage(),
) {
  if (!canUseStorage(storage)) {
    return;
  }

  storage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
}

export function addHistoryRecord(
  history: GenerationRecord[],
  record: GenerationRecord,
) {
  return [record, ...history.filter((item) => item.id !== record.id)].slice(0, HISTORY_LIMIT);
}

export function readFavorites(storage = currentStorage()): FavoriteHook[] {
  if (!canUseStorage(storage)) {
    return [];
  }

  return safeParseArray<FavoriteHook>(storage.getItem(STORAGE_KEYS.favorites));
}

export function writeFavorites(
  favorites: FavoriteHook[],
  storage = currentStorage(),
) {
  if (!canUseStorage(storage)) {
    return;
  }

  storage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
}

export function favoriteKey(favorite: Pick<FavoriteHook, "hook" | "topic" | "platform">) {
  return `${favorite.hook.trim()}::${favorite.topic.trim()}::${favorite.platform}`;
}

export function toggleFavoriteItem(
  favorites: FavoriteHook[],
  favorite: FavoriteHook,
) {
  const key = favoriteKey(favorite);
  const exists = favorites.some((item) => favoriteKey(item) === key);

  if (exists) {
    return favorites.filter((item) => favoriteKey(item) !== key);
  }

  return [favorite, ...favorites];
}

export function isFavorite(
  favorites: FavoriteHook[],
  favorite: Pick<FavoriteHook, "hook" | "topic" | "platform">,
) {
  const key = favoriteKey(favorite);
  return favorites.some((item) => favoriteKey(item) === key);
}
