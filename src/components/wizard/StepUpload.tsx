import { useState, useCallback } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockExtractedItems, mockLinkedProcedures } from "@/lib/mockData";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, Loader2, FileUp, Plus, Minus, TrendingDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const StepUpload = () => {
  const { state, updateState, setStep } = useSurgical();
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
    setLinkedProcs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
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
          currentStep: 3,
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

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Procedimentos Atrelados e Guia</h2>
      <p className="text-muted-foreground mb-8">Adicione procedimentos complementares e faça upload da guia médica</p>

      {/* Linked procedures */}
      {selectedProc && (
        <div className="glass-card rounded-xl p-5 mb-6 animate-fade-in">
          <Label className="text-sm font-semibold mb-1 block flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" /> Procedimentos Atrelados
          </Label>
          <p className="text-xs text-muted-foreground mb-4">
            Procedimentos complementares para esta cirurgia · Operadora: <strong className="text-foreground">{state.operadora?.name}</strong>
          </p>
          <div className="space-y-2">
            {sortedLinked.map((lp) => {
              const isSelected = linkedProcs.includes(lp.code);
              return (
                <div
                  key={lp.code}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                    isSelected ? "border-primary/40 bg-primary/5" : "border-border hover:border-muted-foreground/20"
                  )}
                >
                  <button
                    onClick={() => toggleLinked(lp.code)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                    )}
                  >
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
                </div>
              );
            })}
          </div>
          {linkedProcs.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              {linkedProcs.length} procedimento(s) atrelado(s) selecionado(s)
            </div>
          )}
        </div>
      )}


      <div className="glass-card rounded-xl p-5">
        <Label className="text-sm font-semibold mb-4 block flex items-center gap-2">
          <FileUp className="w-4 h-4 text-primary" /> Upload da Guia Médica
        </Label>
        <div
          onDragOver={(e) => { e.preventDefault(); if (!isLoading) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center transition-all",
            isLoading && "pointer-events-none opacity-70",
            dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40"
          )}
        >
          {phase === "reading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-lg font-semibold text-foreground">Lendo guia…</p>
              <p className="text-sm text-muted-foreground">Processando documento</p>
            </div>
          )}
          {phase === "extracting" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-lg font-semibold text-foreground">Extraindo itens…</p>
              <p className="text-sm text-muted-foreground">Identificando OPMEs e fornecedores</p>
            </div>
          )}
          {phase === "idle" && (
            <div className="flex flex-col items-center gap-3">
              <FileUp className="w-12 h-12 text-muted-foreground" />
              <p className="text-lg font-semibold text-foreground">Arraste e solte a guia aqui</p>
              <p className="text-sm text-muted-foreground">PDF, JPG, PNG — ou clique para selecionar</p>
              <label>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} disabled={!selectedProc} />
                <span className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-opacity",
                  selectedProc
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}>
                  <Upload className="w-4 h-4" /> Selecionar arquivo
                </span>
              </label>
              {!selectedProc && (
                <p className="text-xs text-muted-foreground mt-1">Selecione o procedimento acima para habilitar o upload</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepUpload;
