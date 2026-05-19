import type { ModelMessage } from "./types";

const MODEL_SERVICE_ERROR = "模型服务暂时不可用，请稍后重试";
const INVALID_API_KEY_ERROR = "API Key 无效或无权限，请检查 AI_API_KEY。";
const QUOTA_ERROR = "当前 API Key 额度不足或账单不可用，请检查模型服务账户额度。";
const MODEL_CONFIG_ERROR = "模型名称或接口地址不可用，请检查 AI_MODEL 和 AI_BASE_URL。";
const NETWORK_ERROR = "无法连接模型服务，请检查网络、代理或 AI_BASE_URL。";

export class ModelClientError extends Error {
  constructor(
    public readonly status: number,
    message = MODEL_SERVICE_ERROR,
  ) {
    super(message);
    this.name = "ModelClientError";
  }
}

type RequestChatCompletionInput = {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: ModelMessage[];
  signal?: AbortSignal;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

function joinChatCompletionsUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

function extractProviderErrorCode(body: string) {
  try {
    const parsed = JSON.parse(body) as {
      error?: {
        code?: unknown;
        type?: unknown;
        message?: unknown;
      };
    };

    return [
      parsed.error?.code,
      parsed.error?.type,
      parsed.error?.message,
    ]
      .filter((value): value is string => typeof value === "string")
      .join(" ")
      .toLowerCase();
  } catch {
    return body.toLowerCase();
  }
}

function mapProviderError(status: number, body: string) {
  const detail = extractProviderErrorCode(body);

  if (status === 401 || status === 403) {
    return INVALID_API_KEY_ERROR;
  }

  if (status === 429 || detail.includes("insufficient_quota") || detail.includes("quota")) {
    return QUOTA_ERROR;
  }

  if (status === 404 || detail.includes("model_not_found")) {
    return MODEL_CONFIG_ERROR;
  }

  return MODEL_SERVICE_ERROR;
}

export async function requestChatCompletion({
  apiKey,
  baseUrl,
  model,
  messages,
  signal,
}: RequestChatCompletionInput): Promise<string> {
  let response: Response;

  try {
    response = await fetch(joinChatCompletionsUrl(baseUrl), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.9,
        response_format: { type: "json_object" },
      }),
      signal,
    });
  } catch {
    throw new ModelClientError(0, NETWORK_ERROR);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ModelClientError(response.status, mapProviderError(response.status, body));
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("模型返回格式异常");
  }

  return content;
}
