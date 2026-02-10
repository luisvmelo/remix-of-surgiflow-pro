import { useSurgical } from "@/contexts/SurgicalContext";
import { mockRecommendedOPMEs } from "@/lib/mockData";
import { Package, X, ArrowRight, ClipboardList, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SelectedItem {
  name: string;
  quantity: number;
}

interface Props {
  selectedItems: SelectedItem[];
  onRemove: (name: string) => void;
  onQuantity: (name: string, qty: number) => void;
  onNext: () => void;
}

const ItemCart = ({ selectedItems, onRemove, onQuantity, onNext }: Props) => {
  const { state } = useSurgical();

  const totalImpact = selectedItems.reduce((acc, sel) => {
    const item = mockRecommendedOPMEs.find((o) => o.name === sel.name);
    if (!item) return acc;
    const val = parseInt(item.impactDelta.replace(/[^\d-]/g, "")) || 0;
    return acc + val * sel.quantity;
  }, 0);

  return (
    <div className="w-[340px] shrink-0 border-l bg-card flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground text-sm uppercase tracking-wider">
            Guia de Solicitação
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <div>
            <span className="text-muted-foreground">Paciente:</span>
            <span className="ml-1 font-medium text-foreground">{state.patient?.name || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Operadora:</span>
            <span className="ml-1 font-medium text-foreground">{state.operadora?.name || "—"}</span>
          </div>
          <div className="col-span-2 mt-1 pt-1 border-t border-border/50">
            <span className="text-muted-foreground">Proc. Principal:</span>
            <span className="ml-1 font-medium text-foreground">{state.selectedProcedure?.name || "—"}</span>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Itens OPME ({selectedItems.length})
        </div>

        {selectedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Selecione itens na lista ao lado</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {selectedItems.map((sel, idx) => {
              const item = mockRecommendedOPMEs.find((o) => o.name === sel.name);
              const impact = item ? parseInt(item.impactDelta.replace(/[^\d-]/g, "")) || 0 : 0;
              return (
                <div
                  key={sel.name}
                  className="p-2.5 rounded-lg bg-muted/40 border border-border/50 group animate-scale-in"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground mt-0.5 shrink-0 w-4">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground leading-tight">
                        {sel.name}
                      </div>
                      {item && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">{item.supplier}</div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(sel.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
                    >
                      <X className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/30">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onQuantity(sel.name, Math.max(1, sel.quantity - 1))}
                        className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-bold tabular-nums w-4 text-center">{sel.quantity}</span>
                      <button
                        onClick={() => onQuantity(sel.name, sel.quantity + 1)}
                        className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-[10px] text-muted-foreground ml-1">un.</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold tabular-nums",
                      impact >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {impact >= 0 ? "+" : ""}R$ {Math.abs(impact * sel.quantity)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3 bg-muted/20">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Total de itens</span>
          <span className="font-bold text-foreground">
            {selectedItems.reduce((a, s) => a + s.quantity, 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-muted-foreground">Impacto estimado</span>
          <span className={cn("font-bold", totalImpact >= 0 ? "text-success" : "text-destructive")}>
            {totalImpact >= 0 ? "+" : ""}R$ {Math.abs(totalImpact).toLocaleString("pt-BR")}
          </span>
        </div>
        <Button onClick={onNext} className="w-full h-10">
          Próxima etapa <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ItemCart;
