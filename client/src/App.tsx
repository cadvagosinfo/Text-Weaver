import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Reports from "@/pages/Reports";
import Login from "@/pages/Login";
import { useState, useEffect } from "react";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    setIsAuthenticated(auth === "true");
  }, []);

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <Login onLogin={() => {
      localStorage.setItem("auth", "true");
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <Switch>
      <Route path="/" component={Reports} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full overflow-hidden">
            <div className="flex flex-col flex-1 overflow-hidden">
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
