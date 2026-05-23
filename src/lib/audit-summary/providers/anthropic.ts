import type { CompletionProvider } from "./types";

type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string };
};

export function createAnthropicProvider(apiKey: string): CompletionProvider {
  const model =
    process.env.ANTHROPIC_SUMMARY_MODEL ?? "claude-3-5-haiku-20241022";

  return {
    id: "anthropic",
    async complete(systemPrompt, userPrompt) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 280,
          temperature: 0.35,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(
          body.error?.message ?? `Anthropic API error (${response.status})`
        );
      }

      const data = (await response.json()) as AnthropicResponse;
      const text = data.content
        ?.find((block) => block.type === "text")
        ?.text?.trim();

      if (!text) {
        throw new Error("Anthropic returned an empty summary");
      }
      return text;
    },
  };
}
