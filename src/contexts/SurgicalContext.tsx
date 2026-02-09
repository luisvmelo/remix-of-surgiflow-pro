import React, { createContext, useContext, useState, ReactNode } from "react";
import { WizardState, WizardStep, mockDocuments } from "@/lib/mockData";

interface SurgicalContextType {
  state: WizardState;
  setStep: (step: WizardStep) => void;
  updateState: (partial: Partial<WizardState>) => void;
  isLoggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
  stepStatus: (step: WizardStep) => "done" | "active" | "pending" | "error";
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
};

export function SurgicalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);
  const [isLoggedIn, setLoggedIn] = useState(false);

  const setStep = (step: WizardStep) => setState((s) => ({ ...s, currentStep: step }));
  const updateState = (partial: Partial<WizardState>) => setState((s) => ({ ...s, ...partial }));

  const stepStatus = (step: WizardStep): "done" | "active" | "pending" | "error" => {
    if (step === state.currentStep) return "active";
    switch (step) {
      case 0: return state.doctor ? "done" : "pending";
      case 1: return state.patient && state.operadora ? "done" : step < state.currentStep ? "error" : "pending";
      case 2: return state.uploadedFile ? "done" : step < state.currentStep ? "error" : "pending";
      case 3: return state.confirmedItems ? "done" : step < state.currentStep ? "error" : "pending";
      case 4: return state.documents.some(d => d.attached) ? "done" : step < state.currentStep ? "error" : "pending";
      case 5: return step < state.currentStep ? "done" : "pending";
      default: return "pending";
    }
  };

  return (
    <SurgicalContext.Provider value={{ state, setStep, updateState, isLoggedIn, setLoggedIn, stepStatus }}>
      {children}
    </SurgicalContext.Provider>
  );
}

export function useSurgical() {
  const ctx = useContext(SurgicalContext);
  if (!ctx) throw new Error("useSurgical must be used within SurgicalProvider");
  return ctx;
}
