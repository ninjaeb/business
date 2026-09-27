import OpenAI, { APIConnectionTimeoutError, APIError } from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { z } from "zod";

declare global {
  var geminiClientGlobal: OpenAI | undefined;
}

// Routed through Gemini's own OpenAI-compatible endpoint (the openai SDK
// pointed at Google's baseURL below) rather than OpenRouter — this app
// previously ran every AI feature through OpenRouter's free-tier models,
// but that free tier is a single shared pool across every model and every
// OpenRouter user on it (20 requests/minute, 50/day without purchased
// credits), so it rate-limited in practice regardless of which specific
// free model was picked. A direct Gemini API key gets its own per-project
// quota instead, not shared with unrelated OpenRouter traffic.
//
// gemini-3.5-flash-lite: Google's fastest, cheapest 3.5-series model,
// confirmed free-tier-eligible on Gemini's own pricing page as of
// 2026-09-27. Reasoning ("thinking") is off by default for the Flash-Lite
// line — unlike OpenRouter's free models, which mostly defaulted it on and
// made every AI-assisted feature noticeably slow — so this needs no
// explicit reasoning-effort override the way the old OPENROUTER_MODEL did.
// Also multimodal (accepts image_url content), so one model now serves
// both the text-only features (rewrite/generate/translate, AI Auto
// Create's written content) and business-card scanning — no separate
// vision-model setting the way OPENROUTER_VISION_MODEL was needed for.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export function isAiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

// The openai SDK's own default is 10 minutes, retried up to maxRetries
// times on top of that — a slow/overloaded model could then hang far
// longer than the shared hosting stack's own reverse-proxy timeout, which
// kills the connection out from under it. The browser then shows its own
// generic connection-failure page instead of the graceful "AI request
// failed" toast callAi would otherwise produce — reported in production
// as "This page couldn't load" while using Translate with AI. Set well
// under a typical proxy timeout so this app's own error handling gets
// there first. This is the default for every callAi() call; a caller
// whose prompt is unusually large in either direction (a lot of input to
// read, a lot of output to write — see autoCreateListingDetails's own
// comment) can ask for more time via callAi's own timeoutMs option
// instead of this number being raised for everyone.
const REQUEST_TIMEOUT_MS = 20_000;

// Gemini 3.5 Flash-Lite's own completion budget defaults to much larger
// than this left unset — generous for open-ended chat, but this app only
// ever wants one JSON object built from a known, bounded schema, and an
// unbounded budget is itself a latency risk independent of reasoning:
// nothing stops a model from generating a long, rambling response before
// finally emitting valid JSON. 4000 tokens comfortably covers every schema
// in this file except autoCreateListingDetails's (tagline+description+up
// to 12 services+6 FAQs+SEO fields at once), which passes its own larger
// override via callAi's maxTokens option.
const DEFAULT_MAX_TOKENS = 4000;

export function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!globalThis.geminiClientGlobal) {
    globalThis.geminiClientGlobal = new OpenAI({
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: process.env.GEMINI_API_KEY,
      timeout: REQUEST_TIMEOUT_MS,
      // Halved from the SDK's own default of 2 — a retry re-adds the full
      // REQUEST_TIMEOUT_MS on top, so worst case here is two attempts
      // (~40s) rather than three (~60s), still comfortably inside a
      // typical proxy timeout while keeping one retry for a genuine blip.
      maxRetries: 1,
    });
  }
  return globalThis.geminiClientGlobal;
}

// Shared across every "use server" file that calls the AI — kept here rather
// than in one of them since a "use server" module can only export async
// functions.
export function describeAiError(error: unknown): string {
  // Checked ahead of the generic APIError branch below (which it's also an
  // instance of, just with no .status) for a message that names the actual
  // problem — see REQUEST_TIMEOUT_MS's own comment for why this is common.
  if (error instanceof APIConnectionTimeoutError) {
    return "The AI took too long to respond — try again, or try a shorter piece of content.";
  }
  if (error instanceof APIError) {
    if (error.status === 401 || error.status === 403) {
      return "AI request failed: check that GEMINI_API_KEY is set correctly.";
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
  message: "AI features aren't configured — set GEMINI_API_KEY to enable them.",
};

// Shared across every "use server" file that needs structured JSON back from
// the model (see ai-insights.ts, testimonials.ts, scan-business-card.ts) —
// kept here rather than in one of them since a "use server" module can only
// export async functions, and each caller supplies its own systemPrompt/
// persona rather than this hardcoding one voice for every feature.
//
// `userContent` is a plain string for text-only callers, or an array of
// OpenAI-style content parts (text + image_url) for scan-business-card.ts's
// vision request — the Chat Completions message format both routes through,
// and GEMINI_MODEL handles both (see its own comment above).
//
// There's no cross-provider equivalent of Gemini's own native
// responseJsonSchema reliable enough to depend on if GEMINI_MODEL is ever
// overridden to a different provider's model, so the schema is instead
// spelled out in the prompt and enforced by parsing + Zod validation
// afterward, same as before the JSON came back pre-validated.
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
    const client = getGeminiClient();
    const response = await client.chat.completions.create(
      {
        model: GEMINI_MODEL,
        response_format: { type: "json_object" },
        max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
        messages: [
          {
            role: "system",
            content: `${systemPrompt}\n\nRespond with ONLY a single JSON object (no surrounding text, no markdown code fence) matching this JSON Schema:\n${JSON.stringify(z.toJSONSchema(schema))}`,
          },
          { role: "user", content: userContent },
        ],
      },
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

    // Not guaranteed to be valid JSON just because it was asked for under
    // json_object mode — parsed here rather than left to throw into the
    // outer catch below, which would otherwise surface as the unhelpful
    // generic "AI request failed unexpectedly." instead of this same
    // "didn't return a usable response" message a failed schema check
    // already gives.
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
