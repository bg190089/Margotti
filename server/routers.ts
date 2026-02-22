import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createReport, getReportsByUserId, deleteReport, createCustomInstruction, getCustomInstructions, deleteCustomInstruction, createLearningPattern, getLearningPatterns, createCustomPrompt, getCustomPrompts, deleteCustomPrompt } from "./db";
import { generateMedicalReport, MEDICAL_PROMPTS } from "./ai-providers";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  reports: router({
    generate: protectedProcedure
      .input(
        z.object({
          provider: z.enum(["claude", "gpt", "deepseek"]),
          apiKey: z.string().min(1, "API Key é obrigatória"),
          examType: z.string().min(1, "Tipo de exame é obrigatório"),
          data: z.string().min(1, "Dados do exame são obrigatórios"),
          template: z.string(),
          classification: z.enum(["normal", "patologico"]),
          observation: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const systemPrompt = MEDICAL_PROMPTS.system;
          const userPrompt = MEDICAL_PROMPTS.generateReport(
            input.examType,
            input.data,
            input.template
          );

          const result = await generateMedicalReport({
            provider: input.provider,
            apiKey: input.apiKey,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.5,
            maxTokens: 2000,
          });

          if (!result.success) {
            throw new Error(result.error || "Erro ao gerar laudo");
          }

          // Salvar no banco de dados
          const report = await createReport(ctx.user.id, {
            examType: input.examType,
            classification: input.classification,
            observation: input.observation || undefined,
            reportText: result.content || "",
            doctorName: "Dr. Roberto Freire Margotti",
            doctorCRM: "CRM-BA 26929",
            doctorRQE: "RQE: 21367",
          } as any);

          return {
            success: true,
            report,
            content: result.content,
          };
        } catch (error) {
          console.error("[Reports] Erro ao gerar laudo:", error);
          throw error;
        }
      }),

    list: protectedProcedure
      .input(
        z.object({
          examType: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        return await getReportsByUserId(ctx.user.id, input.examType);
      }),

    delete: protectedProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const success = await deleteReport(input.reportId, ctx.user.id);
        return { success };
      }),

    save: protectedProcedure
      .input(
        z.object({
          examType: z.string(),
          reportText: z.string(),
          classification: z.enum(["normal", "patologico"]),
          title: z.string(),
          observation: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const report = await createReport(ctx.user.id, {
          examType: input.examType,
          classification: input.classification,
          observation: input.observation || undefined,
          reportText: input.reportText,
          doctorName: "Dr. Roberto Freire Margotti",
          doctorCRM: "CRM-BA 26929",
          doctorRQE: "RQE: 21367",
        } as any);
        return { success: true, report };
      }),
  }),

  instructions: router({
    create: protectedProcedure
      .input(
        z.object({
          examType: z.string(),
          trigger: z.string(),
          instruction: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createCustomInstruction(ctx.user.id, {
          examType: input.examType,
          trigger: input.trigger,
          instruction: input.instruction,
          isActive: "true",
        });
      }),

    list: protectedProcedure
      .input(
        z.object({
          examType: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        return await getCustomInstructions(ctx.user.id, input.examType);
      }),

    delete: protectedProcedure
      .input(z.object({ instructionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const success = await deleteCustomInstruction(input.instructionId, ctx.user.id);
        return { success };
      }),
  }),

  patterns: router({
    list: protectedProcedure
      .input(
        z.object({
          examType: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        return await getLearningPatterns(ctx.user.id, input.examType);
      }),
  }),

  prompts: router({
    create: protectedProcedure
      .input(
        z.object({
          examType: z.string(),
          promptText: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createCustomPrompt(ctx.user.id, {
          examType: input.examType,
          promptText: input.promptText,
          isActive: "true",
        });
      }),

    list: protectedProcedure
      .input(
        z.object({
          examType: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        return await getCustomPrompts(ctx.user.id, input.examType);
      }),

    delete: protectedProcedure
      .input(z.object({ promptId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const success = await deleteCustomPrompt(input.promptId, ctx.user.id);
        return { success };
      }),
  }),

  customPrompts: router({
    create: protectedProcedure
      .input(
        z.object({
          examType: z.string(),
          prompt: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createCustomPrompt(ctx.user.id, {
          examType: input.examType,
          promptText: input.prompt,
          isActive: "true",
        });
      }),

    list: protectedProcedure
      .input(
        z.object({
          examType: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        return await getCustomPrompts(ctx.user.id, input.examType);
      }),

    delete: protectedProcedure
      .input(z.object({ promptId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const success = await deleteCustomPrompt(input.promptId, ctx.user.id);
        return { success };
      }),

    update: protectedProcedure
      .input(
        z.object({
          promptId: z.number(),
          prompt: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
