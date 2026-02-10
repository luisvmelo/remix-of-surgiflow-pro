import { useSurgical } from "@/contexts/SurgicalContext";
import { WizardStep } from "@/lib/mockData";
import { Check, AlertCircle, User, Upload, Package, FileCheck, FileText, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const steps: { label: string; icon: React.ElementType; step: WizardStep }[] = [
  { label: "Paciente e Cirurgia", icon: User, step: 1 },
  { label: "Proc. Secundários", icon: Upload, step: 2 },
  { label: "Itens OPME", icon: Package, step: 3 },
  { label: "Documentos", icon: FileText, step: 4 },
];

const WizardSidebar = () => {
  const { state, setStep, stepStatus } = useSurgical();

  const canNavigate = (step: WizardStep) => {
    return step <= state.currentStep || stepStatus(step) === "done";
  };

  return (
    <aside className="w-64 bg-card border-r shrink-0 p-4 hidden md:block">
      <nav className="space-y-1">
        {steps.map(({ label, icon: Icon, step }) => {
          const status = stepStatus(step);
          const active = state.currentStep === step;
          const navigable = canNavigate(step);

          return (
            <button
              key={step}
              onClick={() => navigable && setStep(step)}
              disabled={!navigable}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all text-left",
                active && "bg-primary/10 text-primary",
                !active && navigable && "text-foreground hover:bg-muted",
                !navigable && "text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                  status === "done" && "bg-success text-success-foreground",
                  status === "active" && "bg-primary text-primary-foreground",
                  status === "error" && "bg-destructive text-destructive-foreground",
                  status === "pending" && "bg-muted text-muted-foreground"
                )}
              >
                {status === "done" ? (
                  <Check className="w-4 h-4" />
                ) : status === "error" ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span>{label}</span>
            </button>
          );
        })}
        {/* Summary */}
        <button
          onClick={() => state.currentStep >= 5 && setStep(5 as WizardStep)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all text-left mt-4 border-t pt-4",
            state.currentStep >= 5 ? "text-foreground hover:bg-muted" : "text-muted-foreground/50 cursor-not-allowed"
          )}
          disabled={state.currentStep < 5}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            state.currentStep >= 5 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <ClipboardList className="w-4 h-4" />
          </div>
          <span>Resumo Final</span>
        </button>
      </nav>
    </aside>
  );
};

export default WizardSidebar;
