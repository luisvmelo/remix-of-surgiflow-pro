import { mockLinkedProcedures } from "@/lib/mockData";
import { Zap, History, TrendingUp, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  selectedCodes: string[];
  onApplyAll: (codes: string[]) => void;
}

// Best rentability combo: all procedures that improve rent and aren't offenders
const bestRentCodes = mockLinkedProcedures
  .filter((p) => p.improvesRent && !p.isOfensor && !p.isGlosado)
  .sort((a, b) => {
    const aVal = parseInt(a.rentabilityDelta.replace(/[^\d-]/g, "")) || 0;
    const bVal = parseInt(b.rentabilityDelta.replace(/[^\d-]/g, "")) || 0;
    return bVal - aVal;
  })
  .map((p) => p.code);

// Historical combo: most commonly used together (doctor uses + high approval)
const historicalCodes = mockLinkedProcedures
  .filter((p) => p.doctorUses && p.approvalRate >= 80)
  .sort((a, b) => b.approvalRate - a.approvalRate)
  .map((p) => p.code);

const bestRentProcs = mockLinkedProcedures.filter((p) => bestRentCodes.includes(p.code));
const historicalProcs = mockLinkedProcedures.filter((p) => historicalCodes.includes(p.code));

const bestRentTotal = bestRentProcs.reduce((acc, p) => {
  return acc + (parseInt(p.rentabilityDelta.replace(/[^\d-]/g, "")) || 0);
}, 0);
const historicalTotal = historicalProcs.reduce((acc, p) => {
  return acc + (parseInt(p.rentabilityDelta.replace(/[^\d-]/g, "")) || 0);
}, 0);

const avgGlossRent = Math.round(bestRentProcs.reduce((a, p) => a + p.glossRate, 0) / (bestRentProcs.length || 1));
const avgGlossHist = Math.round(historicalProcs.reduce((a, p) => a + p.glossRate, 0) / (historicalProcs.length || 1));

const SmartSelection = ({ selectedCodes, onApplyAll }: Props) => {
  const isRentApplied = bestRentCodes.every((c) => selectedCodes.includes(c));
  const isHistApplied = historicalCodes.every((c) => selectedCodes.includes(c));

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in border-primary/20">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-accent" />
        <h3 className="font-bold text-foreground text-sm">Smart Selection</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Combinações otimizadas — clique para aplicar todos de uma vez
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Best Rentability */}
        <button
          onClick={() => !isRentApplied && onApplyAll(bestRentCodes)}
          disabled={isRentApplied}
          className={cn(
            "text-left p-4 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden",
            isRentApplied
              ? "border-success/40 bg-success/5 cursor-default"
              : "border-success/20 hover:border-success/50 hover:bg-success/5 hover:shadow-md"
          )}
        >
          {!isRentApplied && (
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(var(--success) / 0.15)" }}>
                {isRentApplied ? <Check className="w-4 h-4 text-success" /> : <TrendingUp className="w-4 h-4 text-success" />}
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Maior Rentabilidade</div>
                <div className="text-[10px] text-muted-foreground">{bestRentProcs.length} procedimentos</div>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {bestRentProcs.map((p) => (
                <div key={p.code} className="flex items-center gap-1.5 text-[10px]">
                  <div className={cn("w-1.5 h-1.5 rounded-full", selectedCodes.includes(p.code) ? "bg-success" : "bg-muted-foreground/30")} />
                  <span className="text-muted-foreground truncate">{p.name}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div>
                <span className="text-lg font-extrabold text-success tabular-nums">+R$ {bestRentTotal.toLocaleString("pt-BR")}</span>
                <div className="text-[10px] text-muted-foreground">Glosa média: {avgGlossRent}%</div>
              </div>
              {!isRentApplied && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-success opacity-0 group-hover:opacity-100 transition-opacity">
                  Aplicar <ArrowRight className="w-3 h-3" />
                </div>
              )}
              {isRentApplied && (
                <span className="text-[10px] font-semibold text-success">Aplicado ✓</span>
              )}
            </div>
          </div>
        </button>

        {/* Historical Combo */}
        <button
          onClick={() => !isHistApplied && onApplyAll(historicalCodes)}
          disabled={isHistApplied}
          className={cn(
            "text-left p-4 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden",
            isHistApplied
              ? "border-primary/40 bg-primary/5 cursor-default"
              : "border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
          )}
        >
          {!isHistApplied && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}>
                {isHistApplied ? <Check className="w-4 h-4 text-primary" /> : <History className="w-4 h-4 text-primary" />}
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Combo Histórico</div>
                <div className="text-[10px] text-muted-foreground">{historicalProcs.length} procedimentos</div>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {historicalProcs.map((p) => (
                <div key={p.code} className="flex items-center gap-1.5 text-[10px]">
                  <div className={cn("w-1.5 h-1.5 rounded-full", selectedCodes.includes(p.code) ? "bg-primary" : "bg-muted-foreground/30")} />
                  <span className="text-muted-foreground truncate">{p.name}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div>
                <span className="text-lg font-extrabold text-primary tabular-nums">+R$ {historicalTotal.toLocaleString("pt-BR")}</span>
                <div className="text-[10px] text-muted-foreground">Glosa média: {avgGlossHist}%</div>
              </div>
              {!isHistApplied && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Aplicar <ArrowRight className="w-3 h-3" />
                </div>
              )}
              {isHistApplied && (
                <span className="text-[10px] font-semibold text-primary">Aplicado ✓</span>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SmartSelection;
