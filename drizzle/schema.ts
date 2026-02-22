import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  examType: varchar("examType", { length: 64 }).notNull(),
  classification: mysqlEnum("classification", ["normal", "patologico"]).notNull(),
  observation: text("observation"),
  reportText: text("reportText").notNull(),
  doctorName: varchar("doctorName", { length: 255 }).default("Dr. Roberto Freire Margotti"),
  doctorCRM: varchar("doctorCRM", { length: 64 }).default("CRM-BA 26929"),
  doctorRQE: varchar("doctorRQE", { length: 64 }).default("RQE: 21367"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

export const customInstructions = mysqlTable("customInstructions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  examType: varchar("examType", { length: 64 }).notNull(),
  trigger: varchar("trigger", { length: 255 }).notNull(),
  instruction: text("instruction").notNull(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomInstruction = typeof customInstructions.$inferSelect;
export type InsertCustomInstruction = typeof customInstructions.$inferInsert;

export const learningPatterns = mysqlTable("learningPatterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  examType: varchar("examType", { length: 64 }).notNull(),
  pattern: text("pattern").notNull(),
  frequency: int("frequency").default(0).notNull(),
  confidence: int("confidence").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningPattern = typeof learningPatterns.$inferSelect;
export type InsertLearningPattern = typeof learningPatterns.$inferInsert;

/**
 * Tabela para armazenar prompts personalizados do médico
 * Pode ser geral (aplicado a todos os exames) ou específico por tipo de exame
 */
export const customPrompts = mysqlTable("customPrompts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  examType: varchar("examType", { length: 64 }).notNull(), // "geral" ou tipo específico
  promptText: text("promptText").notNull(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomPrompt = typeof customPrompts.$inferSelect;
export type InsertCustomPrompt = typeof customPrompts.$inferInsert;