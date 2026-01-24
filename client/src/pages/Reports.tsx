import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema, type InsertReport } from "@shared/schema";
import { useReports, useCreateReport, useUpdateReport, useDeleteReport } from "@/hooks/use-reports";
import { ReportFormatter } from "@/components/ReportFormatter";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
  Package
} from "lucide-react";
import { format } from "date-fns";

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

const ROLES = ["Vítima", "Autor", "Testemunha", "Menor Apreendido", "Preso", "Suspeito"] as const;

export default function Reports() {
  const { data: reports, isLoading: isLoadingReports } = useReports();
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const deleteReport = useDeleteReport();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPreliminar, setIsPreliminar] = useState(false);
  
  const form = useForm<InsertReport>({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      fato: "",
      unidade: "",
      cidade: "",
      local: "",
      oficial: "",
      material: [],
      resumo: "",
      motivacao: "",
      envolvidos: [],
      dataHora: new Date(),
    },
  });

  const { fields: personFields, append: appendPerson, remove: removePerson, replace: replacePeople } = useFieldArray({
    control: form.control,
    name: "envolvidos",
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial, replace: replaceMaterial } = useFieldArray({
    control: form.control,
    name: "material" as any,
  });

  const watchedData = form.watch() as InsertReport;

  const handleUnidadeChange = (value: string) => {
    form.setValue("unidade", value);
    form.setValue("cidade", "");
  };

  const startEdit = (report: any) => {
    setEditingId(report.id);
    form.reset({
      fato: report.fato,
      unidade: report.unidade,
      cidade: report.cidade,
      local: report.local,
      oficial: report.oficial,
      material: report.material,
      resumo: report.resumo,
      motivacao: report.motivacao || "",
      envolvidos: report.envolvidos,
      dataHora: new Date(report.dataHora),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset({
      fato: "",
      unidade: "",
      cidade: "",
      local: "",
      oficial: "",
      material: [],
      resumo: "",
      motivacao: "",
      envolvidos: [],
      dataHora: new Date(),
    });
  };

  const onSubmit = (data: InsertReport) => {
    if (editingId) {
      updateReport.mutate({ id: editingId, data }, {
        onSuccess: () => {
          setEditingId(null);
          form.reset({
            fato: "",
            unidade: "",
            cidade: "",
            local: "",
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
      createReport.mutate(data, {
        onSuccess: () => {
          form.reset({
            fato: "",
            unidade: "",
            cidade: "",
            local: "",
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-80 border-r bg-white dark:bg-slate-900 flex flex-col h-[400px] md:h-screen sticky top-0">
        <div className="p-6 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Polícia Militar</h1>
          </div>
          <p className="text-xs text-blue-200/80 uppercase tracking-widest pl-[3.25rem]">Gerador de Ocorrências</p>
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
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{report.fato}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(report)}
                        className="text-slate-400 hover:text-blue-500 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteReport.mutate(report.id)}
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
                      <span>{report.cidade}</span>
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
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {editingId ? "Editando Relatório" : "Novo Relatório"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Preencha os dados abaixo para gerar a mensagem padrão.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border">
              <label htmlFor="preliminar" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
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
            {editingId && (
              <Button 
                variant="ghost" 
                onClick={cancelEdit}
                className="text-muted-foreground"
              >
                Cancelar Edição
              </Button>
            )}
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={createReport.isPending || updateReport.isPending}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white min-w-[140px]"
            >
              {(createReport.isPending || updateReport.isPending) ? "Salvando..." : <><Save className="w-4 h-4 mr-2" /> {editingId ? "Atualizar Relatório" : "Salvar Relatório"}</>}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
            <ScrollArea className="h-full bg-slate-50 dark:bg-slate-950">
              <div className="p-8 pb-24 max-w-2xl mx-auto">
                <Form {...form}>
                  <form className="space-y-8">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">Dados da Ocorrência</h3>
                      </div>

                      <FormField
                        control={form.control}
                        name="fato"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Fato (Natureza)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Homicídio Doloso" className="bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="unidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-medium">Unidade Policial</FormLabel>
                              <Select onValueChange={handleUnidadeChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Selecione a unidade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {UNIDADES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
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
                              <FormLabel className="text-slate-700 font-medium">Cidade</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch("unidade")}>
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder={form.watch("unidade") ? "Selecione a cidade" : "Selecione a unidade primeiro"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {form.watch("unidade") && CIDADES_BY_UNIDADE[form.watch("unidade") as string]?.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="dataHora"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-medium">Data e Hora</FormLabel>
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

                        <FormField
                          control={form.control}
                          name="local"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-medium">Local do Fato</FormLabel>
                              <FormControl>
                                <Input placeholder="Rua, Número, Bairro" className="bg-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">Envolvidos</h3>
                        </div>
                        <Button type="button" variant="secondary" size="sm" onClick={() => appendPerson({ role: "Vítima", nome: "", antecedentes: "", orcrim: "" })} className="h-8">
                          <Plus className="w-4 h-4 mr-1" /> Adicionar
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {personFields.map((field, index) => (
                          <Card key={field.id} className="relative overflow-hidden group border-dashed">
                            <CardContent className="p-4 pt-4 grid gap-4 md:grid-cols-12">
                              <div className="md:col-span-3">
                                <FormLabel className="text-xs text-muted-foreground mb-1 block">Tipo</FormLabel>
                                <Select onValueChange={(value) => form.setValue(`envolvidos.${index}.role` as any, value)} defaultValue={field.role}>
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="md:col-span-4">
                                <FormLabel className="text-xs text-muted-foreground mb-1 block">Identificação</FormLabel>
                                <Input {...form.register(`envolvidos.${index}.nome` as any)} placeholder="Nome completo" className="h-9" />
                              </div>
                              <div className="md:col-span-4 flex flex-col gap-2">
                                <Input {...form.register(`envolvidos.${index}.antecedentes` as any)} placeholder="Antecedentes" className="h-9" />
                                <Input {...form.register(`envolvidos.${index}.orcrim` as any)} placeholder="ORCRIM" className="h-9" />
                              </div>
                              <div className="md:col-span-1 flex items-end justify-end pb-0.5">
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50" onClick={() => removePerson(index)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">Material Apreendido</h3>
                        </div>
                        <Button type="button" variant="secondary" size="sm" onClick={() => appendMaterial("" as any)} className="h-8">
                          <Plus className="w-4 h-4 mr-1" /> Adicionar Item
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {materialFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2">
                            <Input {...form.register(`material.${index}` as any)} placeholder="Descreva o item" className="bg-white h-9" />
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeMaterial(index)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">Resumo</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="oficial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Oficial Informado</FormLabel>
                            <FormControl><Input placeholder="Nome / Patente" className="bg-white" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="resumo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Resumo do Fato</FormLabel>
                            <FormControl><Textarea placeholder="Detalhes..." className="min-h-[120px] bg-white" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="motivacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Motivação</FormLabel>
                            <FormControl><Input placeholder="Motivação do fato" className="bg-white" {...field} /></FormControl>
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
              <ReportFormatter data={watchedData} isPreliminar={isPreliminar} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
