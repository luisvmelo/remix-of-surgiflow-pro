import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, FileText, Package, Plus, Minus, Search,
  CheckCircle2, AlertTriangle, ShieldAlert, Lightbulb,
  ChevronRight, X, TrendingUp, Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Reuse same mock guides from detail page
const mockGuideData: Record<string, any> = {
  d1: {
    procedure: "Artroscopia de Joelho — Meniscectomia", code: "30725119",
    rentability: 12, glossRisk: 8,
    suggestions: [
      { text: "Adicionar Condroplastia pode aumentar rentabilidade em +R$ 820", type: "success" as const },
      { text: "Todos os itens conferidos — sem ofensores", type: "success" as const },
    ],
    procedures: [
      { id: "p1", name: "Artroscopia de Joelho — Meniscectomia", code: "30725119", type: "principal" },
      { id: "p2", name: "Condroplastia artroscópica", code: "30725020", delta: "+R$ 820" },
      { id: "p3", name: "Bloqueio anestésico regional", code: "31003079", delta: "+R$ 420" },
    ],
    items: [
      { id: "i1", name: "Placa LCP 3.5mm Distal Radius", supplier: "Synthes", qty: 2, status: "ok" },
      { id: "i2", name: "Parafuso Bloqueado 3.5x28mm", supplier: "Synthes", qty: 8, status: "ok" },
      { id: "i3", name: "Cânula Artroscópica 7mm", supplier: "Smith & Nephew", qty: 1, status: "ok" },
      { id: "i4", name: "K-Wire 1.6mm", supplier: "Synthes", qty: 2, status: "ok" },
      { id: "i5", name: "Fio de Alta Resistência #2", supplier: "Arthrex", qty: 3, status: "ok" },
    ],
  },
  d2: {
    procedure: "Reconstrução de LCA", code: "30725097",
    rentability: 6, glossRisk: 22,
    suggestions: [
      { text: "Substituir Implante Interferencial Titânio por PEEK — economia de R$ 520", type: "warning" as const },
      { text: "Âncora Bio-Compósita é ofensor — considere Âncora PEEK 5.5mm", type: "warning" as const },
    ],
    procedures: [
      { id: "p1", name: "Reconstrução de LCA", code: "30725097", type: "principal" },
      { id: "p2", name: "Sinovectomia parcial", code: "30715024", delta: "+R$ 350" },
    ],
    items: [
      { id: "i1", name: "Implante Interferencial Titânio 7x23", supplier: "Arthrex", qty: 1, status: "offender" },
      { id: "i2", name: "Âncora Bio-Compósita 5.5mm", supplier: "Arthrex", qty: 2, status: "offender" },
      { id: "i3", name: "Parafuso Bloqueado 3.5x28mm", supplier: "Synthes", qty: 6, status: "ok" },
      { id: "i4", name: "Fio de Alta Resistência #2", supplier: "Arthrex", qty: 4, status: "ok" },
    ],
  },
  d3: {
    procedure: "Artroscopia de Ombro — Reparo do manguito", code: "30725038",
    rentability: 18, glossRisk: 5,
    suggestions: [
      { text: "Excelente rentabilidade — acima do percentil 85", type: "success" as const },
      { text: "Lâmina Shaver tem risco de glosa leve — monitorar", type: "info" as const },
    ],
    procedures: [
      { id: "p1", name: "Artroscopia de Ombro — Reparo do manguito", code: "30725038", type: "principal" },
      { id: "p2", name: "Condroplastia artroscópica", code: "30725020", delta: "+R$ 820" },
      { id: "p3", name: "Liberação de retináculo lateral", code: "30725052", delta: "+R$ 180" },
    ],
    items: [
      { id: "i1", name: "Cânula Artroscópica 7mm", supplier: "Smith & Nephew", qty: 2, status: "ok" },
      { id: "i2", name: "Lâmina Shaver Agressiva", supplier: "Smith & Nephew", qty: 1, status: "glosa" },
      { id: "i3", name: "Fio de Alta Resistência #2", supplier: "Arthrex", qty: 6, status: "ok" },
    ],
  },
};

// Fallback
["d4", "d5"].forEach((id) => {
  mockGuideData[id] = { ...mockGuideData.d1 };
});

// Catalog of available procedures to add
const availableProcedures = [
  { code: "30725020", name: "Condroplastia artroscópica", delta: "+R$ 820" },
  { code: "30715024", name: "Sinovectomia parcial", delta: "+R$ 350" },
  { code: "31003079", name: "Bloqueio anestésico regional", delta: "+R$ 420" },
  { code: "30725052", name: "Liberação de retináculo lateral", delta: "+R$ 180" },
  { code: "30725045", name: "Capsulotomia artroscópica", delta: "-R$ 290" },
  { code: "30725038", name: "Desbridamento articular", delta: "-R$ 180" },
];

// Catalog of available items to add
const availableItems = [
  { name: "Placa LCP 3.5mm Distal Radius", supplier: "Synthes", status: "ok" },
  { name: "Parafuso Bloqueado 3.5x28mm", supplier: "Synthes", status: "ok" },
  { name: "Cânula Artroscópica 7mm", supplier: "Smith & Nephew", status: "ok" },
  { name: "K-Wire 1.6mm", supplier: "Synthes", status: "ok" },
  { name: "Fio de Alta Resistência #2", supplier: "Arthrex", status: "ok" },
  { name: "Âncora PEEK 5.5mm", supplier: "Arthrex", status: "ok" },
  { name: "Lâmina Shaver Agressiva", supplier: "Smith & Nephew", status: "glosa" },
  { name: "Implante Interferencial PEEK", supplier: "Arthrex", status: "ok" },
  { name: "Dreno Portovac 3.2mm", supplier: "BBraun", status: "ok" },
];

type EditTab = "procedures" | "items";

const statusBadge: Record<string, { label: string; className: string }> = {
  offender: { label: "Ofensor", className: "bg-destructive/15 text-destructive" },
  glosa: { label: "Risco glosa", className: "bg-warning/15 text-warning" },
};

const DoctorGuiaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const guideData = mockGuideData[id || ""] || mockGuideData.d1;

  const [activeTab, setActiveTab] = useState<EditTab>("procedures");
  const [procedures, setProcedures] = useState(guideData.procedures);
  const [items, setItems] = useState(guideData.items);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);

  const removeProcedure = (code: string) => {
    setProcedures((prev: any[]) => prev.filter((p: any) => p.code !== code || p.type === "principal"));
  };

  const addProcedure = (proc: any) => {
    const exists = procedures.some((p: any) => p.code === proc.code);
    if (!exists) {
      setProcedures((prev: any[]) => [...prev, { ...proc, id: `p${Date.now()}` }]);
    }
    setShowAddPanel(false);
    setSearchQuery("");
  };

  const removeItem = (itemId: string) => {
    setItems((prev: any[]) => prev.filter((i: any) => i.id !== itemId));
  };

  const updateItemQty = (itemId: string, delta: number) => {
    setItems((prev: any[]) =>
      prev.map((i: any) =>
        i.id === itemId ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    );
  };

  const addItem = (item: any) => {
    const exists = items.some((i: any) => i.name === item.name);
    if (!exists) {
      setItems((prev: any[]) => [...prev, { ...item, id: `i${Date.now()}`, qty: 1 }]);
    }
    setShowAddPanel(false);
    setSearchQuery("");
  };

  // Filter catalog based on search and what's already added
  const filteredProcedures = availableProcedures.filter(
    (p) =>
      !procedures.some((existing: any) => existing.code === p.code) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.includes(searchQuery))
  );

  const filteredItems = availableItems.filter(
    (i) =>
      !items.some((existing: any) => existing.name === i.name) &&
      (i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-4 pt-10 pb-3 safe-area-top sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/medico/guia/${id}`)} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground text-sm">Editar Guia</h1>
            <p className="text-[10px] text-muted-foreground truncate">{guideData.procedure}</p>
          </div>
        </div>
      </header>

      {/* Wizard tabs */}
      <div className="flex border-b bg-card sticky top-[68px] z-10">
        <button
          onClick={() => { setActiveTab("procedures"); setShowAddPanel(false); setSearchQuery(""); }}
          className={cn(
            "flex-1 py-3 text-sm font-semibold text-center transition-colors relative",
            activeTab === "procedures" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center justify-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Procedimentos
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {procedures.length}
            </span>
          </div>
          {activeTab === "procedures" && (
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab("items"); setShowAddPanel(false); setSearchQuery(""); }}
          className={cn(
            "flex-1 py-3 text-sm font-semibold text-center transition-colors relative",
            activeTab === "items" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            Itens OPME
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          {activeTab === "items" && (
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Metrics bar */}
        <div className="grid grid-cols-2 gap-2 px-4 py-3">
          <div className="glass-card rounded-xl p-2.5 flex items-center gap-2">
            <TrendingUp className={cn("w-4 h-4", guideData.rentability > 15 ? "text-success" : guideData.rentability > 0 ? "text-warning" : "text-destructive")} />
            <div>
              <div className={cn("text-lg font-extrabold leading-none", guideData.rentability > 15 ? "text-success" : guideData.rentability > 0 ? "text-warning" : "text-destructive")}>
                +{guideData.rentability}%
              </div>
              <div className="text-[9px] text-muted-foreground">Rentabilidade</div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-2.5 flex items-center gap-2">
            <Shield className={cn("w-4 h-4", guideData.glossRisk < 15 ? "text-success" : "text-warning")} />
            <div>
              <div className={cn("text-lg font-extrabold leading-none", guideData.glossRisk < 15 ? "text-success" : "text-warning")}>
                {guideData.glossRisk}%
              </div>
              <div className="text-[9px] text-muted-foreground">Risco Glosa</div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {guideData.suggestions && guideData.suggestions.length > 0 && (
          <div className="px-4 pb-3">
            <div className={cn(
              "rounded-xl p-3 border",
              guideData.suggestions.some((s: any) => s.type === "warning") ? "bg-warning/5 border-warning/20" :
              "bg-success/5 border-success/20"
            )}>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px] font-bold text-foreground">Sugestões de Melhoria</span>
              </div>
              <div className="space-y-1.5">
                {guideData.suggestions.map((s: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    {s.type === "success" && <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />}
                    {s.type === "warning" && <AlertTriangle className="w-3 h-3 text-warning shrink-0 mt-0.5" />}
                    {s.type === "info" && <Lightbulb className="w-3 h-3 text-primary shrink-0 mt-0.5" />}
                    <span className="text-foreground">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add panel (slide overlay) */}
        {showAddPanel && (
          <div className="px-4 pt-3 pb-2 border-b bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === "procedures" ? "Buscar procedimento..." : "Buscar item OPME..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-sm"
                autoFocus
              />
              <button onClick={() => { setShowAddPanel(false); setSearchQuery(""); }} className="p-1">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[40vh] overflow-y-auto">
              {activeTab === "procedures" ? (
                filteredProcedures.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum procedimento encontrado</p>
                ) : (
                  filteredProcedures.map((proc) => (
                    <button
                      key={proc.code}
                      onClick={() => addProcedure(proc)}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-card border border-border/50 text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-medium text-foreground truncate">{proc.name}</div>
                        <div className="text-[9px] text-muted-foreground font-mono">{proc.code}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={cn(
                          "text-[10px] font-bold",
                          proc.delta.startsWith("+") ? "text-success" : "text-destructive"
                        )}>{proc.delta}</span>
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                    </button>
                  ))
                )
              ) : (
                filteredItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum item encontrado</p>
                ) : (
                  filteredItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => addItem(item)}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-card border border-border/50 text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-medium text-foreground truncate">{item.name}</div>
                        <div className="text-[9px] text-muted-foreground">{item.supplier}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {item.status !== "ok" && statusBadge[item.status] && (
                          <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-semibold", statusBadge[item.status].className)}>
                            {statusBadge[item.status].label}
                          </span>
                        )}
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                    </button>
                  ))
                )
              )}
            </div>
          </div>
        )}

        {/* Procedures list */}
        {activeTab === "procedures" && (
          <div className="px-4 py-3 space-y-2">
            {procedures.map((proc: any) => (
              <div
                key={proc.code}
                className={cn(
                  "flex items-center justify-between py-3 px-3 rounded-xl text-[11px]",
                  proc.type === "principal"
                    ? "bg-primary/5 border border-primary/20"
                    : "glass-card"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <CheckCircle2 className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    proc.type === "principal" ? "text-primary" : "text-success"
                  )} />
                  <div className="min-w-0">
                    <div className="text-foreground font-medium truncate">{proc.name}</div>
                    <div className="text-[9px] text-muted-foreground font-mono">{proc.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {proc.delta && (
                    <span className={cn(
                      "text-[10px] font-bold",
                      proc.delta.startsWith("+") ? "text-success" : "text-destructive"
                    )}>{proc.delta}</span>
                  )}
                  {proc.type === "principal" ? (
                    <span className="text-[9px] text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">Principal</span>
                  ) : (
                    <button
                      onClick={() => removeProcedure(proc.code)}
                      className="p-1 rounded-full hover:bg-destructive/10 active:scale-90 transition-transform"
                    >
                      <X className="w-4 h-4 text-destructive/60" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items list */}
        {activeTab === "items" && (
          <div className="px-4 py-3 space-y-2">
            {items.map((item: any) => {
              const badge = statusBadge[item.status];
              return (
                <div key={item.id} className="glass-card rounded-xl py-3 px-3">
                  <div className="flex items-start justify-between text-[11px]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {item.status === "ok" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                        ) : item.status === "offender" ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-destructive shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                        )}
                        <span className="text-foreground font-medium truncate">{item.name}</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground ml-5 mt-0.5">{item.supplier}</div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded-full hover:bg-destructive/10 active:scale-90 transition-transform shrink-0"
                    >
                      <X className="w-4 h-4 text-destructive/60" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2 ml-5">
                    <div className="flex items-center gap-1.5">
                      {badge && (
                        <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-semibold", badge.className)}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateItemQty(item.id, -1)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-foreground">{item.qty}</span>
                      <button
                        onClick={() => updateItemQty(item.id, 1)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Plus className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="border-t bg-card px-4 py-3 safe-area-bottom space-y-2 overflow-hidden">
        <div className="flex gap-2">
          {!showAddPanel && (
            <Button
              variant="outline"
              className="flex-1 h-11 text-xs font-semibold min-w-0"
              onClick={() => setShowAddPanel(true)}
            >
              <Plus className="w-4 h-4 mr-1 shrink-0" />
              <span className="truncate">Adicionar</span>
            </Button>
          )}
          <Button
            className="flex-1 h-11 text-xs font-semibold min-w-0"
            onClick={() => navigate(`/medico/guia/${id}`)}
          >
            <CheckCircle2 className="w-4 h-4 mr-1 shrink-0" /> <span className="truncate">Salvar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorGuiaEdit;
