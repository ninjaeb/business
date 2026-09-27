import OpenAI, { APIError } from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { z } from "zod";
import { getConfiguredSiteOrigin } from "@/lib/site-url";

declare global {
  var openRouterClientGlobal: OpenAI | undefined;
}

// Both overridable per deployment (e.g. to a stronger or paid model) without
// a code change — see callAi below for which one a given request uses and
// how a comma-separated value becomes a primary model plus OpenRouter
// fallbacks.
//
// OPENROUTER_MODEL (text-only requests: ai-insights.ts, testimonials.ts,
// autoCreateListingDetails's tagline/description/services/faqs generation)
// defaults to 10 of OpenRouter's own top free models, verified against its
// /rankings (real-world usage, free or paid) and /models (capabilities) on
// 2026-09-27, ordered as a priority list:
//   1. nvidia/nemotron-3-ultra-550b-a55b:free — OpenRouter's #7
//      highest-usage model platform-wide, and the top-ranked free one.
//      Doesn't advertise json_object/response_format support in its
//      OpenRouter listing, so a reply that isn't valid JSON is possible —
//      callAi's existing JSON.parse/Zod validation already surfaces that
//      as a normal "AI request failed" error rather than crashing.
//   2. nvidia/nemotron-3-super-120b-a12b:free — smaller sibling of #1,
//      explicitly advertises response_format support.
//   3. google/gemma-4-31b-it:free — different provider (spreads risk if
//      NVIDIA's free endpoints get rate-limited), also advertises
//      response_format support.
//   4. google/gemma-4-26b-a4b-it:free — slightly smaller Gemma sibling,
//      same response_format support.
//   5. qwen/qwen3.8-27b:free — different provider again, response_format
//      support.
//   6. nvidia/nemotron-3.5-lightning:free — newer, lighter NVIDIA tier.
//   7. thinkingmachines/inkling:free — 1M+ context, multimodal.
//   8. thinkingmachines/inkling-small:free — same family, smaller/faster.
//   9. nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free — omni-modal,
//      reasoning-tuned.
//   10. dots-studio/dots-3-note-preview:free — 512K context, vision,
//       response_format support.
// Listed as a priority list, not a single pin, precisely so this app isn't
// betting everything on one free model staying available: if the first is
// down, deprecated, or rate-limited, OpenRouter's own model-fallback
// feature (see callAi's `models` field) automatically tries the next, all
// the way down this list.
//
// OPENROUTER_VISION_MODEL (image-bearing requests: scan-business-card.ts,
// scan-partner-business-card.ts) stays on "openrouter/free", OpenRouter's
// own dynamic free-tier router — every model above is text-only and can't
// take the image_url content those two callers send. The router picks
// whichever free backend model is currently available and capable of the
// request, including vision and tool calling, rather than pinning this app
// to one specific free vision model that might get deprecated or rate-
// limited on its own.
//
// Both use plain json_object mode (not OpenAI's stricter json_schema mode)
// for structured output, since it's supported by virtually every model
// OpenRouter could route to, free or otherwise.
export const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ||
  [
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "qwen/qwen3.8-27b:free",
    "nvidia/nemotron-3.5-lightning:free",
    "thinkingmachines/inkling:free",
    "thinkingmachines/inkling-small:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "dots-studio/dots-3-note-preview:free",
  ].join(",");
export const OPENROUTER_VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || "openrouter/free";

// Splits one of the constants above (or their env override) into a primary
// model plus fallbacks for OpenRouter's model-fallback feature — a single
// value with no comma is just a one-element priority list, so this also
// covers OPENROUTER_VISION_MODEL's plain "openrouter/free" default.
function parseModelPriorityList(value: string): { model: string; fallbacks: string[] } {
  const [model, ...fallbacks] = value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return { model, fallbacks };
}

export function isAiConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function getOpenRouterClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (!globalThis.openRouterClientGlobal) {
    globalThis.openRouterClientGlobal = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      maxRetries: 2,
      // Both optional and purely cosmetic on OpenRouter's own dashboard/
      // rankings — never read by this app, safe to omit if SITE_URL isn't set.
      defaultHeaders: {
        "HTTP-Referer": getConfiguredSiteOrigin() ?? undefined,
        "X-Title": "Gotka CRM",
      },
    });
  }
  return globalThis.openRouterClientGlobal;
}

// Shared across every "use server" file that calls the AI — kept here rather
// than in one of them since a "use server" module can only export async
// functions.
export function describeAiError(error: unknown): string {
  if (error instanceof APIError) {
    if (error.status === 401 || error.status === 403) {
      return "AI request failed: check that OPENROUTER_API_KEY is set correctly.";
    }
    if (error.status === 429) {
      return "AI request was rate-limited — try again in a moment.";
    }
    if (error.status && error.status >= 500) {
      return `The AI service is temporarily overloaded — try again in a moment. (${error.message})`;
    }
    return `AI request failed: ${error.message}`;
  }
  return "AI request failed unexpectedly.";
}

export type AiResult<T> = { status: "ok"; data: T } | { status: "error"; message: string };

export const AI_NOT_CONFIGURED: AiResult<never> = {
  status: "error",
  message: "AI features aren't configured — set OPENROUTER_API_KEY to enable them.",
};

// Shared across every "use server" file that needs structured JSON back from
// the model (see ai-insights.ts, testimonials.ts, scan-business-card.ts) —
// kept here rather than in one of them since a "use server" module can only
// export async functions, and each caller supplies its own systemPrompt/
// persona rather than this hardcoding one voice for every feature.
//
// `userContent` is a plain string for text-only callers, or an array of
// OpenAI-style content parts (text + image_url) for scan-business-card.ts's
// vision request — the Chat Completions message format both routes through.
// Which one it is also picks OPENROUTER_MODEL vs OPENROUTER_VISION_MODEL
// (see their own comments above) — an image_url part means the request
// needs a vision-capable model, which OPENROUTER_MODEL's pinned default
// isn't. Each constant's own priority list becomes a primary `model` plus
// an OpenRouter `models` fallback array (see parseModelPriorityList) — an
// OpenRouter extension the official chat-completions type doesn't declare,
// so the params object is typed loosely enough to carry it; the openai SDK
// just serializes whatever's on this object into the request body, so the
// extra field reaches OpenRouter same as it would over a raw HTTP call.
//
// There's no cross-provider equivalent of Gemini's native responseJsonSchema
// reliable enough to depend on for every model these constants might be set
// to, so the schema is instead spelled out in the prompt and enforced by
// parsing + Zod validation afterward, same as before the JSON came back
// pre-validated by the provider.
export async function callAi<T>(
  schema: z.ZodType<T>,
  systemPrompt: string,
  userContent: string | ChatCompletionContentPart[],
): Promise<AiResult<T>> {
  try {
    const client = getOpenRouterClient();
    const hasImage = Array.isArray(userContent) && userContent.some((part) => part.type === "image_url");
    const { model, fallbacks } = parseModelPriorityList(hasImage ? OPENROUTER_VISION_MODEL : OPENROUTER_MODEL);
    const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & { models?: string[] } = {
      model,
      ...(fallbacks.length > 0 ? { models: fallbacks } : {}),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nRespond with ONLY a single JSON object (no surrounding text, no markdown code fence) matching this JSON Schema:\n${JSON.stringify(z.toJSONSchema(schema))}`,
        },
        { role: "user", content: userContent },
      ],
    };
    const response = await client.chat.completions.create(params);

    const choice = response.choices[0];
    const finishReason = choice?.finish_reason;
    if (finishReason && finishReason !== "stop" && finishReason !== "length") {
      return { status: "error", message: "The AI declined to respond to this request." };
    }

    const text = choice?.message?.content;
    if (!text) {
      return { status: "error", message: "The model didn't return a usable response." };
    }

    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      return { status: "error", message: "The model didn't return a usable response." };
    }
    return { status: "ok", data: parsed.data };
  } catch (error) {
    return { status: "error", message: describeAiError(error) };
  }
}
