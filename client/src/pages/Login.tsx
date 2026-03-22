import { useState } from "react";
import owlBg from "@assets/arquetipodacoruja_1774223541664.webp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

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
      <polygon points="60,36 42,12 68,30" opacity="0.6" />
      <polygon points="140,36 158,12 132,30" opacity="0.6" />
      {/* ── Heavy angry brow ridge ── */}
      <polygon points="48,54 100,42 152,54 100,66" fill="rgba(0,0,30,0.35)" />
      {/* ── Left eye ── */}
      <circle cx="76" cy="78" r="19" fill="white" />
      <circle cx="78" cy="80" r="13" fill="#1e3a8a" />
      <circle cx="80" cy="82" r="7" fill="black" />
      <circle cx="83" cy="77" r="2.5" fill="white" />
      <path d="M54,53 Q70,48 96,62" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      {/* ── Right eye ── */}
      <circle cx="124" cy="78" r="19" fill="white" />
      <circle cx="122" cy="80" r="13" fill="#1e3a8a" />
      <circle cx="120" cy="82" r="7" fill="black" />
      <circle cx="117" cy="77" r="2.5" fill="white" />
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
      <line x1="82" y1="206" x2="68" y2="216" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="206" x2="76" y2="218" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="206" x2="84" y2="218" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="206" x2="96" y2="214" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="206" x2="73" y2="196" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="118" y1="206" x2="104" y2="216" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="118" y1="206" x2="116" y2="218" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="118" y1="206" x2="124" y2="218" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="118" y1="206" x2="132" y2="214" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="118" y1="206" x2="127" y2="196" stroke="white" strokeWidth="3" strokeLinecap="round" />
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Blurred owl photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${owlBg})`, filter: "blur(6px)" }}
      />
      {/* Heavy dark overlay — image is intentionally subtle/dim */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/93 via-blue-950/90 to-slate-900/95 pointer-events-none" />
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.12)_0%,_transparent_70%)] pointer-events-none" />

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
