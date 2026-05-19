import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white/70 px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-950 text-lime-300">
        <Sparkles className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-semibold text-neutral-950">第一批 Hook 会在这里成形</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600">
        10 种风格排开，留下最有爆发力的一句。
      </p>
    </div>
  );
}
