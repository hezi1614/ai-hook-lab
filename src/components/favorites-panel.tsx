"use client";

import { Copy, Heart, X } from "lucide-react";
import type { FavoriteHook } from "../lib/types";

type FavoritesPanelProps = {
  favorites: FavoriteHook[];
  onClose: () => void;
};

export function FavoritesPanel({ favorites, onClose }: FavoritesPanelProps) {
  return (
    <div className="fixed inset-0 z-40 bg-neutral-950/20 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-neutral-950">收藏</h2>
          </div>
          <button
            type="button"
            aria-label="关闭收藏"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {favorites.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-200 p-5 text-sm text-neutral-500">
              暂无收藏
            </p>
          ) : (
            favorites.map((favorite) => (
              <article
                key={favorite.id}
                className="rounded-lg border border-neutral-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    {favorite.styleTag}
                  </span>
                  <button
                    type="button"
                    aria-label="复制收藏 Hook"
                    onClick={() => navigator.clipboard.writeText(favorite.hook)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-base font-semibold leading-7 text-neutral-950">
                  {favorite.hook}
                </p>
                <p className="mt-3 text-sm text-neutral-500">
                  {favorite.topic} / {favorite.platform} / {favorite.contentType}
                </p>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
