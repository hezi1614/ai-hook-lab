import type { GenerateHooksRequest, ModelMessage } from "./types";

const STYLE_POOL = [
  "反差型",
  "痛点型",
  "好奇型",
  "结果型",
  "共鸣型",
  "争议型",
  "清单型",
  "故事型",
  "反常识型",
  "紧迫感型",
] as const;

const PLATFORM_GUIDE = {
  小红书: "更重情绪、共鸣、生活化表达，像用户会主动点开的图文或视频开头。",
  抖音: "前三秒冲击强，短句、反差、痛点明显，适合快速停留。",
  B站: "可以稍微长一点，适合观点、教程、反常识和可展开的悬念。",
  YouTube: "像视频开场白，强调结果、悬念和继续看下去的理由。",
  X: "更短、更锋利、更观点化，适合一眼读完并转发讨论。",
} as const;

const CONTENT_TYPE_GUIDE = {
  视频: "开头要强停留，尽量在前三秒抓住注意力。",
  图文: "像标题或首句，适合点击、收藏和继续阅读。",
  产品广告: "突出痛点、变化、利益点，但不要虚假承诺。",
  教程: "突出结果、步骤、避坑和学完后的收益。",
  观点: "观点鲜明，有立场、有讨论感，但避免攻击性表达。",
} as const;

export function buildHookMessages(input: GenerateHooksRequest): ModelMessage[] {
  const system = [
    "你是中文新媒体爆款开头文案专家。",
    "你擅长为小红书、抖音、B站、YouTube、X 等平台创作高点击开头。",
    "你必须返回严格 JSON，不要输出 Markdown，不要解释 JSON 之外的内容。",
  ].join("\n");

  const user = [
    `主题：${input.topic}`,
    `平台：${input.platform}`,
    `内容类型：${input.contentType}`,
    "",
    "请生成 10 个不同风格的爆款开头 Hook。",
    "要求：",
    "- 使用中文",
    "- 每条 Hook 控制在适合平台的长度",
    "- 不要重复表达",
    "- 不要编造具体事实、数据或身份",
    "- 风格要有区分度",
    "- 每条都给出点击潜力评分 0-100",
    "- 每条都给出简短推荐理由",
    `- 可用风格池：${STYLE_POOL.join("、")}`,
    `- 平台适配：${PLATFORM_GUIDE[input.platform]}`,
    `- 内容类型适配：${CONTENT_TYPE_GUIDE[input.contentType]}`,
    "",
    "返回 JSON 格式：",
    '{"results":[{"hook":"...","styleTag":"反差型","score":89,"reason":"..."}]}',
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
