import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Lock } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ari") {
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-blue-100 dark:border-blue-900">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto p-3 bg-blue-600 rounded-full w-fit shadow-lg shadow-blue-600/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100">
            Sistema de Ocorrências
          </CardTitle>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Gerenciamento Integrado</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Informe a senha de acesso"
                  className={`pl-10 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 font-medium">Senha incorreta. Tente novamente.</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
              Entrar no Sistema
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
