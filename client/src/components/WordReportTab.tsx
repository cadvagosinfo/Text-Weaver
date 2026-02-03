import { format, differenceInYears, parseISO, isWithinInterval, subHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileText, Download } from "lucide-react";
import { useState } from "react";
import type { Report } from "@shared/schema";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

const CITY_UNIT_ORDER = [
  "1ª CIA - GRAMADO",
  "3º PEL - NOVA PETRÓPOLIS",
  "4º GPM - PICADA CAFÉ",
  "2ª CIA – CANELA",
  "3º PEL - SÃO FRANCISCO DE PAULA",
  "4º GPM - CAMBARÁ DO SUL",
  "2ª CIA IND PM TAQUARA",
  "3º PEL – ROLANTE",
  "4º GPM - RIOZINHO",
  "4º PEL – IGREJINHA",
  "5º PEL - TRÊS COROAS",
];

const CITY_MAPPING: Record<string, string> = {
  "Gramado": "1ª CIA - GRAMADO",
  "Nova Petrópolis": "3º PEL - NOVA PETRÓPOLIS",
  "Picada Café": "4º GPM - PICADA CAFÉ",
  "Canela": "2ª CIA – CANELA",
  "São Francisco de Paula": "3º PEL - SÃO FRANCISCO DE PAULA",
  "Cambará do Sul": "4º GPM - CAMBARÁ DO SUL",
  "Taquara": "2ª CIA IND PM TAQUARA",
  "Rolante": "3º PEL – ROLANTE",
  "Riozinho": "4º GPM - RIOZINHO",
  "Igrejinha": "4º PEL – IGREJINHA",
  "Três Coroas": "5º PEL - TRÊS COROAS",
};

interface WordReportTabProps {
  reports: Report[];
}

export function WordReportTab({ reports }: WordReportTabProps) {
  const [copied, setCopied] = useState(false);

  const now = new Date();
  const twentyFourHoursAgo = subHours(now, 24);

  const recentReports = reports.filter((r) => {
    const reportDate = new Date(r.dataHora);
    return isWithinInterval(reportDate, { start: twentyFourHoursAgo, end: now });
  });

  const groupedReports: Record<string, Report[]> = {};
  CITY_UNIT_ORDER.forEach((unit) => {
    groupedReports[unit] = recentReports.filter((r) => CITY_MAPPING[r.cidade] === unit);
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    try {
      const date = parseISO(birthDate);
      return differenceInYears(new Date(), date).toString();
    } catch (e) {
      return "N/A";
    }
  };

  const capitalizeSentence = (text: string) => {
    if (!text) return "";
    return text.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
  };

  const generatePlainText = () => {
    let output = "";

    CITY_UNIT_ORDER.forEach((unit) => {
      output += `${unit}\n`;
      const reportsInUnit = groupedReports[unit];

      if (reportsInUnit.length === 0) {
        output += "SN.\n\n";
      } else {
        reportsInUnit.forEach((report, rIndex) => {
          const d = new Date(report.dataHora);
          const dateStr = format(d, "dd/MM/yyyy");
          const timeStr = format(d, "HH'h'mm'min'");
          
          let fatoCompleto = report.fato.toUpperCase();
          if (report.fatoComplementar) {
            fatoCompleto += ` / ${report.fatoComplementar.toUpperCase()}`;
          }
          
          output += `${dateStr} às ${timeStr} - ${fatoCompleto}\n`;
          output += `Na ${report.localRua.toLowerCase()}, nº ${report.localNumero.toLowerCase()}, bairro ${report.localBairro.toLowerCase()}, em ${report.cidade}, ${capitalizeSentence(report.resumo.toLowerCase())}\n\n`;

          if (Array.isArray(report.material) && report.material.length > 0) {
            output += "Material apreendido:\n";
            report.material.forEach((m) => {
              output += `${capitalizeSentence(m.toLowerCase())}\n`;
            });
            output += "\n";
          }

          if (Array.isArray(report.envolvidos) && report.envolvidos.length > 0) {
            report.envolvidos.forEach((p: any) => {
              const role = p.role.charAt(0).toUpperCase() + p.role.slice(1).toLowerCase();
              const age = calculateAge(p.dataNascimento);
              const nameCapitalized = p.nome.toLowerCase().replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase());
              output += `${role}: ${nameCapitalized}, ${p.documentoTipo}: ${p.documentoNumero}, ${age} anos\n`;
              output += `Antecedentes: ${capitalizeSentence(p.antecedentes.toLowerCase())}\n`;
              output += `Orcrim: ${capitalizeSentence(p.orcrim.toLowerCase())}\n\n`;
            });
          }
          
          if (rIndex < reportsInUnit.length - 1) {
            output += "\n";
          }
        });
      }
    });

    return output.trim();
  };

  const plainText = generatePlainText();

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = async () => {
    const sections = [];
    const lines = plainText.split("\n");

    const children = lines.map((line) => {
      const isHeader = CITY_UNIT_ORDER.includes(line) || line === "SN.";
      const isIncidentTitle = /^\d{2}\/\d{2}\/\d{4} às \d{2}h\d{2}min - .*/.test(line);
      const isRoleLine = /^(Vítima|Autor|Testemunha|Preso|Menor apreendido|Condutor|Atendido|Suspeito):/.test(line);
      const isOtherTitle = line.startsWith("Antecedentes:") || line.startsWith("Orcrim:") || line.startsWith("Material apreendido:");

      const textRunOptions = {
        text: line || " ",
        font: "Times New Roman",
        size: 24, // 12pt = 24 half-points
      };

      if (isHeader || isIncidentTitle) {
        return new Paragraph({
          children: [new TextRun({ ...textRunOptions, bold: true })],
          spacing: { before: 0, after: 0, line: 240 }, // simple spacing (approx 240 twips)
        });
      }

      if (isRoleLine || isOtherTitle) {
        const colonIndex = line.indexOf(":");
        const titlePart = line.substring(0, colonIndex + 1);
        const restPart = line.substring(colonIndex + 1);
        return new Paragraph({
          children: [
            new TextRun({ ...textRunOptions, text: titlePart, bold: true }),
            new TextRun({ ...textRunOptions, text: restPart }),
          ],
          spacing: { before: 0, after: 0, line: 240 },
        });
      }

      return new Paragraph({
        children: [new TextRun(textRunOptions)],
        spacing: { before: 0, after: 0, line: 240 },
      });
    });

    const doc = new Document({
      sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Relatorio_RPI_${format(new Date(), "ddMMyyyy_HHmm")}.docx`);
  };

  const renderWithBolds = () => {
    const lines = plainText.split("\n");
    return lines.map((line, i) => {
      const isHeader = CITY_UNIT_ORDER.includes(line) || line === "SN.";
      const isIncidentTitle = /^\d{2}\/\d{2}\/\d{4} às \d{2}h\d{2}min - .*/.test(line);
      const isRoleLine = /^(Vítima|Autor|Testemunha|Preso|Menor apreendido|Condutor|Atendido|Suspeito):/.test(line);
      const isOtherTitle = line.startsWith("Antecedentes:") || line.startsWith("Orcrim:") || line.startsWith("Material apreendido:");

      if (isHeader || isIncidentTitle) {
        return <div key={i} className="font-bold">{line}</div>;
      }
      
      if (isRoleLine || isOtherTitle) {
        const colonIndex = line.indexOf(":");
        if (colonIndex !== -1) {
          const titlePart = line.substring(0, colonIndex + 1);
          const restPart = line.substring(colonIndex + 1);
          return (
            <div key={i}>
              <span className="font-bold">{titlePart}</span>
              <span>{restPart}</span>
            </div>
          );
        }
        return <div key={i} className="font-bold">{line}</div>;
      }

      return <div key={i}>{line || "\u00A0"}</div>;
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Relatório RPI (Últimas 24h)</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownloadDocx} disabled={!plainText}>
            <Download className="w-4 h-4 mr-2" /> Baixar Word
          </Button>
          <Button size="sm" onClick={handleCopy} disabled={!plainText}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copiado" : "Copiar Tudo"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="font-sans text-sm whitespace-pre-wrap">
            {renderWithBolds()}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
