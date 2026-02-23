import { reports, type InsertReport, type Report } from "@shared/schema";
import { db } from "./db";
import { eq, and, notInArray, lt, sql } from "drizzle-orm";

const WEEKLY_FACTS = [
  "HOMICÍDIO DOLOSO",
  "ROUBO A PEDESTRE",
  "ROUBO DE VEÍCULO",
  "ROUBO A ESTABELECIMENTO COMERCIAL E DE ENSINO",
  "ROUBO A RESIDÊNCIA",
  "FURTO DE VEÍCULO",
  "FURTO EM VEÍCULO",
  "HOMICÍDIO CULPOSO EM DIREÇÃO DE VEÍCULO AUTOMOTOR"
];

export interface IStorage {
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, report: InsertReport): Promise<Report | undefined>;
  deleteReport(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getReports(): Promise<Report[]> {
    // Auto-delete reports older than 24 hours that are not in WEEKLY_FACTS
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
      await db.delete(reports).where(
        and(
          notInArray(reports.fato, WEEKLY_FACTS),
          lt(reports.dataHora, twentyFourHoursAgo)
        )
      );
    } catch (error) {
      console.error("Error auto-deleting reports:", error);
    }
    return await db.select().from(reports).orderBy(reports.createdAt);
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport as any).returning();
    return report;
  }

  async updateReport(id: number, insertReport: InsertReport): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set(insertReport as any)
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }
}

export const storage = new DatabaseStorage();
