import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockExtractedItems } from "@/lib/mockData";
import { SuggestedProcedures, HistoricalProcedures } from "./procedures/ProcedureLists";
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
