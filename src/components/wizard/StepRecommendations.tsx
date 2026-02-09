import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockProcedures, mockLinkedProcedures, mockRecommendedOPMEs } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Plus, Minus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

const StepRecommendations = () => {
  const { state, updateState, setStep } = useSurgical();
  const [selectedProc, setSelectedProc] = useState(state.selectedProcedure);
  const [linkedProcs, setLinkedProcs] = useState<string[]>(state.linkedProcedures);
  const [procSearch, setProcSearch] = useState("");

  const toggleLinked = (code: string) => {
    setLinkedProcs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleNext = () => {
    updateState({
      selectedProcedure: selectedProc,
      linkedProcedures: linkedProcs,
      currentStep: 5,
      rentabilityScore: 24,
      glossRisk: 9,
    });
    setStep(5);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Recomendações e Análises</h2>
        <p className="text-muted-foreground">Otimize rentabilidade e reduza riscos de glosa</p>
      </div>

      {/* Bloco A — Procedimento principal */}
      <section className="glass-card rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" /> Procedimento Principal
        </h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar procedimento..."
            className="pl-10"
            value={procSearch}
            onChange={(e) => setProcSearch(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          {mockProcedures.map((proc) => (
            <button
              key={proc.code}
              onClick={() => setSelectedProc(proc)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-lg text-left text-sm transition-all",
                selectedProc?.code === proc.code
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted border border-transparent"
              )}
            >
              <div>
                <div className="font-medium text-foreground">{proc.name}</div>
                <div className="text-muted-foreground text-xs">{proc.code}</div>
              </div>
              <div className="flex gap-2">
                {proc.doctorUses && <span className="badge-doctor text-xs px-2 py-0.5 rounded-full">Seu médico</span>}
                {proc.common && <span className="badge-info text-xs px-2 py-0.5 rounded-full">Comum</span>}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Bloco B — Procedimentos atrelados */}
      {selectedProc && (
        <section className="glass-card rounded-xl p-6 animate-fade-in">
          <h3 className="font-bold text-foreground mb-4">Procedimentos Atrelados Sugeridos</h3>
          <div className="space-y-3">
            {mockLinkedProcedures.map((lp) => (
              <div
                key={lp.code}
                className={cn(
                  "rounded-lg p-4 border transition-all",
                  linkedProcs.includes(lp.code) ? "border-primary/40 bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-foreground text-sm">{lp.name}</div>
                    <div className="text-xs text-muted-foreground">{lp.code} · {lp.reason}</div>
                  </div>
                  <Button
                    variant={linkedProcs.includes(lp.code) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLinked(lp.code)}
                  >
                    {linkedProcs.includes(lp.code) ? <Minus className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                    {linkedProcs.includes(lp.code) ? "Remover" : "Adicionar"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lp.doctorUses && <span className="badge-doctor text-xs px-2 py-0.5 rounded-full">Seu médico</span>}
                  {lp.isOfensor && <span className="badge-danger text-xs px-2 py-0.5 rounded-full">Ofensor rentabilidade</span>}
                  {lp.isGlosado && <span className="badge-warning text-xs px-2 py-0.5 rounded-full">Comumente glosado</span>}
                  {lp.improvesRent && <span className="badge-success text-xs px-2 py-0.5 rounded-full">Melhora rentabilidade</span>}
                </div>
                <div className="flex gap-6 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-success" /> Aprovação: {lp.approvalRate}%
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-warning" /> Glosa: {lp.glossRate}%
                  </span>
                  <span className={cn("flex items-center gap-1 font-semibold", lp.rentabilityDelta.startsWith("+") ? "text-success" : "text-destructive")}>
                    {lp.rentabilityDelta.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {lp.rentabilityDelta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bloco C — OPMEs */}
      {selectedProc && (
        <section className="glass-card rounded-xl p-6 animate-fade-in">
          <h3 className="font-bold text-foreground mb-4">OPMEs e Itens Recomendados</h3>
          <div className="space-y-3">
            {mockRecommendedOPMEs.map((opme, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-all">
                <div>
                  <div className="font-medium text-foreground text-sm">{opme.name}</div>
                  <div className="text-xs text-muted-foreground">{opme.supplier}</div>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {opme.inGuide && <span className="badge-info text-xs px-2 py-0.5 rounded-full">Na guia</span>}
                    {!opme.inGuide && opme.recommended && <span className="badge-warning text-xs px-2 py-0.5 rounded-full">Ausente na guia</span>}
                    {opme.doctorUses && <span className="badge-doctor text-xs px-2 py-0.5 rounded-full">Seu médico pede</span>}
                    {opme.isOfensor && <span className="badge-danger text-xs px-2 py-0.5 rounded-full">Ofensor</span>}
                    {opme.improvesRent && <span className="badge-success text-xs px-2 py-0.5 rounded-full">Melhora rent.</span>}
                  </div>
                </div>
                {!opme.inGuide && (
                  <Button size="sm" variant="outline">
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!selectedProc} className="h-11 px-6">
          Próxima etapa <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepRecommendations;
