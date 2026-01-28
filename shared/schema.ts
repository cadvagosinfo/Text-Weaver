import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  fato: text("fato").notNull(),
  fatoComplementar: text("fato_complementar"),
  unidade: text("unidade").notNull(), // '41º BPM' | '2ª Cia Ind'
  cidade: text("cidade").notNull(),
  dataHora: timestamp("data_hora").notNull(),
  local: text("local").notNull(),
  // Storing involved people as a JSONB array
  envolvidos: jsonb("envolvidos").notNull().$type<{ 
    role: string, 
    nome: string, 
    documentoTipo: "RG" | "CPF",
    documentoNumero: string,
    dataNascimento: string,
    antecedentes: string, 
    orcrim: string 
  }[]>(),
  oficial: text("oficial").notNull(),
  material: jsonb("material").notNull().$type<string[]>(),
  resumo: text("resumo").notNull(),
  motivacao: text("motivacao").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports, {
  dataHora: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()),
  motivacao: z.string().min(1, "Motivação é obrigatória"),
}).omit({ id: true, createdAt: true });

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
