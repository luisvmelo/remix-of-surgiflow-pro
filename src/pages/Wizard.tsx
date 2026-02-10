import { useSurgical } from "@/contexts/SurgicalContext";
import WizardSidebar from "@/components/wizard/WizardSidebar";
import MetricsBar from "@/components/wizard/MetricsBar";
import StepPatient from "@/components/wizard/StepPatient";
import StepUpload from "@/components/wizard/StepUpload";
import StepConference from "@/components/wizard/StepConference";
import StepDocuments from "@/components/wizard/StepDocuments";
import StepSummary from "@/components/wizard/StepSummary";
import { Activity } from "lucide-react";

const stepComponents = [
  null, // step 0 not rendered here
  StepPatient,
  StepUpload,
  StepConference,
  StepDocuments,
];

const Wizard = () => {
  const { state } = useSurgical();
  const step = state.currentStep;

  if (step === 0) return null;

  const StepComponent = step <= 4 ? stepComponents[step] : null;
  const showSummary = step > 4;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">SolicitaCirurg</span>
          {state.doctor && (
            <span className="text-sm text-muted-foreground ml-2">
              · {state.doctor.name}
            </span>
          )}
        </div>
        {/* metrics bar moved below */}
      </header>

      {state.currentStep >= 2 && <MetricsBar />}

      <div className="flex flex-1 overflow-hidden">
        <WizardSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            {showSummary ? <StepSummary /> : StepComponent && <StepComponent />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wizard;
