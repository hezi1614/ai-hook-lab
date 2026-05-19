import { parseHookResults } from "../../../lib/model-response";
import { ModelClientError, requestChatCompletion } from "../../../lib/model-client";
import { buildHookMessages } from "../../../lib/prompt";
import {
  CONTENT_TYPES,
  PLATFORMS,
  type ContentType,
  type GenerateHooksRequest,
  type Platform,
} from "../../../lib/types";
import type { ApiErrorCode, ApiErrorResponse, GenerateHooksResponse } from "../../../lib/types";

export const runtime = "nodejs";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 30_000;

type RawGenerateRequest = {
  topic?: unknown;
  platform?: unknown;
  contentType?: unknown;
};

type NormalizedRequest =
  | { ok: false; error: string }
  | { ok: true; value: GenerateHooksRequest };

function jsonError(code: ApiErrorCode, message: string, status: number) {
  return Response.json({ code, message } satisfies ApiErrorResponse, { status });
}

function normalizeRequest(body: RawGenerateRequest): NormalizedRequest {
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const platform = body.platform;
  const contentType = body.contentType;

  if (topic.length < 2) {
    return { ok: false, error: "请输入一个要生成 Hook 的主题" };
  }

  if (!PLATFORMS.includes(platform as Platform)) {
    return { ok: false, error: "请选择有效的平台" };
  }

  if (!CONTENT_TYPES.includes(contentType as ContentType)) {
    return { ok: false, error: "请选择有效的内容类型" };
  }

  return {
    ok: true,
    value: {
      topic,
      platform: platform as Platform,
      contentType: contentType as ContentType,
    },
  };
}

function timeoutSignal() {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  }

  return undefined;
}

export async function POST(request: Request) {
  let body: RawGenerateRequest;

  try {
    body = (await request.json()) as RawGenerateRequest;
  } catch {
    return jsonError("INVALID_INPUT", "请求格式不正确", 400);
  }

  const normalized = normalizeRequest(body);

  if (!normalized.ok) {
    return jsonError("INVALID_INPUT", normalized.error, 400);
  }

  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "MISSING_API_KEY",
      "服务端未配置 API Key，请在 .env.local 或 Vercel 环境变量中设置 AI_API_KEY",
      500,
    );
  }

  try {
    const modelContent = await requestChatCompletion({
      apiKey,
      baseUrl: process.env.AI_BASE_URL ?? DEFAULT_BASE_URL,
      model: process.env.AI_MODEL ?? DEFAULT_MODEL,
      messages: buildHookMessages(normalized.value),
      signal: timeoutSignal(),
    });
    const results = parseHookResults(modelContent);

    return Response.json({
      results,
      warning:
        results.length < 10
          ? `本次只生成了 ${results.length} 条，建议重试`
          : undefined,
    } satisfies GenerateHooksResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const isFormatError = message.includes("模型返回");
    const isModelClientError = error instanceof ModelClientError;

    return jsonError(
      isFormatError ? "MODEL_FORMAT_ERROR" : "MODEL_SERVICE_ERROR",
      isFormatError
        ? "模型返回格式异常，请重试"
        : isModelClientError
          ? error.message
          : "模型服务暂时不可用，请稍后重试",
      502,
    );
  }
}
