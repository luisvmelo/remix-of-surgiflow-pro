import { useState, useCallback } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockExtractedItems } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

const StepUpload = () => {
  const { updateState, setStep } = useSurgical();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  const simulateUpload = useCallback((name: string) => {
    setFileName(name);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
      updateState({
        uploadedFile: name,
        extractedItems: mockExtractedItems,
      });
    }, 2000);
  }, [updateState]);

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

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Upload da Guia Médica</h2>
      <p className="text-muted-foreground mb-8">Arraste a guia médica (PDF/Imagem) para extração automática dos itens</p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragOver
            ? "border-primary bg-primary/5"
            : uploaded
            ? "border-success/40 bg-success/5"
            : "border-border hover:border-primary/40"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium text-foreground">Lendo guia…</p>
            <p className="text-sm text-muted-foreground">Extraindo procedimentos e itens</p>
          </div>
        ) : uploaded ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-success" />
            <p className="text-lg font-medium text-foreground">{fileName}</p>
            <p className="text-sm text-muted-foreground">
              Itens encontrados: <span className="font-bold text-foreground">{mockExtractedItems.length}</span>
              {uncertainCount > 0 && (
                <> · Incertos: <span className="font-bold text-warning">{uncertainCount}</span></>
              )}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Arraste e solte a guia aqui</p>
            <p className="text-sm text-muted-foreground">PDF, JPG, PNG — ou clique para selecionar</p>
            <label>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
                <FileText className="w-4 h-4" /> Selecionar arquivo
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Extracted preview */}
      {uploaded && (
        <div className="mt-6 glass-card rounded-lg p-5 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-3">Itens Extraídos</h3>
          <div className="space-y-2">
            {mockExtractedItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-md text-sm ${
                  item.uncertain ? "bg-warning/5 border border-warning/20" : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.uncertain && <AlertTriangle className="w-4 h-4 text-warning" />}
                  <span className="font-medium text-foreground">{item.name}</span>
                  {item.supplier && <span className="text-muted-foreground">· {item.supplier}</span>}
                </div>
                <span className="text-muted-foreground">Qtd: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <Button onClick={handleNext} disabled={!uploaded} className="h-11 px-6">
          Conferir itens <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepUpload;
