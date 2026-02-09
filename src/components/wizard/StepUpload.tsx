import { useState, useCallback } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockExtractedItems, mockExtractedProcedure } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, Loader2, FileUp, Package, Stethoscope } from "lucide-react";

const StepUpload = () => {
  const { updateState, setStep } = useSurgical();
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<"idle" | "reading" | "extracting" | "done">("idle");
  const [fileName, setFileName] = useState("");

  const simulateUpload = useCallback((name: string) => {
    setFileName(name);
    setPhase("reading");
    setTimeout(() => {
      setPhase("extracting");
      setTimeout(() => {
        updateState({
          uploadedFile: name,
          extractedItems: mockExtractedItems,
          currentStep: 3,
        });
        setStep(3);
      }, 1200);
    }, 800);
  }, [updateState, setStep]);

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

  const handleNext = () => {
    updateState({ currentStep: 3 });
    setStep(3);
  };

  const uncertainCount = mockExtractedItems.filter((i) => i.uncertain).length;
  const opmeCount = mockExtractedItems.filter((i) => i.type === "OPME").length;
  const materialCount = mockExtractedItems.filter((i) => i.type === "Material").length;

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Upload da Guia Médica</h2>
      <p className="text-muted-foreground mb-8">Arraste a guia médica para extração automática de procedimentos e itens</p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : phase === "done"
            ? "border-success/40 bg-success/5"
            : "border-border hover:border-primary/40"
        }`}
      >
        {phase === "reading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-14 h-14 text-primary animate-spin" />
            <p className="text-lg font-semibold text-foreground">Lendo guia…</p>
            <p className="text-sm text-muted-foreground">Processando documento</p>
          </div>
        )}
        {phase === "extracting" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-14 h-14 text-primary animate-spin" />
            <p className="text-lg font-semibold text-foreground">Extraindo itens…</p>
            <p className="text-sm text-muted-foreground">Identificando procedimentos, OPMEs e fornecedores</p>
          </div>
        )}
        {phase === "done" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-14 h-14 text-success" />
            <p className="text-lg font-semibold text-foreground">{fileName}</p>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-foreground">
                <Package className="w-4 h-4 text-primary" />
                <strong>{mockExtractedItems.length}</strong> itens encontrados
              </span>
              <span className="flex items-center gap-1.5 text-warning">
                <AlertTriangle className="w-4 h-4" />
                <strong>{uncertainCount}</strong> incertos
              </span>
            </div>
          </div>
        )}
        {phase === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <FileUp className="w-14 h-14 text-muted-foreground" />
            <p className="text-lg font-semibold text-foreground">Arraste e solte a guia aqui</p>
            <p className="text-sm text-muted-foreground">PDF, JPG, PNG — ou clique para selecionar</p>
            <label>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
                <Upload className="w-4 h-4" /> Selecionar arquivo
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Extraction results */}
      {phase === "done" && (
        <div className="mt-8 space-y-4 animate-fade-in">
          {/* Procedure detected */}
          <div className="glass-card rounded-xl p-5 border-l-4 border-l-primary">
            <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground text-sm">Procedimento Detectado</span>
            </div>
            <p className="text-foreground font-medium">{mockExtractedProcedure.name}</p>
            <p className="text-xs text-muted-foreground">{mockExtractedProcedure.code}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="big-number text-primary text-2xl">{mockExtractedItems.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total de itens</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="big-number text-foreground text-2xl">{opmeCount}</div>
              <div className="text-xs text-muted-foreground mt-1">OPMEs</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="big-number text-foreground text-2xl">{materialCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Materiais</div>
            </div>
          </div>

          {/* Items list */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4 text-sm">Itens Extraídos</h3>
            <div className="space-y-2">
              {mockExtractedItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                    item.uncertain ? "bg-warning/10 border border-warning/30" : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.uncertain && <AlertTriangle className="w-4 h-4 text-warning shrink-0" />}
                    <div className="min-w-0">
                      <span className="font-medium text-foreground">{item.name}</span>
                      {item.supplier ? (
                        <span className="text-muted-foreground ml-2 text-xs">· {item.supplier}</span>
                      ) : (
                        <span className="badge-warning text-xs px-1.5 py-0.5 rounded ml-2">Sem fornecedor</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="badge-info text-xs px-2 py-0.5 rounded-full">{item.type}</span>
                    <span className="text-muted-foreground text-xs w-12 text-right">Qtd: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <Button onClick={handleNext} disabled={phase !== "done"} className="h-11 px-6">
          Conferir itens <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepUpload;
