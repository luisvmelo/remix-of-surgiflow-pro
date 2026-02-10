import { mockRecommendedOPMEs } from "@/lib/mockData";
import { Plus, Check, Minus, TrendingUp, TrendingDown, AlertTriangle, Sparkles, History, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectedItem {
  name: string;
  quantity: number;
}

interface Props {
  selectedItems: SelectedItem[];
  onToggle: (name: string) => void;
  onQuantity: (name: string, qty: number) => void;
  operadoraName: string;
  search?: string;
}

const ItemCard = ({
  item,
  isSelected,
  quantity,
  onToggle,
  onQuantity,
}: {
  item: typeof mockRecommendedOPMEs[0];
  isSelected: boolean;
  quantity: number;
  onToggle: () => void;
  onQuantity: (qty: number) => void;
}) => {
  const isPositive = item.impactDelta.startsWith("+") && item.impactDelta !== "+R$ 0";
  const isNegative = item.impactDelta.startsWith("-");

  return (
    <div className={cn(
      "p-3 rounded-lg border-2 transition-all duration-200 group",
      isSelected
        ? "border-primary/50 bg-primary/5 shadow-sm"
        : "border-border hover:border-primary/30 hover:bg-muted/30"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-xs leading-tight">{item.name}</div>
          <div className="text-[10px] text-muted-foreground">{item.supplier}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className={cn(
              "text-xs font-bold tabular-nums block",
              isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"
            )}>
              {item.impactDelta}
            </span>
          </div>
          <button
            onClick={onToggle}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground group-hover:bg-primary/10"
            )}
          >
            {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        {item.doctorUses && <span className="badge-doctor text-[9px] px-1.5 py-0.5 rounded-full">Seu médico</span>}
        {item.isOfensor && (
          <span className="badge-danger text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingDown className="w-2 h-2" /> Ofensor
          </span>
        )}
        {item.isGlosado && (
          <span className="badge-warning text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <AlertTriangle className="w-2 h-2" /> Glosa
          </span>
        )}
        {item.improvesRent && (
          <span className="badge-success text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingUp className="w-2 h-2" /> +Rent
          </span>
        )}
      </div>

      {/* Quantity selector — only when selected */}
      {isSelected && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 animate-fade-in">
          <span className="text-[10px] text-muted-foreground">Qtd:</span>
          <button
            onClick={(e) => { e.stopPropagation(); onQuantity(Math.max(1, quantity - 1)); }}
            className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>
          <span className="text-xs font-bold tabular-nums w-4 text-center">{quantity}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onQuantity(quantity + 1); }}
            className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const SuggestedItems = ({ selectedItems, onToggle, onQuantity, operadoraName, search = "" }: Props) => {
  const suggested = mockRecommendedOPMEs
    .filter((item) => item.doctorUses || item.improvesRent)
    .filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.supplier.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Sugeridos para o procedimento</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Itens recomendados com base no histórico do médico e operadora
      </p>
      <div className="grid grid-cols-2 gap-2">
        {suggested.map((item) => {
          const sel = selectedItems.find((s) => s.name === item.name);
          return (
            <ItemCard
              key={item.name}
              item={item}
              isSelected={!!sel}
              quantity={sel?.quantity || 1}
              onToggle={() => onToggle(item.name)}
              onQuantity={(qty) => onQuantity(item.name, qty)}
            />
          );
        })}
      </div>
    </div>
  );
};

export const HistoricalItems = ({ selectedItems, onToggle, onQuantity, operadoraName, search = "" }: Props) => {
  const historical = mockRecommendedOPMEs
    .filter((item) => !item.doctorUses && !item.improvesRent)
    .filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.supplier.toLowerCase().includes(search.toLowerCase()));

  if (historical.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-bold text-foreground text-sm">Históricos para o procedimento</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Itens utilizados em cirurgias similares anteriores
      </p>
      <div className="grid grid-cols-2 gap-2">
        {historical.map((item) => {
          const sel = selectedItems.find((s) => s.name === item.name);
          return (
            <ItemCard
              key={item.name}
              item={item}
              isSelected={!!sel}
              quantity={sel?.quantity || 1}
              onToggle={() => onToggle(item.name)}
              onQuantity={(qty) => onQuantity(item.name, qty)}
            />
          );
        })}
      </div>
    </div>
  );
};

// Mock equivalence data
const mockEquivalences = [
  { original: "Placa LCP 3.5mm Distal Radius", equivalent: "Placa VA-LCP 3.5mm", supplier: "DePuy Synthes", impactDelta: "+R$ 280", reason: "Menor custo, mesma performance clínica" },
  { original: "Âncora Bio-Compósita 5.5mm", equivalent: "Âncora PEEK 5.5mm", supplier: "Smith & Nephew", impactDelta: "+R$ 450", reason: "Material não-ofensor nesta operadora" },
  { original: "Implante Interferencial Titânio 7x23", equivalent: "Implante Interferencial PEEK 7x23", supplier: "ConMed", impactDelta: "+R$ 320", reason: "Reduz risco de glosa em 18%" },
];

export const EquivalenceItems = ({ selectedItems, onToggle, onQuantity }: Omit<Props, "operadoraName" | "search">) => {
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in border-accent/20">
      <div className="flex items-center gap-2 mb-1">
        <RefreshCw className="w-4 h-4 text-accent" />
        <h3 className="font-bold text-foreground text-sm">Equivalência Técnica</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Substituições que mantêm a qualidade e melhoram rentabilidade
      </p>
      <div className="space-y-2">
        {mockEquivalences.map((eq) => {
          const sel = selectedItems.find((s) => s.name === eq.equivalent);
          return (
            <div
              key={eq.equivalent}
              className={cn(
                "p-3 rounded-lg border-2 transition-all",
                sel ? "border-accent/40 bg-accent/5" : "border-border hover:border-accent/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-muted-foreground line-through">{eq.original}</div>
                  <div className="font-semibold text-foreground text-xs mt-0.5">{eq.equivalent}</div>
                  <div className="text-[10px] text-muted-foreground">{eq.supplier}</div>
                  <div className="text-[10px] text-accent-foreground mt-1 italic">{eq.reason}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-success tabular-nums">{eq.impactDelta}</span>
                  <button
                    onClick={() => onToggle(eq.equivalent)}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      sel
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent/10"
                    )}
                  >
                    {sel ? <Check className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              {sel && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 animate-fade-in">
                  <span className="text-[10px] text-muted-foreground">Qtd:</span>
                  <button
                    onClick={() => onQuantity(eq.equivalent, Math.max(1, (sel.quantity || 1) - 1))}
                    className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-bold tabular-nums w-4 text-center">{sel.quantity}</span>
                  <button
                    onClick={() => onQuantity(eq.equivalent, (sel.quantity || 1) + 1)}
                    className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
