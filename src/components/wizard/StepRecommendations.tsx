import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockProcedures, mockLinkedProcedures, mockRecommendedOPMEs } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Plus, Minus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Stethoscope, BarChart3, Shield, Package, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const StepRecommendations = () => {
  const { state, updateState, setStep } = useSurgical();
  const [selectedProc, setSelectedProc] = useState(state.selectedProcedure);
  const [linkedProcs, setLinkedProcs] = useState<string[]>(state.linkedProcedures);
  const [procSearch, setProcSearch] = useState("");
  const [appliedOPMEs, setAppliedOPMEs] = useState<string[]>([]);

  // Simulated metrics based on selections
  const baseRent = 18;
  const linkedBonus = linkedProcs.length * 4;
  const opmeBonus = appliedOPMEs.reduce((acc, name) => {
    const o = mockRecommendedOPMEs.find(r => r.name === name);
    const delta = o?.impactDelta || "+R$ 0";
    return acc + (delta.startsWith("+") ? 2 : -3);
  }, 0);
  const currentRent = baseRent + linkedBonus + opmeBonus;
  const currentGloss = Math.max(3, 14 - linkedProcs.filter(c => {
    const p = mockLinkedProcedures.find(lp => lp.code === c);
    return p && !p.isGlosado;
  }).length * 2 + appliedOPMEs.filter(n => {
    const o = mockRecommendedOPMEs.find(r => r.name === n);
    return o?.isGlosado;
  }).length * 4);

  const toggleLinked = (code: string) => {
    setLinkedProcs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleOPME = (name: string) => {
    setAppliedOPMEs((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleNext = () => {
    updateState({
      selectedProcedure: selectedProc,
      linkedProcedures: linkedProcs,
      currentStep: 5,
      rentabilityScore: currentRent,
      glossRisk: currentGloss,
      historicalPercentile: 72,
      bestPossible: currentRent + 12,
    });
    setStep(5);
  };

  const filteredProcs = procSearch
    ? mockProcedures.filter(p => p.name.toLowerCase().includes(procSearch.toLowerCase()) || p.code.includes(procSearch))
    : mockProcedures;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Recomendações e Análises</h2>
        <p className="text-muted-foreground">Otimize rentabilidade e reduza riscos de glosa com sugestões inteligentes</p>
      </div>

      {/* Big numbers — always visible */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 text-center">
          <TrendingUp className={`w-7 h-7 mx-auto mb-2 ${currentRent > 15 ? "text-success" : "text-warning"}`} />
          <div className={`big-number ${currentRent > 15 ? "text-success" : "text-warning"}`}>
            {currentRent > 0 ? "+" : ""}{currentRent}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Rentabilidade Estimada</div>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <AlertTriangle className={`w-7 h-7 mx-auto mb-2 ${currentGloss < 15 ? "text-success" : currentGloss < 25 ? "text-warning" : "text-destructive"}`} />
          <div className={`big-number ${currentGloss < 15 ? "text-success" : currentGloss < 25 ? "text-warning" : "text-destructive"}`}>
            {currentGloss}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Risco de Glosa</div>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <BarChart3 className="w-7 h-7 mx-auto mb-2 text-primary" />
          <div className="big-number text-primary">P{72 + linkedProcs.length * 3}</div>
          <div className="text-xs text-muted-foreground mt-1">Percentil vs Histórico</div>
        </div>
      </div>

      {/* Bloco A — Procedimento principal */}
      <section className="glass-card rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" /> Procedimento Principal
        </h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar procedimento por nome ou código..." className="pl-10" value={procSearch} onChange={(e) => setProcSearch(e.target.value)} />
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {filteredProcs.map((proc) => (
            <button
              key={proc.code}
              onClick={() => setSelectedProc(proc)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-lg text-left text-sm transition-all",
                selectedProc?.code === proc.code ? "bg-primary/10 border-2 border-primary/40" : "hover:bg-muted border border-transparent"
              )}
            >
              <div>
                <div className="font-medium text-foreground">{proc.name}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{proc.code}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                {proc.doctorUses && <span className="badge-doctor text-[10px] px-2 py-0.5 rounded-full">Seu médico</span>}
                {proc.common && <span className="badge-info text-[10px] px-2 py-0.5 rounded-full">Comum</span>}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Bloco B — Procedimentos atrelados */}
      {selectedProc && (
        <section className="glass-card rounded-xl p-6 animate-fade-in">
          <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" /> Procedimentos Atrelados Sugeridos
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Adicione ou remova para ver o impacto em tempo real nos indicadores acima</p>
          <div className="space-y-3">
            {mockLinkedProcedures.map((lp) => {
              const isSelected = linkedProcs.includes(lp.code);
              return (
                <div
                  key={lp.code}
                  className={cn(
                    "rounded-xl p-4 border-2 transition-all",
                    isSelected ? "border-primary/40 bg-primary/5" : "border-border hover:border-muted-foreground/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">{lp.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{lp.code} · {lp.reason}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {lp.doctorUses && <span className="badge-doctor text-[10px] px-2 py-0.5 rounded-full">Seu médico</span>}
                        {lp.isGlosado && <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full">Glosa comum</span>}
                        {lp.isOfensor && <span className="badge-danger text-[10px] px-2 py-0.5 rounded-full">Ofensor</span>}
                        {lp.improvesRent && <span className="badge-success text-[10px] px-2 py-0.5 rounded-full">Melhora rentabilidade</span>}
                        {lp.isExtrapacote && <span className="bg-accent/15 text-accent-foreground border border-accent/30 text-[10px] px-2 py-0.5 rounded-full">Extrapacote</span>}
                      </div>
                    </div>
                    <Button variant={isSelected ? "default" : "outline"} size="sm" onClick={() => toggleLinked(lp.code)} className="shrink-0">
                      {isSelected ? <><Minus className="w-3 h-3 mr-1" /> Remover</> : <><Plus className="w-3 h-3 mr-1" /> Adicionar</>}
                    </Button>
                  </div>
                  <div className="flex gap-6 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> Aprovação: <strong className="text-foreground">{lp.approvalRate}%</strong></span>
                    <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning" /> Glosa: <strong className="text-foreground">{lp.glossRate}%</strong></span>
                    <span className={cn("flex items-center gap-1 font-semibold", lp.rentabilityDelta.startsWith("+") ? "text-success" : "text-destructive")}>
                      {lp.rentabilityDelta.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {lp.rentabilityDelta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Bloco C — OPMEs */}
      {selectedProc && (
        <section className="glass-card rounded-xl p-6 animate-fade-in">
          <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> OPMEs e Itens — Guia vs Sugestões
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Compare os itens da guia com as sugestões baseadas em histórico</p>
          <div className="space-y-2">
            {mockRecommendedOPMEs.map((opme, idx) => {
              const isApplied = appliedOPMEs.includes(opme.name);
              return (
                <div key={idx} className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  isApplied ? "border-primary/30 bg-primary/5" : "border-border hover:border-muted-foreground/20"
                )}>
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{opme.name}</div>
                    <div className="text-xs text-muted-foreground">{opme.supplier}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {opme.inGuide && <span className="badge-info text-[10px] px-2 py-0.5 rounded-full">Na guia</span>}
                      {!opme.inGuide && <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full">Ausente na guia</span>}
                      {opme.doctorUses && <span className="badge-doctor text-[10px] px-2 py-0.5 rounded-full">Seu médico pede</span>}
                      {opme.isOfensor && <span className="badge-danger text-[10px] px-2 py-0.5 rounded-full">Ofensor</span>}
                      {opme.isGlosado && <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full">Glosa comum</span>}
                      {opme.improvesRent && <span className="badge-success text-[10px] px-2 py-0.5 rounded-full">Melhora rent.</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn(
                      "text-xs font-semibold",
                      opme.impactDelta.startsWith("+") ? "text-success" : opme.impactDelta === "+R$ 0" ? "text-muted-foreground" : "text-destructive"
                    )}>
                      {opme.impactDelta}
                    </span>
                    {!opme.inGuide && (
                      <Button size="sm" variant={isApplied ? "default" : "outline"} onClick={() => toggleOPME(opme.name)}>
                        {isApplied ? "Aplicado" : "Aplicar"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={handleNext} disabled={!selectedProc} className="h-11 px-6">
          Próxima etapa <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepRecommendations;
