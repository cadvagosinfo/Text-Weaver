import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

function OwlWatermark() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <ellipse cx="50" cy="62" rx="22" ry="28" />
      <ellipse cx="50" cy="32" rx="20" ry="18" />
      <polygon points="33,18 28,6 38,14" />
      <polygon points="67,18 72,6 62,14" />
      <circle cx="40" cy="33" r="9" fill="white" />
      <circle cx="40" cy="33" r="6" fill="#1e40af" />
      <circle cx="40" cy="33" r="3" fill="black" />
      <circle cx="38" cy="31" r="1" fill="white" />
      <circle cx="60" cy="33" r="9" fill="white" />
      <circle cx="60" cy="33" r="6" fill="#1e40af" />
      <circle cx="60" cy="33" r="3" fill="black" />
      <circle cx="58" cy="31" r="1" fill="white" />
      <polygon points="50,38 46,44 54,44" fill="#b45309" />
      <path d="M30 58 Q25 70 28 82" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M70 58 Q75 70 72 82" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="42" y1="88" x2="38" y2="96" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="88" x2="42" y2="97" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="88" x2="46" y2="96" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="58" y1="88" x2="54" y2="96" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="58" y1="88" x2="58" y2="97" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="58" y1="88" x2="62" y2="96" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Owl watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] opacity-[0.07] text-blue-300">
          <OwlWatermark />
        </div>
      </div>

      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15)_0%,_transparent_70%)] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm animate-in zoom-in-95 duration-300">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-blue-400/20">
          {/* Blue gradient top */}
          <div className="bg-gradient-to-b from-blue-700 to-blue-600 px-8 pt-10 pb-14 flex flex-col items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-white blur-2xl opacity-20 scale-150" />
              <div className="relative p-5 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm">
                <ShieldAlert className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h1 className="font-black text-2xl tracking-tight uppercase text-white leading-none">
                Sistema de Ocorrências
              </h1>
              <p className="text-[10px] font-bold uppercase text-blue-200 tracking-[0.25em]">
                Acesso Seguro ao Sistema
              </p>
            </div>
          </div>

          {/* White bottom */}
          <div className="bg-white px-8 pb-8 -mt-6 rounded-t-3xl relative">
            <form onSubmit={handleSubmit}>
              <div className="pt-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase text-slate-400 text-center tracking-widest">
                    INSIRA A SENHA DE ACESSO
                  </p>
                  <Input
                    type="password"
                    autoFocus
                    placeholder="••••"
                    className={`text-center text-3xl tracking-[0.5em] h-16 border-2 focus-visible:ring-blue-600 focus-visible:border-blue-600 bg-slate-50 font-mono transition-colors ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  />
                  {error && (
                    <p className="text-[10px] text-red-500 font-bold uppercase text-center tracking-wider">
                      ✕ Senha incorreta
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] h-13 py-3.5 shadow-lg shadow-blue-600/30 tracking-wider rounded-xl"
                >
                  Entrar no Sistema
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
