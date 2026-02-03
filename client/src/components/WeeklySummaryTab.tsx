import { format, differenceInYears, parseISO, isWithinInterval, subDays, startOfHour } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { Report } from "@shared/schema";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

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

interface WeeklySummaryTabProps {
  reports: Report[];
}

export function WeeklySummaryTab({ reports }: WeeklySummaryTabProps) {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const filteredReports = reports.filter((r) => {
    const reportDate = new Date(r.dataHora);
    return WEEKLY_FACTS.includes(r.fato) && isWithinInterval(reportDate, { start: sevenDaysAgo, end: now });
  });

  const groupedByFact = WEEKLY_FACTS.reduce((acc, fact) => {
    const factReports = filteredReports.filter(r => r.fato === fact);
    if (factReports.length > 0) acc[fact] = factReports;
    return acc;
  }, {} as Record<string, Report[]>);

  const getTurno = (dateStr: string) => {
    const hour = new Date(dateStr).getHours();
    if (hour >= 6 && hour < 14) return "1º TURNO";
    if (hour >= 14 && hour < 22) return "2º TURNO";
    return "3º TURNO";
  };

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

  const handleDownloadDocx = async () => {
    const children: any[] = [];

    Object.entries(groupedByFact).forEach(([fact, factReports]) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${fact} - ${factReports.length} ${factReports.length === 1 ? 'REGISTRO' : 'REGISTROS'} NA SEMANA`, bold: true, size: 24, font: "Times New Roman" })],
        spacing: { before: 240, after: 120 }
      }));

      const rows = [
        new TableRow({
          children: ["HORA", "TURNO", "DATA", "ENDEREÇO", "BAIRRO / CIDADE", "HISTÓRICO"].map(text => 
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: "Times New Roman" })] })],
              shading: { fill: "F2F2F2" }
            })
          )
        })
      ];

      factReports.forEach(r => {
        const d = new Date(r.dataHora);
        const involvedText = (r.envolvidos as any[] || []).map(p => {
          const nameCap = p.nome.toLowerCase().replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase());
          return `${p.role}: ${nameCap}\n${p.documentoTipo}: ${p.documentoNumero}\nantecedentes: ${p.antecedentes}`;
        }).join("\n\n");

        rows.push(new TableRow({
          children: [
            format(d, "HH:mm"),
            getTurno(String(r.dataHora)),
            format(d, "dd/MM/yyyy"),
            `${r.localRua}, ${r.localNumero}`,
            `${r.localBairro.toUpperCase()} / ${r.cidade.toUpperCase()}`,
            `${capitalizeSentence(r.resumo.toLowerCase())}\n\n${involvedText}`
          ].map(text => 
            new TableCell({
              children: text.split("\n").map(line => new Paragraph({ children: [new TextRun({ text: line, size: 18, font: "Times New Roman" })] }))
            })
          )
        }));
      });

      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows
      }));
    });

    const doc = new Document({
      sections: [{ children }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Resumo Semanal ${format(new Date(), "dd-MM-yyyy")}.docx`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase">Resumo Semanal (Últimos 7 dias)</CardTitle>
        <Button size="sm" onClick={handleDownloadDocx} disabled={filteredReports.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Baixar Word
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full">
          {Object.entries(groupedByFact).length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">Nenhum registro encontrado nos últimos 7 dias.</div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByFact).map(([fact, factReports]) => (
                <div key={fact} className="space-y-2">
                  <h3 className="font-bold text-sm bg-slate-100 p-2 border rounded uppercase">
                    {fact} - {factReports.length} {factReports.length === 1 ? 'REGISTRO' : 'REGISTROS'} NA SEMANA
                  </h3>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="p-2 border-r text-left w-12">HORA</th>
                          <th className="p-2 border-r text-left w-20">TURNO</th>
                          <th className="p-2 border-r text-left w-20">DATA</th>
                          <th className="p-2 border-r text-left w-32">ENDEREÇO</th>
                          <th className="p-2 border-r text-left w-32">BAIRRO / CIDADE</th>
                          <th className="p-2 text-left">HISTÓRICO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {factReports.map((r, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="p-2 border-r align-top font-mono">{format(new Date(r.dataHora), "HH:mm")}</td>
                            <td className="p-2 border-r align-top">{getTurno(String(r.dataHora))}</td>
                            <td className="p-2 border-r align-top">{format(new Date(r.dataHora), "dd/MM/yyyy")}</td>
                            <td className="p-2 border-r align-top">{r.localRua}, {r.localNumero}</td>
                            <td className="p-2 border-r align-top font-bold">{r.localBairro.toUpperCase()} / {r.cidade.toUpperCase()}</td>
                            <td className="p-2 align-top whitespace-pre-wrap">
                              <div className="mb-2 italic">{capitalizeSentence(r.resumo.toLowerCase())}</div>
                              <div className="space-y-1">
                                {(r.envolvidos as any[] || []).map((p, pi) => (
                                  <div key={pi} className="border-t pt-1 first:border-0">
                                    <div className="font-bold">{p.role}: {p.nome.toLowerCase().replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase())}</div>
                                    <div>{p.documentoTipo}: {p.documentoNumero}</div>
                                    <div className="text-slate-500">antecedentes: {p.antecedentes}</div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
