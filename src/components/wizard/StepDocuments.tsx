import { useState, useRef } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, CheckCircle2, FileText, BarChart3, X, Paperclip, File } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type DocFile = {
  name: string;
  size: number;
};

const StepDocuments = () => {
  const { state, updateState } = useSurgical();
  const [docs, setDocs] = useState(state.documents.map(d => ({ ...d, files: [] as DocFile[] })));
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileSelect = (idx: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList).map(f => ({ name: f.name, size: f.size }));
    setDocs(prev => prev.map((d, i) =>
      i === idx ? { ...d, attached: true, files: [...d.files, ...newFiles] } : d
    ));
  };

  const removeFile = (docIdx: number, fileIdx: number) => {
    setDocs(prev => prev.map((d, i) => {
      if (i !== docIdx) return d;
      const newFiles = d.files.filter((_, fi) => fi !== fileIdx);
      return { ...d, files: newFiles, attached: newFiles.length > 0 };
    }));
  };

  const handleFinish = () => {
    updateState({ documents: docs.map(({ files, ...d }) => d), currentStep: 5 as any });
  };

  const attachedCount = docs.filter(d => d.attached).length;
  const requiredCount = docs.filter(d => d.required).length;
  const requiredAttached = docs.filter(d => d.required && d.attached).length;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
        <div className="space-y-3">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-xl border-2 transition-all overflow-hidden",
                doc.attached ? "border-success/30 bg-success/5" : "border-border"
              )}
            >
              <div className="flex items-center gap-4 p-4">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all",
                    doc.attached ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {doc.attached ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
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
                <div className="shrink-0">
                  <input
                    ref={el => fileInputRefs.current[idx] = el}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    onChange={e => handleFileSelect(idx, e.target.files)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    className="h-8 text-xs"
                  >
                    <Paperclip className="w-3 h-3 mr-1" />
                    {doc.attached ? "Mais arquivos" : "Anexar"}
                  </Button>
                </div>
              </div>

              {/* Attached files list */}
              {doc.files.length > 0 && (
                <div className="px-4 pb-3 ml-[52px]">
                  <div className="space-y-1">
                    {doc.files.map((file, fi) => (
                      <div
                        key={fi}
                        className="flex items-center gap-2 text-xs bg-background/60 rounded-lg px-3 py-2 border border-border/50"
                      >
                        <File className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-foreground truncate flex-1">{file.name}</span>
                        <span className="text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                        <button
                          onClick={() => removeFile(idx, fi)}
                          className="p-0.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drop zone when no files */}
              {doc.files.length === 0 && (
                <div
                  className="mx-4 mb-3 ml-[68px] border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => fileInputRefs.current[idx]?.click()}
                >
                  <Upload className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground">
                    Clique ou arraste arquivos aqui
                  </p>
                </div>
              )}
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
