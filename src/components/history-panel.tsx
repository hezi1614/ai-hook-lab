"use client";

import { Clock3, X } from "lucide-react";
import type { GenerationRecord } from "../lib/types";

type HistoryPanelProps = {
  history: GenerationRecord[];
  onRestore: (record: GenerationRecord) => void;
  onClose: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function HistoryPanel({ history, onRestore, onClose }: HistoryPanelProps) {
  return (
    <div className="fixed inset-0 z-40 bg-neutral-950/20 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-neutral-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-neutral-950">历史</h2>
          </div>
          <button
            type="button"
            aria-label="关闭历史"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {history.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-200 p-5 text-sm text-neutral-500">
              暂无历史
            </p>
          ) : (
            history.map((record) => (
              <button
                key={record.id}
                type="button"
                aria-label={`恢复 ${record.topic}`}
                onClick={() => onRestore(record)}
                className="w-full rounded-lg border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-950"
              >
                <span className="block text-base font-semibold text-neutral-950">
                  {record.topic}
                </span>
                <span className="mt-2 block text-sm text-neutral-500">
                  {record.platform} / {record.contentType} / {formatDate(record.createdAt)}
                </span>
                <span className="mt-1 block text-sm text-neutral-500">
                  {record.results.length} 条 Hook
                </span>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
