import { useState } from "react";
import { Activity, BookOpenCheck, FileSignature, Home, Lightbulb, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDominio } from "@/dominio/store";
import GestaoHome from "@/components/gestao/GestaoHome";
import ComissaoTab from "@/components/gestao/ComissaoTab";
import ContratosTab from "@/components/gestao/ContratosTab";
import ConsultoriaTab from "@/components/gestao/ConsultoriaTab";
import ConfiguracaoTab from "@/components/gestao/ConfiguracaoTab";

const HospitalHome = () => {
  const { dominio } = useDominio();
  const [aba, setAba] = useState("home");
  const [abrirPadrao, setAbrirPadrao] = useState<string | null>(null);
  const hospital = dominio.hospitais[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" aria-hidden />
          <span className="font-bold text-lg text-foreground">SolicitaCirurg</span>
          <span className="text-sm text-muted-foreground">· Gestão + consultoria</span>
        </div>
        <span className="text-sm text-muted-foreground">{hospital.nome}</span>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-24">
        <Tabs value={aba} onValueChange={(v) => { setAba(v); if (v !== "comissao") setAbrirPadrao(null); }}>
          <TabsList className="mb-5 flex-wrap h-auto">
            <TabsTrigger value="home" className="gap-1.5"><Home className="w-4 h-4" aria-hidden /> Home</TabsTrigger>
            <TabsTrigger value="comissao" className="gap-1.5"><BookOpenCheck className="w-4 h-4" aria-hidden /> Comissão</TabsTrigger>
            <TabsTrigger value="contratos" className="gap-1.5"><FileSignature className="w-4 h-4" aria-hidden /> Contratos</TabsTrigger>
            <TabsTrigger value="consultoria" className="gap-1.5"><Lightbulb className="w-4 h-4" aria-hidden /> Consultoria</TabsTrigger>
            <TabsTrigger value="config" className="gap-1.5"><SlidersHorizontal className="w-4 h-4" aria-hidden /> Configuração</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <GestaoHome
              onAbrirPadrao={(id) => { setAbrirPadrao(id); setAba("comissao"); }}
              onIrPara={setAba}
            />
          </TabsContent>
          <TabsContent value="comissao"><ComissaoTab abrir={abrirPadrao} /></TabsContent>
          <TabsContent value="contratos"><ContratosTab /></TabsContent>
          <TabsContent value="consultoria"><ConsultoriaTab /></TabsContent>
          <TabsContent value="config"><ConfiguracaoTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HospitalHome;
