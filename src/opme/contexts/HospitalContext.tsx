import React, { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HOSPITAL_STORAGE_KEY, REDE_ID } from "@opme/config/produto";
import { HOSPITAIS, NOME_REDE } from "@opme/mock/catalogo";
import { Hospital } from "@opme/types/produto";
import { biGeralProvider } from "@opme/services/biGeralProvider";

interface HospitalContextType {
  hospitalId: string;
  hospital: Hospital | null;
  hospitais: Hospital[];
  nomeRede: string;
  isRede: boolean;
  nomeAtual: string;
  setHospitalId: (id: string) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

function lerHospitalInicial(): string {
  try {
    const salvo = localStorage.getItem(HOSPITAL_STORAGE_KEY);
    if (salvo) return salvo;
    localStorage.setItem(HOSPITAL_STORAGE_KEY, HOSPITAIS[0].id);
  } catch {
    // localStorage indisponível: usa o primeiro hospital
  }
  return HOSPITAIS[0].id;
}

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [hospitalId, setHospitalIdState] = useState<string>(lerHospitalInicial);

  const setHospitalId = (id: string) => {
    try {
      localStorage.setItem(HOSPITAL_STORAGE_KEY, id);
    } catch {
      // segue só em memória
    }
    setHospitalIdState(id);
    // Cada hospital tem sua própria base: descarta os dados em cache do anterior
    biGeralProvider.clearCache();
    queryClient.resetQueries();
  };

  const hospital = HOSPITAIS.find((h) => h.id === hospitalId) ?? null;
  const isRede = hospitalId === REDE_ID;

  return (
    <HospitalContext.Provider
      value={{
        hospitalId,
        hospital,
        hospitais: HOSPITAIS,
        nomeRede: NOME_REDE,
        isRede,
        nomeAtual: isRede ? NOME_REDE : hospital?.nome ?? "",
        setHospitalId,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error("useHospital must be used within a HospitalProvider");
  }
  return context;
};
