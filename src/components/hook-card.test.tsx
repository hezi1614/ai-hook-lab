import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HookCard } from "./hook-card";
import type { HookResult } from "../lib/types";

const result: HookResult = {
  id: "hook-1",
  hook: "别再一上来就讲道理了，你的观众前三秒就划走了。",
  styleTag: "反差型",
  score: 92,
  reason: "用反差制造停留动机。",
};

describe("HookCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("copies the hook text and toggles favorite", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onToggleFavorite = vi.fn();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    render(
      <HookCard
        result={result}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    await user.click(screen.getByRole("button", { name: "复制 Hook" }));
    expect(writeText).toHaveBeenCalledWith(result.hook);
    expect(await screen.findByRole("button", { name: "已复制" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "收藏 Hook" }));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });
});
