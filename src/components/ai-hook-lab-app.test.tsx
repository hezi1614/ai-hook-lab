import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiHookLabApp } from "./ai-hook-lab-app";

const generatedHook = {
  id: "hook-1",
  hook: "别再一上来就讲道理了，你的观众前三秒就划走了。",
  styleTag: "反差型",
  score: 92,
  reason: "用反差制造停留动机。",
};

describe("AiHookLabApp", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("generates hooks, renders results, and saves history locally", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [generatedHook] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AiHookLabApp />);

    const generateButton = screen.getByRole("button", { name: /生成 10 个 Hook/ });
    expect(generateButton).toBeDisabled();

    await user.type(screen.getByLabelText("主题"), "普通人如何开始做自媒体");
    expect(generateButton).toBeEnabled();

    await user.click(generateButton);

    expect(await screen.findByText(generatedHook.hook)).toBeInTheDocument();
    expect(screen.getByText("反差型")).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/generate-hooks",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      topic: "普通人如何开始做自媒体",
      platform: "小红书",
      contentType: "视频",
    });

    const history = JSON.parse(localStorage.getItem("ai-hook-lab:history") ?? "[]");
    expect(history[0]).toMatchObject({
      topic: "普通人如何开始做自媒体",
      platform: "小红书",
      contentType: "视频",
      results: [generatedHook],
    });
  });

  it("shows the configured API key error returned by the server", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          code: "MISSING_API_KEY",
          message: "服务端未配置 API Key，请在 .env.local 或 Vercel 环境变量中设置 AI_API_KEY",
        }),
      }),
    );

    render(<AiHookLabApp />);

    await user.type(screen.getByLabelText("主题"), "普通人如何开始做自媒体");
    await user.click(screen.getByRole("button", { name: /生成 10 个 Hook/ }));

    expect(
      await screen.findByText("服务端未配置 API Key，请在 .env.local 或 Vercel 环境变量中设置 AI_API_KEY"),
    ).toBeInTheDocument();
  });

  it("can open history and restore a previous generation", async () => {
    localStorage.setItem(
      "ai-hook-lab:history",
      JSON.stringify([
        {
          id: "record-1",
          topic: "历史主题",
          platform: "B站",
          contentType: "观点",
          createdAt: "2026-05-18T00:00:00.000Z",
          results: [generatedHook],
        },
      ]),
    );

    const user = userEvent.setup();
    render(<AiHookLabApp />);

    await user.click(screen.getByRole("button", { name: "历史" }));
    await user.click(await screen.findByRole("button", { name: /恢复 历史主题/ }));

    await waitFor(() => {
      expect(screen.getByText(generatedHook.hook)).toBeInTheDocument();
    });
  });
});
