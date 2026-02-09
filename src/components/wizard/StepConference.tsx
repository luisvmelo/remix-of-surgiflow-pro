import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ArrowRight, AlertTriangle, FileImage, ZoomIn, ZoomOut, Copy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ExtractedItem = {
  id: string;
  name: string;
  supplier: string;
  quantity: number;
  type: string;
  uncertain: boolean;
  status: string;
};

const StepConference = () => {
  const { state, updateState, setStep } = useSurgical();
  const [items, setItems] = useState<ExtractedItem[]>(
    state.extractedItems.length > 0 ? [...state.extractedItems] : []
  );
  const [zoom, setZoom] = useState(100);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, name: "", supplier: "", quantity: 1, type: "OPME", uncertain: false, status: "ok" },
    ]);
  };

  // Validation
  const emptyNames = items.filter((i) => !i.name.trim());
  const missingSuppliers = items.filter((i) => !i.supplier.trim());
  const duplicates = items.filter((item, idx) => items.findIndex((i) => i.name === item.name && i.name !== "") < idx);
  const hasErrors = emptyNames.length > 0;
  const canConfirm = items.length > 0 && !hasErrors;

  const handleConfirm = () => {
    updateState({
      extractedItems: items as any,
      confirmedItems: true,
      currentStep: 4,
      rentabilityScore: 18,
      glossRisk: 14,
      historicalPercentile: 62,
      bestPossible: 34,
    });
    setStep(4);
  };

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Left: PDF Preview */}
      <div className="w-1/2 border-r bg-muted/30 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileImage className="w-4 h-4 text-primary" /> Preview da Guia
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom((z) => Math.max(50, z - 25))} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground font-mono w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 25))} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div
            className="mx-auto space-y-6"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", maxWidth: "420px" }}
          >
            {/* Simulated PDF pages */}
            {[1, 2].map((page) => (
              <div key={page} className="bg-card rounded-lg shadow-lg border p-8 relative">
                <div className="absolute top-2 right-3 text-[10px] text-muted-foreground">Pág. {page}/2</div>
                <div className="text-center mb-6 border-b pb-4">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Guia de Solicitação</div>
                  <div className="font-bold text-foreground">Solicitação de Material / OPME</div>
                </div>
                {page === 1 ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Paciente:</span><span className="font-medium text-foreground">{state.patient?.name || "—"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Operadora:</span><span className="font-medium text-foreground">{state.operadora?.name || "—"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Procedimento:</span><span className="font-medium text-foreground">Artroscopia de Joelho</span></div>
                    <div className="mt-4 pt-2">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Itens Solicitados</div>
                      {state.extractedItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="py-1.5 border-b border-dashed text-muted-foreground">
                          {item.quantity}x {item.name} {item.supplier && `(${item.supplier})`}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Itens (continuação)</div>
                    {state.extractedItems.slice(5).map((item) => (
                      <div key={item.id} className="py-1.5 border-b border-dashed text-muted-foreground">
                        {item.quantity}x {item.name} {item.supplier && `(${item.supplier})`}
                      </div>
                    ))}
                    <div className="mt-8 pt-4 border-t">
                      <div className="text-[10px] text-muted-foreground">Assinatura do médico</div>
                      <div className="mt-6 border-b border-foreground/20 w-48" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Editable list */}
      <div className="w-1/2 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Itens Extraídos</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{items.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {missingSuppliers.length > 0 && (
              <span className="badge-warning text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {missingSuppliers.length} sem fornecedor
              </span>
            )}
            {duplicates.length > 0 && (
              <span className="badge-danger text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                <Copy className="w-3 h-3" /> {duplicates.length} duplicado(s)
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.map((item, idx) => {
            const isDuplicate = items.findIndex((i) => i.name === item.name && i.name !== "") < idx;
            return (
              <div
                key={item.id}
                className={cn(
                  "glass-card rounded-lg p-3 transition-all",
                  item.uncertain && "border-warning/40",
                  isDuplicate && "border-destructive/40 bg-destructive/5",
                  !item.name.trim() && "border-destructive/40"
                )}
              >
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground w-5 shrink-0 text-center">{idx + 1}</span>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, "name", e.target.value)}
                    placeholder="Nome do item *"
                    className={cn("flex-1 text-sm h-9", !item.name.trim() && "border-destructive/50")}
                  />
                  <Input
                    value={item.supplier}
                    onChange={(e) => updateItem(item.id, "supplier", e.target.value)}
                    placeholder="Fornecedor"
                    className={cn("w-32 text-sm h-9", !item.supplier.trim() && "border-warning/50")}
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                    className="w-16 text-sm h-9 text-center"
                    min={1}
                  />
                  <button onClick={() => removeItem(item.id)} className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {isDuplicate && <p className="text-[10px] text-destructive ml-6 mt-1">⚠ Item duplicado</p>}
              </div>
            );
          })}
          <button
            onClick={addItem}
            className="w-full border-2 border-dashed rounded-lg p-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar item manualmente
          </button>
        </div>
        <div className="p-4 border-t bg-card flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {canConfirm ? (
              <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-3.5 h-3.5" /> Pronto para confirmar</span>
            ) : (
              <span className="text-destructive">Corrija os erros para continuar</span>
            )}
          </div>
          <Button onClick={handleConfirm} disabled={!canConfirm} className="h-10 px-6">
            Confirmar Itens <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepConference;
