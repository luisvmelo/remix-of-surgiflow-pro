import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ArrowRight, AlertTriangle, FileImage, ZoomIn, ZoomOut } from "lucide-react";

const StepConference = () => {
  const { state, updateState, setStep } = useSurgical();
  const [items, setItems] = useState(state.extractedItems.length > 0 ? state.extractedItems : []);
  const [zoom, setZoom] = useState(100);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, name: "", supplier: "", quantity: 1, type: "OPME", uncertain: false },
    ]);
  };

  const hasErrors = items.some((i) => !i.name);
  const hasMissingSuppliers = items.some((i) => !i.supplier);

  const handleConfirm = () => {
    updateState({ extractedItems: items, confirmedItems: true, currentStep: 4, rentabilityScore: 18, glossRisk: 12 });
    setStep(4);
  };

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Left: Preview */}
      <div className="w-1/2 border-r bg-muted/30 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileImage className="w-4 h-4" /> Preview da Guia
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom((z) => Math.max(50, z - 25))} className="p-1 rounded hover:bg-muted">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 25))} className="p-1 rounded hover:bg-muted">
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
          <div
            className="bg-card rounded-lg shadow-md p-8 w-full max-w-md border"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            <div className="text-center mb-6">
              <div className="text-xs text-muted-foreground mb-1">GUIA MÉDICA</div>
              <div className="text-lg font-bold text-foreground">Solicitação de Material/OPME</div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Paciente:</span>
                <span className="font-medium text-foreground">{state.patient?.name || "—"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Operadora:</span>
                <span className="font-medium text-foreground">{state.operadora?.name || "—"}</span>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {state.extractedItems.map((item) => (
                  <div key={item.id} className="py-1 border-b border-dashed">
                    {item.quantity}x {item.name} {item.supplier && `(${item.supplier})`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Editable list */}
      <div className="w-1/2 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <span className="text-sm font-semibold text-foreground">Itens Extraídos ({items.length})</span>
          {hasMissingSuppliers && (
            <span className="text-xs badge-warning px-2 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Fornecedor ausente
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`glass-card rounded-lg p-4 space-y-3 ${item.uncertain ? "border-warning/40" : ""}`}
            >
              <div className="flex gap-3">
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, "name", e.target.value)}
                  placeholder="Nome do item"
                  className="flex-1 text-sm"
                />
                <Input
                  value={item.supplier}
                  onChange={(e) => updateItem(item.id, "supplier", e.target.value)}
                  placeholder="Fornecedor"
                  className="w-32 text-sm"
                />
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                  className="w-20 text-sm"
                  min={1}
                />
                <button onClick={() => removeItem(item.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full border-2 border-dashed rounded-lg p-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar item manualmente
          </button>
        </div>
        <div className="p-4 border-t bg-card flex justify-end">
          <Button onClick={handleConfirm} disabled={hasErrors || items.length === 0} className="h-11 px-6">
            Confirmar Itens <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepConference;
