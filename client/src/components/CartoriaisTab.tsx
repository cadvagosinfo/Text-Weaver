import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, FileSearch } from "lucide-react";
import type { Report } from "@shared/schema";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign } from "docx";
import { saveAs } from "file-saver";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CartoriaisTabProps {
  reports: Report[];
}

export function CartoriaisTab({ reports }: CartoriaisTabProps) {
  const [selectedReportId, setSelectedReportId] = useState<string>("");

  const selectedReport = reports.find(r => r.id.toString() === selectedReportId);
  const envolvidos = (selectedReport?.envolvidos as any[]) || [];

  const handleDownloadDocx = async () => {
    if (!selectedReport) return;

    const children: any[] = [];

    for (const p of envolvidos) {
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2 },
          bottom: { style: BorderStyle.SINGLE, size: 2 },
          left: { style: BorderStyle.SINGLE, size: 2 },
          right: { style: BorderStyle.SINGLE, size: 2 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 2 },
          insideVertical: { style: BorderStyle.SINGLE, size: 2 },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                rowSpan: 5,
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "ESPAÇO PARA INSERIR FOTO", font: "Times New Roman", size: 18, italic: true })] 
                })],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ 
                  children: [
                    new TextRun({ text: "NOME: ", font: "Times New Roman", size: 18, bold: true }),
                    new TextRun({ text: (p.nome || "").toUpperCase(), font: "Times New Roman", size: 18, italic: true })
                  ] 
                })],
              }),
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ 
                  children: [
                    new TextRun({ text: "RG: ", font: "Times New Roman", size: 18, bold: true }),
                    new TextRun({ text: (p.documentoTipo === "RG" ? p.documentoNumero : "").toUpperCase(), font: "Times New Roman", size: 18, italic: true })
                  ] 
                })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "ALCUNHA: ", font: "Times New Roman", size: 18, bold: true })] 
                })],
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [
                    new TextRun({ text: "CPF: ", font: "Times New Roman", size: 18, bold: true }),
                    new TextRun({ text: (p.documentoTipo === "CPF" ? p.documentoNumero : "").toUpperCase(), font: "Times New Roman", size: 18, italic: true })
                  ] 
                })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [
                    new TextRun({ text: "ORCRIM: ", font: "Times New Roman", size: 18, bold: true }),
                    new TextRun({ text: (p.orcrim || "").toUpperCase(), font: "Times New Roman", size: 18, italic: true })
                  ] 
                })],
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [
                    new TextRun({ text: "DN: ", font: "Times New Roman", size: 18, bold: true }),
                    new TextRun({ text: (p.dataNascimento || "").toUpperCase(), font: "Times New Roman", size: 18, italic: true })
                  ] 
                })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "SITUAÇÃO: ", font: "Times New Roman", size: 18, bold: true })] 
                })],
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "CD: ", font: "Times New Roman", size: 18, bold: true })] 
                })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "FILIAÇÃO: ", font: "Times New Roman", size: 18, bold: true })] 
                })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 3,
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "END.: ", font: "Times New Roman", size: 18, bold: true })] 
                })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 3,
                children: [new Paragraph({ 
                  children: [
                    new TextRun({ text: "OC.: ", font: "Times New Roman", size: 18, bold: true }),
                    new TextRun({ text: (p.antecedentes || "").toUpperCase(), font: "Times New Roman", size: 18, italic: true })
                  ] 
                })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 3,
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "OBS.: ", font: "Times New Roman", size: 18, bold: true })] 
                })],
              }),
            ],
          }),
        ],
      });

      children.push(table);
      children.push(new Paragraph({ text: "" })); // Spacer
    }

    const doc = new Document({
      sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Tabelas_Cartoriais_${selectedReport.fato}.docx`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center gap-4 flex-1">
          <CardTitle className="text-sm font-bold uppercase shrink-0">Cartoriais</CardTitle>
          <Select value={selectedReportId} onValueChange={setSelectedReportId}>
            <SelectTrigger className="w-[400px] uppercase text-xs">
              <SelectValue placeholder="Selecione um Release..." />
            </SelectTrigger>
            <SelectContent>
              {reports.map(r => (
                <SelectItem key={r.id} value={r.id.toString()} className="uppercase text-xs">
                  {r.fato} - {r.cidade} ({new Date(r.dataHora).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleDownloadDocx} disabled={!selectedReport || envolvidos.length === 0} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" /> Baixar Tabelas (Word)
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-6 bg-slate-50/50">
        <ScrollArea className="h-full">
          {!selectedReportId ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
              <FileSearch className="w-12 h-12 mb-4" />
              <p className="font-bold uppercase text-sm">Selecione um release para gerar as tabelas</p>
            </div>
          ) : envolvidos.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground uppercase text-sm font-bold">Nenhum indivíduo encontrado neste release.</div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              {envolvidos.map((p, idx) => (
                <div key={idx} className="bg-white border-2 border-black p-[1px] shadow-sm">
                  <table className="w-full border-collapse text-[9pt] font-['Times_New_Roman'] leading-tight">
                    <tbody>
                      <tr>
                        <td rowSpan={5} className="border border-black w-1/4 p-2 text-center align-middle italic text-slate-400">
                          ESPAÇO PARA INSERIR FOTO
                        </td>
                        <td className="border border-black w-1/2 p-1 px-2">
                          <span className="font-bold uppercase">NOME: </span>
                          <span className="italic uppercase">{p.nome}</span>
                        </td>
                        <td className="border border-black w-1/4 p-1 px-2">
                          <span className="font-bold uppercase">RG: </span>
                          <span className="italic uppercase">{p.documentoTipo === "RG" ? p.documentoNumero : ""}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 px-2">
                          <span className="font-bold uppercase">ALCUNHA: </span>
                        </td>
                        <td className="border border-black p-1 px-2">
                          <span className="font-bold uppercase">CPF: </span>
                          <span className="italic uppercase">{p.documentoTipo === "CPF" ? p.documentoNumero : ""}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 px-2">
                          <span className="font-bold uppercase">ORCRIM: </span>
                          <span className="italic uppercase">{p.orcrim}</span>
                        </td>
                        <td className="border border-black p-1 px-2">
                          <span className="font-bold uppercase">DN: </span>
                          <span className="italic uppercase">{p.dataNascimento}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 px-2">
                          <span className="font-bold uppercase">SITUAÇÃO: </span>
                        </td>
                        <td className="border border-black p-1 px-2">
                          <span className="font-bold uppercase">CD: </span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="border border-black p-1 px-2">
                          <span className="font-bold uppercase">FILIAÇÃO: </span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="border border-black p-1 px-2">
                          <span className="font-bold uppercase">END.: </span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="border border-black p-1 px-2 min-h-[40px]">
                          <span className="font-bold uppercase">OC.: </span>
                          <span className="italic uppercase">{p.antecedentes}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="border border-black p-1 px-2">
                          <span className="font-bold uppercase">OBS.: </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
