import { useSurgical } from "@/contexts/SurgicalContext";
import { mockLinkedProcedures } from "@/lib/mockData";
import { Plus, Check, TrendingUp, TrendingDown, AlertTriangle, Sparkles, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  selectedCodes: string[];
  onToggle: (code: string) => void;
  operadoraName: string;
}

const ProcedureCard = ({
  proc,
  isSelected,
  onToggle,
  operadoraName,
}: {
  proc: typeof mockLinkedProcedures[0];
  isSelected: boolean;
  onToggle: () => void;
  operadoraName: string;
}) => {
  const isPositive = proc.rentabilityDelta.startsWith("+") && proc.rentabilityDelta !== "+R$ 0";
  const isNegative = proc.rentabilityDelta.startsWith("-");

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group",
        isSelected
          ? "border-primary/50 bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/30 hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-sm">{proc.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{proc.code}</div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {proc.doctorUses && (
              <span className="badge-doctor text-[10px] px-2 py-0.5 rounded-full">Seu médico</span>
            )}
            {proc.isOfensor && (
              <span className="badge-danger text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingDown className="w-2.5 h-2.5" /> Ofensor na {operadoraName}
              </span>
            )}
            {proc.isGlosado && (
              <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Glosa comum
              </span>
            )}
            {proc.improvesRent && (
              <span className="badge-success text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> Melhora rentabilidade
              </span>
            )}
            {proc.isExtrapacote && (
              <span className="bg-accent/15 text-accent-foreground border border-accent/30 text-[10px] px-2 py-0.5 rounded-full">
                Extrapacote
              </span>
            )}
          </div>
        </div>

        {/* Impact numbers */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn(
            "text-sm font-bold tabular-nums",
            isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"
          )}>
            {proc.rentabilityDelta}
          </span>
          <span className={cn(
            "text-[11px] tabular-nums",
            proc.glossRate <= 10 ? "text-success" : proc.glossRate <= 20 ? "text-warning" : "text-destructive"
          )}>
            Glosa {proc.glossRate}%
          </span>
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center mt-1 transition-all",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10"
          )}>
            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>
    </button>
  );
};

export const SuggestedProcedures = ({ selectedCodes, onToggle, operadoraName }: Props) => {
  const suggested = mockLinkedProcedures.filter(
    (p) => p.doctorUses || p.improvesRent
  ).sort((a, b) => b.approvalRate - a.approvalRate);

  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Sugeridos para o procedimento</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Baseado no histórico do médico e perfil da operadora
      </p>
      <div className="space-y-2">
        {suggested.map((proc) => (
          <ProcedureCard
            key={proc.code}
            proc={proc}
            isSelected={selectedCodes.includes(proc.code)}
            onToggle={() => onToggle(proc.code)}
            operadoraName={operadoraName}
          />
        ))}
      </div>
    </div>
  );
};

export const HistoricalProcedures = ({ selectedCodes, onToggle, operadoraName }: Props) => {
  const historical = mockLinkedProcedures.filter(
    (p) => !p.doctorUses && !p.improvesRent
  );

  if (historical.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-bold text-foreground text-sm">Históricos para o procedimento</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Procedimentos usados anteriormente em cirurgias similares
      </p>
      <div className="space-y-2">
        {historical.map((proc) => (
          <ProcedureCard
            key={proc.code}
            proc={proc}
            isSelected={selectedCodes.includes(proc.code)}
            onToggle={() => onToggle(proc.code)}
            operadoraName={operadoraName}
          />
        ))}
      </div>
    </div>
  );
};
