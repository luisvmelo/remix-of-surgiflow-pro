import { createContext, useContext, useState, type ReactNode } from "react";
import { WizardState, WizardStep, mockDocuments, SavedRequest, mockRecommendedOPMEs } from "@/lib/mockData";

interface SurgicalContextType {
  state: WizardState;
  setStep: (step: WizardStep) => void;
  updateState: (partial: Partial<WizardState>) => void;
  isLoggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
  stepStatus: (step: WizardStep) => "done" | "active" | "pending" | "error";
  savedRequests: SavedRequest[];
  saveRequest: (status: "draft" | "awaiting-auth") => void;
  resetWizard: () => void;
}

const SurgicalContext = createContext<SurgicalContextType | null>(null);

const initialState: WizardState = {
  currentStep: 0,
  doctor: null,
  patient: null,
  operadora: null,
  uploadedFile: null,
  extractedItems: [],
  confirmedItems: false,
  selectedProcedure: null,
  linkedProcedures: [],
  documents: mockDocuments,
  rentabilityScore: 0,
  glossRisk: 0,
  historicalPercentile: 0,
  bestPossible: 0,
  showPackageReview: false,
};

export function SurgicalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);

  const setStep = (step: WizardStep) => setState((s) => ({ ...s, currentStep: step }));
  const updateState = (partial: Partial<WizardState>) => setState((s) => ({ ...s, ...partial }));

  const resetWizard = () => {
    setState((s) => ({
      ...initialState,
      doctor: s.doctor,
      currentStep: 1,
    }));
  };

  const saveRequest = (status: "draft" | "awaiting-auth") => {
    const missingRequired = state.documents.filter(d => d.required && !d.attached);
    const hasOffenders = state.extractedItems.some(item => {
      const nameLower = item.name.toLowerCase();
      const matched = mockRecommendedOPMEs.find(o => {
        const oW = o.name.toLowerCase().split(/\s+/);
        const iW = nameLower.split(/\s+/);
        return o.name.toLowerCase() === nameLower || oW.filter(w => iW.some(iw => iw.includes(w) || w.includes(iw))).length >= 2;
      });
      return matched && (matched.isOfensor);
    });
    const hasGlossRisk = state.extractedItems.some(item => {
      const nameLower = item.name.toLowerCase();
      const matched = mockRecommendedOPMEs.find(o => {
        const oW = o.name.toLowerCase().split(/\s+/);
        const iW = nameLower.split(/\s+/);
        return o.name.toLowerCase() === nameLower || oW.filter(w => iW.some(iw => iw.includes(w) || w.includes(iw))).length >= 2;
      });
      return matched && matched.isGlosado;
    });

    const finalStatus = status === "draft" ? "draft" as const :
      missingRequired.length > 0 ? "docs-pending" as const : "awaiting-auth" as const;

    const statusLabels = {
      "draft": "Rascunho",
      "awaiting-auth": "Aguardando Autorização",
      "docs-pending": "Documentos Pendentes",
    };

    const newRequest: SavedRequest = {
      id: `req-${Date.now()}`,
      patient: state.patient?.name || "—",
      operadora: state.operadora?.name || "—",
      procedure: state.selectedProcedure?.name || "—",
      code: state.selectedProcedure?.code || "—",
      doctor: state.doctor?.name || "—",
      date: new Date().toISOString().split("T")[0],
      itemCount: state.extractedItems.length,
      status: finalStatus,
      statusLabel: statusLabels[finalStatus],
      missingDocs: missingRequired.length,
      hasOffenders,
      hasGlossRisk,
    };

    setSavedRequests(prev => [newRequest, ...prev]);
  };

  const stepStatus = (step: WizardStep): "done" | "active" | "pending" | "error" => {
    if (step === state.currentStep) return "active";
    switch (step) {
      case 0: return state.doctor ? "done" : "pending";
      case 1: return state.patient && state.operadora && state.selectedProcedure ? "done" : step < state.currentStep ? "error" : "pending";
      case 2: return state.uploadedFile ? "done" : step < state.currentStep ? "error" : "pending";
      case 3: return state.confirmedItems ? "done" : step < state.currentStep ? "error" : "pending";
      case 4: return state.documents.some(d => d.attached) ? "done" : step < state.currentStep ? "error" : "pending";
      case 5: return step < state.currentStep ? "done" : "pending";
      default: return "pending";
    }
  };

  return (
    <SurgicalContext.Provider value={{ state, setStep, updateState, isLoggedIn, setLoggedIn, stepStatus, savedRequests, saveRequest, resetWizard }}>
      {children}
    </SurgicalContext.Provider>
  );
}

export function useSurgical() {
  const ctx = useContext(SurgicalContext);
  if (!ctx) throw new Error("useSurgical must be used within SurgicalProvider");
  return ctx;
}

