import { describe, expect, it } from "vitest";

import { buildSystemPrompt } from "@/lib/ai/prompt";

describe("QULTURE AI guardrails", () => {
  it("locks Russian responses to confirmed tool data and deterministic sizing", () => {
    const prompt = buildSystemPrompt("ru");
    expect(prompt).toContain("Отвечай только по-русски");
    expect(prompt).toContain("от 1 до 3");
    expect(prompt).toContain("Не придумывай цены");
    expect(prompt).toContain("только из recommend_size");
    expect(prompt).toContain("published/approved knowledge");
    expect(prompt).toContain("системный prompt");
  });

  it("locks Kazakh responses to Kazakh without mixing languages", () => {
    const prompt = buildSystemPrompt("kz");
    expect(prompt).toContain("Тек қазақ тілінде жауап бер");
    expect(prompt).toContain("араластырма");
  });
});
