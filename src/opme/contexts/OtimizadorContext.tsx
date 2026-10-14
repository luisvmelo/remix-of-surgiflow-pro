import React, { createContext, useContext, useState } from "react";
import { Patient } from "@opme/types/patient";
import { Escolha } from "@opme/types/produto";
import { EstadoOtimizador, gerarRodada } from "@opme/lib/otimizador";

const OTIMIZADOR_STORAGE_KEY = "otimizador_compras";

interface OtimizadorContextType {
  estado: EstadoOtimizador;
  otimizar: (patients: Patient[], escolhas: Record<string, Escolha>) => void;
  recusar: (itemId: string, opcaoId: string, motivo: string) => void;
  remover: (itemId: string, justificativa: string) => void;
  /** Descarta as sugestões pendentes da rodada (o que já foi aceito continua no pedido) */
  cancelar: () => void;
}

const VAZIO: EstadoOtimizador = { rodada: null, recusas: {}, removidos: {} };

function lerEstado(): EstadoOtimizador {
  try {
    const salvo = localStorage.getItem(OTIMIZADOR_STORAGE_KEY);
    if (salvo) return { ...VAZIO, ...JSON.parse(salvo) };
  } catch {
    // localStorage indisponível ou corrompido
  }
  return VAZIO;
}

const OtimizadorContext = createContext<OtimizadorContextType | undefined>(undefined);

/** Rodadas do "Otimizar tudo" e as recusas/remoções de Compras (a próxima rodada parte delas) */
export const OtimizadorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estado, setEstado] = useState<EstadoOtimizador>(lerEstado);

  const atualizar = (f: (atual: EstadoOtimizador) => EstadoOtimizador) =>
    setEstado((atual) => {
      const novo = f(atual);
      try {
        localStorage.setItem(OTIMIZADOR_STORAGE_KEY, JSON.stringify(novo));
      } catch {
        // segue só em memória
      }
      return novo;
    });

  const otimizar = (patients: Patient[], escolhas: Record<string, Escolha>) =>
    atualizar((atual) => ({ ...atual, rodada: gerarRodada(patients, escolhas, atual) }));

  const recusar = (itemId: string, opcaoId: string, motivo: string) =>
    atualizar((atual) => ({
      ...atual,
      recusas: { ...atual.recusas, [itemId]: [...(atual.recusas[itemId] ?? []), { opcaoId, motivo, em: new Date().toISOString() }] },
    }));

  const remover = (itemId: string, justificativa: string) =>
    atualizar((atual) => ({ ...atual, removidos: { ...atual.removidos, [itemId]: justificativa } }));

  const cancelar = () => atualizar((atual) => ({ ...atual, rodada: null }));

  return <OtimizadorContext.Provider value={{ estado, otimizar, recusar, remover, cancelar }}>{children}</OtimizadorContext.Provider>;
};

export const useOtimizador = () => {
  const context = useContext(OtimizadorContext);
  if (context === undefined) {
    throw new Error("useOtimizador must be used within an OtimizadorProvider");
  }
  return context;
};
