import { useSurgical } from "@/contexts/SurgicalContext";
import { mockLinkedProcedures } from "@/lib/mockData";
import { FileText, X, ArrowRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  selectedCodes: string[];
  onRemove: (code: string) => void;
  onNext: () => void;
}

const GuiaCart = ({ selectedCodes, onRemove, onNext }: Props) => {
  const { state } = useSurgical();
  const selected = mockLinkedProcedures.filter((p) => selectedCodes.includes(p.code));

  const totalRent = selected.reduce((acc, p) => {
    const val = parseInt(p.rentabilityDelta.replace(/[^\d-]/g, "")) || 0;
    return acc + val;
  }, 0);

  return (
    <div className="w-[340px] shrink-0 border-l bg-card flex flex-col h-full">
      {/* Header styled like hospital guide */}
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
          {state.selectedProcedure && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Código:</span>
              <span className="ml-1 font-mono text-foreground">{state.selectedProcedure.code}</span>
            </div>
          )}
        </div>
      </div>

      {/* Procedures list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Procedimentos Secundários ({selected.length})
        </div>

        {selected.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Selecione procedimentos na lista ao lado</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {selected.map((proc, idx) => (
              <div
                key={proc.code}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 group animate-scale-in"
              >
                <span className="text-[10px] font-mono text-muted-foreground mt-0.5 shrink-0 w-4">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground leading-tight">
                    {proc.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {proc.code}
                  </div>
                  <div className={cn(
                    "text-[10px] font-semibold mt-0.5",
                    proc.rentabilityDelta.startsWith("+") ? "text-success" : "text-destructive"
                  )}>
                    {proc.rentabilityDelta}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(proc.code)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
                >
                  <X className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer totals */}
      <div className="border-t px-4 py-3 bg-muted/20">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Total de procedimentos</span>
          <span className="font-bold text-foreground">{selected.length + 1}</span>
        </div>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-muted-foreground">Impacto estimado</span>
          <span className={cn(
            "font-bold",
            totalRent >= 0 ? "text-success" : "text-destructive"
          )}>
            {totalRent >= 0 ? "+" : ""}R$ {Math.abs(totalRent).toLocaleString("pt-BR")}
          </span>
        </div>
        <Button onClick={onNext} className="w-full h-10" disabled={selected.length === 0}>
          Próxima etapa <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default GuiaCart;
