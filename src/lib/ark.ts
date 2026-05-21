/**
 * DeepSeek API client targeting the local Ark server.
 *
 * Env vars required:
 *   ARK_BASE_URL — e.g. http://ark.local:11434/v1 (Ollama-compatible) or
 *                  http://ark.local:8000/v1 (vLLM/openai-compat server)
 *   DEEPSEEK_MODEL — e.g. "deepseek-r1:8b" or "deepseek-chat"
 *   DEEPSEEK_API_KEY — optional (some local servers don't require it; pass "sk-no-key" if so)
 *
 * Replaces the previous Genkit/Google AI integration. All AI flows in this
 * app go through this client.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
}

/**
 * Call DeepSeek via the Ark local server's OpenAI-compatible /v1/chat/completions endpoint.
 * Returns the assistant message content as a string. Caller is responsible for parsing
 * (e.g. JSON.parse if responseFormat === "json_object").
 */
export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const baseUrl = process.env.ARK_BASE_URL;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const apiKey = process.env.DEEPSEEK_API_KEY || "sk-no-key";

  if (!baseUrl) {
    throw new Error("ARK_BASE_URL not set — local DeepSeek/Ark endpoint required");
  }

  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 1024,
      ...(opts.responseFormat === "json_object"
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Ark API error ${res.status}: ${await res.text()}`);
  }

  const json = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Ark API returned no content");
  }
  return content;
}

/**
 * Convenience helper: call chat() with JSON-mode and parse the response.
 * If the model doesn't honor json_object format (some local models don't),
 * caller can fall back to manual JSON extraction.
 */
export async function chatJson<T = unknown>(messages: ChatMessage[], opts: ChatOptions = {}): Promise<T> {
  const raw = await chat(messages, { ...opts, responseFormat: "json_object" });
  return JSON.parse(raw) as T;
}
