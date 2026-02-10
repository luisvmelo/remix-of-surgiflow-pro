import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockExtractedItems } from "@/lib/mockData";
import { SuggestedProcedures, HistoricalProcedures } from "./procedures/ProcedureLists";
import GuiaCart from "./procedures/GuiaCart";

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
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Procedimentos Secundários</h2>
          <p className="text-muted-foreground text-sm">
            Selecione procedimentos complementares para{" "}
            <strong className="text-foreground">{state.selectedProcedure?.name}</strong>
          </p>
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
