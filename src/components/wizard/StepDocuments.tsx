import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, CheckCircle2, FileText, BarChart3, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const StepDocuments = () => {
  const { state, updateState, setStep } = useSurgical();
  const [docs, setDocs] = useState(state.documents);

  const toggleAttached = (idx: number) => {
    setDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, attached: !d.attached } : d)));
  };

  const handleFinish = () => {
    updateState({ documents: docs, currentStep: 5 as any });
  };

  const attachedCount = docs.filter((d) => d.attached).length;
  const requiredCount = docs.filter((d) => d.required).length;
  const requiredAttached = docs.filter((d) => d.required && d.attached).length;

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Documentos Necessários</h2>
      <p className="text-muted-foreground mb-8">Anexe os documentos baseados em solicitações aprovadas anteriormente</p>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="big-number text-primary text-2xl">{attachedCount}/{docs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Anexados</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className={cn("big-number text-2xl", requiredAttached === requiredCount ? "text-success" : "text-warning")}>
            {requiredAttached}/{requiredCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Obrigatórios</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="big-number text-foreground text-2xl">{docs.length - attachedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Pendentes</div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Checklist de Documentos
          </span>
        </div>
        <div className="space-y-2">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
                doc.attached ? "border-success/30 bg-success/5" : "border-border hover:border-primary/30"
              )}
              onClick={() => toggleAttached(idx)}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all",
                  doc.attached ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {doc.attached ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm flex items-center gap-2">
                  {doc.name}
                  {doc.required && <span className="text-[10px] badge-danger px-1.5 py-0.5 rounded">Obrigatório</span>}
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <Progress value={doc.attachedPercent} className="h-1.5 flex-1 max-w-40" />
                  <span className="text-[10px] text-muted-foreground">
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
