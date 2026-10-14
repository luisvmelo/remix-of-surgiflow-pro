// ============================================================
// DOMÍNIO — store compartilhado entre todos os perfis
// Salvo no localStorage do navegador (o protótipo não tem banco).
// ============================================================

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { DOMINIO_SEMENTE, PEDIDOS_SEMENTE } from "./dados";
import type { ContratoMedico, ContratoOperadora, Dominio, Padrao, Pedido, StatusPedido } from "./tipos";

export const CHAVE_STORAGE = "solicitacirurg.dominio.v1";

interface Estado {
  padroes: Dominio["padroes"];
  contratosMedico: ContratoMedico[];
  contratosOperadora: ContratoOperadora[];
  pedidos: Pedido[];
}

const SEMENTE: Estado = {
  padroes: DOMINIO_SEMENTE.padroes,
  contratosMedico: DOMINIO_SEMENTE.contratosMedico,
  contratosOperadora: DOMINIO_SEMENTE.contratosOperadora,
  pedidos: PEDIDOS_SEMENTE,
};

function carregar(): Estado {
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (!salvo) return SEMENTE;
    const dados = JSON.parse(salvo) as Partial<Estado>;
    if (!dados || !Array.isArray(dados.pedidos) || typeof dados.padroes !== "object") return SEMENTE;
    return { ...SEMENTE, ...dados } as Estado;
  } catch {
    return SEMENTE;
  }
}

const hojeIso = () => new Date().toISOString().slice(0, 10);
const novoId = (prefixo: string) => `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

type Acao =
  | { tipo: "criar"; pedido: Pedido }
  | { tipo: "atualizar"; id: string; parcial: Partial<Pedido> }
  | { tipo: "pedirAjuste"; id: string; motivo: string; itemId?: string }
  | { tipo: "resolverAjustes"; id: string }
  | { tipo: "aceitarForaPadrao"; id: string; motivo: string }
  | { tipo: "salvarPadrao"; padrao: Padrao }
  | { tipo: "sugestao"; procedimentoId: string; sugestaoId: string; aceitar: boolean }
  | { tipo: "contratoMedico"; contrato: ContratoMedico }
  | { tipo: "contratoOperadora"; contrato: ContratoOperadora }
  | { tipo: "resetar" };

const mapPedido = (e: Estado, id: string, f: (p: Pedido) => Pedido): Estado => ({
  ...e,
  pedidos: e.pedidos.map((p) => (p.id === id ? f(p) : p)),
});

function reducer(e: Estado, a: Acao): Estado {
  switch (a.tipo) {
    case "criar":
      return { ...e, pedidos: [a.pedido, ...e.pedidos] };
    case "atualizar":
      return mapPedido(e, a.id, (p) => ({ ...p, ...a.parcial }));
    case "pedirAjuste":
      return mapPedido(e, a.id, (p) => ({
        ...p,
        status: "esperando_confirmacao",
        ajustes: [...p.ajustes, { id: novoId("aj"), motivo: a.motivo, itemId: a.itemId, resolvido: false }],
      }));
    case "resolverAjustes":
      return mapPedido(e, a.id, (p) => ({ ...p, ajustes: p.ajustes.map((x) => ({ ...x, resolvido: true })) }));
    case "aceitarForaPadrao":
      return mapPedido(e, a.id, (p) => ({ ...p, aceitoForaPadrao: { motivo: a.motivo } }));
    case "salvarPadrao":
      return { ...e, padroes: { ...e.padroes, [a.padrao.procedimentoId]: a.padrao } };
    case "sugestao": {
      const padrao = e.padroes[a.procedimentoId];
      const sug = padrao?.sugestoes.find((s) => s.id === a.sugestaoId);
      if (!padrao || !sug) return e;
      const sugestoes = padrao.sugestoes.filter((s) => s.id !== a.sugestaoId);
      if (!a.aceitar) return { ...e, padroes: { ...e.padroes, [a.procedimentoId]: { ...padrao, sugestoes } } };
      const troca = (lista: string[]) => {
        const sem = sug.de ? lista.filter((x) => x !== sug.de) : lista;
        return sem.includes(sug.para) ? sem : [...sem, sug.para];
      };
      const itens = padrao.itens.some((i) => i.itemId === sug.itemId)
        ? padrao.itens.map((i) =>
            i.itemId === sug.itemId
              ? { ...i, aceitas: troca(i.aceitas), preferenciais: sug.de && i.preferenciais.includes(sug.de) ? troca(i.preferenciais) : i.preferenciais }
              : i)
        : [...padrao.itens, { itemId: sug.itemId, qtdTipica: 1, aceitas: [sug.para], preferenciais: [sug.para] }];
      const versao = padrao.versao + 1;
      const novo: Padrao = {
        ...padrao,
        itens,
        sugestoes,
        versao,
        status: "vigente",
        aprovadoEm: hojeIso(),
        historico: [...padrao.historico, { versao, data: hojeIso(), mudanca: sug.titulo }],
      };
      return { ...e, padroes: { ...e.padroes, [a.procedimentoId]: novo } };
    }
    case "contratoMedico":
      return { ...e, contratosMedico: [...e.contratosMedico.filter((c) => c.medicoId !== a.contrato.medicoId), a.contrato] };
    case "contratoOperadora":
      return {
        ...e,
        contratosOperadora: [
          ...e.contratosOperadora.filter((c) => !(c.operadoraId === a.contrato.operadoraId && c.procedimentoId === a.contrato.procedimentoId)),
          a.contrato,
        ],
      };
    case "resetar":
      return SEMENTE;
  }
}

export type NovoPedido = Omit<Pedido, "id" | "status" | "ajustes" | "criadoEm"> & Partial<Pick<Pedido, "status">>;

interface DominioCtx {
  dominio: Dominio;
  pedidos: Pedido[];
  criarPedido: (p: NovoPedido) => string;
  atualizarPedido: (id: string, parcial: Partial<Pedido>) => void;
  mudarStatus: (id: string, status: StatusPedido) => void;
  pedirAjuste: (id: string, motivo: string, itemId?: string) => void;
  resolverAjustes: (id: string) => void;
  aceitarForaPadrao: (id: string, motivo: string) => void;
  salvarPadrao: (padrao: Padrao) => void;
  aceitarSugestao: (procedimentoId: string, sugestaoId: string) => void;
  recusarSugestao: (procedimentoId: string, sugestaoId: string) => void;
  salvarContratoMedico: (c: ContratoMedico) => void;
  salvarContratoOperadora: (c: ContratoOperadora) => void;
  resetar: () => void;
}

const Ctx = createContext<DominioCtx | null>(null);

export function DominioProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, undefined, carregar);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
    } catch {
      // Sem storage (aba privada etc.): os dados valem só nesta sessão.
    }
  }, [estado]);

  const valor = useMemo<DominioCtx>(() => ({
    dominio: { ...DOMINIO_SEMENTE, padroes: estado.padroes, contratosMedico: estado.contratosMedico, contratosOperadora: estado.contratosOperadora },
    pedidos: estado.pedidos,
    criarPedido: (p) => {
      const id = novoId("ped");
      dispatch({ tipo: "criar", pedido: { ...p, id, status: p.status ?? "rascunho", ajustes: [], criadoEm: hojeIso() } });
      return id;
    },
    atualizarPedido: (id, parcial) => dispatch({ tipo: "atualizar", id, parcial }),
    mudarStatus: (id, status) => dispatch({ tipo: "atualizar", id, parcial: { status } }),
    pedirAjuste: (id, motivo, itemId) => dispatch({ tipo: "pedirAjuste", id, motivo, itemId }),
    resolverAjustes: (id) => dispatch({ tipo: "resolverAjustes", id }),
    aceitarForaPadrao: (id, motivo) => dispatch({ tipo: "aceitarForaPadrao", id, motivo }),
    salvarPadrao: (padrao) => dispatch({ tipo: "salvarPadrao", padrao }),
    aceitarSugestao: (procedimentoId, sugestaoId) => dispatch({ tipo: "sugestao", procedimentoId, sugestaoId, aceitar: true }),
    recusarSugestao: (procedimentoId, sugestaoId) => dispatch({ tipo: "sugestao", procedimentoId, sugestaoId, aceitar: false }),
    salvarContratoMedico: (contrato) => dispatch({ tipo: "contratoMedico", contrato }),
    salvarContratoOperadora: (contrato) => dispatch({ tipo: "contratoOperadora", contrato }),
    resetar: () => dispatch({ tipo: "resetar" }),
  }), [estado]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useDominio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDominio precisa estar dentro de DominioProvider");
  return ctx;
}
