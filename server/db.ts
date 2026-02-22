import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, reports, InsertReport, Report, customInstructions, InsertCustomInstruction, CustomInstruction, learningPatterns, InsertLearningPattern, LearningPattern, customPrompts, InsertCustomPrompt, CustomPrompt } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createReport(userId: number, data: Omit<InsertReport, 'userId'>): Promise<Report | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(reports).values({
      ...data,
      userId,
    });
    return { ...data, userId, id: result[0].insertId } as Report;
  } catch (error) {
    console.error("[Database] Failed to create report:", error);
    throw error;
  }
}

export async function getReportsByUserId(userId: number, examType?: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    if (examType) {
      return await db.select().from(reports).where(
        and(eq(reports.userId, userId), eq(reports.examType, examType))
      ).orderBy(reports.createdAt);
    }
    return await db.select().from(reports).where(eq(reports.userId, userId)).orderBy(reports.createdAt);
  } catch (error) {
    console.error("[Database] Failed to fetch reports:", error);
    return [];
  }
}

export async function deleteReport(reportId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(reports).where(
      and(eq(reports.id, reportId), eq(reports.userId, userId))
    );
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete report:", error);
    return false;
  }
}

export async function createCustomInstruction(userId: number, data: Omit<InsertCustomInstruction, 'userId'>): Promise<CustomInstruction | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(customInstructions).values({
      ...data,
      userId,
    });
    return { ...data, userId, id: result[0].insertId } as CustomInstruction;
  } catch (error) {
    console.error("[Database] Failed to create custom instruction:", error);
    throw error;
  }
}

export async function getCustomInstructions(userId: number, examType?: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    if (examType) {
      return await db.select().from(customInstructions).where(
        and(eq(customInstructions.userId, userId), eq(customInstructions.examType, examType))
      ).orderBy(customInstructions.createdAt);
    }
    return await db.select().from(customInstructions).where(eq(customInstructions.userId, userId)).orderBy(customInstructions.createdAt);
  } catch (error) {
    console.error("[Database] Failed to fetch custom instructions:", error);
    return [];
  }
}

export async function deleteCustomInstruction(instructionId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(customInstructions).where(
      and(eq(customInstructions.id, instructionId), eq(customInstructions.userId, userId))
    );
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete custom instruction:", error);
    return false;
  }
}

export async function createLearningPattern(userId: number, data: Omit<InsertLearningPattern, 'userId'>): Promise<LearningPattern | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(learningPatterns).values({
      ...data,
      userId,
    });
    return { ...data, userId, id: result[0].insertId } as LearningPattern;
  } catch (error) {
    console.error("[Database] Failed to create learning pattern:", error);
    throw error;
  }
}

export async function getLearningPatterns(userId: number, examType?: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    if (examType) {
      return await db.select().from(learningPatterns).where(
        and(eq(learningPatterns.userId, userId), eq(learningPatterns.examType, examType))
      ).orderBy(learningPatterns.createdAt);
    }
    return await db.select().from(learningPatterns).where(eq(learningPatterns.userId, userId)).orderBy(learningPatterns.createdAt);
  } catch (error) {
    console.error("[Database] Failed to fetch learning patterns:", error);
    return [];
  }
}

export async function createCustomPrompt(userId: number, data: Omit<InsertCustomPrompt, 'userId'>): Promise<CustomPrompt | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(customPrompts).values({
      ...data,
      userId,
    });
    return { ...data, userId, id: result[0].insertId } as CustomPrompt;
  } catch (error) {
    console.error("[Database] Failed to create custom prompt:", error);
    throw error;
  }
}

export async function getCustomPrompts(userId: number, examType?: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    if (examType) {
      return await db.select().from(customPrompts).where(
        and(eq(customPrompts.userId, userId), eq(customPrompts.examType, examType))
      ).orderBy(customPrompts.createdAt);
    }
    return await db.select().from(customPrompts).where(eq(customPrompts.userId, userId)).orderBy(customPrompts.createdAt);
  } catch (error) {
    console.error("[Database] Failed to fetch custom prompts:", error);
    return [];
  }
}

export async function deleteCustomPrompt(promptId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(customPrompts).where(
      and(eq(customPrompts.id, promptId), eq(customPrompts.userId, userId))
    );
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete custom prompt:", error);
    return false;
  }
}
