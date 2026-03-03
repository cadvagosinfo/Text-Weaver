import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Package,
  FileSpreadsheet,
  ArrowLeft,
  LogOut
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

const UNIDADES = ["41º BPM", "2ª Cia Ind"] as const;

const CIDADES_BY_UNIDADE: Record<string, string[]> = {
  "41º BPM": [
    "Gramado", 
    "Canela", 
    "São Francisco de Paula", 
    "Nova Petrópolis", 
    "Picada Café", 
    "Cambará do Sul"
  ],
  "2ª Cia Ind": [
    "Taquara", 
    "Rolante", 
    "Riozinho", 
    "Igrejinha", 
    "Três Coroas"
  ]
};

const ROLES = ["VÍTIMA", "AUTOR", "TESTEMUNHA", "PRESO", "MENOR APREENDIDO", "CONDUTOR", "ATENDIDO", "SUSPEITO"] as const;
const DOCUMENTO_TIPOS = ["RG", "CPF"] as const;

const QUICK_FACTS = [
  "HOMICÍDIO DOLOSO",
  "ROUBO A PEDESTRE",
  "ROUBO DE VEÍCULO",
  "ROUBO A ESTABELECIMENTO COMERCIAL E DE ENSINO",
  "ROUBO A RESIDÊNCIA",
  "FURTO DE VEÍCULO",
  "FURTO EM VEÍCULO",
  "HOMICÍDIO CULPOSO EM DIREÇÃO DE VEÍCULO AUTOMOTOR"
];

export default function Reports() {
  const { data: reports, isLoading: isLoadingReports } = useReports();
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const deleteReport = useDeleteReport();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPreliminar, setIsPreliminar] = useState(false);
  const [showFatoComplementar, setShowFatoComplementar] = useState(false);
  
  const form = useForm<InsertReport>({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      fato: "",
      fatoComplementar: "",
      unidade: "",
      cidade: "",
      localRua: "",
      localNumero: "",
      localBairro: "",
      oficial: "",
      material: [],
      resumo: "",
      motivacao: "",
      gerarCartorial: false,
      envolvidos: [],
      dataHora: new Date(),
    },
  });

  // Add validation for involved parties if needed, but the main issue might be default values
  useEffect(() => {
    if (editingId === null) {
      form.reset({
        fato: "",
        fatoComplementar: "",
        unidade: "",
        cidade: "",
        localRua: "",
        localNumero: "",
        localBairro: "",
        oficial: "",
        material: [],
        resumo: "",
        motivacao: "",
        gerarCartorial: false,
        envolvidos: [],
        dataHora: new Date(),
      });
    }
  }, [editingId]);

  const { fields: personFields, append: appendPerson, remove: removePerson } = useFieldArray({
    control: form.control,
    name: "envolvidos",
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: "material",
  });

  const watchedData = form.watch();

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    try {
      const date = parseISO(birthDate);
      return differenceInYears(new Date(), date);
    } catch (e) {
      return null;
    }
  };

  const handleUnidadeChange = (value: string) => {
    form.setValue("unidade", value);
    form.setValue("cidade", "");
  };

  const applyCPFMask = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const [activeTab, setActiveTab] = useState("editor");
  const [showMenu, setShowMenu] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState<{ open: boolean, tab: string }>({ open: false, tab: "" });
  const [passwordInput, setPasswordInput] = useState("");

  const checkPassword = (tab: string) => {
    setShowPasswordDialog({ open: true, tab });
    setPasswordInput("");
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "1837") {
      setActiveTab(showPasswordDialog.tab);
      setShowMenu(false);
      setShowPasswordDialog({ open: false, tab: "" });
    } else {
      alert("Senha incorreta.");
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "editor") {
      setActiveTab(value);
      setShowMenu(false);
      return;
    }
    checkPassword(value);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["editor", "word", "weekly"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const startEdit = (report: any) => {
    setEditingId(report.id);
    setShowFatoComplementar(!!report.fatoComplementar);
    form.reset({
      fato: report.fato,
      fatoComplementar: report.fatoComplementar || "",
      unidade: report.unidade,
      cidade: report.cidade,
      localRua: report.localRua,
      localNumero: report.localNumero,
      localBairro: report.localBairro,
      oficial: report.oficial,
      material: report.material,
      resumo: report.resumo,
      motivacao: report.motivacao || "",
      gerarCartorial: report.gerarCartorial || false,
      envolvidos: report.envolvidos,
      dataHora: new Date(report.dataHora),
    });
    
    setTimeout(() => {
      form.setValue("cidade", report.cidade);
    }, 50);

    setActiveTab("editor");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowFatoComplementar(false);
    form.reset({
      fato: "",
      fatoComplementar: "",
      unidade: "",
      cidade: "",
      localRua: "",
      localNumero: "",
      localBairro: "",
      oficial: "",
      material: [],
      resumo: "",
      motivacao: "",
      gerarCartorial: false,
      envolvidos: [],
      dataHora: new Date(),
    });
  };

  const onSubmit = (data: InsertReport) => {
    const finalData = {
      ...data,
      fatoComplementar: showFatoComplementar ? data.fatoComplementar : null
    };
    if (editingId) {
      updateReport.mutate({ id: editingId, data: finalData }, {
        onSuccess: () => {
          setEditingId(null);
          setShowFatoComplementar(false);
          form.reset({
            fato: "",
            fatoComplementar: "",
            unidade: "",
            cidade: "",
            localRua: "",
            localNumero: "",
            localBairro: "",
            oficial: "",
            material: [],
            resumo: "",
            motivacao: "",
            gerarCartorial: false,
            envolvidos: [],
            dataHora: new Date(),
          });
        }
      });
    } else {
      createReport.mutate(finalData, {
        onSuccess: () => {
          setShowFatoComplementar(false);
          form.reset({
            fato: "",
            fatoComplementar: "",
            unidade: "",
            cidade: "",
            localRua: "",
            localNumero: "",
            localBairro: "",
            oficial: "",
            material: [],
            resumo: "",
            motivacao: "",
            gerarCartorial: false,
            envolvidos: [],
            dataHora: new Date(),
          });
        }
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {showPasswordDialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-600/10 backdrop-blur-md p-4">
          <Card className="w-full max-w-sm border-0 shadow-2xl animate-in zoom-in-95 duration-200 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400" />
            <CardContent className="pt-10 pb-8 flex flex-col items-center gap-8 px-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 animate-pulse" />
                <div className="relative p-5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <ShieldAlert className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="font-black text-2xl tracking-tight uppercase text-slate-900 dark:text-white leading-none">ACESSO RESTRITO</h3>
                <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">SISTEMA DE SEGURANÇA</p>
              </div>

              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase text-slate-400 text-center tracking-widest">INSIRA A SENHA DE ACESSO</p>
                  <Input 
                    type="password" 
                    autoFocus
                    placeholder="••••"
                    className="text-center text-3xl tracking-[0.5em] h-16 border-2 border-slate-100 dark:border-slate-800 focus-visible:ring-blue-600 focus-visible:border-blue-600 bg-slate-50/50 dark:bg-slate-800/50 font-mono"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    className="flex-1 font-bold uppercase text-[10px] h-12 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    onClick={() => setShowPasswordDialog({ open: false, tab: "" })}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] h-12 shadow-lg shadow-blue-600/20 tracking-wider"
                    onClick={handlePasswordSubmit}
                  >
                    Acessar Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {!showMenu && activeTab === "editor" && (
        <aside className="w-full md:w-80 border-r bg-white dark:bg-slate-900 flex flex-col h-[400px] md:h-screen sticky top-0">
          <div className="p-6 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-lg tracking-tight uppercase text-blue-100">Sistema de Ocorrências</h1>
            </div>
            <p className="text-[10px] text-blue-300/80 uppercase tracking-[0.2em] pl-[3.25rem] font-bold">Gerenciamento Integrado</p>
          </div>

          <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="w-4 h-4" />
              <span>Histórico Recente</span>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">{reports?.length || 0}</Badge>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {isLoadingReports ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
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
                    className={`group bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 relative ${editingId === report.id ? 'border-blue-500 ring-1 ring-blue-500' : 'hover:border-blue-200 dark:hover:border-blue-800'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 uppercase">{report.fato}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(report)}
                          className="text-slate-400 hover:text-blue-500 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(report.id)}
                          className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Excluir"
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

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
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
                {showMenu ? "Selecione uma funcionalidade abaixo." : "Preencha os dados abaixo para gerar a mensagem padrão."}
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
            {!showMenu && activeTab === "editor" && (
              <Button 
                onClick={form.handleSubmit(onSubmit)} 
                disabled={createReport.isPending || updateReport.isPending}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white min-w-[140px] uppercase text-xs font-bold"
              >
                {(createReport.isPending || updateReport.isPending) ? "Salvando..." : <><Save className="w-4 h-4 mr-2" /> {editingId ? "Atualizar" : "Salvar"}</>}
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {showMenu ? (
            <div className="h-full bg-slate-50 dark:bg-slate-950 p-12 overflow-auto flex items-center justify-center relative">
              <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none flex items-center justify-center overflow-hidden p-20">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full max-w-2xl text-blue-900 dark:text-blue-100">
                  <path d="M12,2C10.89,2 10,2.89 10,4C10,4.55 10.22,5.05 10.59,5.42C10.03,6.29 9.17,6.86 8.24,7.18C8.5,7.63 8.64,8.14 8.64,8.68C8.64,10.27 7.36,11.55 5.77,11.55C5.45,11.55 5.14,11.5 4.86,11.41C4.5,12.33 4.29,13.33 4.29,14.38C4.29,18.59 7.71,22 11.91,22C16.11,22 19.53,18.59 19.53,14.38C19.53,13.33 19.32,12.33 18.96,11.41C18.68,11.5 18.37,11.55 18.05,11.55C16.46,11.55 15.18,10.27 15.18,8.68C15.18,8.14 15.32,7.63 15.58,7.18C14.65,6.86 13.79,6.29 13.23,5.42C13.6,5.05 13.82,4.55 13.82,4C13.82,2.89 12.93,2 11.82,2M12,4A1,1 0 0,1 13,5A1,1 0 0,1 12,6A1,1 0 0,1 11,5A1,1 0 0,1 12,4M8,8H16V9H8V8M5.77,9.55C6.25,9.55 6.64,9.94 6.64,10.42C6.64,10.9 6.25,11.29 5.77,11.29C5.29,11.29 4.9,10.9 4.9,10.42C4.9,9.94 5.29,9.55 5.77,9.55M18.05,9.55C18.53,9.55 18.92,9.94 18.92,10.42C18.92,10.9 18.53,11.29 18.05,11.29C17.57,11.29 17.18,10.9 17.18,10.42C17.18,9.94 17.57,9.55 18.05,9.55M11.91,12.38C13.01,12.38 13.91,13.28 13.91,14.38C13.91,15.48 13.01,16.38 11.91,16.38C10.81,16.38 9.91,15.48 9.91,14.38C9.91,13.28 10.81,12.38 11.91,12.38Z" />
                </svg>
              </div>
              <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                <Card 
                  className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:-translate-y-2"
                  onClick={() => { setActiveTab("editor"); setShowMenu(false); }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-500 scale-150" />
                      <div className="relative p-6 bg-blue-50 dark:bg-blue-900/30 rounded-[2rem] group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <FileText className="w-14 h-14 text-blue-600 group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-black uppercase tracking-tighter text-2xl text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">Release</h3>
                      <div className="h-1.5 w-12 bg-blue-600 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                      <p className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] leading-tight">WhatsApp & Mídias</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:-translate-y-2"
                  onClick={() => checkPassword("word")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-500 scale-150" />
                      <div className="relative p-6 bg-blue-50 dark:bg-blue-900/30 rounded-[2rem] group-hover:bg-blue-600 group-hover:-rotate-6 transition-all duration-500 shadow-inner">
                        <FileSpreadsheet className="w-14 h-14 text-blue-600 group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-black uppercase tracking-tighter text-2xl text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">Relatório RPI</h3>
                      <div className="h-1.5 w-12 bg-blue-600 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                      <p className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] leading-tight">Documento Oficial</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:-translate-y-2"
                  onClick={() => checkPassword("weekly")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-500 scale-150" />
                      <div className="relative p-6 bg-blue-50 dark:bg-blue-900/30 rounded-[2rem] group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <Calendar className="w-14 h-14 text-blue-600 group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-black uppercase tracking-tighter text-2xl text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">Resumo Semanal</h3>
                      <div className="h-1.5 w-12 bg-blue-600 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                      <p className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] leading-tight">Estatística 7 Dias</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:-translate-y-2"
                  onClick={() => checkPassword("cartoriais")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-500 scale-150" />
                      <div className="relative p-6 bg-blue-50 dark:bg-blue-900/30 rounded-[2rem] group-hover:bg-blue-600 group-hover:-rotate-6 transition-all duration-500 shadow-inner">
                        <Briefcase className="w-14 h-14 text-blue-600 group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-black uppercase tracking-tighter text-2xl text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">Cartoriais</h3>
                      <div className="h-1.5 w-12 bg-blue-600 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                      <p className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] leading-tight">Gerenciamento de Dados</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {activeTab === "editor" && (
                <div className="flex-1 p-4 md:p-8 overflow-auto bg-slate-50 dark:bg-slate-950">
                  <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-400" />
                      <CardContent className="p-8">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                              <div className="space-y-1">
                                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Novo Registro</h2>
                                <p className="text-sm text-slate-500 font-medium">Preencha os dados da ocorrência com precisão.</p>
                              </div>
                              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <FormField
                                  control={form.control}
                                  name="gerarCartorial"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          className="w-5 h-5 border-2 border-blue-600 data-[state=checked]:bg-blue-600"
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-xs font-black uppercase text-blue-600 cursor-pointer select-none tracking-wider">
                                          Incluir no Cartorial
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="fato"
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Natureza da Ocorrência</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-blue-600">
                                          <SelectValue placeholder="Selecione o fato" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="max-h-[300px]">
                                        {CRIME_TYPES.map(type => (
                                          <SelectItem key={type} value={type} className="py-3 font-medium">{type}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="dataHora"
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Data e Hora</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="datetime-local" 
                                        {...field} 
                                        className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-blue-600 font-medium"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Localização</h3>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="municipio"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Município</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                            <SelectValue placeholder="Selecione a cidade" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {CITIES.map(city => (
                                            <SelectItem key={city} value={city} className="py-3 font-medium">{city}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="localLogradouro"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logradouro (Rua/Av)</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ex: Rua das Flores" {...field} className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                  control={form.control}
                                  name="localNumero"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Número</FormLabel>
                                      <FormControl>
                                        <Input placeholder="S/N ou nº" {...field} className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="localBairro"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bairro</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ex: Centro" {...field} className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="viatura"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Viatura / Equipe</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ex: VTR 1234" {...field} className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-600" />
                                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Envolvidos</h3>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const current = form.getValues("envolvidos") || [];
                                    form.setValue("envolvidos", [...current, { 
                                      tipo: "Autor", 
                                      nome: "", 
                                      alcunha: "", 
                                      dataNascimento: "", 
                                      antecedentes: "", 
                                      faccao: "Não",
                                      documentoRg: "",
                                      documentoCpf: ""
                                    }]);
                                  }}
                                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-black uppercase text-[9px] tracking-widest h-8 px-4"
                                >
                                  <Plus className="w-3 h-3 mr-2" /> Adicionar Envolvido
                                </Button>
                              </div>

                              <div className="space-y-4">
                                {form.watch("envolvidos")?.map((_, index) => (
                                  <Card key={index} className="border-2 border-slate-100 dark:border-slate-800 shadow-none overflow-hidden hover:border-blue-100 dark:hover:border-blue-900 transition-colors">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Envolvido #{index + 1}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const current = form.getValues("envolvidos");
                                          form.setValue("envolvidos", current.filter((_, i) => i !== index));
                                        }}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.tipo`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Qualificação</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl>
                                                <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                  <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {ROLES.map(role => (
                                                  <SelectItem key={role} value={role} className="font-medium">{role}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.nome`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Nome Completo</FormLabel>
                                            <FormControl>
                                              <Input {...field} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.alcunha`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Alcunha (Apelido)</FormLabel>
                                            <FormControl>
                                              <Input {...field} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.dataNascimento`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Data de Nascimento</FormLabel>
                                            <FormControl>
                                              <Input type="date" {...field} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.documentoRg`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">RG</FormLabel>
                                            <FormControl>
                                              <Input {...field} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.documentoCpf`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">CPF</FormLabel>
                                            <FormControl>
                                              <Input {...field} className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.antecedentes`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2 md:col-span-2">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Antecedentes Criminais</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Ex: Tráfico, Furto..." className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.faccao`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] font-bold uppercase text-slate-400">Pertence a Facção?</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl>
                                                <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                  <SelectValue placeholder="Facção?" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {ORGANIZED_CRIME_OPTIONS.map(opt => (
                                                  <SelectItem key={opt} value={opt} className="font-medium">{opt}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormItem>
                                        )}
                                      />
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2 mb-2">
                                <FileEdit className="w-4 h-4 text-blue-600" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Resumo e Materiais</h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="objetosApreendidos"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Materiais Apreendidos</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Liste os materiais..." 
                                          className="min-h-[120px] border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-blue-600 resize-none" 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="historico"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Síntese dos Fatos</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Descreva a ocorrência..." 
                                          className="min-h-[120px] border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-blue-600 resize-none" 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <FormField
                                  control={form.control}
                                  name="motivacao"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Motivação</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Ex: Passional, Tráfico..." 
                                          {...field} 
                                          value={field.value || ""}
                                          className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-blue-600" 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="policialNome"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Policial Responsável</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Nome do Policial" 
                                          {...field} 
                                          className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-blue-600" 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="pt-8 flex flex-col md:flex-row gap-4">
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
                                  onClick={() => { setEditingId(null); form.reset(); }}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Prévia Formatada</h3>
                        </div>
                        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 h-full">
                          <CardContent className="p-8">
                            <ReportFormatter data={form.watch()} />
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <Share2 className="w-4 h-4 text-blue-600" />
                          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Opções de Compartilhamento</h3>
                        </div>
                        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 h-full">
                          <CardContent className="p-8 flex flex-col gap-4">
                            <Button 
                              onClick={handleCopyMessage}
                              className="w-full h-14 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest shadow-lg"
                            >
                              <Copy className="w-4 h-4 mr-2" /> Copiar para WhatsApp
                            </Button>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-2">
                              * A mensagem será copiada com a formatação adequada (negritos em asteriscos) pronta para ser colada no WhatsApp.
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
                                      <SelectTrigger className="bg-white uppercase">
                                        <SelectValue placeholder="Selecione a unidade" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-white">
                                      {UNIDADES.map(u => <SelectItem key={u} value={u} className="uppercase">{u}</SelectItem>)}
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
                                <FormItem>
                                  <FormLabel className="text-slate-700 font-medium uppercase text-xs">Cidade</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch("unidade")}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white uppercase">
                                        <SelectValue placeholder={form.watch("unidade") ? "Selecione a cidade" : "Selecione a unidade primeiro"} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-white">
                                      {form.watch("unidade") && CIDADES_BY_UNIDADE[form.watch("unidade") as string]?.map(c => (
                                        <SelectItem key={c} value={c} className="uppercase">{c}</SelectItem>
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
                              name="dataHora"
                              render={({ field }) => (
                                <FormItem className="md:col-span-1">
                                  <FormLabel className="text-slate-700 font-medium uppercase text-xs">Data e Hora</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="datetime-local" 
                                      className="bg-white"
                                      value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <FormField
                                control={form.control}
                                name="localRua"
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel className="text-slate-700 font-medium uppercase text-xs">Logradouro (Rua/Av)</FormLabel>
                                    <FormControl><Input placeholder="Ex: Av. Central" className="bg-white uppercase" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="localNumero"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-700 font-medium uppercase text-xs">Nº</FormLabel>
                                    <FormControl><Input placeholder="S/N" className="bg-white uppercase" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="localBairro"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 font-medium uppercase text-xs">Bairro</FormLabel>
                                <FormControl><Input placeholder="Ex: Centro" className="bg-white uppercase" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-6 pt-4">
                          <div className="flex items-center justify-between pb-2 border-b">
                            <div className="flex items-center gap-2">
                              <UserPlus className="w-5 h-5 text-blue-600" />
                              <h3 className="font-semibold text-lg uppercase tracking-tight">Partes Envolvidas</h3>
                            </div>
                            <div className="flex items-center gap-4">
                              <FormField
                                control={form.control}
                                name="gerarCartorial"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800 space-y-0">
                                    <FormLabel className="text-[10px] font-black uppercase cursor-pointer text-blue-700 dark:text-blue-300">
                                      GERAR CARTORIAL
                                    </FormLabel>
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-3.5 w-3.5 rounded border-blue-300 text-blue-600 focus:ring-blue-600"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <Button type="button" variant="outline" size="sm" onClick={() => appendPerson({ role: "VÍTIMA", nome: "", documentoRg: "", documentoCpf: "", dataNascimento: "", criminalHistory: false, crimeOrg: false, antecedentes: "", orcrim: "" })} className="h-8 uppercase text-[10px] font-bold border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Plus className="w-4 h-4 mr-1" /> Adicionar Parte
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {personFields.map((field, index) => (
                              <Card key={field.id} className="border-blue-100 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 border-b px-4 py-2 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">PARTE #{index + 1}</span>
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => removePerson(index)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                <CardContent className="p-4 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.role`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Qualificação</FormLabel>
                                          <Select onValueChange={field.onChange} value={(field.value as string) || ""}>
                                            <FormControl><SelectTrigger className="bg-white h-9 uppercase text-xs"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent className="bg-white">
                                              {ROLES.map(r => <SelectItem key={r} value={r} className="uppercase text-xs">{r}</SelectItem>)}
                                            </SelectContent>
                                          </Select>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.nome`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Nome Completo</FormLabel>
                                          <FormControl><Input className="bg-white h-9 uppercase text-xs" {...field} /></FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    {watchedData.gerarCartorial && (
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.alcunha`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Alcunha</FormLabel>
                                            <FormControl><Input className="bg-white h-9 uppercase text-xs" {...field} value={field.value || ""} /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.documentoRg`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">RG</FormLabel>
                                          <FormControl>
                                            <Input 
                                              className="bg-white h-9 text-xs" 
                                              {...field} 
                                              value={(field.value as string) || ""}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.documentoCpf`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">CPF</FormLabel>
                                          <FormControl>
                                            <Input 
                                              className="bg-white h-9 text-xs" 
                                              {...field} 
                                              value={(field.value as string) || ""}
                                              onChange={(e) => field.onChange(applyCPFMask(e.target.value))}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  {watchedData.gerarCartorial && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.situacao`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Situação</FormLabel>
                                            <FormControl><Input className="bg-white h-9 uppercase text-xs" {...field} value={field.value || ""} /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.codigoPreso`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Código de Preso (CD)</FormLabel>
                                            <FormControl><Input className="bg-white h-9 uppercase text-xs" {...field} value={field.value || ""} /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  )}
                                  {watchedData.gerarCartorial && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.pai`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Nome do Pai</FormLabel>
                                            <FormControl><Input className="bg-white h-9 uppercase text-xs" {...field} value={field.value || ""} /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`envolvidos.${index}.mae`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Nome da Mãe</FormLabel>
                                            <FormControl><Input className="bg-white h-9 uppercase text-xs" {...field} value={field.value || ""} /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  )}
                                  {watchedData.gerarCartorial && (
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.endereco`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Endereço</FormLabel>
                                          <FormControl><Input className="bg-white h-9 uppercase text-xs" {...field} value={field.value || ""} /></FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.dataNascimento`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <div className="flex items-center justify-between">
                                            <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Data de Nascimento</FormLabel>
                                            {field.value && (
                                              <Badge variant="outline" className="text-[10px] font-mono">
                                                {calculateAge(field.value)} ANOS
                                              </Badge>
                                            )}
                                          </div>
                                          <FormControl>
                                            <Input type="date" className="bg-white h-9 text-xs" {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.antecedentes`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Antecedentes Criminais (OC)</FormLabel>
                                          <FormControl><Input placeholder="Descreva os antecedentes..." className="bg-white h-9 text-xs lowercase" {...field} value={(field.value as string) || ""} /></FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.orcrim`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Orcrim</FormLabel>
                                          <FormControl><Input placeholder="Facção / Organização..." className="bg-white h-9 text-xs lowercase" {...field} value={(field.value as string) || ""} /></FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  {watchedData.gerarCartorial && (
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.observacoes`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Observações</FormLabel>
                                          <FormControl><Textarea className="bg-white text-xs lowercase" {...field} value={field.value || ""} /></FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-6 pt-4">
                          <div className="flex items-center justify-between pb-2 border-b">
                            <div className="flex items-center gap-2">
                              <Package className="w-5 h-5 text-blue-600" />
                              <h3 className="font-semibold text-lg uppercase tracking-tight">Material Apreendido</h3>
                            </div>
                            <Button type="button" variant="secondary" size="sm" onClick={() => appendMaterial("")} className="h-8 uppercase text-[10px] font-bold">
                              <Plus className="w-4 h-4 mr-1" /> Adicionar Item
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {materialFields.map((field, index) => (
                              <div key={field.id} className="flex items-center gap-2">
                                <Input {...form.register(`material.${index}`)} placeholder="Descreva o item" className="bg-white h-9 lowercase" />
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeMaterial(index)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-5 pb-12">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-lg uppercase tracking-tight">Finalização</h3>
                          </div>
                          <FormField
                            control={form.control}
                            name="oficial"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 font-medium uppercase text-xs">Oficial Informado</FormLabel>
                                <FormControl><Input placeholder="Nome / Patente" className="bg-white uppercase" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="resumo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 font-medium uppercase text-xs">Resumo do Fato</FormLabel>
                                <FormControl><Textarea placeholder="Detalhes..." className="min-h-[120px] bg-white lowercase" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="motivacao"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 font-medium uppercase text-xs">Motivação</FormLabel>
                                <FormControl><Input placeholder="Motivação do fato" className="bg-white lowercase" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </form>
                    </Form>
                  </div>
                </ScrollArea>

                <div className="h-full bg-slate-200/50 dark:bg-slate-900/50 p-8 border-l flex flex-col">
                  <ReportFormatter data={watchedData as any} isPreliminar={isPreliminar} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="word" className="flex-1 overflow-hidden m-0 p-8 bg-slate-50 dark:bg-slate-950">
              <WordReportTab reports={reports || []} />
            </TabsContent>

            <TabsContent value="weekly" className="flex-1 overflow-hidden m-0 p-8 bg-slate-50 dark:bg-slate-950">
              <WeeklySummaryTab reports={reports || []} />
            </TabsContent>

            <TabsContent value="cartoriais" className="flex-1 overflow-hidden m-0 p-8 bg-slate-50 dark:bg-slate-950">
              <CartoriaisTab reports={reports || []} />
            </TabsContent>
          </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
