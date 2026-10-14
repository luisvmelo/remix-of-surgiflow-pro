import { useNavigate } from "react-router-dom";
import { Activity, BarChart3, Lightbulb, LogOut, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConsultoriaTab from "@/components/hospital/ConsultoriaTab";
import NumerosTab from "@/components/hospital/NumerosTab";
import ConfigTab from "@/components/hospital/ConfigTab";

const HospitalHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">SolicitaCirurg</span>
          <span className="text-sm text-muted-foreground ml-2">· Gestão do hospital</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Rentabilidade e honorários</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Os dois lados de cada guia: a margem do hospital e o honorário do médico
          </p>
        </div>

        <Tabs defaultValue="consultoria">
          <TabsList className="mb-5">
            <TabsTrigger value="consultoria" className="gap-1.5"><Lightbulb className="w-4 h-4" /> Consultoria</TabsTrigger>
            <TabsTrigger value="numeros" className="gap-1.5"><BarChart3 className="w-4 h-4" /> Números</TabsTrigger>
            <TabsTrigger value="config" className="gap-1.5"><SlidersHorizontal className="w-4 h-4" /> Configuração</TabsTrigger>
          </TabsList>
          <TabsContent value="consultoria"><ConsultoriaTab /></TabsContent>
          <TabsContent value="numeros"><NumerosTab /></TabsContent>
          <TabsContent value="config"><ConfigTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HospitalHome;
