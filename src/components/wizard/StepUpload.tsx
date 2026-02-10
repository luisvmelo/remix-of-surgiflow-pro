import { useState, useCallback } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockExtractedItems, mockLinkedProcedures } from "@/lib/mockData";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, Loader2, FileUp, Plus, Minus, TrendingDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
const StepUpload = () => {
  const {
    state,
    updateState,
    setStep
  } = useSurgical();
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<"idle" | "reading" | "extracting">("idle");
  const [linkedProcs, setLinkedProcs] = useState<string[]>(state.linkedProcedures);
  const selectedProc = state.selectedProcedure;

  // Sort linked procedures: doctor's first, then by approval rate
  const sortedLinked = [...mockLinkedProcedures].sort((a, b) => {
    if (a.doctorUses && !b.doctorUses) return -1;
    if (!a.doctorUses && b.doctorUses) return 1;
    return b.approvalRate - a.approvalRate;
  });
  const toggleLinked = (code: string) => {
    setLinkedProcs(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };
  const simulateUpload = useCallback((name: string) => {
    setPhase("reading");
    setTimeout(() => {
      setPhase("extracting");
      setTimeout(() => {
        updateState({
          uploadedFile: name,
          extractedItems: mockExtractedItems,
          selectedProcedure: selectedProc,
          linkedProcedures: linkedProcs,
          currentStep: 3
        });
        setStep(3);
      }, 1200);
    }, 800);
  }, [updateState, setStep, selectedProc, linkedProcs]);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateUpload(file.name);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file.name);
  };
  const isLoading = phase === "reading" || phase === "extracting";
  return <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Procedimentos Atrelados e Guia</h2>
      <p className="text-muted-foreground mb-8">Adicione procedimentos complementares e faça upload da guia médica</p>

      {/* Linked procedures */}
      {selectedProc && <div className="glass-card rounded-xl p-5 mb-6 animate-fade-in">
          <Label className="text-sm font-semibold mb-1 block flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" /> Procedimentos Atrelados
          </Label>
          <p className="text-xs text-muted-foreground mb-4">
            Procedimentos complementares para esta cirurgia · Operadora: <strong className="text-foreground">{state.operadora?.name}</strong>
          </p>
          <div className="space-y-2">
            {sortedLinked.map(lp => {
          const isSelected = linkedProcs.includes(lp.code);
          return <div key={lp.code} className={cn("flex items-center gap-3 p-3 rounded-lg border-2 transition-all", isSelected ? "border-primary/40 bg-primary/5" : "border-border hover:border-muted-foreground/20")}>
                  <button onClick={() => toggleLinked(lp.code)} className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10")}>
                    {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">{lp.name}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {lp.doctorUses && <span className="badge-doctor text-[10px] px-2 py-0.5 rounded-full">Seu médico</span>}
                      {lp.isOfensor && <span className="badge-danger text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5"><TrendingDown className="w-2.5 h-2.5" /> Ofensor na {state.operadora?.name}</span>}
                      {lp.isGlosado && <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full">Glosa comum</span>}
                      {lp.improvesRent && <span className="badge-success text-[10px] px-2 py-0.5 rounded-full">Melhora rentabilidade</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">Aprovação</div>
                    <div className={cn("text-sm font-bold", lp.approvalRate >= 85 ? "text-success" : lp.approvalRate >= 70 ? "text-warning" : "text-destructive")}>
                      {lp.approvalRate}%
                    </div>
                  </div>
                </div>;
        })}
          </div>
          {linkedProcs.length > 0 && <div className="mt-3 text-xs text-muted-foreground">
              {linkedProcs.length} procedimento(s) atrelado(s) selecionado(s)
            </div>}
        </div>}


      
    </div>;
};
export default StepUpload;