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
        "text-left p-3 rounded-lg border-2 transition-all duration-200 group",
        isSelected
          ? "border-primary/50 bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/30 hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-xs leading-tight">{proc.name}</div>
          <div className="text-[10px] text-muted-foreground">{proc.code}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className={cn(
              "text-xs font-bold tabular-nums block",
              isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"
            )}>
              {proc.rentabilityDelta}
            </span>
            <span className={cn(
              "text-[10px] tabular-nums",
              proc.glossRate <= 10 ? "text-success" : proc.glossRate <= 20 ? "text-warning" : "text-destructive"
            )}>
              Glosa {proc.glossRate}%
            </span>
          </div>
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-all",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10"
          )}>
            {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </div>
        </div>
      </div>
      {/* Badges */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        {proc.doctorUses && (
          <span className="badge-doctor text-[9px] px-1.5 py-0.5 rounded-full">Seu médico</span>
        )}
        {proc.isOfensor && (
          <span className="badge-danger text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingDown className="w-2 h-2" /> Ofensor
          </span>
        )}
        {proc.isGlosado && (
          <span className="badge-warning text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <AlertTriangle className="w-2 h-2" /> Glosa
          </span>
        )}
        {proc.improvesRent && (
          <span className="badge-success text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingUp className="w-2 h-2" /> +Rent
          </span>
        )}
        {proc.isExtrapacote && (
          <span className="bg-accent/15 text-accent-foreground border border-accent/30 text-[9px] px-1.5 py-0.5 rounded-full">
            Extra
          </span>
        )}
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
      <div className="grid grid-cols-2 gap-2">
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
