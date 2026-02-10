import { useState, useRef } from "react";
import { mockLinkedProcedures } from "@/lib/mockData";
import { Search, Plus, Check, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  selectedCodes: string[];
  onToggle: (code: string) => void;
  operadoraName: string;
}

const ProcedureSearch = ({ selectedCodes, onToggle, operadoraName }: Props) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = query.length >= 2
    ? mockLinkedProcedures.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.code.includes(query)
      )
    : [];

  const handleBlur = (e: React.FocusEvent) => {
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-4" ref={wrapperRef} onBlur={handleBlur}>
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Adicionar procedimento</h3>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Digite nome ou código do procedimento..."
          className="pl-10 h-9 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
      </div>

      {/* Autocomplete dropdown */}
      {isFocused && query.length >= 2 && (
        <div className="mt-2 rounded-lg border border-border bg-card shadow-lg max-h-64 overflow-y-auto animate-fade-in">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Nenhum procedimento encontrado
            </div>
          ) : (
            results.map((proc) => {
              const isSelected = selectedCodes.includes(proc.code);
              const isPositive = proc.rentabilityDelta.startsWith("+") && proc.rentabilityDelta !== "+R$ 0";
              const isNegative = proc.rentabilityDelta.startsWith("-");

              return (
                <button
                  key={proc.code}
                  onClick={() => {
                    onToggle(proc.code);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors border-b border-border/50 last:border-0",
                    isSelected
                      ? "bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-xs">{proc.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground font-mono">{proc.code}</span>
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
                    </div>
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
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ProcedureSearch;
