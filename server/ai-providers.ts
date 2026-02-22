import { z } from "zod";

export type AIProvider = "claude" | "gpt" | "deepseek";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export const MEDICAL_PROMPTS = {
  system: `Você é um especialista em diagnóstico por imagem ultrassonográfica com mais de 20 anos de experiência. 
Sua responsabilidade é gerar laudos médicos precisos, estruturados e profissionais.

INSTRUÇÕES CRÍTICAS:
1. Ignore completamente conversas informais com o paciente (ex: "Bom dia", "Como vai?", "Tudo bem?")
2. Foque EXCLUSIVAMENTE em dados clínicos e medidas ultrassonográficas
3. Extraia apenas as informações relevantes para o laudo
4. Use terminologia médica apropriada
5. Mantenha a estrutura e formato dos modelos fornecidos
6. Substitua os campos em branco (___) com os valores extraídos dos dados fornecidos
7. Seja conciso mas completo
8. Sempre inclua uma conclusão clara e objetiva`,

  generateReport: (examType: string, data: string, template: string) => `
Tipo de Exame: ${examType}

Dados Fornecidos:
${data}

Template de Referência:
${template}

Tarefa: Gere um laudo completo baseado nos dados fornecidos e no template de referência. 
Substitua os campos em branco (___) pelos valores apropriados extraídos dos dados.
Mantenha a estrutura e profissionalismo do template.
Assine como: Dr. Roberto Freire Margotti - CRM-BA 26929 | RQE: 21367
`,
};

/**
 * Gera laudo usando Claude (Anthropic) com fallback de modelos
 */
async function generateWithClaude(
  apiKey: string,
  messages: AIMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  const modelsToTry = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20240620",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ];

  const systemMessages = messages.filter((m) => m.role === "system");
  const otherMessages = messages.filter((m) => m.role !== "system");
  const systemPrompt = systemMessages.map((m) => m.content).join("\n");

  let lastError: string | null = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[Claude API] Tentando modelo: ${model}`);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt || undefined,
          messages: otherMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          (errorData as any).error?.message ||
          (errorData as any).message ||
          response.statusText;
        console.log(`[Claude API] Modelo ${model} falhou: ${errorMessage}`);
        lastError = errorMessage;
        continue;
      }

      const data = await response.json();
      const content = (data as any).content?.[0]?.text || "";

      if (!content) {
        lastError = "Claude retornou uma resposta vazia";
        continue;
      }

      console.log(`[Claude API] Sucesso com modelo: ${model}`);
      return {
        success: true,
        content,
      };
    } catch (error) {
      console.log(`[Claude API] Erro ao tentar ${model}:`, error);
      lastError = String(error);
      continue;
    }
  }

  return {
    success: false,
    error:
      lastError ||
      "Nenhum modelo Claude disponível para sua chave de API. Verifique sua chave e tente novamente.",
  };
}

/**
 * Gera laudo usando GPT (OpenAI)
 */
async function generateWithGPT(
  apiKey: string,
  messages: AIMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        max_tokens: maxTokens,
        temperature,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as any).error?.message || response.statusText;
      throw new Error(`GPT API Error: ${errorMessage}`);
    }

    const data = await response.json();
    const content = (data as any).choices?.[0]?.message?.content || "";

    return {
      success: true,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Gera laudo usando DeepSeek
 */
async function generateWithDeepSeek(
  apiKey: string,
  messages: AIMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: maxTokens,
        temperature,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as any).error?.message || response.statusText;
      throw new Error(`DeepSeek API Error: ${errorMessage}`);
    }

    const data = await response.json();
    const content = (data as any).choices?.[0]?.message?.content || "";

    return {
      success: true,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Função principal que roteia para o provedor correto
 */
export async function generateMedicalReport({
  provider,
  apiKey,
  messages,
  temperature = 0.3,
  maxTokens = 2000,
}: {
  provider: AIProvider;
  apiKey: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<AIResponse> {
  try {
    console.log(`[AI Provider] Gerando laudo com ${provider}`);

    let result: AIResponse;

    switch (provider) {
      case "claude":
        result = await generateWithClaude(apiKey, messages, temperature, maxTokens);
        break;
      case "gpt":
        result = await generateWithGPT(apiKey, messages, temperature, maxTokens);
        break;
      case "deepseek":
        result = await generateWithDeepSeek(apiKey, messages, temperature, maxTokens);
        break;
      default:
        return {
          success: false,
          error: `Provedor ${provider} não suportado`,
        };
    }

    if (!result.success) {
      console.error(`[AI Provider] Erro ao gerar laudo com ${provider}:`, result.error);
    }

    return result;
  } catch (error) {
    console.error(`[AI Provider] Erro inesperado:`, error);
    return {
      success: false,
      error: String(error),
    };
  }
}
