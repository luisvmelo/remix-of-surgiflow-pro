import React, { createContext, useContext, useState } from "react";
import { Escolha, OpcaoPedido } from "@opme/types/produto";
import { useAuth } from "@opme/contexts/AuthContext";

const ESCOLHAS_STORAGE_KEY = "escolhas_compras";

interface EscolhasContextType {
  /** Escolha de Compras por item do pedido (chave = id do item) */
  escolhas: Record<string, Escolha>;
  escolher: (itemId: string, cirurgiaId: string, opcao: OpcaoPedido) => void;
  /** Várias escolhas de uma vez (aceitar todas, aplicar a melhor combinação) */
  escolherVarios: (lista: Array<{ itemId: string; cirurgiaId: string; opcao: OpcaoPedido }>) => void;
  desfazer: (itemId: string) => void;
}

const EscolhasContext = createContext<EscolhasContextType | undefined>(undefined);

function lerEscolhas(): Record<string, Escolha> {
  try {
    const salvo = localStorage.getItem(ESCOLHAS_STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch {
    // localStorage indisponível ou corrompido
  }
  return {};
}

/**
 * Escolhas de Compras na montagem do pedido: para cada item, qual combinação
 * item + fornecedor vai ser comprada. Fora dos 3 fornecedores indicados pelo
 * médico, a escolha fica como proposta até o aval dele.
 */
export const EscolhasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { username } = useAuth();
  const [escolhas, setEscolhas] = useState<Record<string, Escolha>>(lerEscolhas);

  // Atualização funcional: várias escolhas seguidas não se sobrescrevem
  const atualizar = (f: (atual: Record<string, Escolha>) => Record<string, Escolha>) =>
    setEscolhas((atual) => {
      const novas = f(atual);
      try {
        localStorage.setItem(ESCOLHAS_STORAGE_KEY, JSON.stringify(novas));
      } catch {
        // segue só em memória
      }
      return novas;
    });

  const registro = (itemId: string, cirurgiaId: string, opcao: OpcaoPedido): Escolha => ({
    itemId, cirurgiaId, opcaoId: opcao.id, em: new Date().toISOString(), por: username ?? "compras",
  });

  const escolher = (itemId: string, cirurgiaId: string, opcao: OpcaoPedido) =>
    atualizar((atual) => ({ ...atual, [itemId]: registro(itemId, cirurgiaId, opcao) }));

  const escolherVarios = (lista: Array<{ itemId: string; cirurgiaId: string; opcao: OpcaoPedido }>) =>
    atualizar((atual) => ({ ...atual, ...Object.fromEntries(lista.map((e) => [e.itemId, registro(e.itemId, e.cirurgiaId, e.opcao)])) }));

  const desfazer = (itemId: string) =>
    atualizar((atual) => {
      const novas = { ...atual };
      delete novas[itemId];
      return novas;
    });

  return <EscolhasContext.Provider value={{ escolhas, escolher, escolherVarios, desfazer }}>{children}</EscolhasContext.Provider>;
};

export const useEscolhas = () => {
  const context = useContext(EscolhasContext);
  if (context === undefined) {
    throw new Error("useEscolhas must be used within an EscolhasProvider");
  }
  return context;
};
