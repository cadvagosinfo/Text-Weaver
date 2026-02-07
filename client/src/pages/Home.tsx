import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldAlert, 
  FileText, 
  FileSpreadsheet, 
  Calendar,
  ChevronRight
} from "lucide-react";

export default function Home() {
  const menuItems = [
    {
      title: "RELEASE",
      description: "Gerar mensagem formatada para WhatsApp",
      icon: FileText,
      href: "/reports?tab=editor",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "RELATÓRIO RPI",
      description: "Relatórios prontos para Word (Últimas 24h)",
      icon: FileSpreadsheet,
      href: "/reports?tab=word",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      title: "RESUMO SEMANAL",
      description: "Resumo estatístico dos últimos 7 dias",
      icon: Calendar,
      href: "/reports?tab=weekly",
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="p-8 flex items-center justify-center border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100">Gerador de Texto</h1>
            <p className="text-sm text-blue-600 font-bold uppercase tracking-widest">Sistema de Ocorrências</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {menuItems.map((item, idx) => (
            <Link key={idx} href={item.href}>
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 overflow-hidden h-full">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                  <div className={`p-6 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 uppercase">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="pt-4 flex items-center text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Acessar Módulo <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <footer className="p-8 text-center text-xs text-muted-foreground uppercase tracking-widest border-t bg-white dark:bg-slate-900">
        Gerador de Texto
      </footer>
    </div>
  );
}
