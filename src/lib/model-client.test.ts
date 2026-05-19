import { afterEach, describe, expect, it, vi } from "vitest";
import { ModelClientError, requestChatCompletion } from "./model-client";

describe("requestChatCompletion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls an OpenAI-compatible chat completions endpoint without exposing the key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "{\"results\":[]}" } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const content = await requestChatCompletion({
      apiKey: "secret-key",
      baseUrl: "https://example.com/v1/",
      model: "deepseek-chat",
      messages: [{ role: "user", content: "hello" }],
    });

    expect(content).toBe("{\"results\":[]}");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer secret-key",
          "Content-Type": "application/json",
        },
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      model: "deepseek-chat",
      messages: [{ role: "user", content: "hello" }],
    });
  });

  it("throws a sanitized error when the provider rejects the request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "invalid api key: secret-key",
      }),
    );

    await expect(
      requestChatCompletion({
        apiKey: "secret-key",
        baseUrl: "https://example.com/v1",
        model: "deepseek-chat",
        messages: [{ role: "user", content: "hello" }],
      }),
    ).rejects.toEqual(new ModelClientError(401, "API Key 无效或无权限，请检查 AI_API_KEY。"));
  });

  it("maps provider quota errors to a clear billing message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () =>
          JSON.stringify({
            error: {
              message: "You exceeded your current quota",
              type: "insufficient_quota",
              code: "insufficient_quota",
            },
          }),
      }),
    );

    await expect(
      requestChatCompletion({
        apiKey: "secret-key",
        baseUrl: "https://example.com/v1",
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "hello" }],
      }),
    ).rejects.toEqual(
      new ModelClientError(
        429,
        "当前 API Key 额度不足或账单不可用，请检查模型服务账户额度。",
      ),
    );
  });

  it("maps network failures to a clear connectivity message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    await expect(
      requestChatCompletion({
        apiKey: "secret-key",
        baseUrl: "https://example.com/v1",
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "hello" }],
      }),
    ).rejects.toEqual(
      new ModelClientError(0, "无法连接模型服务，请检查网络、代理或 AI_BASE_URL。"),
    );
  });
});
