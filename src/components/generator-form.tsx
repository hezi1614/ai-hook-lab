"use client";

import { WandSparkles } from "lucide-react";
import { CONTENT_TYPES, PLATFORMS, type ContentType, type Platform } from "../lib/types";

type TopicSample = {
  label: string;
  topic: string;
  platform: Platform;
  contentType: ContentType;
};

type GeneratorFormProps = {
  topic: string;
  platform: Platform;
  contentType: ContentType;
  isGenerating: boolean;
  error: string | null;
  onTopicChange: (topic: string) => void;
  onPlatformChange: (platform: Platform) => void;
  onContentTypeChange: (contentType: ContentType) => void;
  onGenerate: () => void;
};

const TOPIC_SAMPLES: TopicSample[] = [
  {
    label: "新手自媒体",
    topic: "普通人如何开始做自媒体",
    platform: PLATFORMS[0],
    contentType: CONTENT_TYPES[1],
  },
  {
    label: "AI工具推荐",
    topic: "3个适合新手的AI效率工具",
    platform: PLATFORMS[2],
    contentType: CONTENT_TYPES[3],
  },
  {
    label: "副业避坑",
    topic: "普通人做副业最容易踩的坑",
    platform: PLATFORMS[1],
    contentType: CONTENT_TYPES[4],
  },
];

export function GeneratorForm({
  topic,
  platform,
  contentType,
  isGenerating,
  error,
  onTopicChange,
  onPlatformChange,
  onContentTypeChange,
  onGenerate,
}: GeneratorFormProps) {
  const canGenerate = topic.trim().length > 0 && !isGenerating;

  function applySample(sample: TopicSample) {
    onTopicChange(sample.topic);
    onPlatformChange(sample.platform);
    onContentTypeChange(sample.contentType);
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (canGenerate) {
          onGenerate();
        }
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-900" htmlFor="topic">
          主题
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(event) => onTopicChange(event.target.value)}
          rows={4}
          placeholder="例如：普通人如何开始做自媒体"
          className="min-h-28 w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base leading-7 text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-lime-200/70"
        />
        <div className="flex flex-wrap gap-2">
          {TOPIC_SAMPLES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => applySample(sample)}
              className="h-8 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-xs font-semibold text-neutral-700 transition hover:border-neutral-950 hover:bg-white hover:text-neutral-950"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-neutral-900">平台</legend>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={platform === item}
              onClick={() => onPlatformChange(item)}
              className={`h-10 rounded-lg border px-3 text-sm font-medium transition ${
                platform === item
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-neutral-900">内容类型</legend>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={contentType === item}
              onClick={() => onContentTypeChange(item)}
              className={`h-10 rounded-lg border px-3 text-sm font-medium transition ${
                contentType === item
                  ? "border-lime-500 bg-lime-300 text-neutral-950"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!canGenerate}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-base font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
      >
        <WandSparkles className="h-5 w-5" aria-hidden="true" />
        {isGenerating ? "生成中" : "生成 10 个 Hook"}
      </button>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
