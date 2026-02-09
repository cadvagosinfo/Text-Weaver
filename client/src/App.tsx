import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Reports from "@/pages/Reports";
import Home from "@/pages/Home";
import Login from "@/pages/Login";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("auth") === "true";
  });

  if (!isAuthenticated) {
    return <Login onLogin={() => {
      setIsAuthenticated(true);
      localStorage.setItem("auth", "true");
    }} />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

};

import React from "react";
import { ReportFormatter } from "./components/ReportFormatter";

function App() {
  const exemploData = {
    fato: "Roubo a pedestre",
    unidade: "2ª Cia Ind",
    cidade: "Rolante",
    dataHora: "091440FEV26",
    localRua: "Rua 07 de Julho",
    localNumero: "123",
    localBairro: "Centro",
    envolvidos: [],
    oficial: "TEN FULANO",
    material: "Nenhum",
    resumo: "Resumo do fato...",
    motivacao: "Desconhecida",
  };

  return (
    <div>
      <ReportFormatter data={exemploData} isPreliminar={true} />
    </div>
  );
}

export default App;