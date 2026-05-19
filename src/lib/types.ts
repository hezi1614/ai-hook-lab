export const PLATFORMS = ["小红书", "抖音", "B站", "YouTube", "X"] as const;

export const CONTENT_TYPES = ["视频", "图文", "产品广告", "教程", "观点"] as const;

export type Platform = (typeof PLATFORMS)[number];

export type ContentType = (typeof CONTENT_TYPES)[number];

export type ModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GenerateHooksRequest = {
  topic: string;
  platform: Platform;
  contentType: ContentType;
};

export type HookResult = {
  id: string;
  hook: string;
  styleTag: string;
  score: number;
  reason: string;
};

export type GenerationRecord = {
  id: string;
  topic: string;
  platform: Platform;
  contentType: ContentType;
  createdAt: string;
  results: HookResult[];
};

export type FavoriteHook = {
  id: string;
  sourceRecordId: string;
  topic: string;
  platform: Platform;
  contentType: ContentType;
  createdAt: string;
  hook: string;
  styleTag: string;
  score: number;
  reason: string;
};

export type GenerateHooksResponse = {
  results: HookResult[];
  warning?: string;
};

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "MISSING_API_KEY"
  | "MODEL_SERVICE_ERROR"
  | "MODEL_FORMAT_ERROR"
  | "UNKNOWN_ERROR";

export type ApiErrorResponse = {
  code: ApiErrorCode;
  message: string;
};
