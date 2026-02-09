import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Upload, CheckCircle2, FileText, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const StepDocuments = () => {
  const { state, updateState, setStep } = useSurgical();
  const [docs, setDocs] = useState(state.documents);

  const toggleAttached = (idx: number) => {
    setDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, attached: !d.attached } : d)));
  };

  const handleFinish = () => {
    updateState({ documents: docs, currentStep: 6 as any, rentabilityScore: 26, glossRisk: 7 });
    setStep(5);
    // Navigate to summary by setting step beyond 5
    updateState({ currentStep: 6 as any });
  };

  const attachedCount = docs.filter((d) => d.attached).length;

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Documentos Necessários</h2>
      <p className="text-muted-foreground mb-8">
        Anexe os documentos baseados em solicitações aprovadas anteriormente
      </p>

      <div className="glass-card rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Checklist de Documentos
          </span>
          <span className="text-sm text-muted-foreground">{attachedCount}/{docs.length} anexados</span>
        </div>
        <div className="space-y-3">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                doc.attached ? "border-success/30 bg-success/5" : "border-border"
              }`}
            >
              <button
                onClick={() => toggleAttached(idx)}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  doc.attached ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                }`}
              >
                {doc.attached ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm flex items-center gap-2">
                  {doc.name}
                  {doc.required && <span className="text-xs text-destructive">*</span>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <Progress value={doc.attachedPercent} className="h-1.5 flex-1 max-w-32" />
                  <span className="text-xs text-muted-foreground">
                    Em {doc.attachedPercent}% das aprovações
                  </span>
                </div>
              </div>
              {doc.attached && <FileText className="w-4 h-4 text-success shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleFinish} className="h-11 px-6">
          Ver Resumo Final <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepDocuments;
