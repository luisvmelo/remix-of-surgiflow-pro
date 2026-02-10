import { useState, useEffect } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockExtractedItems, mockLinkedProcedures } from "@/lib/mockData";
import { SuggestedProcedures, HistoricalProcedures } from "./procedures/ProcedureLists";
import ProcedureSearch from "./procedures/ProcedureSearch";
import SmartSelection from "./procedures/SmartSelection";
import GuiaCart from "./procedures/GuiaCart";
import MetricsBar from "./MetricsBar";

const StepUpload = () => {
  const { state, updateState, setStep } = useSurgical();
  const [linkedProcs, setLinkedProcs] = useState<string[]>(state.linkedProcedures);
  const operadoraName = state.operadora?.name || "—";

  const toggleLinked = (code: string) => {
    setLinkedProcs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const applyAll = (codes: string[]) => {
    setLinkedProcs((prev) => {
      const newCodes = codes.filter((c) => !prev.includes(c));
      return [...prev, ...newCodes];
    });
  };

  // Recalculate metrics whenever selected procedures change
  useEffect(() => {
    const selected = mockLinkedProcedures.filter((p) => linkedProcs.includes(p.code));
    const baseRent = 4;
    const rentBonus = selected.reduce((acc, p) => {
      const val = parseInt(p.rentabilityDelta.replace(/[^\d-]/g, "")) || 0;
      return acc + (val > 0 ? 3 : -2);
    }, 0);
    const glossBase = 8;
    const glossDelta = selected.reduce((acc, p) => {
      return acc + (p.isGlosado ? 6 : p.glossRate > 15 ? 3 : -1);
    }, 0);

    updateState({
      rentabilityScore: baseRent + rentBonus,
      glossRisk: Math.max(0, glossBase + glossDelta),
    });
  }, [linkedProcs]);

  const handleNext = () => {
    updateState({
      uploadedFile: "auto",
      extractedItems: mockExtractedItems,
      linkedProcedures: linkedProcs,
      currentStep: 3,
    });
    setStep(3);
  };

  return (
    <div className="flex h-full">
      {/* Left: procedure lists */}
      <div className="flex-1 overflow-y-auto p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground leading-tight">Procedimentos Secundários</h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              Complementares para <strong className="text-foreground">{state.selectedProcedure?.name}</strong>
            </p>
          </div>
          <MetricsBar />
        </div>

        <SmartSelection selectedCodes={linkedProcs} onApplyAll={applyAll} />

        <ProcedureSearch
          selectedCodes={linkedProcs}
          onToggle={toggleLinked}
          operadoraName={operadoraName}
        />

        <SuggestedProcedures
          selectedCodes={linkedProcs}
          onToggle={toggleLinked}
          operadoraName={operadoraName}
        />

        <HistoricalProcedures
          selectedCodes={linkedProcs}
          onToggle={toggleLinked}
          operadoraName={operadoraName}
        />
      </div>

      {/* Right: fixed cart / guia */}
      <GuiaCart
        selectedCodes={linkedProcs}
        onRemove={toggleLinked}
        onNext={handleNext}
      />
    </div>
  );
};

export default StepUpload;
