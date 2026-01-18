import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existing = await storage.getReports();
  if (existing.length === 0) {
    const sampleDate = new Date();
    await storage.createReport({
      fato: "Furto de Veículo",
      unidade: "41º BPM",
      cidade: "Gramado",
      dataHora: sampleDate,
      local: "Av. das Hortênsias, 1234",
      envolvidos: [
        { role: "Vítima", nome: "João da Silva, RG 123456789", antecedentes: "Nada consta", orcrim: "Nenhuma" },
        { role: "Autor", nome: "Indivíduo não identificado", antecedentes: "Posse de entorpecentes (2020)", orcrim: "Os Manos" }
      ],
      oficial: "Cap. Souza",
      material: ["1 porção de cocaína", "2 porções de maconha", "3 porções de crack"],
      resumo: "A guarnição foi despachada para atender ocorrência de furto. No local, a vítima informou que estacionou seu veículo..."
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed on startup
  seedDatabase().catch(console.error);

  app.get(api.reports.list.path, async (_req, res) => {
    const reports = await storage.getReports();
    res.json(reports);
  });

  app.get(api.reports.get.path, async (req, res) => {
    const report = await storage.getReport(Number(req.params.id));
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  });

  app.post(api.reports.create.path, async (req, res) => {
    try {
      const input = api.reports.create.input.parse(req.body);
      const report = await storage.createReport(input);
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.reports.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const report = await storage.getReport(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    await storage.deleteReport(id);
    res.status(204).send();
  });

  return httpServer;
}
