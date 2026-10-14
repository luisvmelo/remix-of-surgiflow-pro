// ============ ACOMPANHAMENTO (módulo tático) ============
// Atrasos de cada cirurgia contra o prazo esperado da etapa e a data da cirurgia.

import { Patient } from "@opme/types/patient";
import { Escolha } from "@opme/types/produto";
import { resumoCirurgia } from "@opme/lib/produto";

export type TipoAtraso = "cotacao" | "autorizacao" | "entrega" | "pedido" | "prazo";

export const LABEL_ATRASO: Record<TipoAtraso, string> = {
  cotacao: "Cotação atrasada",
  autorizacao: "Autorização atrasada",
  entrega: "Entrega de material não confirmada",
  pedido: "Pedido não fechado",
  prazo: "Cirurgia próxima sem autorização",
};

export const DESCRICAO_ATRASO: Record<TipoAtraso, string> = {
  cotacao: "Na cotação há mais tempo que o prazo da etapa",
  autorizacao: "Na operadora há mais tempo que o prazo médio dela",
  entrega: "Fornecedor não confirmou a entrega a 3 dias da cirurgia",
  pedido: "Compras ainda tem itens a definir a 5 dias da cirurgia",
  prazo: "Cirurgia em até 7 dias e o pedido ainda não foi autorizado",
};

export const ORDEM_ETAPAS = [
  "Aguardando Cotação", "Em Cotação", "Aguardando Autorização", "Em Análise", "Autorizado", "Aguardando Realização", "Confirmação",
];

export interface Atraso {
  tipo: TipoAtraso;
  /** Dias além do prazo */
  dias: number;
}

export function atrasosDaCirurgia(p: Patient, escolhas: Record<string, Escolha>): Atraso[] {
  const etapa = p.etapaProcesso ?? "";
  const idx = ORDEM_ETAPAS.indexOf(etapa);
  const naEtapa = p.diasNaEtapa ?? 0;
  const sla = p.slaEtapa ?? 3;
  const dias = p.diasAteCirurgia ?? 99;
  const lista: Atraso[] = [];
  if ((etapa === "Aguardando Cotação" || etapa === "Em Cotação") && naEtapa > sla) lista.push({ tipo: "cotacao", dias: naEtapa - sla });
  if ((etapa === "Aguardando Autorização" || etapa === "Em Análise") && naEtapa > sla) lista.push({ tipo: "autorizacao", dias: naEtapa - sla });
  if (idx >= 4 && !p.materialConfirmado && dias <= 3) lista.push({ tipo: "entrega", dias: 4 - dias });
  if (dias <= 5 && resumoCirurgia(p, escolhas).aDefinir > 0) lista.push({ tipo: "pedido", dias: 6 - dias });
  if (idx >= 0 && idx < 4 && dias <= 7) lista.push({ tipo: "prazo", dias: 8 - dias });
  return lista.sort((a, b) => b.dias - a.dias);
}
