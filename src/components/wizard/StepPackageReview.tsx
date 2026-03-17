import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2, TrendingUp, AlertTriangle, Shield, User, Stethoscope,
  Building, FileText, Package, Send, Edit3, Clock, History, ArrowLeft,
  X, Plus, Search, Sparkles
} from "lucide-react";
import { mockLinkedProcedures, mockDocuments, mockRecommendedOPMEs } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// ── Historical package data ──────────────────────────────────────
const getHistoricalPackage = (_code: string | undefined) => ({
  procedures: [
    { code: "30725020", name: "Condroplastia artroscópica", delta: "+R$ 820" },
    { code: "31003079", name: "Bloqueio anestésico regional", delta: "+R$ 420" },
  ],
  items: [
    { id: "h1", name: "Placa de Titânio 3.5mm", supplier: "Synthes", quantity: 2, type: "OPME" as const },
    { id: "h2", name: "Parafuso Cortical 3.5x40mm", supplier: "Synthes", quantity: 8, type: "OPME" as const },
    { id: "h3", name: "Parafuso Bloqueado 3.5x30mm", supplier: "Synthes", quantity: 4, type: "OPME" as const },
    { id: "h4", name: "Kit de Instrumental Ortopédico", supplier: "Synthes", quantity: 1, type: "Material" as const },
    { id: "h5", name: "Fio de Sutura Vicryl 2-0", supplier: "Ethicon", quantity: 3, type: "Material" as const },
    { id: "h6", name: "Âncora de Sutura 5.5mm", supplier: "Arthrex", quantity: 2, type: "OPME" as const },
    { id: "h7", name: "Lâmina de Shaver 5.5mm", supplier: "Smith & Nephew", quantity: 2, type: "Material" as const },
    { id: "h8", name: "Dreno Portovac 3.2mm", supplier: "BBraun", quantity: 1, type: "Material" as const },
  ],
  documents: [
    { name: "Guia TISS preenchida", attached: true },
    { name: "Relatório médico detalhado", attached: true },
    { name: "Exames de imagem (RX/TC/RM)", attached: true },
    { name: "Exames pré-operatórios", attached: true },
    { name: "Termo de consentimento", attached: true },
    { name: "Cotação de OPME (3 fornecedores)", attached: true },
  ],
  rentability: 16,
  glossRisk: 8,
  conformidade: 100,
  basedOn: 5,
  lastDate: "12 fev 2026",
});

// ── Suggestion pools ─────────────────────────────────────────────
const procedureSuggestions = mockLinkedProcedures.map(p => ({
  code: p.code, name: p.name, delta: p.rentabilityDelta, tag: p.improvesRent ? "Recomendado" : undefined,
}));

const itemSuggestions = mockRecommendedOPMEs.map((o, i) => ({
  id: `sug-${i}`, name: o.name, supplier: o.supplier, delta: o.impactDelta,
  tag: o.improvesRent ? "Recomendado" : o.isOfensor ? "Ofensor" : undefined,
}));

const docSuggestions = mockDocuments.map(d => ({ name: d.name, required: d.required }));

// ── Modal types ──────────────────────────────────────────────────
type ModalType = "procedures" | "items" | "documents" | null;

const StepPackageReview = () => {
  const { state, updateState, setStep, saveRequest, resetWizard } = useSurgical();
  const navigate = useNavigate();
  const basePkg = getHistoricalPackage(state.selectedProcedure?.code);

  // ── Editable local state (initialised from historical package) ─
  const [procedures, setProcedures] = useState(basePkg.procedures);
  const [items, setItems] = useState(basePkg.items);
  const [documents, setDocuments] = useState(basePkg.documents);

  // ── Modal state ────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalType>(null);
  const [search, setSearch] = useState("");

  // ── Metrics (static for prototype) ─────────────────────────────
  const rentColor = basePkg.rentability > 15 ? "text-success" : basePkg.rentability > 0 ? "text-warning" : "text-destructive";
  const glossColor = basePkg.glossRisk < 15 ? "text-success" : basePkg.glossRisk < 30 ? "text-warning" : "text-destructive";

  // ── Remove helpers ─────────────────────────────────────────────
  const removeProc = (code: string) => setProcedures(p => p.filter(x => x.code !== code));
  const removeItem = (id: string) => setItems(i => i.filter(x => x.id !== id));
  const removeDoc = (name: string) => setDocuments(d => d.filter(x => x.name !== name));

  // ── Add helpers ────────────────────────────────────────────────
  const addProc = (proc: typeof procedures[0]) => {
    if (!procedures.find(p => p.code === proc.code)) {
      setProcedures(prev => [...prev, proc]);
    }
    setModal(null);
    setSearch("");
  };

  const addItem = (item: { id: string; name: string; supplier: string; delta: string }) => {
    if (!items.find(i => i.name === item.name)) {
      setItems(prev => [...prev, { id: item.id, name: item.name, supplier: item.supplier, quantity: 1, type: "OPME" as const }]);
    }
    setModal(null);
    setSearch("");
  };

  const addDoc = (doc: { name: string }) => {
    if (!documents.find(d => d.name === doc.name)) {
      setDocuments(prev => [...prev, { name: doc.name, attached: true }]);
    }
    setModal(null);
    setSearch("");
  };

  // ── Confirm / Back ─────────────────────────────────────────────
  const handleConfirm = () => {
    updateState({
      extractedItems: items.map(item => ({ ...item, uncertain: false, status: "ok" as const })),
      linkedProcedures: procedures.map(p => p.code),
      documents: mockDocuments.map(d => ({ ...d, attached: documents.some(pd => pd.name === d.name) })),
      rentabilityScore: basePkg.rentability,
      glossRisk: basePkg.glossRisk,
      showPackageReview: false,
    });
    saveRequest("awaiting-auth");
    resetWizard();
    navigate("/medico");
  };

  const handleBack = () => {
    updateState({ showPackageReview: false, currentStep: 1 });
    setStep(1);
  };

  // ── Filtered suggestions ───────────────────────────────────────
  const q = search.toLowerCase();
  const filteredProcs = procedureSuggestions
    .filter(p => !procedures.find(x => x.code === p.code))
    .filter(p => !q || p.name.toLowerCase().includes(q) || p.code.includes(q));

  const filteredItems = itemSuggestions
    .filter(s => !items.find(x => x.name === s.name))
    .filter(s => !q || s.name.toLowerCase().includes(q) || s.supplier.toLowerCase().includes(q));

  const filteredDocs = docSuggestions
    .filter(d => !documents.find(x => x.name === d.name))
    .filter(d => !q || d.name.toLowerCase().includes(q));

  return (
    <>
      <div className="h-full overflow-y-auto p-4 lg:p-8 space-y-5 max-w-[1200px] mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={handleBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="p-2 rounded-xl bg-primary/10">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">Pacote Sugerido</h2>
              <p className="text-muted-foreground text-[11px]">
                Baseado nas últimas {basePkg.basedOn} cirurgias de{" "}
                <span className="font-semibold text-foreground">{state.selectedProcedure?.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground ml-12">
            <Clock className="w-3 h-3" />
            Última realizada em {basePkg.lastDate}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card rounded-xl p-3 text-center">
            <TrendingUp className={cn("w-4 h-4 mx-auto mb-0.5", rentColor)} />
            <div className={cn("text-2xl font-extrabold tracking-tight", rentColor)}>+{basePkg.rentability}%</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Rentabilidade</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <AlertTriangle className={cn("w-4 h-4 mx-auto mb-0.5", glossColor)} />
            <div className={cn("text-2xl font-extrabold tracking-tight", glossColor)}>{basePkg.glossRisk}%</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Risco Glosa</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <Shield className={cn("w-4 h-4 mx-auto mb-0.5", basePkg.conformidade === 100 ? "text-success" : "text-warning")} />
            <div className={cn("text-2xl font-extrabold tracking-tight", basePkg.conformidade === 100 ? "text-success" : "text-warning")}>{basePkg.conformidade}%</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Conformidade</div>
          </div>
        </div>

        {/* Guide content */}
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Patient / Doctor / Operadora */}
          <div className="bg-muted/30 border-b px-4 py-3">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-0.5">
                  <User className="w-3 h-3" /> Paciente
                </div>
                <div className="font-semibold text-foreground text-[11px]">{state.patient?.name || "—"}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-0.5">
                  <Stethoscope className="w-3 h-3" /> Médico
                </div>
                <div className="font-semibold text-foreground text-[11px]">{state.doctor?.name || "—"}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-0.5">
                  <Building className="w-3 h-3" /> Operadora
                </div>
                <div className="font-semibold text-foreground text-[11px]">{state.operadora?.name || "—"}</div>
              </div>
            </div>
          </div>

          {/* ── Procedimentos ──────────────────────────────────── */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Procedimentos ({1 + procedures.length})
                </span>
              </div>
              <button
                onClick={() => { setModal("procedures"); setSearch(""); }}
                className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
            {/* Principal (not removable) */}
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/20 mb-1.5">
              <div className="flex items-center gap-2 text-xs min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-semibold text-foreground truncate">{state.selectedProcedure?.name || "—"}</span>
              </div>
              <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10 shrink-0">Principal</span>
            </div>
            {procedures.map((proc) => (
              <div key={proc.code} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 mb-1 text-xs group">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                  <span className="text-foreground truncate">{proc.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold tabular-nums text-success">{proc.delta}</span>
                  <button onClick={() => removeProc(proc.code)} className="p-0.5 rounded hover:bg-destructive/10 transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Itens OPME ─────────────────────────────────────── */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Itens OPME & Materiais ({items.length})
                </span>
              </div>
              <button
                onClick={() => { setModal("items"); setSearch(""); }}
                className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-xs group">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                    <span className="font-medium text-foreground truncate">{item.name}</span>
                    <span className="text-muted-foreground shrink-0 hidden sm:inline">· {item.supplier}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-muted-foreground tabular-nums">×{item.quantity}</span>
                    <button onClick={() => removeItem(item.id)} className="p-0.5 rounded hover:bg-destructive/10 transition-colors">
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Documentos ─────────────────────────────────────── */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Documentos ({documents.length})
                </span>
              </div>
              <button
                onClick={() => { setModal("documents"); setSearch(""); }}
                className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
            <div className="space-y-1">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-success/5 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                    <span className="text-foreground truncate">{doc.name}</span>
                  </div>
                  <button onClick={() => removeDoc(doc.name)} className="p-0.5 rounded hover:bg-destructive/10 transition-colors shrink-0">
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2 pb-4">
          <Button variant="outline" size="lg" className="flex-1 gap-2 min-w-0" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="truncate">Voltar</span>
          </Button>
          <Button size="lg" className="flex-1 gap-2 min-w-0" onClick={handleConfirm}>
            <Send className="w-4 h-4 shrink-0" />
            <span className="truncate">Confirmar e Enviar</span>
          </Button>
        </div>
      </div>

      {/* ── Add Modal ──────────────────────────────────────────── */}
      <Dialog open={modal !== null} onOpenChange={(open) => { if (!open) { setModal(null); setSearch(""); } }}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">
              {modal === "procedures" && "Adicionar Procedimento"}
              {modal === "items" && "Adicionar Item OPME / Material"}
              {modal === "documents" && "Adicionar Documento"}
            </DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Suggestions list */}
          <div className="flex-1 overflow-y-auto space-y-1 mt-2 -mx-1 px-1">
            {modal === "procedures" && (
              <>
                {filteredProcs.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Nenhum procedimento encontrado</p>
                )}
                {filteredProcs.map(p => (
                  <button
                    key={p.code}
                    onClick={() => addProc({ code: p.code, name: p.name, delta: p.delta })}
                    className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{p.code}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {p.tag && (
                        <span className={cn(
                          "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                          p.tag === "Recomendado" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />{p.tag}
                        </span>
                      )}
                      <span className={cn("text-xs font-bold tabular-nums", p.delta.startsWith("+") ? "text-success" : "text-destructive")}>{p.delta}</span>
                    </div>
                  </button>
                ))}
              </>
            )}

            {modal === "items" && (
              <>
                {filteredItems.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Nenhum item encontrado</p>
                )}
                {filteredItems.map(s => (
                  <button
                    key={s.id}
                    onClick={() => addItem(s)}
                    className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground">{s.supplier}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {s.tag && (
                        <span className={cn(
                          "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                          s.tag === "Recomendado" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          {s.tag}
                        </span>
                      )}
                      <span className={cn("text-xs font-bold tabular-nums", s.delta.startsWith("+") ? "text-success" : "text-destructive")}>{s.delta}</span>
                    </div>
                  </button>
                ))}
              </>
            )}

            {modal === "documents" && (
              <>
                {filteredDocs.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Nenhum documento encontrado</p>
                )}
                {filteredDocs.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => addDoc(d)}
                    className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                  >
                    <span className="text-xs font-medium text-foreground truncate">{d.name}</span>
                    {d.required && (
                      <span className="text-[9px] font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded-full shrink-0 ml-2">Obrigatório</span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StepPackageReview;
