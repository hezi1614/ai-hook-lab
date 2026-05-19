"use client";

import { Check, Copy, Heart } from "lucide-react";
import { useState } from "react";
import type { HookResult } from "../lib/types";

type HookCardProps = {
  result: HookResult;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export function HookCard({ result, isFavorite, onToggleFavorite }: HookCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(result.hook);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <article className="flex min-h-72 flex-col justify-between rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_18px_50px_rgba(20,20,20,0.06)]">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-neutral-900">
            {result.styleTag}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={copied ? "已复制" : "复制 Hook"}
              title={copied ? "已复制" : "复制 Hook"}
              onClick={handleCopy}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              aria-label={isFavorite ? "取消收藏 Hook" : "收藏 Hook"}
              title={isFavorite ? "取消收藏 Hook" : "收藏 Hook"}
              onClick={onToggleFavorite}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                isFavorite
                  ? "border-orange-300 bg-orange-100 text-orange-700"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950"
              }`}
            >
              <Heart
                className="h-4 w-4"
                aria-hidden="true"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>

        <p className="text-xl font-semibold leading-8 text-neutral-950">{result.hook}</p>
      </div>

      <div className="mt-6 grid grid-cols-[72px_1fr] gap-4 border-t border-neutral-100 pt-4">
        <div>
          <p className="text-xs text-neutral-500">点击潜力</p>
          <p className="text-3xl font-bold tabular-nums text-neutral-950">{result.score}</p>
        </div>
        <p className="text-sm leading-6 text-neutral-600">{result.reason}</p>
      </div>
    </article>
  );
}
