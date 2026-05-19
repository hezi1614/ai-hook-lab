import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModelClientError, requestChatCompletion } from "../../../lib/model-client";
import { POST } from "./route";

vi.mock("../../../lib/model-client", async () => {
  const actual =
    await vi.importActual<typeof import("../../../lib/model-client")>(
      "../../../lib/model-client",
    );

  return {
    ...actual,
    requestChatCompletion: vi.fn(),
  };
});

function postRequest(body: unknown) {
  return new Request("http://localhost/api/generate-hooks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate-hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.AI_API_KEY;
    delete process.env.AI_BASE_URL;
    delete process.env.AI_MODEL;
  });

  it("returns a clear missing API key error without calling the provider", async () => {
    const response = await POST(
      postRequest({
        topic: "普通人如何开始做自媒体",
        platform: "小红书",
        contentType: "视频",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: "MISSING_API_KEY",
      message: "服务端未配置 API Key，请在 .env.local 或 Vercel 环境变量中设置 AI_API_KEY",
    });
    expect(requestChatCompletion).not.toHaveBeenCalled();
  });

  it("returns normalized hook results from the model provider", async () => {
    process.env.AI_API_KEY = "server-secret";
    process.env.AI_BASE_URL = "https://example.com/v1";
    process.env.AI_MODEL = "deepseek-chat";
    vi.mocked(requestChatCompletion).mockResolvedValue(
      JSON.stringify({
        results: [
          {
            hook: "别再一上来就讲道理了，你的观众前三秒就划走了。",
            styleTag: "反差型",
            score: 92,
            reason: "用反差制造停留动机。",
          },
        ],
      }),
    );

    const response = await POST(
      postRequest({
        topic: "普通人如何开始做自媒体",
        platform: "小红书",
        contentType: "视频",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.results).toHaveLength(1);
    expect(body.results[0]).toMatchObject({
      hook: "别再一上来就讲道理了，你的观众前三秒就划走了。",
      styleTag: "反差型",
      score: 92,
      reason: "用反差制造停留动机。",
    });
    expect(body.results[0].id).toEqual(expect.any(String));
    expect(requestChatCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "server-secret",
        baseUrl: "https://example.com/v1",
        model: "deepseek-chat",
      }),
    );
  });

  it("returns provider quota errors clearly", async () => {
    process.env.AI_API_KEY = "server-secret";
    vi.mocked(requestChatCompletion).mockRejectedValue(
      new ModelClientError(
        429,
        "当前 API Key 额度不足或账单不可用，请检查模型服务账户额度。",
      ),
    );

    const response = await POST(
      postRequest({
        topic: "普通人如何开始做自媒体",
        platform: "小红书",
        contentType: "视频",
      }),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      code: "MODEL_SERVICE_ERROR",
      message: "当前 API Key 额度不足或账单不可用，请检查模型服务账户额度。",
    });
  });
});
