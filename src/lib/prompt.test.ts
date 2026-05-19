import { describe, expect, it } from "vitest";
import { buildHookMessages } from "./prompt";

describe("buildHookMessages", () => {
  it("builds strict JSON instructions for Chinese viral hooks", () => {
    const messages = buildHookMessages({
      topic: "普通人如何开始做自媒体",
      platform: "小红书",
      contentType: "视频",
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      role: "system",
    });
    expect(messages[0].content).toContain("中文新媒体爆款开头文案专家");
    expect(messages[0].content).toContain("严格 JSON");
    expect(messages[1].content).toContain("主题：普通人如何开始做自媒体");
    expect(messages[1].content).toContain("平台：小红书");
    expect(messages[1].content).toContain("内容类型：视频");
    expect(messages[1].content).toContain("10 个不同风格");
    expect(messages[1].content).toContain("反差型");
    expect(messages[1].content).toContain("点击潜力评分");
  });
});
