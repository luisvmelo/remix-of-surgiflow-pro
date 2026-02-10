import { useState, useRef } from "react";
import { mockRecommendedOPMEs } from "@/lib/mockData";
import { Search, Plus, Check, Minus, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SelectedItem {
  name: string;
  quantity: number;
}

interface Props {
  selectedItems: SelectedItem[];
  onToggle: (name: string, quantity?: number) => void;
}

const ItemSearch = ({ selectedItems, onToggle }: Props) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [previewQtys, setPreviewQtys] = useState<Record<string, number>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = query.length >= 2
    ? mockRecommendedOPMEs.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.supplier.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleBlur = (e: React.FocusEvent) => {
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
    }
  };

  const getQty = (name: string) => previewQtys[name] || 1;
  const setQty = (name: string, qty: number) => setPreviewQtys(prev => ({ ...prev, [name]: Math.max(1, qty) }));

  return (
    <div className="glass-card rounded-xl p-4" ref={wrapperRef} onBlur={handleBlur}>
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Adicionar item OPME</h3>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Digite nome do item ou fornecedor..."
          className="pl-10 h-9 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
      </div>

      {isFocused && query.length >= 2 && (
        <div className="mt-2 rounded-lg border border-border bg-card shadow-lg max-h-72 overflow-y-auto animate-fade-in">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Nenhum item encontrado
            </div>
          ) : (
            results.map((item) => {
              const isSelected = selectedItems.some((s) => s.name === item.name);
              const qty = getQty(item.name);
              const baseImpact = parseInt(item.impactDelta.replace(/[^\d-]/g, "")) || 0;
              const liveImpact = baseImpact * qty;

              return (
                <div
                  key={item.name}
                  className={cn(
                    "w-full text-left px-3 py-2.5 transition-colors border-b border-border/50 last:border-0",
                    isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-xs">{item.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">{item.supplier}</span>
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
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/30">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Qtd:</span>
                      <button
                        onClick={() => setQty(item.name, qty - 1)}
                        className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                        disabled={isSelected}
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-bold tabular-nums w-4 text-center">{qty}</span>
                      <button
                        onClick={() => setQty(item.name, qty + 1)}
                        className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                        disabled={isSelected}
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-bold tabular-nums",
                        liveImpact > 0 ? "text-success" : liveImpact < 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {liveImpact >= 0 ? "+" : ""}R$ {Math.abs(liveImpact)}
                      </span>
                      <button
                        onClick={() => onToggle(item.name, qty)}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                        )}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ItemSearch;
