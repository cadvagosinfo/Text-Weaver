import { format, differenceInYears, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { InsertReport } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Copy, FileText, Check } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

// Helper to format date as DDHHMMMYY (e.g., 151630JAN25)
const formatMilitaryDate = (date: Date | string) => {
  const d = new Date(date);
  const day = format(d, "dd");
  const time = format(d, "HHmm");
  const month = format(d, "MMM", { locale: ptBR }).toUpperCase().replace(".", "");
  const year = format(d, "yy");
  return `${day}${time}${month}${year}`;
};

interface ReportFormatterProps {
  data: Partial<InsertReport>;
  isPreliminar?: boolean;
}

export function ReportFormatter({ data, isPreliminar }: ReportFormatterProps) {
  const [copied, setCopied] = useState(false);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    try {
      const date = parseISO(birthDate);
      return differenceInYears(new Date(), date).toString();
    } catch (e) {
      return "N/A";
    }
  };

  // Safeguard against partial data during form filling
  const safeData = {
    fato: data.fato || "[FATO]",
    fatoComplementar: data.fatoComplementar || "",
    unidade: data.unidade || "[UNIDADE]",
    cidade: data.cidade || "[CIDADE]",
    dataHora: data.dataHora ? formatMilitaryDate(data.dataHora) : "[DATA/HORA]",
    local: data.local || "[LOCAL]",
    envolvidos: (data.envolvidos as any[]) || [],
    oficial: data.oficial || "[OFICIAL]",
    material: data.material || [],
    resumo: data.resumo || "[RESUMO]",
    motivacao: data.motivacao || "[MOTIVAÇÃO]",
  };

  const involvedBlocks = safeData.envolvidos.map((p: any) => {
    const roleUpper = (p.role || "ENVOLVIDO").toUpperCase();
    const age = calculateAge(p.dataNascimento);
    const docTipo = p.documentoTipo || "RG";
    const docNum = p.documentoNumero || "Não informado";
    
    return `*${roleUpper}:* ${p.nome || "[NOME]"}; *${docTipo}:* ${docNum}; *Idade:* ${age}
*ANTECEDENTES:* ${p.antecedentes || "Nada consta"}
*ORCRIM:* ${p.orcrim || "Nada consta"}`;
  }).join("\n\n");

  const fatoText = safeData.fatoComplementar 
    ? `*${safeData.fato.toUpperCase()}*\n*${safeData.fatoComplementar.toUpperCase()}*`
    : `*${safeData.fato.toUpperCase()}*`;

  const formattedText = `${isPreliminar ? "*PRELIMINAR*\n\n" : ""}${fatoText}

*${safeData.cidade.toUpperCase()} - CRPM HORTÊNSIAS / ${safeData.unidade.toUpperCase()}*

*DATA/HORA:* ${safeData.dataHora}

*LOCAL:* ${safeData.local}

${involvedBlocks}

*MOTIVAÇÃO:* ${safeData.motivacao}

*MATERIAL APREENDIDO:*
${Array.isArray(safeData.material) && safeData.material.length > 0 ? safeData.material.join("\n") : "Nenhum"}

*OFICIAL:* ${safeData.oficial}

*RESUMO DO FATO:*
${safeData.resumo}

*OCORRÊNCIA EM ANDAMENTO / AGUARDANDO MAIORES DADOS*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-2 shadow-sm bg-muted/30">
      <div className="p-4 bg-muted/50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Pré-visualização</h3>
        </div>
        <Button 
          variant={copied ? "default" : "outline"} 
          size="sm" 
          onClick={handleCopy}
          className="transition-all duration-300"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" /> Copiar Texto
            </>
          )}
        </Button>
      </div>
      
      <div className="flex-1 p-6 overflow-auto bg-white dark:bg-zinc-950">
        <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
          {formattedText}
        </pre>
      </div>
    </Card>
  );
}
