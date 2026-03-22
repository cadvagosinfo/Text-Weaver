import { useState } from "react";
import { Link } from "wouter";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema, type InsertReport } from "@shared/schema";
import { useReports, useCreateReport, useUpdateReport, useDeleteReport } from "@/hooks/use-reports";
import { ReportFormatter } from "@/components/ReportFormatter";
import { WordReportTab } from "@/components/WordReportTab";
import { WeeklySummaryTab } from "@/components/WeeklySummaryTab";
import { differenceInYears, parseISO, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Trash2,
  Edit2,
  History,
  Save,
  ShieldAlert,
  UserPlus,
  X,
  FileClock,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  FileSpreadsheet,
  ArrowLeft,
  LogOut,
  Users,
  FileEdit,
  MessageSquare,
  Share2,
  Copy,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartoriaisTab } from "@/components/CartoriaisTab";

// ─── Constants ───────────────────────────────────────────────────────────────

const UNIDADES_CIDADES: Record<string, string[]> = {
  "41º BPM": [
    "Gramado",
    "Canela",
    "São Francisco de Paula",
    "Nova Petrópolis",
    "Picada Café",
    "Cambará do Sul",
  ],
  "2ª Cia Ind": ["Taquara", "Rolante", "Riozinho", "Igrejinha", "Três Coroas"],
};

const ROLES = [
  "VÍTIMA",
  "AUTOR",
  "TESTEMUNHA",
  "PRESO",
  "MENOR APREENDIDO",
  "CONDUTOR",
  "ATENDIDO",
  "SUSPEITO",
] as const;

const QUICK_FACTS = [
  "HOMICÍDIO DOLOSO",
  "ROUBO DE VEÍCULO",
  "ROUBO A PEDESTRE",
  "ROUBO A RESIDÊNCIA",
  "ROUBO A ESTABELECIMENTO COMERCIAL E DE ENSINO",
  "FURTO DE VEÍCULO",
  "FURTO EM VEÍCULO",
  "HOMICÍDIO CULPOSO EM DIREÇÃO DE VEÍCULO AUTOMOTOR",
];


const DEFAULT_PERSON = {
  role: "AUTOR",
  nome: "",
  alcunha: "",
  dataNascimento: "",
  antecedentes: "",
  orcrim: "NÃO CONSTA",
  documentoRg: "",
  documentoCpf: "",
};

const DEFAULT_FORM: InsertReport = {
  fato: "",
  fatoComplementar: "",
  unidade: "",
  cidade: "",
  dataHora: new Date(),
  localRua: "",
  localNumero: "",
  localBairro: "",
  envolvidos: [],
  oficial: "",
  material: [],
  resumo: "",
  motivacao: "",
  gerarCartorial: false,
};

// ─── Owl SVG watermark ───────────────────────────────────────────────────────
function OwlWatermark() {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* ── Wings spread wide ── */}
      <path d="M55,100 Q10,80 5,140 Q25,125 48,118" />
      <path d="M145,100 Q190,80 195,140 Q175,125 152,118" />

      {/* ── Body – broad & imposing ── */}
      <ellipse cx="100" cy="148" rx="52" ry="62" />

      {/* ── Head ── */}
      <circle cx="100" cy="72" r="52" />

      {/* ── Aggressive ear tufts – splayed outward ── */}
      <polygon points="52,38 24,4 62,28" />
      <polygon points="148,38 176,4 138,28" />
      {/* inner tuft detail */}
      <polygon points="60,36 42,12 68,30" opacity="0.6" />
      <polygon points="140,36 158,12 132,30" opacity="0.6" />

      {/* ── Heavy angry brow ridge ── */}
      <polygon points="48,54 100,42 152,54 100,66" fill="rgba(0,0,30,0.35)" />

      {/* ── Left eye ── */}
      <circle cx="76" cy="78" r="19" fill="white" />
      <circle cx="78" cy="80" r="13" fill="#1e3a8a" />
      <circle cx="80" cy="82" r="7" fill="black" />
      <circle cx="83" cy="77" r="2.5" fill="white" />
      {/* angry left brow – angled sharply inward */}
      <path d="M54,53 Q70,48 96,62" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />

      {/* ── Right eye ── */}
      <circle cx="124" cy="78" r="19" fill="white" />
      <circle cx="122" cy="80" r="13" fill="#1e3a8a" />
      <circle cx="120" cy="82" r="7" fill="black" />
      <circle cx="117" cy="77" r="2.5" fill="white" />
      {/* angry right brow – angled sharply inward */}
      <path d="M146,53 Q130,48 104,62" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />

      {/* ── Hooked beak – large & sharp ── */}
      <path d="M100,94 L84,114 L100,108 L116,114 Z" fill="#92400e" />
      <path d="M100,108 Q90,120 82,114 L100,96 L118,114 Q110,120 100,108Z" fill="#78350f" />

      {/* ── Chest feather rows ── */}
      <path d="M66,125 Q100,112 134,125" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
      <path d="M60,142 Q100,128 140,142" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
      <path d="M58,159 Q100,144 142,159" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
      <path d="M60,176 Q100,162 140,176" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

      {/* ── Talons – sharp & extended ── */}
      {/* left foot */}
      <line x1="82" y1="206" x2="68" y2="216" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="206" x2="76" y2="218" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="206" x2="84" y2="218" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="206" x2="96" y2="214" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="206" x2="73" y2="196" stroke="white" strokeWidth="3" strokeLinecap="round" />
      {/* right foot */}
      <line x1="118" y1="206" x2="104" y2="216" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="118" y1="206" x2="116" y2="218" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="118" y1="206" x2="124" y2="218" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="118" y1="206" x2="132" y2="214" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="118" y1="206" x2="127" y2="196" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Reports() {
  const { data: reports, isLoading: isLoadingReports } = useReports();
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const deleteReport = useDeleteReport();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPreliminar, setIsPreliminar] = useState(false);
  const [showFatoComplementar, setShowFatoComplementar] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [showMenu, setShowMenu] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState<{ open: boolean; tab: string }>({ open: false, tab: "" });
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const form = useForm<InsertReport>({
    resolver: zodResolver(insertReportSchema),
    defaultValues: DEFAULT_FORM,
  });

  const { fields: personFields, append: appendPerson, remove: removePerson } = useFieldArray({
    control: form.control,
    name: "envolvidos" as any,
  });

  const watchedUnidade = useWatch({ control: form.control, name: "unidade" });
  const cidadesDisponiveis = UNIDADES_CIDADES[watchedUnidade as string] || [];

  const handleUnidadeChange = (value: string) => {
    form.setValue("unidade", value);
    form.setValue("cidade", "");
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    try {
      return differenceInYears(new Date(), parseISO(birthDate));
    } catch {
      return null;
    }
  };

  const checkPassword = (tab: string) => {
    setShowPasswordDialog({ open: true, tab });
    setPasswordInput("");
    setPasswordError(false);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "1837") {
      setActiveTab(showPasswordDialog.tab);
      setShowMenu(false);
      setShowPasswordDialog({ open: false, tab: "" });
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  const startEdit = (report: any) => {
    setEditingId(report.id);
    setIsPreliminar(false);
    setShowFatoComplementar(!!(report.fatoComplementar));
    const values = {
      fato: report.fato,
      fatoComplementar: report.fatoComplementar || "",
      unidade: report.unidade,
      cidade: report.cidade,
      dataHora: new Date(report.dataHora),
      localRua: report.localRua,
      localNumero: report.localNumero,
      localBairro: report.localBairro,
      envolvidos: report.envolvidos,
      oficial: report.oficial,
      material: report.material,
      resumo: report.resumo,
      motivacao: report.motivacao || "",
      gerarCartorial: report.gerarCartorial || false,
    };
    form.reset(values);
    setActiveTab("editor");
    setShowMenu(false);
    // Re-apply cidade after a tick — Radix Select drops the value when
    // cidadesDisponiveis is still empty on the very first render.
    setTimeout(() => {
      form.setValue("cidade", report.cidade || "", { shouldValidate: false });
    }, 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsPreliminar(false);
    form.reset(DEFAULT_FORM);
  };

  const onSubmit = (data: InsertReport) => {
    const finalData = {
      ...data,
      motivacao: data.motivacao || "Desconhecida",
      localNumero: data.localNumero?.trim() || "S/N",
    };
    if (editingId) {
      updateReport.mutate({ id: editingId, data: finalData }, {
        onSuccess: () => {
          setEditingId(null);
          setIsPreliminar(false);
          form.reset(DEFAULT_FORM);
        },
      });
    } else {
      createReport.mutate(finalData, {
        onSuccess: () => {
          setIsPreliminar(false);
          form.reset(DEFAULT_FORM);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    const password = prompt("Informe a senha para autorizar a exclusão:");
    if (password === "1837") {
      deleteReport.mutate(id);
    } else {
      alert("Senha incorreta. A exclusão não foi autorizada.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("auth");
    window.location.href = "/";
  };

  const handleCopyMessage = () => {
    const data = form.getValues();
    const localNumero = data.localNumero?.trim() || "";
    const numStr = localNumero.toUpperCase() === "S/N" || !localNumero ? "S/N" : `nº ${localNumero}`;

    const envLines = (data.envolvidos as any[])?.map((p: any) => {
      const age = calculateAge(p.dataNascimento);
      const ageStr = age != null ? `${age} anos` : "idade não informada";
      const doc = p.documentoRg ? `RG: ${p.documentoRg}` : p.documentoCpf ? `CPF: ${p.documentoCpf}` : "DOC: N/I";
      return `*${(p.role || "ENVOLVIDO").toUpperCase()}:* ${(p.nome || "[NOME]").toUpperCase()}; ${doc}; ${ageStr}\n*ANTECEDENTES:* ${p.antecedentes || "Nada consta"}\n*ORCRIM:* ${p.orcrim || "Não consta"}`;
    }).join("\n\n") || "";

    const military = data.dataHora ? format(new Date(data.dataHora), "ddHHmm") + format(new Date(data.dataHora), "MMM").toUpperCase().replace(".", "") + format(new Date(data.dataHora), "yy") : "[DATA]";

    const fatoLine = data.fatoComplementar?.trim()
      ? `*${(data.fato || "[FATO]").toUpperCase()}*\n*${data.fatoComplementar.toUpperCase()}*`
      : `*${(data.fato || "[FATO]").toUpperCase()}*`;

    const msg = `${isPreliminar ? "*PRELIMINAR*\n\n" : ""}${fatoLine}

*${(data.cidade || "[CIDADE]").toUpperCase()} - CRPM HORTÊNSIAS / ${(data.unidade || "[UNIDADE]").toUpperCase()}*

*DATA/HORA:* ${military}

*LOCAL:* ${(data.localRua || "[LOGRADOURO]").toLowerCase()}, ${numStr}, bairro ${(data.localBairro || "[BAIRRO]").toLowerCase()}

${envLines}

*MOTIVAÇÃO:* ${data.motivacao || "Desconhecida"}

*MATERIAL APREENDIDO:*
${Array.isArray(data.material) && data.material.length > 0 ? data.material.join("\n") : "nenhum"}

*OFICIAL:* ${(data.oficial || "[OFICIAL]").toUpperCase()}

*RESUMO DO FATO:*
${data.resumo || "[RESUMO]"}${isPreliminar ? "\n\n*OCORRÊNCIA EM ANDAMENTO / AGUARDANDO MAIORES DADOS*" : ""}`;

    navigator.clipboard.writeText(msg);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">

      {/* ── Password Dialog ── */}
      {showPasswordDialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/60 backdrop-blur-md p-4">
          <div className="w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-blue-400/30">
              {/* Blue gradient top half */}
              <div className="bg-gradient-to-b from-blue-700 to-blue-600 px-8 pt-10 pb-12 flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-white blur-2xl opacity-20 scale-150" />
                  <div className="relative p-5 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm">
                    <ShieldAlert className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-black text-2xl tracking-tight uppercase text-white leading-none">
                    ACESSO RESTRITO
                  </h3>
                  <p className="text-[10px] font-bold uppercase text-blue-200 tracking-[0.25em]">
                    SISTEMA DE SEGURANÇA
                  </p>
                </div>
              </div>
              {/* White bottom half */}
              <div className="bg-white px-8 pb-8 -mt-6 rounded-t-3xl relative">
                <div className="pt-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-slate-400 text-center tracking-widest">
                      INSIRA A SENHA DE ACESSO
                    </p>
                    <Input
                      type="password"
                      autoFocus
                      placeholder="••••"
                      className={`text-center text-3xl tracking-[0.5em] h-16 border-2 focus-visible:ring-blue-600 focus-visible:border-blue-600 bg-slate-50 font-mono transition-colors ${passwordError ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                      value={passwordInput}
                      onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                      onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                    />
                    {passwordError && (
                      <p className="text-[10px] text-red-500 font-bold uppercase text-center tracking-wider">
                        ✕ Senha incorreta
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      className="flex-1 font-bold uppercase text-[10px] h-12 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                      onClick={() => setShowPasswordDialog({ open: false, tab: "" })}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] h-12 shadow-lg shadow-blue-600/30 tracking-wider rounded-xl"
                      onClick={handlePasswordSubmit}
                    >
                      Acessar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar (only in editor tab) ── */}
      {!showMenu && activeTab === "editor" && (
        <aside className="w-full md:w-80 border-r bg-white dark:bg-slate-900 flex flex-col h-[400px] md:h-screen sticky top-0">
          <div className="p-6 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-lg tracking-tight uppercase text-blue-100">
                Sistema de Ocorrências
              </h1>
            </div>
            <p className="text-[10px] text-blue-300/80 uppercase tracking-[0.2em] pl-[3.25rem] font-bold">
              Gerenciamento Integrado
            </p>
          </div>

          <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="w-4 h-4" />
              <span>Histórico Recente</span>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {reports?.length || 0}
            </Badge>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {isLoadingReports ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : reports?.length === 0 ? (
                <div className="text-center py-12 px-4 text-muted-foreground border-2 border-dashed rounded-xl">
                  <FileClock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhum relatório salvo ainda.</p>
                </div>
              ) : (
                reports?.map((report) => (
                  <div
                    key={report.id}
                    className={`group bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 relative ${editingId === report.id ? "border-blue-500 ring-1 ring-blue-500" : "hover:border-blue-200 dark:hover:border-blue-800"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 uppercase">
                        {report.fato}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(report)}
                          className="text-slate-400 hover:text-blue-500 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        <span className="uppercase">{report.cidade}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(report.dataHora), "dd/MM/yy HH:mm")}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </aside>
      )}

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="px-8 py-5 border-b bg-white dark:bg-slate-900 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 uppercase">
                {showMenu ? "Menu Principal" : editingId ? "Editando Relatório" : "Novo Relatório"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {showMenu
                  ? "Selecione uma funcionalidade abaixo."
                  : "Preencha os dados abaixo para gerar a mensagem padrão."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!showMenu && (
              <Button
                variant="outline"
                onClick={() => setShowMenu(true)}
                className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 font-bold uppercase text-xs px-6 border-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Menu
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 font-bold uppercase text-xs px-6 border-2"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {showMenu ? (
            /* ── Menu ── */
            <div className="h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-auto flex flex-col items-center justify-center relative">
              {/* Owl watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="w-[500px] h-[500px] opacity-[0.07] text-blue-300">
                  <OwlWatermark />
                </div>
              </div>

              {/* Subtle radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15)_0%,_transparent_70%)] pointer-events-none" />

              {/* Title */}
              <div className="relative z-10 text-center mb-12 space-y-3">
                <h1 className="text-4xl font-black uppercase tracking-tight text-white">
                  Sistema de Ocorrências
                </h1>
                <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full" />
              </div>

              {/* Cards */}
              <div className="relative z-10 max-w-5xl w-full px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Release */}
                <Card
                  className="group relative overflow-hidden border border-white/10 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer bg-white/5 backdrop-blur-md hover:-translate-y-3 hover:border-blue-400/40"
                  onClick={() => { setActiveTab("editor"); setShowMenu(false); }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 gap-6 min-h-[220px]">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500 scale-150" />
                      <div className="relative p-5 bg-blue-600/20 rounded-2xl border border-blue-400/30 group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-500">
                        <FileText className="w-12 h-12 text-blue-300 group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-black uppercase tracking-tighter text-xl text-white">Release</h3>
                      <div className="h-0.5 w-8 bg-blue-500 mx-auto rounded-full group-hover:w-16 transition-all duration-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Relatório RPI */}
                <Card
                  className="group relative overflow-hidden border border-white/10 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer bg-white/5 backdrop-blur-md hover:-translate-y-3 hover:border-blue-400/40"
                  onClick={() => checkPassword("word")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 gap-6 min-h-[220px]">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500 scale-150" />
                      <div className="relative p-5 bg-blue-600/20 rounded-2xl border border-blue-400/30 group-hover:bg-blue-600 group-hover:-rotate-6 transition-all duration-500">
                        <FileSpreadsheet className="w-12 h-12 text-blue-300 group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-black uppercase tracking-tighter text-xl text-white">Relatório RPI</h3>
                      <div className="h-0.5 w-8 bg-blue-500 mx-auto rounded-full group-hover:w-16 transition-all duration-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo Semanal */}
                <Card
                  className="group relative overflow-hidden border border-white/10 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer bg-white/5 backdrop-blur-md hover:-translate-y-3 hover:border-blue-400/40"
                  onClick={() => checkPassword("weekly")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 gap-6 min-h-[220px]">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500 scale-150" />
                      <div className="relative p-5 bg-blue-600/20 rounded-2xl border border-blue-400/30 group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-500">
                        <Calendar className="w-12 h-12 text-blue-300 group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-black uppercase tracking-tighter text-xl text-white">Resumo Semanal</h3>
                      <div className="h-0.5 w-8 bg-blue-500 mx-auto rounded-full group-hover:w-16 transition-all duration-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Cartoriais */}
                <Card
                  className="group relative overflow-hidden border border-white/10 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer bg-white/5 backdrop-blur-md hover:-translate-y-3 hover:border-blue-400/40"
                  onClick={() => checkPassword("cartoriais")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 gap-6 min-h-[220px]">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500 scale-150" />
                      <div className="relative p-5 bg-blue-600/20 rounded-2xl border border-blue-400/30 group-hover:bg-blue-600 group-hover:-rotate-6 transition-all duration-500">
                        <Briefcase className="w-12 h-12 text-blue-300 group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-black uppercase tracking-tighter text-xl text-white">Cartoriais</h3>
                      <div className="h-0.5 w-8 bg-blue-500 mx-auto rounded-full group-hover:w-16 transition-all duration-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          ) : (
            /* ── Tab contents ── */
            <div className="flex-1 overflow-hidden h-full">
              {activeTab === "editor" && (
                <div className="h-full overflow-auto bg-slate-50 dark:bg-slate-950">
                  <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 pb-24">

                    <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400" />
                      <CardContent className="p-8">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* ── Header row ── */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                              <div>
                                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                                  {editingId ? "Editar Registro" : "Novo Registro"}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">Preencha os dados da ocorrência com precisão.</p>
                              </div>
                              <div className="flex items-center gap-4 flex-wrap">
                                {/* Preliminar toggle */}
                                <label className="flex items-center gap-2 cursor-pointer bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-xl">
                                  <input
                                    type="checkbox"
                                    checked={isPreliminar}
                                    onChange={(e) => setIsPreliminar(e.target.checked)}
                                    className="w-4 h-4 accent-amber-500"
                                  />
                                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Preliminar</span>
                                </label>
                              </div>
                            </div>

                            {/* ── Fato + Data ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <FormField
                                  control={form.control}
                                  name="fato"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Natureza da Ocorrência *</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <FormControl>
                                          <SelectTrigger className="h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium">
                                            <SelectValue placeholder="Selecione a natureza" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px] bg-white dark:bg-slate-900">
                                          {QUICK_FACTS.map((type) => (
                                            <SelectItem key={type} value={type} className="py-2 font-medium">
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                {/* Fato complementar toggle */}
                                <div className="space-y-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowFatoComplementar(!showFatoComplementar);
                                      if (showFatoComplementar) form.setValue("fatoComplementar", "");
                                    }}
                                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border-2 transition-all ${showFatoComplementar ? "bg-blue-600 border-blue-600 text-white" : "border-blue-200 text-blue-600 hover:bg-blue-50"}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                    Fato Complementar
                                  </button>
                                  {showFatoComplementar && (
                                    <FormField
                                      control={form.control}
                                      name="fatoComplementar"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              placeholder="Ex: COM EMPREGO DE ARMA DE FOGO"
                                              {...field}
                                              value={field.value || ""}
                                              className="h-12 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 font-medium focus-visible:ring-blue-600"
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                </div>
                              </div>

                              <FormField
                                control={form.control}
                                name="dataHora"
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Data e Hora *</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="datetime-local"
                                        className="h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                                        value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* ── Localização ── */}
                            <div className="space-y-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Localização</h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField
                                  control={form.control}
                                  name="unidade"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unidade Policial *</FormLabel>
                                      <Select onValueChange={handleUnidadeChange} value={field.value || ""}>
                                        <FormControl>
                                          <SelectTrigger className="h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium">
                                            <SelectValue placeholder="Selecione a unidade" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white dark:bg-slate-900">
                                          {Object.keys(UNIDADES_CIDADES).map((u) => (
                                            <SelectItem key={u} value={u} className="font-medium">{u}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="cidade"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Município *</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedUnidade}>
                                        <FormControl>
                                          <SelectTrigger className="h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium">
                                            <SelectValue placeholder={watchedUnidade ? "Selecione a cidade" : "Selecione a unidade primeiro"} />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white dark:bg-slate-900">
                                          {cidadesDisponiveis.map((city) => (
                                            <SelectItem key={city} value={city} className="font-medium">{city}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <FormField
                                  control={form.control}
                                  name="localRua"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2 md:col-span-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logradouro *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ex: Rua das Flores" {...field} className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="localNumero"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Número</FormLabel>
                                      <FormControl>
                                        <Input placeholder="S/N" {...field} className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name="localBairro"
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bairro *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ex: Centro" {...field} className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* ── Envolvidos ── */}
                            <div className="space-y-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-600" />
                                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Envolvidos</h3>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                  {/* Gerar Cartorial */}
                                  <FormField
                                    control={form.control}
                                    name="gerarCartorial"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg">
                                        <FormControl>
                                          <Checkbox
                                            checked={!!field.value}
                                            onCheckedChange={field.onChange}
                                            className="w-4 h-4 border-2 border-blue-600 data-[state=checked]:bg-blue-600"
                                          />
                                        </FormControl>
                                        <FormLabel className="text-[9px] font-black uppercase text-blue-600 cursor-pointer select-none tracking-widest whitespace-nowrap">
                                          Incluir Cartorial
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendPerson(DEFAULT_PERSON as any)}
                                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-black uppercase text-[9px] tracking-widest h-8 px-4"
                                  >
                                    <Plus className="w-3 h-3 mr-1" /> Adicionar Envolvido
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {personFields.map((pf, index) => (
                                  <Card key={pf.id} className="border-2 border-slate-100 dark:border-slate-800 shadow-none overflow-hidden">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-2.5 border-b flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                        Envolvido #{index + 1}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePerson(index)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                      {/* Always visible: Qualificação */}
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.role` as any}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Qualificação</FormLabel>
                                            <Select onValueChange={field.onChange} value={(field.value as string) || ""}>
                                              <FormControl>
                                                <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium">
                                                  <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent className="bg-white dark:bg-slate-900">
                                                {ROLES.map((r) => (
                                                  <SelectItem key={r} value={r} className="font-medium">{r}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormItem>
                                        )}
                                      />
                                      {/* Always visible: Nome */}
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.nome` as any}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Nome Completo</FormLabel>
                                            <FormControl>
                                              <Input {...field} value={(field.value as string) || ""} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      {/* Always visible: Data de Nascimento */}
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.dataNascimento` as any}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">
                                              Data de Nascimento
                                              {field.value && (
                                                <span className="ml-2 text-blue-600">
                                                  ({calculateAge(field.value as string)} anos)
                                                </span>
                                              )}
                                            </FormLabel>
                                            <FormControl>
                                              <Input type="date" {...field} value={(field.value as string) || ""} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      {/* Always visible: RG */}
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.documentoRg` as any}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">RG</FormLabel>
                                            <FormControl>
                                              <Input {...field} value={(field.value as string) || ""} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      {/* Always visible: CPF */}
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.documentoCpf` as any}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">CPF</FormLabel>
                                            <FormControl>
                                              <Input {...field} value={(field.value as string) || ""} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      {/* Always visible: Antecedentes */}
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.antecedentes` as any}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Antecedentes Criminais</FormLabel>
                                            <FormControl>
                                              <Input {...field} value={(field.value as string) || ""} placeholder="Ex: Tráfico, Furto..." className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      {/* Always visible: ORCRIM */}
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.orcrim` as any}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">ORCRIM / Facção</FormLabel>
                                            <FormControl>
                                              <Input {...field} value={(field.value as string) || ""} placeholder="Ex: Não consta, PCC, CV..." className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />

                                      {/* ── Cartorial extras (only when gerarCartorial is checked) ── */}
                                      {form.watch("gerarCartorial") && (
                                        <>
                                          <div className="md:col-span-2 border-t border-blue-100 dark:border-blue-900 pt-3 mt-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Dados Cartoriais</p>
                                          </div>
                                          {/* Situação */}
                                          <FormField
                                            control={form.control}
                                            name={`envolvidos.${index}.situacao` as any}
                                            render={({ field }) => (
                                              <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Situação</FormLabel>
                                                <FormControl>
                                                  <Input {...field} value={(field.value as string) || ""} placeholder="Ex: Preso, Liberdade, Foragido..." className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                          {/* Alcunha */}
                                          <FormField
                                            control={form.control}
                                            name={`envolvidos.${index}.alcunha` as any}
                                            render={({ field }) => (
                                              <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Alcunha</FormLabel>
                                                <FormControl>
                                                  <Input {...field} value={(field.value as string) || ""} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                          {/* Pai */}
                                          <FormField
                                            control={form.control}
                                            name={`envolvidos.${index}.pai` as any}
                                            render={({ field }) => (
                                              <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Nome do Pai</FormLabel>
                                                <FormControl>
                                                  <Input {...field} value={(field.value as string) || ""} placeholder="N/I" className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                          {/* Mãe */}
                                          <FormField
                                            control={form.control}
                                            name={`envolvidos.${index}.mae` as any}
                                            render={({ field }) => (
                                              <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Nome da Mãe</FormLabel>
                                                <FormControl>
                                                  <Input {...field} value={(field.value as string) || ""} placeholder="N/I" className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                          {/* Código Preso */}
                                          <FormField
                                            control={form.control}
                                            name={`envolvidos.${index}.codigoPreso` as any}
                                            render={({ field }) => (
                                              <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Código Preso</FormLabel>
                                                <FormControl>
                                                  <Input {...field} value={(field.value as string) || ""} placeholder="Nº do preso" className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                          {/* Endereço */}
                                          <FormField
                                            control={form.control}
                                            name={`envolvidos.${index}.endereco` as any}
                                            render={({ field }) => (
                                              <FormItem className="space-y-1.5 md:col-span-2">
                                                <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Endereço Residencial</FormLabel>
                                                <FormControl>
                                                  <Input {...field} value={(field.value as string) || ""} placeholder="Rua, número, bairro..." className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                          {/* Observações */}
                                          <FormField
                                            control={form.control}
                                            name={`envolvidos.${index}.observacoes` as any}
                                            render={({ field }) => (
                                              <FormItem className="space-y-1.5 md:col-span-2">
                                                <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Observações</FormLabel>
                                                <FormControl>
                                                  <Textarea {...field} value={(field.value as string) || ""} placeholder="Informações adicionais..." className="min-h-[70px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-none" />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                        </>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            {/* ── Resumo e Materiais ── */}
                            <div className="space-y-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <FileEdit className="w-4 h-4 text-blue-600" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Resumo, Materiais e Oficial</h3>
                              </div>

                              <FormField
                                control={form.control}
                                name="resumo"
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Síntese dos Fatos *</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Descreva a ocorrência com todos os detalhes relevantes..."
                                        className="min-h-[200px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-y"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="motivacao"
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                      Motivação <span className="text-slate-300 font-normal normal-case tracking-normal">(opcional — se vazio: "Desconhecida")</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Ex: Passional, Tráfico, Desconhecida..."
                                        {...field}
                                        value={field.value || ""}
                                        className="h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Material apreendido */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Material Apreendido</FormLabel>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const cur = form.getValues("material") as string[];
                                      form.setValue("material", [...(cur || []), ""]);
                                    }}
                                    className="border border-slate-300 text-slate-600 text-[9px] font-black uppercase h-7 px-3 hover:bg-slate-100"
                                  >
                                    <Plus className="w-3 h-3 mr-1" /> Adicionar Item
                                  </Button>
                                </div>
                                {(form.watch("material") as string[])?.map((_, mi) => (
                                  <div key={mi} className="flex gap-2">
                                    <FormField
                                      control={form.control}
                                      name={`material.${mi}` as any}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormControl>
                                            <Input {...field} value={(field.value as string) || ""} placeholder={`Item ${mi + 1}`} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const cur = form.getValues("material") as string[];
                                        form.setValue("material", cur.filter((_, i) => i !== mi));
                                      }}
                                      className="text-red-500 hover:bg-red-50 h-10 w-10 p-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              <FormField
                                control={form.control}
                                name="oficial"
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Oficial / Policial Responsável *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Nome do Oficial"
                                        {...field}
                                        className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* ── Submit ── */}
                            <div className="pt-6 flex flex-col md:flex-row gap-4">
                              <Button
                                type="submit"
                                disabled={createReport.isPending || updateReport.isPending}
                                className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-600/20"
                              >
                                {createReport.isPending || updateReport.isPending ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Processando...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Save className="w-5 h-5" />
                                    <span>{editingId ? "Atualizar Registro" : "Salvar Registro"}</span>
                                  </div>
                                )}
                              </Button>
                              {editingId && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={cancelEdit}
                                  className="h-14 border-2 border-slate-200 font-black uppercase text-xs tracking-widest px-8"
                                >
                                  Cancelar Edição
                                </Button>
                              )}
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>

                    {/* ── Preview + Share ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Prévia do Release</h3>
                        </div>
                        <div className="h-[400px]">
                          <ReportFormatter data={form.watch()} isPreliminar={isPreliminar} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <Share2 className="w-4 h-4 text-blue-600" />
                          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Compartilhamento</h3>
                        </div>
                        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900">
                          <CardContent className="p-6 flex flex-col gap-4">
                            <Button
                              type="button"
                              onClick={handleCopyMessage}
                              className="w-full h-14 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest shadow-lg"
                            >
                              <Copy className="w-4 h-4 mr-2" /> Copiar para WhatsApp
                            </Button>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                              * A mensagem será copiada com formatação para WhatsApp (negritos em asteriscos). Se a motivação não for preenchida, aparecerá como "Desconhecida". Se o número não for informado, aparecerá como "S/N".
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "word" && <WordReportTab reports={reports || []} />}
              {activeTab === "weekly" && <WeeklySummaryTab reports={reports || []} />}
              {activeTab === "cartoriais" && <CartoriaisTab reports={reports || []} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
