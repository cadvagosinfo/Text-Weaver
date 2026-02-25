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
      envolvidos: [],
      dataHora: new Date(),
    },
  });

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

  const checkPassword = (tab: string) => {
    const password = prompt("Informe a senha para acessar esta aba:");
    if (password === "1837") {
      setActiveTab(tab);
      setShowMenu(false);
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
      <aside className="w-full md:w-80 border-r bg-white dark:bg-slate-900 flex flex-col h-[400px] md:h-screen sticky top-0">
        <div className="p-6 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight uppercase text-blue-100">Sistema de Ocorrências</h1>
          </div>
          <p className="text-[10px] text-blue-300/80 uppercase tracking-[0.2em] pl-[3.25rem] font-bold">Gerenciamento Integrado</p>
          <div className="absolute top-2 right-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-white/40 hover:text-white hover:bg-white/10 h-8 px-2 gap-2"
              title="Sair do Sistema"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">Sair</span>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
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
            <div className="h-full bg-slate-50 dark:bg-slate-950 p-12 overflow-auto">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card 
                  className="hover:border-blue-500 cursor-pointer transition-all hover:shadow-xl group bg-white dark:bg-slate-900"
                  onClick={() => { setActiveTab("editor"); setShowMenu(false); }}
                >
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                      <FileText className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="font-bold uppercase tracking-wide text-lg">Release</h3>
                    <p className="text-sm text-muted-foreground">Geração de texto para WhatsApp e redes sociais.</p>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:border-blue-500 cursor-pointer transition-all hover:shadow-xl group bg-white dark:bg-slate-900"
                  onClick={() => checkPassword("word")}
                >
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="font-bold uppercase tracking-wide text-lg">Relatório RPI</h3>
                    <p className="text-sm text-muted-foreground">Documento formatado para relatórios policiais internos.</p>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:border-blue-500 cursor-pointer transition-all hover:shadow-xl group bg-white dark:bg-slate-900"
                  onClick={() => checkPassword("weekly")}
                >
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                      <Calendar className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="font-bold uppercase tracking-wide text-lg">Resumo Semanal</h3>
                    <p className="text-sm text-muted-foreground">Estatísticas e registros criminais dos últimos 7 dias.</p>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:border-blue-500 cursor-pointer transition-all hover:shadow-xl group bg-white dark:bg-slate-900"
                  onClick={() => checkPassword("cartoriais")}
                >
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                      <Briefcase className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="font-bold uppercase tracking-wide text-lg">Cartoriais</h3>
                    <p className="text-sm text-muted-foreground">Geração de tabelas individuais para cartório.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
              <div className="hidden">
                <TabsList>
                  <TabsTrigger value="editor" />
                  <TabsTrigger value="word" />
                  <TabsTrigger value="weekly" />
                  <TabsTrigger value="cartoriais" />
                </TabsList>
              </div>

              <TabsContent value="editor" className="flex-1 overflow-hidden m-0">
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <ScrollArea className="h-full bg-slate-50 dark:bg-slate-950">
                    <div className="p-8 pb-24 max-w-2xl mx-auto">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border">
                          <label htmlFor="preliminar" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-xs font-bold uppercase">
                            PRELIMINAR
                          </label>
                          <input
                            id="preliminar"
                            type="checkbox"
                            checked={isPreliminar}
                            onChange={(e) => setIsPreliminar(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                      <Form {...form}>
                      <form className="space-y-8">
                        <div className="space-y-5">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-lg uppercase tracking-tight">Dados da Ocorrência</h3>
                          </div>

                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="fato"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between">
                                    <FormLabel className="text-slate-700 font-medium uppercase text-xs">Fato (Natureza)</FormLabel>
                                    <div className="flex items-center gap-2">
                                      <label htmlFor="toggle-fato-comp" className="text-[10px] text-muted-foreground cursor-pointer uppercase font-bold">Fato Complementar?</label>
                                      <input 
                                        id="toggle-fato-comp"
                                        type="checkbox" 
                                        checked={showFatoComplementar}
                                        onChange={(e) => setShowFatoComplementar(e.target.checked)}
                                        className="h-3.5 w-3.5 rounded border-gray-300"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Select 
                                      onValueChange={(val) => field.onChange(val)}
                                      value={QUICK_FACTS.includes(field.value) ? field.value : ""}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="bg-white uppercase text-xs">
                                          <SelectValue placeholder="Opções rápidas..." />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-white">
                                        {QUICK_FACTS.map(f => (
                                          <SelectItem key={f} value={f} className="uppercase text-xs">{f}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormControl>
                                      <Input 
                                        placeholder="Preenchimento livre..." 
                                        className="bg-white uppercase" 
                                        {...field} 
                                      />
                                    </FormControl>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {showFatoComplementar && (
                              <FormField
                                control={form.control}
                                name="fatoComplementar"
                                render={({ field }) => (
                                  <FormItem className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <FormLabel className="text-slate-700 font-medium uppercase text-xs">Fato Complementar</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ex: Tráfico de Entorpecentes" className="bg-white border-blue-100 uppercase" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                              control={form.control}
                              name="unidade"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 font-medium uppercase text-xs">Unidade Policial</FormLabel>
                                  <Select onValueChange={handleUnidadeChange} value={field.value}>
                                    <FormControl>
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
                            <Button type="button" variant="outline" size="sm" onClick={() => appendPerson({ role: "VÍTIMA", nome: "", documentoTipo: "RG", documentoNumero: "", dataNascimento: "", criminalHistory: false, crimeOrg: false, antecedentes: "" })} className="h-8 uppercase text-[10px] font-bold border-blue-200 text-blue-700 hover:bg-blue-50">
                              <Plus className="w-4 h-4 mr-1" /> Adicionar Parte
                            </Button>
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
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.documentoTipo`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Documento</FormLabel>
                                          <Select onValueChange={field.onChange} value={(field.value as string) || ""}>
                                            <FormControl><SelectTrigger className="bg-white h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent className="bg-white">
                                              {DOCUMENTO_TIPOS.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                                            </SelectContent>
                                          </Select>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.documentoNumero`}
                                      render={({ field }) => (
                                        <FormItem className="md:col-span-1">
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Número</FormLabel>
                                          <FormControl>
                                            <Input 
                                              className="bg-white h-9 text-xs" 
                                              {...field} 
                                              value={(field.value as string) || ""}
                                              onChange={(e) => {
                                                const val = form.getValues(`envolvidos.${index}.documentoTipo`) === "CPF" 
                                                  ? applyCPFMask(e.target.value) 
                                                  : e.target.value;
                                                field.onChange(val);
                                              }}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.dataNascimento`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <div className="flex items-center justify-between">
                                            <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Nascimento</FormLabel>
                                            {field.value && (
                                              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold">
                                                {calculateAge(field.value as string)} ANOS
                                              </Badge>
                                            )}
                                          </div>
                                          <FormControl><Input type="date" className="bg-white h-9 text-xs" {...field} value={(field.value as string) || ""} /></FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                    <FormField
                                      control={form.control}
                                      name={`envolvidos.${index}.antecedentes`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Antecedentes Criminais</FormLabel>
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
