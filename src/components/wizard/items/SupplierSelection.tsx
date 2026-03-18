import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Truck, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock suppliers the doctor uses most frequently
const mockSuppliers = [
  { id: "s1", name: "Synthes (DePuy)", usageCount: 42, specialty: "Placas, Parafusos, Instrumental" },
  { id: "s2", name: "Arthrex", usageCount: 31, specialty: "Âncoras, Implantes artroscópicos" },
  { id: "s3", name: "Smith & Nephew", usageCount: 28, specialty: "Shavers, Cânulas, Implantes" },
  { id: "s4", name: "Ethicon (J&J)", usageCount: 22, specialty: "Fios de Sutura, Grampeadores" },
  { id: "s5", name: "BBraun", usageCount: 18, specialty: "Drenos, Cateteres, Acessórios" },
  { id: "s6", name: "Stryker", usageCount: 15, specialty: "Próteses, Placas, Motor cirúrgico" },
  { id: "s7", name: "Zimmer Biomet", usageCount: 12, specialty: "Próteses articulares, Implantes" },
  { id: "s8", name: "Medtronic", usageCount: 8, specialty: "Neuromodulação, Energia cirúrgica" },
  { id: "s9", name: "ConMed", usageCount: 6, specialty: "Artroscopia, Eletrocirurgia" },
  { id: "s10", name: "Globus Medical", usageCount: 4, specialty: "Coluna, Implantes espinhais" },
];

interface SupplierSelectionProps {
  selectedSuppliers: string[];
  onToggleSupplier: (supplierId: string) => void;
}

const SupplierSelection = ({ selectedSuppliers, onToggleSupplier }: SupplierSelectionProps) => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const q = search.toLowerCase();
  const filtered = mockSuppliers.filter(
    s => !q || s.name.toLowerCase().includes(q) || s.specialty.toLowerCase().includes(q)
  );

  // Show top 5 by default, all when expanded or searching
  const visible = search ? filtered : expanded ? filtered : filtered.slice(0, 5);

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Fornecedores</h3>
          {selectedSuppliers.length > 0 && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              {selectedSuppliers.length} selecionado(s)
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mb-3">
        Selecione os fornecedores para filtrar os itens OPME disponíveis
      </p>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar fornecedor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {/* Selected chips */}
      {selectedSuppliers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selectedSuppliers.map(id => {
            const supplier = mockSuppliers.find(s => s.id === id);
            if (!supplier) return null;
            return (
              <button
                key={id}
                onClick={() => onToggleSupplier(id)}
                className="flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
              >
                {supplier.name}
                <X className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      )}

      {/* Supplier list */}
      <div className="space-y-1">
        {visible.map(supplier => {
          const isSelected = selectedSuppliers.includes(supplier.id);
          return (
            <button
              key={supplier.id}
              onClick={() => onToggleSupplier(supplier.id)}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all",
                isSelected
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted/50 border border-transparent"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
              )}>
                {isSelected && <Check className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground">{supplier.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{supplier.specialty}</div>
              </div>
              <div className="text-[10px] text-muted-foreground shrink-0">
                {supplier.usageCount}× usado
              </div>
            </button>
          );
        })}
      </div>

      {/* Show more / less */}
      {!search && filtered.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-[11px] text-primary font-semibold mt-2 py-1.5 hover:bg-primary/5 rounded-lg transition-colors"
        >
          {expanded ? "Ver menos" : `Ver todos (${filtered.length})`}
        </button>
      )}

      {visible.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Nenhum fornecedor encontrado</p>
      )}
    </div>
  );
};

export default SupplierSelection;
