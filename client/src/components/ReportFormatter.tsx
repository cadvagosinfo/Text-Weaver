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
    localRua: data.localRua || "[LOGRADOURO]",
    localNumero: data.localNumero || "[Nº]",
    localBairro: data.localBairro || "[BAIRRO]",
    envolvidos: (data.envolvidos as any[]) || [],
    oficial: data.oficial || "[OFICIAL]",
    material: data.material || [],
    resumo: data.resumo || "[RESUMO]",
    motivacao: data.motivacao || "[MOTIVAÇÃO]",
  };

  const involvedBlocks = safeData.envolvidos.map((p: any) => {
    const roleUpper = (p.role || "ENVOLVIDO").toUpperCase();
    const ageVal = calculateAge(p.dataNascimento);
    const ageStr = ageVal !== "N/A" ? `${ageVal} anos` : "idade não informada";
    const nameUpper = (p.nome || "[NOME]").toUpperCase();
    const docTipo = (p.documentoTipo || "RG").toUpperCase();
    const docNum = p.documentoNumero || "Não informado";
    const antecedentesVal = (p.antecedentes || "Nada consta").toLowerCase();
    const orcrimVal = (p.orcrim || "Nada consta").toLowerCase();
    
    const capitalize = (text: string) => {
      return text.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    };

    return `*${roleUpper}:* ${nameUpper}; *${docTipo}:* ${docNum}; ${ageStr}
*ANTECEDENTES:* ${capitalize(antecedentesVal)}
*ORCRIM:* ${capitalize(orcrimVal)}`;
  }).join("\n\n");

  const fatoText = safeData.fatoComplementar 
    ? `*${safeData.fato.toUpperCase()}*\n*${safeData.fatoComplementar.toUpperCase()}*`
    : `*${safeData.fato.toUpperCase()}*`;

  const locationText = `*LOCAL:* ${safeData.localRua.toLowerCase()}, nº ${safeData.localNumero.toLowerCase()}, bairro ${safeData.localBairro.toLowerCase()}`;

  const capitalize = (text: string) => {
    return text.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
  };

  const formattedText = `${isPreliminar ? "*PRELIMINAR*\n\n" : ""}${fatoText}

*${safeData.cidade.toUpperCase()} / ${safeData.unidade.toUpperCase()}*

*DATA/HORA:* ${safeData.dataHora}

${locationText}

${involvedBlocks}

*MOTIVAÇÃO:* ${capitalize(safeData.motivacao.toLowerCase())}

*MATERIAL APREENDIDO:*
${Array.isArray(safeData.material) && safeData.material.length > 0 ? safeData.material.map(m => capitalize(m.toLowerCase())).join("\n") : "nenhum"}

*OFICIAL:* ${safeData.oficial.toUpperCase()}

*RESUMO DO FATO:*
${capitalize(safeData.resumo.toLowerCase())}${isPreliminar ? "\n\n*OCORRÊNCIA EM ANDAMENTO / AGUARDANDO MAIORES DADOS*" : ""}`;

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
function formatDateToISO(input: string): string {
  const day = input.slice(0,2);
  const hour = input.slice(2,4);
  const minute = input.slice(4,6);
  const monthStr = input.slice(6,9);
  const year = "20" + input.slice(9,11);

  const months: Record<string,string> = {
    JAN:"01", FEV:"02", MAR:"03", ABR:"04", MAI:"05", JUN:"06",
    JUL:"07", AGO:"08", SET:"09", OUT:"10", NOV:"11", DEZ:"12"
  };

  const month = months[monthStr];
  return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
}
const report = {
  fato: data.fato,
  unidade: data.unidade,
  cidade: data.cidade,
  dataHora: formatDateToISO(data.dataHora),
  localRua: data.localRua,
  localNumero: data.localNumero,
  localBairro: data.localBairro,
  envolvidos: data.envolvidos,
  oficial: data.oficial,
  material: data.material && data.material.length
    ? data.material.split(",").map(item => item.trim())
    : ["nenhum"],
  resumo: data.resumo,
  motivacao: data.motivacao || "Desconhecida",
};

import { format, differenceInYears, parseISO } from "date-fns";
import ptBR from "date-fns/locale";
import type { InsertReport } from "@shared/schema";
import { useState } from "react";

// Função para converter data no formato militar (DDHHMMYY)
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

  const report = {
    fato: data?.fato || "",
    unidade: data?.unidade || "",
    cidade: data?.cidade || "",
    dataHora: data?.dataHora ? formatMilitaryDate(data.dataHora) : "",
    localRua: data?.localRua || "",
    localNumero: data?.localNumero || "",
    localBairro: data?.localBairro || "",
    envolvidos: data?.envolvidos || [],
    oficial: data?.oficial || "",
    material: data?.material?.length
      ? data.material.split(",").map(item => item.trim())
      : ["nenhum"],
    resumo: data?.resumo || "",
    motivacao: data?.motivacao || "Desconhecida",
  };

  return <div>{JSON.stringify(report, null, 2)}</div>;
}