import { describe, expect, it } from "vitest";
import { parseHookResults } from "./model-response";

describe("parseHookResults", () => {
  it("normalizes valid model JSON into hook results with server ids", () => {
    const results = parseHookResults(
      JSON.stringify({
        results: [
          {
            hook: "别再一上来就讲道理了，你的观众前三秒就划走了。",
            styleTag: "反差型",
            score: 108,
            reason: "用反常识提醒制造停留动机。",
          },
          {
            hook: "如果你也想开始做自媒体，先避开这 3 个坑。",
            styleTag: "痛点型",
            score: -12,
            reason: "直接指出新手最关心的风险。",
          },
        ],
      }),
      () => "fixed-id",
    );

    expect(results).toEqual([
      {
        id: "fixed-id",
        hook: "别再一上来就讲道理了，你的观众前三秒就划走了。",
        styleTag: "反差型",
        score: 100,
        reason: "用反常识提醒制造停留动机。",
      },
      {
        id: "fixed-id",
        hook: "如果你也想开始做自媒体，先避开这 3 个坑。",
        styleTag: "痛点型",
        score: 0,
        reason: "直接指出新手最关心的风险。",
      },
    ]);
  });

  it("rejects malformed or empty model output", () => {
    expect(() => parseHookResults("not-json")).toThrow("模型返回格式异常");
    expect(() => parseHookResults(JSON.stringify({ results: [] }))).toThrow(
      "模型没有返回可用 Hook",
    );
  });
});
