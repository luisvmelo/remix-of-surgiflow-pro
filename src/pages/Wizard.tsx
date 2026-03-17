import { useSurgical } from "@/contexts/SurgicalContext";
import WizardSidebar from "@/components/wizard/WizardSidebar";
import StepPatient from "@/components/wizard/StepPatient";
import StepUpload from "@/components/wizard/StepUpload";
import StepItems from "@/components/wizard/StepItems";
import StepDocuments from "@/components/wizard/StepDocuments";
import StepSummary from "@/components/wizard/StepSummary";
import StepPackageReview from "@/components/wizard/StepPackageReview";
import { Activity } from "lucide-react";

const stepComponents = [
  null, // step 0 not rendered here
  StepPatient,
  StepUpload,
  StepItems,
  StepDocuments,
];

const Wizard = () => {
  const { state } = useSurgical();
  const step = state.currentStep;

  if (step === 0) return null;

  // Show package review if flagged (after step 1 confirmation)
  if (state.showPackageReview) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
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
        </header>
        <main className="flex-1 overflow-hidden">
          <div className="animate-fade-in h-full">
            <StepPackageReview />
          </div>
        </main>
      </div>
    );
  }

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
      </header>

      <div className="flex flex-1 overflow-hidden">
        <WizardSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="animate-fade-in h-full">
            {showSummary ? <StepSummary /> : StepComponent && <StepComponent />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wizard;
