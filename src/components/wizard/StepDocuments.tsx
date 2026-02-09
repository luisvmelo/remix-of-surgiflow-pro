import { useState, useRef } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, FileText, BarChart3, X, File, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type UploadedFile = {
  name: string;
  size: number;
};

const StepDocuments = () => {
  const { state, updateState } = useSurgical();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList).map(f => ({ name: f.name, size: f.size }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinish = () => {
    updateState({ currentStep: 5 as any });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const docs = state.documents;

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Anexar Documentos</h2>
      <p className="text-muted-foreground mb-8">
        Envie todos os documentos de uma vez — o sistema identificará automaticamente cada um
      </p>

      {/* Upload area */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          onChange={e => { handleFileSelect(e.target.files); e.target.value = ""; }}
        />

        <div
          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-primary/50", "bg-primary/5"); }}
          onDragLeave={e => { e.currentTarget.classList.remove("border-primary/50", "bg-primary/5"); }}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-primary/50", "bg-primary/5"); handleFileSelect(e.dataTransfer.files); }}
        >
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">Clique ou arraste arquivos aqui</p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, imagens, Word, Excel — guias, prescrições, laudos, exames, etc.
          </p>
        </div>

        {/* Uploaded files */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs text-muted-foreground font-medium mb-2">
              {files.length} arquivo{files.length > 1 ? "s" : ""} selecionado{files.length > 1 ? "s" : ""}
            </div>
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-background/60 rounded-lg px-4 py-3 border border-border/50"
              >
                <File className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reference: commonly attached docs */}
      <div className="glass-card rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Documentos comuns em aprovações anteriores</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Referência dos documentos mais anexados em solicitações aprovadas para este procedimento</p>
        <div className="space-y-2">
          {docs.map((doc, idx) => (
            <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground flex items-center gap-2">
                  {doc.name}
                  {doc.required && <span className="text-[10px] badge-danger px-1.5 py-0.5 rounded">Obrigatório</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Progress value={doc.attachedPercent} className="h-1.5 w-20" />
                <span className="text-[10px] text-muted-foreground w-8 text-right">{doc.attachedPercent}%</span>
              </div>
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
