import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  fato: text("fato").notNull(),
  unidade: text("unidade").notNull(), // '41º BPM' | '2ª Cia Ind'
  cidade: text("cidade").notNull(),
  dataHora: timestamp("data_hora").notNull(),
  local: text("local").notNull(),
  // Storing involved people as a JSONB array
  envolvidos: jsonb("envolvidos").notNull().$type<{ role: string, nome: string, antecedentes: string, orcrim: string }[]>(),
  oficial: text("oficial").notNull(),
  material: text("material").notNull(),
  resumo: text("resumo").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
