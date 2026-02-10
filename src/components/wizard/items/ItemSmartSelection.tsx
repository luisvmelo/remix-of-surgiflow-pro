import { mockRecommendedOPMEs } from "@/lib/mockData";
import { Zap, History, TrendingUp, Check, ArrowRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectedItem {
  name: string;
  quantity: number;
}

interface Props {
  selectedItems: SelectedItem[];
  onApplyAll: (items: SelectedItem[]) => void;
}

// Best rentability combo: items that improve rent and aren't offenders
const bestRentItems = mockRecommendedOPMEs
  .filter((item) => item.improvesRent && !item.isOfensor && !item.isGlosado)
  .sort((a, b) => {
    const aVal = parseInt(a.impactDelta.replace(/[^\d-]/g, "")) || 0;
    const bVal = parseInt(b.impactDelta.replace(/[^\d-]/g, "")) || 0;
    return bVal - aVal;
  });

// Historical combo: doctor uses + not offender
const historicalItems = mockRecommendedOPMEs
  .filter((item) => item.doctorUses && !item.isOfensor)
  .sort((a, b) => {
    const aVal = parseInt(a.impactDelta.replace(/[^\d-]/g, "")) || 0;
    const bVal = parseInt(b.impactDelta.replace(/[^\d-]/g, "")) || 0;
    return bVal - aVal;
  });

const bestRentTotal = bestRentItems.reduce((acc, item) => {
  return acc + (parseInt(item.impactDelta.replace(/[^\d-]/g, "")) || 0);
}, 0);

const historicalTotal = historicalItems.reduce((acc, item) => {
  return acc + (parseInt(item.impactDelta.replace(/[^\d-]/g, "")) || 0);
}, 0);

const avgGlossRent = Math.round(
  bestRentItems.filter((i) => i.isGlosado).length / (bestRentItems.length || 1) * 100
);
const avgGlossHist = Math.round(
  historicalItems.filter((i) => i.isGlosado).length / (historicalItems.length || 1) * 100
);

const ItemSmartSelection = ({ selectedItems, onApplyAll }: Props) => {
  const isRentApplied = bestRentItems.every((item) =>
    selectedItems.some((s) => s.name === item.name)
  );
  const isHistApplied = historicalItems.every((item) =>
    selectedItems.some((s) => s.name === item.name)
  );

  const applyRent = () => {
    if (isRentApplied) return;
    const newItems = bestRentItems
      .filter((item) => !selectedItems.some((s) => s.name === item.name))
      .map((item) => ({ name: item.name, quantity: 1 }));
    onApplyAll(newItems);
  };

  const applyHist = () => {
    if (isHistApplied) return;
    const newItems = historicalItems
      .filter((item) => !selectedItems.some((s) => s.name === item.name))
      .map((item) => ({ name: item.name, quantity: 1 }));
    onApplyAll(newItems);
  };

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in border-primary/20">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-accent" />
        <h3 className="font-bold text-foreground text-sm">Smart Selection — Itens OPME</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Combinações otimizadas de itens — clique para aplicar todos de uma vez
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Best Rentability */}
        <button
          onClick={applyRent}
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
                <div className="text-[10px] text-muted-foreground">{bestRentItems.length} itens</div>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {bestRentItems.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                  <div className={cn("w-1.5 h-1.5 rounded-full", selectedItems.some((s) => s.name === item.name) ? "bg-success" : "bg-muted-foreground/30")} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div>
                <span className="text-lg font-extrabold text-success tabular-nums">+R$ {bestRentTotal.toLocaleString("pt-BR")}</span>
                <div className="text-[10px] text-muted-foreground">Risco glosa: {avgGlossRent}%</div>
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
          onClick={applyHist}
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
                <div className="text-[10px] text-muted-foreground">{historicalItems.length} itens</div>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {historicalItems.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                  <div className={cn("w-1.5 h-1.5 rounded-full", selectedItems.some((s) => s.name === item.name) ? "bg-primary" : "bg-muted-foreground/30")} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div>
                <span className="text-lg font-extrabold text-primary tabular-nums">+R$ {historicalTotal.toLocaleString("pt-BR")}</span>
                <div className="text-[10px] text-muted-foreground">Risco glosa: {avgGlossHist}%</div>
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

export default ItemSmartSelection;
