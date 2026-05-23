import OpenAI from "openai";

import type { CompletionProvider } from "./types";

export function createOpenAiProvider(apiKey: string): CompletionProvider {
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_SUMMARY_MODEL ?? "gpt-4o-mini";

  return {
    id: "openai",
    async complete(systemPrompt, userPrompt) {
      const response = await client.chat.completions.create({
        model,
        temperature: 0.35,
        max_tokens: 280,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (!text) {
        throw new Error("OpenAI returned an empty summary");
      }
      return text;
    },
  };
}
