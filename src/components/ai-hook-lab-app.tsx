"use client";

import { Clock3, Heart, RefreshCw, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { EmptyState } from "./empty-state";
import { GeneratorForm } from "./generator-form";
import { HookCard } from "./hook-card";
import {
  addHistoryRecord,
  isFavorite,
  readFavorites,
  readHistory,
  toggleFavoriteItem,
  writeFavorites,
  writeHistory,
} from "../lib/storage";
import type {
  ApiErrorResponse,
  ContentType,
  FavoriteHook,
  GenerateHooksResponse,
  GenerationRecord,
  HookResult,
  Platform,
} from "../lib/types";

type ActivePanel = "history" | "favorites" | null;

const HistoryPanel = dynamic(
  () => import("./history-panel").then((module) => module.HistoryPanel),
  { ssr: false },
);

const FavoritesPanel = dynamic(
  () => import("./favorites-panel").then((module) => module.FavoritesPanel),
  { ssr: false },
);

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createFavorite(
  result: HookResult,
  recordId: string,
  topic: string,
  platform: Platform,
  contentType: ContentType,
): FavoriteHook {
  return {
    id: makeId("favorite"),
    sourceRecordId: recordId,
    topic,
    platform,
    contentType,
    createdAt: new Date().toISOString(),
    hook: result.hook,
    styleTag: result.styleTag,
    score: result.score,
    reason: result.reason,
  };
}

function ResultSkeletons() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-lg border border-neutral-200 bg-white p-5"
        >
          <div className="h-6 w-20 rounded-full bg-neutral-100" />
          <div className="mt-8 h-5 w-11/12 rounded bg-neutral-100" />
          <div className="mt-3 h-5 w-4/5 rounded bg-neutral-100" />
          <div className="mt-16 h-px bg-neutral-100" />
          <div className="mt-5 grid grid-cols-[72px_1fr] gap-4">
            <div className="h-12 rounded bg-neutral-100" />
            <div className="space-y-2">
              <div className="h-4 rounded bg-neutral-100" />
              <div className="h-4 w-3/4 rounded bg-neutral-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AiHookLabApp() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("小红书");
  const [contentType, setContentType] = useState<ContentType>("视频");
  const [results, setResults] = useState<HookResult[]>([]);
  const [history, setHistory] = useState<GenerationRecord[]>(() => readHistory());
  const [favorites, setFavorites] = useState<FavoriteHook[]>(() => readFavorites());
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const resultCountLabel = useMemo(() => {
    if (isGenerating) {
      return "生成中";
    }

    return results.length > 0 ? `${results.length} 条 Hook` : "等待输入";
  }, [isGenerating, results.length]);

  async function handleGenerate() {
    const trimmedTopic = topic.trim();

    if (trimmedTopic.length === 0) {
      setError("请输入一个要生成 Hook 的主题");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: trimmedTopic,
          platform,
          contentType,
        }),
      });
      const data = (await response.json()) as GenerateHooksResponse | ApiErrorResponse;

      if (!response.ok) {
        throw new Error("message" in data ? data.message : "生成失败，请稍后重试");
      }

      if (!("results" in data) || !Array.isArray(data.results)) {
        throw new Error("模型返回格式异常，请重试");
      }

      const record: GenerationRecord = {
        id: makeId("record"),
        topic: trimmedTopic,
        platform,
        contentType,
        createdAt: new Date().toISOString(),
        results: data.results,
      };
      const nextHistory = addHistoryRecord(history, record);

      setResults(data.results);
      setHistory(nextHistory);
      setCurrentRecordId(record.id);
      writeHistory(nextHistory);
      setError(data.warning ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleToggleFavorite(result: HookResult) {
    const favorite = createFavorite(
      result,
      currentRecordId ?? "current",
      topic.trim() || "未命名主题",
      platform,
      contentType,
    );
    const nextFavorites = toggleFavoriteItem(favorites, favorite);

    setFavorites(nextFavorites);
    writeFavorites(nextFavorites);
  }

  function handleRestore(record: GenerationRecord) {
    setTopic(record.topic);
    setPlatform(record.platform);
    setContentType(record.contentType);
    setResults(record.results);
    setCurrentRecordId(record.id);
    setError(null);
    setActivePanel(null);
  }

  return (
    <div className="min-h-screen bg-[#f5f6f2] text-neutral-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
        <aside className="lg:sticky lg:top-8 lg:flex lg:h-[calc(100vh-4rem)] lg:w-[360px] lg:shrink-0 lg:flex-col">
          <div className="flex flex-1 flex-col rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_22px_70px_rgba(20,20,20,0.07)] sm:p-5">
            <header className="mb-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-950 text-lime-300">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold tracking-normal text-neutral-950">
                AI Hook Lab
              </h1>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                为中文内容生成高点击开头
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePanel("history")}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                >
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  历史
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel("favorites")}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                >
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  收藏
                </button>
              </div>
            </header>

            <GeneratorForm
              topic={topic}
              platform={platform}
              contentType={contentType}
              isGenerating={isGenerating}
              error={error}
              onTopicChange={setTopic}
              onPlatformChange={setPlatform}
              onContentTypeChange={setContentType}
              onGenerate={handleGenerate}
            />

          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-neutral-500">Results</p>
              <h2 className="text-2xl font-semibold text-neutral-950">Hook Studio</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {results.length > 0 ? (
                <button
                  type="button"
                  aria-label="Regenerate hooks"
                  onClick={handleGenerate}
                  disabled={topic.trim().length === 0 || isGenerating}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  {isGenerating ? "生成中" : "再次生成"}
                </button>
              ) : null}
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-neutral-600">
                {resultCountLabel}
              </span>
            </div>
          </div>

          {isGenerating ? <ResultSkeletons /> : null}

          {!isGenerating && results.length === 0 ? <EmptyState /> : null}

          {!isGenerating && results.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {results.map((result) => (
                <HookCard
                  key={result.id}
                  result={result}
                  isFavorite={isFavorite(favorites, {
                    hook: result.hook,
                    topic: topic.trim() || "未命名主题",
                    platform,
                  })}
                  onToggleFavorite={() => handleToggleFavorite(result)}
                />
              ))}
            </div>
          ) : null}
        </main>
      </div>

      {activePanel === "history" ? (
        <HistoryPanel history={history} onRestore={handleRestore} onClose={() => setActivePanel(null)} />
      ) : null}

      {activePanel === "favorites" ? (
        <FavoritesPanel favorites={favorites} onClose={() => setActivePanel(null)} />
      ) : null}
    </div>
  );
}
