import { describe, it, expect, vi } from "vitest";
import { generateMedicalReport, MEDICAL_PROMPTS, type AIProvider } from "./ai-providers";

describe("AI Providers - Medical Report Generation", () => {
  it("should validate system prompt for medical diagnosis", () => {
    expect(MEDICAL_PROMPTS.system).toContain("especialista em diagnóstico por imagem");
    expect(MEDICAL_PROMPTS.system).toContain("Ignore completamente conversas informais");
    expect(MEDICAL_PROMPTS.system).toContain("Foque EXCLUSIVAMENTE em dados clínicos");
  });

  it("should generate report prompt with exam type and data", () => {
    const examType = "obstetrico";
    const data = "IG 28 semanas, DBP 71mm, CC 264mm";
    const template = "ULTRASSONOGRAFIA OBSTÉTRICA...";

    const prompt = MEDICAL_PROMPTS.generateReport(examType, data, template);

    expect(prompt).toContain(examType);
    expect(prompt).toContain(data);
    expect(prompt).toContain(template);
  });

  it("should handle Claude API provider", async () => {
    // Mock fetch para Claude
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ text: "Laudo gerado com sucesso" }],
          }),
      })
    ) as any;

    const result = await generateMedicalReport({
      provider: "claude",
      apiKey: "test-key",
      messages: [
        { role: "system", content: "You are a medical expert" },
        { role: "user", content: "Generate a report" },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.content).toBe("Laudo gerado com sucesso");
  });

  it("should handle GPT API provider", async () => {
    // Mock fetch para GPT
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Laudo gerado com sucesso" } }],
          }),
      })
    ) as any;

    const result = await generateMedicalReport({
      provider: "gpt",
      apiKey: "test-key",
      messages: [
        { role: "system", content: "You are a medical expert" },
        { role: "user", content: "Generate a report" },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.content).toBe("Laudo gerado com sucesso");
  });

  it("should handle DeepSeek API provider", async () => {
    // Mock fetch para DeepSeek
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Laudo gerado com sucesso" } }],
          }),
      })
    ) as any;

    const result = await generateMedicalReport({
      provider: "deepseek",
      apiKey: "test-key",
      messages: [
        { role: "system", content: "You are a medical expert" },
        { role: "user", content: "Generate a report" },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.content).toBe("Laudo gerado com sucesso");
  });

  it("should handle API errors gracefully", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: { message: "Invalid API key" },
          }),
      })
    ) as any;

    const result = await generateMedicalReport({
      provider: "claude",
      apiKey: "invalid-key",
      messages: [{ role: "user", content: "Generate a report" }],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should validate unsupported provider", async () => {
    const result = await generateMedicalReport({
      provider: "invalid" as AIProvider,
      apiKey: "test-key",
      messages: [{ role: "user", content: "Generate a report" }],
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("não suportado");
  });

  it("should respect temperature and maxTokens parameters", async () => {
    let capturedBody: any;

    global.fetch = vi.fn((url, options) => {
      capturedBody = JSON.parse(options.body);
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ text: "Laudo" }],
          }),
      });
    }) as any;

    await generateMedicalReport({
      provider: "claude",
      apiKey: "test-key",
      messages: [{ role: "user", content: "Generate a report" }],
      temperature: 0.3,
      maxTokens: 1500,
    });

    expect(capturedBody.temperature).toBe(0.3);
    expect(capturedBody.max_tokens).toBe(1500);
  });
});
