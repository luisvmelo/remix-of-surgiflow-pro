// ============ GESTÃO DE COMPRAS (módulo tático) ============
// Visão do gerente de compras: como cada pedido está e quanto poderia ser. Serve para cobrar o
// comprador ("por que fechou assim? dava para ganhar mais") e ver o que falta cotar, comprar e pedir.

import { Patient } from "@opme/types/patient";
import { Escolha } from "@opme/types/produto";
import { ResumoCirurgia, resumoCirurgia } from "@opme/lib/produto";
import { AnaliseCirurgia, EstadoOtimizador, analisarCirurgia } from "@opme/lib/otimizador";
import { Atraso, ORDEM_ETAPAS, atrasosDaCirurgia } from "@opme/lib/tatico";
import { USUARIO_DEMO } from "@opme/mock/catalogo";

/** Onde o pedido está no fluxo de compras */
export type SituacaoCompra = "a_cotar" | "na_operadora" | "a_comprar" | "aguardando_entrega" | "material_confirmado";

export const LABEL_SITUACAO_COMPRA: Record<SituacaoCompra, string> = {
  a_cotar: "A cotar",
  na_operadora: "Na operadora",
  a_comprar: "A comprar",
  aguardando_entrega: "Aguardando entrega",
  material_confirmado: "Material confirmado",
};

export const DESCRICAO_SITUACAO_COMPRA: Record<SituacaoCompra, string> = {
  a_cotar: "Fornecedores ainda em cotação",
  na_operadora: "Pedido enviado, aguardando autorização",
  a_comprar: "Autorizado, com itens ainda sem compra fechada",
  aguardando_entrega: "Compra fechada, fornecedor não confirmou a entrega",
  material_confirmado: "Compra fechada e entrega confirmada",
};

/** Lentes do gerente: cada uma responde a uma cobrança diferente ao comprador */
export type Lente = "todas" | "na_mesa" | "pode_ganhar" | "margem_baixa" | "risco_glosa" | "nao_homologado";

export const LABEL_LENTE: Record<Lente, string> = {
  todas: "Todos os pedidos",
  na_mesa: "Margem deixada na mesa",
  pode_ganhar: "Ainda pode ganhar",
  margem_baixa: "Margem baixa",
  risco_glosa: "Risco de glosa alto",
  nao_homologado: "Não homologados",
};

/** Margem OPME abaixo deste percentual do valor cobrado é considerada baixa */
export const LIMIAR_MARGEM_BAIXA = 3;
/** Risco de glosa a partir do qual o pedido é alto (mesmo corte do nível "alto") */
export const LIMIAR_RISCO_ALTO = 45;

export const DESCRICAO_LENTE: Record<Lente, string> = {
  todas: "Todas as cirurgias agendadas",
  na_mesa: "Compra fechada abaixo da maior margem entre os fornecedores que o médico indicou",
  pode_ganhar: "Itens ainda abertos com margem a capturar",
  margem_baixa: `Margem OPME negativa ou abaixo de ${LIMIAR_MARGEM_BAIXA}% do valor cobrado`,
  risco_glosa: `Risco de glosa de ${LIMIAR_RISCO_ALTO}% ou mais`,
  nao_homologado: "Item com fornecedor que a operadora não libera",
};

export interface AvaliacaoPedido {
  p: Patient;
  resumo: ResumoCirurgia;
  analise: AnaliseCirurgia;
  situacao: SituacaoCompra;
  atrasos: Atraso[];
  comprador?: string;
  /** Margem com o pedido como está (R$) */
  hoje: number;
  /** Margem se tudo estivesse na maior margem possível (R$) */
  poderia: number;
  /** Itens fechados abaixo da maior margem (R$) */
  naMesa: number;
  /** Itens abertos que ainda podem ganhar (R$) */
  podeGanhar: number;
  /** Margem sobre o valor cobrado de OPME (%) */
  margemPct: number;
  /** Itens com o fornecedor atual não homologado */
  naoHomologados: number;
  lentes: Set<Lente>;
}

export function situacaoCompra(p: Patient, resumo: ResumoCirurgia): SituacaoCompra {
  const idx = ORDEM_ETAPAS.indexOf(p.etapaProcesso ?? "");
  if (idx < 2) return "a_cotar";
  if (idx < 4) return "na_operadora";
  if (resumo.aDefinir > 0) return "a_comprar";
  return p.materialConfirmado ? "material_confirmado" : "aguardando_entrega";
}

export function avaliarPedido(p: Patient, escolhas: Record<string, Escolha>, estado: EstadoOtimizador): AvaliacaoPedido {
  const resumo = resumoCirurgia(p, escolhas);
  const analise = analisarCirurgia(p, escolhas, estado);
  const naMesa = analise.itens.reduce((s, a) => s + a.deixado, 0);
  const podeGanhar = analise.ganho;
  const hoje = resumo.margemAtual;
  const cobrado = analise.itens.reduce((s, a) => s + (a.atual ? a.atual.cobradoUnitario * a.item.quantidade : 0), 0);
  const margemPct = cobrado > 0 ? (hoje / cobrado) * 100 : 0;
  const naoHomologados = analise.itens.filter((a) => a.atual && !a.atual.homologado).length;

  const lentes = new Set<Lente>(["todas"]);
  if (naMesa > 0) lentes.add("na_mesa");
  if (podeGanhar > 0) lentes.add("pode_ganhar");
  if (margemPct < LIMIAR_MARGEM_BAIXA) lentes.add("margem_baixa");
  if (resumo.riscoAtual >= LIMIAR_RISCO_ALTO) lentes.add("risco_glosa");
  if (naoHomologados > 0) lentes.add("nao_homologado");

  return {
    p, resumo, analise,
    situacao: situacaoCompra(p, resumo),
    atrasos: atrasosDaCirurgia(p, escolhas),
    comprador: p.comprador,
    hoje,
    poderia: hoje + naMesa + podeGanhar,
    naMesa,
    podeGanhar,
    margemPct,
    naoHomologados,
    lentes,
  };
}

/** Nome para exibir: escolhas feitas nesta sessão aparecem como o usuário de demonstração */
export const nomeComprador = (por?: string) => (!por ? "—" : por === USUARIO_DEMO.username ? "Compras (demo)" : por);

export interface DesempenhoComprador {
  nome: string;
  pedidos: number;
  itensFechados: number;
  /** Itens fechados na maior margem possível */
  naMaior: number;
  naMesa: number;
  /** Margem a mais que conseguiu sobre o preferido do médico */
  capturado: number;
  /** Itens ainda abertos e que podem ganhar */
  podeGanhar: number;
}

/** Desempenho de cada comprador nos pedidos que ele é responsável */
export function desempenhoPorComprador(avaliacoes: AvaliacaoPedido[]): DesempenhoComprador[] {
  const mapa = new Map<string, DesempenhoComprador>();
  avaliacoes.forEach((av) => {
    const nome = av.comprador ?? "Sem comprador";
    const d = mapa.get(nome) ?? { nome, pedidos: 0, itensFechados: 0, naMaior: 0, naMesa: 0, capturado: 0, podeGanhar: 0 };
    d.pedidos += 1;
    av.analise.itens.forEach((a) => {
      if (a.situacao === "definido" || a.situacao === "aceito") {
        d.itensFechados += 1;
        if (a.deixado === 0) d.naMaior += 1;
        d.naMesa += a.deixado;
        d.capturado += Math.max(0, a.capturado);
      }
    });
    d.podeGanhar += av.podeGanhar;
    mapa.set(nome, d);
  });
  return [...mapa.values()].sort((a, b) => b.naMesa - a.naMesa);
}
