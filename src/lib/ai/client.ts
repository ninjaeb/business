import OpenAI, { APIConnectionTimeoutError, APIError } from "openai";
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
// defaults to 4 of OpenRouter's own top free models, ordered by SPEED
// first rather than raw usage rank — an earlier version led with Nemotron
// 3 Ultra (OpenRouter's #7 highest-usage model platform-wide, the top-
// ranked free one by usage), but that model — and every other candidate
// except the two below — has "reasoning" ON by default per OpenRouter's
// /models data (its own hidden chain-of-thought pass before answering),
// which made every AI-assisted feature noticeably slow in practice. These
// two are the only free models in OpenRouter's catalog that are both
// confirmed non-reasoning (reasoning.default_enabled: false) AND support
// response_format/JSON mode, verified 2026-09-27:
//   1. google/gemma-4-31b-it:free — no reasoning overhead, JSON mode.
//   2. google/gemma-4-26b-a4b-it:free — same family, slightly smaller/
//      faster, same JSON mode support.
// The remaining two slots trade some of that speed guarantee for provider
// diversity (both above are Google) — neither advertises reasoning in its
// listing either (no `reasoning` field at all, vs. an explicit "on"), and
// neither is from NVIDIA:
//   3. nvidia/nemotron-3.5-lightning:free — no `reasoning` field, "Lightning"
//      branding, but no confirmed JSON mode.
//   4. cohere/north-mini-code:free — no `reasoning` field, "mini" branding,
//      no confirmed JSON mode.
// Only 4 total (not more of OpenRouter's other top free models) because
// OpenRouter's model-fallback feature caps the `models` field itself (see
// MAX_MODEL_FALLBACKS below) at 3 entries beyond the primary — a longer
// list was tried in production on 2026-09-27 and every request failed with
// "400 'models' array must have 3 items or fewer", contradicting what
// OpenRouter's own docs for this feature say elsewhere. Listed as a
// priority list, not a single pin, precisely so this app isn't betting
// everything on one free model staying available: if the first is down,
// deprecated, or rate-limited, OpenRouter tries the next automatically.
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
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3.5-lightning:free",
    "cohere/north-mini-code:free",
  ].join(",");
export const OPENROUTER_VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || "openrouter/free";

// OpenRouter's own real limit on its `models` fallback field — see
// OPENROUTER_MODEL's own comment above for how this was discovered. Applied
// defensively in parseModelPriorityList so a misconfigured/overlong
// OPENROUTER_MODEL or OPENROUTER_VISION_MODEL env override degrades to
// "extra entries ignored" instead of a hard 400 on every AI request.
const MAX_MODEL_FALLBACKS = 3;

// Splits one of the constants above (or their env override) into a primary
// model plus fallbacks for OpenRouter's model-fallback feature — a single
// value with no comma is just a one-element priority list, so this also
// covers OPENROUTER_VISION_MODEL's plain "openrouter/free" default.
function parseModelPriorityList(value: string): { model: string; fallbacks: string[] } {
  const [model, ...fallbacks] = value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return { model, fallbacks: fallbacks.slice(0, MAX_MODEL_FALLBACKS) };
}

export function isAiConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

// The openai SDK's own default is 10 minutes, retried up to maxRetries
// times on top of that — a slow/overloaded free model (or OpenRouter
// working through this app's own multi-model fallback list server-side
// within that one HTTP call) could then hang far longer than the shared
// hosting stack's own reverse-proxy timeout, which kills the connection
// out from under it. The browser then shows its own generic connection-
// failure page instead of the graceful "AI request failed" toast callAi
// would otherwise produce — reported in production 2026-09-27 as
// "This page couldn't load" while using Translate with AI. Set well under
// a typical proxy timeout so this app's own error handling gets there
// first. This is the default for every callAi() call; a caller whose
// prompt is unusually large in either direction (a lot of input to read,
// a lot of output to write — see autoCreateListingDetails's own comment)
// can ask for more time via callAi's own timeoutMs option instead of this
// number being raised for everyone.
const REQUEST_TIMEOUT_MS = 20_000;

// Every model this app's OPENROUTER_MODEL/OPENROUTER_VISION_MODEL could
// route to defaults to a much larger completion budget left unset (up to
// 32K-65K tokens per OpenRouter's own /models data) — generous for open-
// ended chat, but this app only ever wants one JSON object built from a
// known, bounded schema. An unbounded budget is itself a latency risk
// independent of reasoning (see callAi's own reasoning: {effort: "none"}
// comment) — nothing stops a model from generating a long, rambling
// response before finally emitting valid JSON. 4000 tokens comfortably
// covers every schema in this file except autoCreateListingDetails's
// (tagline+description+up to 12 services+6 FAQs+SEO fields at once), which
// passes its own larger override via callAi's maxTokens option.
const DEFAULT_MAX_TOKENS = 4000;

export function getOpenRouterClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (!globalThis.openRouterClientGlobal) {
    globalThis.openRouterClientGlobal = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      timeout: REQUEST_TIMEOUT_MS,
      // Halved from the SDK's own default of 2 — a retry re-adds the full
      // REQUEST_TIMEOUT_MS on top, so worst case here is two attempts
      // (~40s) rather than three (~60s), still comfortably inside a
      // typical proxy timeout while keeping one retry for a genuine blip.
      maxRetries: 1,
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
  // Checked ahead of the generic APIError branch below (which it's also an
  // instance of, just with no .status) for a message that names the actual
  // problem — see REQUEST_TIMEOUT_MS's own comment for why this is common
  // on the free models this app defaults to.
  if (error instanceof APIConnectionTimeoutError) {
    return "The AI took too long to respond — try again, or try a shorter piece of content.";
  }
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
//
// options.timeoutMs overrides REQUEST_TIMEOUT_MS for this one call — for a
// caller whose prompt is unusually large either way (see
// autoCreateListingDetails, the one caller that currently uses this).
// Retries are turned off whenever this is set: a retry re-adds the full
// timeout on top, and doubling an already-long wait risks the same
// hung-connection failure REQUEST_TIMEOUT_MS exists to prevent in the
// first place — better to surface one clear timeout error than make the
// partner wait through two. options.maxTokens overrides DEFAULT_MAX_TOKENS
// below, for a caller whose expected JSON is unusually large (also
// autoCreateListingDetails).
export async function callAi<T>(
  schema: z.ZodType<T>,
  systemPrompt: string,
  userContent: string | ChatCompletionContentPart[],
  options?: { timeoutMs?: number; maxTokens?: number },
): Promise<AiResult<T>> {
  try {
    const client = getOpenRouterClient();
    const hasImage = Array.isArray(userContent) && userContent.some((part) => part.type === "image_url");
    const { model, fallbacks } = parseModelPriorityList(hasImage ? OPENROUTER_VISION_MODEL : OPENROUTER_MODEL);
    const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
      models?: string[];
      reasoning?: { effort: "none" };
    } = {
      model,
      ...(fallbacks.length > 0 ? { models: fallbacks } : {}),
      response_format: { type: "json_object" },
      max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
      // Structured JSON output never needs a model's hidden chain-of-
      // thought pass — this app parses+validates the final answer either
      // way — and reasoning tokens run up the same wall-clock time (and
      // count against max_tokens above) whether or not the model's own
      // default has reasoning on. Explicit here rather than left to each
      // model's default: relying on OPENROUTER_MODEL's picks defaulting to
      // reasoning off (see that constant's own comment) didn't reliably
      // keep every request fast in production, most likely because a
      // fallback deeper in the priority list doesn't share the primary's
      // default. "none" is OpenRouter's own documented effort level for
      // fully disabling reasoning, honored (or harmlessly ignored, for a
      // model with no reasoning mode at all) across every model this could
      // route to.
      reasoning: { effort: "none" },
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nRespond with ONLY a single JSON object (no surrounding text, no markdown code fence) matching this JSON Schema:\n${JSON.stringify(z.toJSONSchema(schema))}`,
        },
        { role: "user", content: userContent },
      ],
    };
    const response = await client.chat.completions.create(
      params,
      options?.timeoutMs ? { timeout: options.timeoutMs, maxRetries: 0 } : undefined,
    );

    const choice = response.choices[0];
    const finishReason = choice?.finish_reason;
    if (finishReason && finishReason !== "stop" && finishReason !== "length") {
      return { status: "error", message: "The AI declined to respond to this request." };
    }

    const text = choice?.message?.content;
    if (!text) {
      return { status: "error", message: "The model didn't return a usable response." };
    }

    // A free/lite model under json_object mode isn't guaranteed to emit
    // valid JSON the way native structured-output modes are — parsed here
    // rather than left to throw into the outer catch below, which would
    // otherwise surface as the unhelpful generic "AI request failed
    // unexpectedly." instead of this same "didn't return a usable
    // response" message a failed schema check already gives.
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return { status: "error", message: "The model didn't return a usable response." };
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return { status: "error", message: "The model didn't return a usable response." };
    }
    return { status: "ok", data: parsed.data };
  } catch (error) {
    return { status: "error", message: describeAiError(error) };
  }
}
