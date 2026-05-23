export type CompletionProvider = {
  id: "openai" | "anthropic";
  complete(systemPrompt: string, userPrompt: string): Promise<string>;
};
