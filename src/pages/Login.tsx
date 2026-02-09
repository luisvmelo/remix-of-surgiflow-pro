import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Activity } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setLoggedIn } = useSurgical();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
    navigate("/select-doctor");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-foreground/20"
              style={{
                width: `${200 + i * 120}px`,
                height: `${200 + i * 120}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-primary-foreground text-center px-12">
          <div className="flex items-center justify-center mb-6">
            <Activity className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold mb-4">SolicitaCirurg</h1>
          <p className="text-xl opacity-80 leading-relaxed">
            Maximize a rentabilidade e previna glosas em solicitações cirúrgicas
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">94%</div>
              <div className="text-sm opacity-70">Taxa de Aprovação</div>
            </div>
            <div>
              <div className="text-3xl font-bold">-67%</div>
              <div className="text-sm opacity-70">Redução de Glosas</div>
            </div>
            <div>
              <div className="text-3xl font-bold">+32%</div>
              <div className="text-sm opacity-70">Rentabilidade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">SolicitaCirurg</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vinda de volta</h2>
          <p className="text-muted-foreground mb-8">Acesse sua conta para gerenciar solicitações</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="secretaria@clinica.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
