import { useSurgical } from "@/contexts/SurgicalContext";
import StepRecommendations from "@/components/wizard/StepRecommendations";
import RentabilityIndicator from "@/components/wizard/RentabilityIndicator";
import { Activity, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Analises = () => {
  const { state } = useSurgical();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/wizard")} className="mr-1">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">Análises e Recomendações</span>
          {state.doctor && (
            <span className="text-sm text-muted-foreground ml-2">
              · {state.doctor.name}
            </span>
          )}
        </div>
        <RentabilityIndicator />
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="animate-fade-in">
          <StepRecommendations />
        </div>
      </main>
    </div>
  );
};

export default Analises;
