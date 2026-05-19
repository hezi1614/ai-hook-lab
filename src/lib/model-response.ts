import type { HookResult } from "./types";

type RawHookResult = {
  hook?: unknown;
  styleTag?: unknown;
  score?: unknown;
  reason?: unknown;
};

type RawModelResponse = {
  results?: unknown;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function stripCodeFence(content: string) {
  const trimmed = content.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function toScore(value: unknown) {
  const score = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

function toNonEmptyString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseHookResults(
  content: string,
  idFactory: () => string = createId,
): HookResult[] {
  let parsed: RawModelResponse;

  try {
    parsed = JSON.parse(stripCodeFence(content)) as RawModelResponse;
  } catch {
    throw new Error("模型返回格式异常");
  }

  if (!Array.isArray(parsed.results)) {
    throw new Error("模型返回格式异常");
  }

  const results = parsed.results
    .slice(0, 10)
    .map((item) => {
      const raw = item as RawHookResult;
      const hook = toNonEmptyString(raw.hook);
      const styleTag = toNonEmptyString(raw.styleTag);
      const reason = toNonEmptyString(raw.reason);

      if (!hook || !styleTag || !reason) {
        return null;
      }

      return {
        id: idFactory(),
        hook,
        styleTag,
        score: toScore(raw.score),
        reason,
      };
    })
    .filter((item): item is HookResult => item !== null);

  if (results.length === 0) {
    throw new Error("模型没有返回可用 Hook");
  }

  return results;
}
