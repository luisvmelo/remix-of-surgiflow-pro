// ============================================================
// CONSULTORIA — histórico, médicos e recomendações (mock).
// Valores em R$ por mês. Margem e complementar são recalculados
// com a configuração atual do hospital, como no resto do sistema.
// ============================================================

import { catalogoMatMed, type HospitalConfig } from "./remuneracao";

export interface MesHistorico {
  mes: string;
  cirurgias: number;
  /** Ganho bruto do hospital por faixa de MatMed e por procedimentos secundários. */
  ganhoA: number;
  ganhoB: number;
  ganhoC: number;
  ganhoProcedimentos: number;
  /** Honorário base pago pelas operadoras aos médicos. */
  honorarioBase: number;
  glosa: number;
}

export const historico: MesHistorico[] = [
  { mes: "Abr", cirurgias: 38, ganhoA: 9200, ganhoB: 4100, ganhoC: 14800, ganhoProcedimentos: 11800, honorarioBase: 412000, glosa: 11.2 },
  { mes: "Mai", cirurgias: 41, ganhoA: 9800, ganhoB: 4300, ganhoC: 15200, ganhoProcedimentos: 12600, honorarioBase: 438000, glosa: 10.8 },
  { mes: "Jun", cirurgias: 39, ganhoA: 10400, ganhoB: 4000, ganhoC: 13900, ganhoProcedimentos: 12100, honorarioBase: 421000, glosa: 10.1 },
  { mes: "Jul", cirurgias: 44, ganhoA: 11900, ganhoB: 4600, ganhoC: 14100, ganhoProcedimentos: 13900, honorarioBase: 476000, glosa: 9.6 },
  { mes: "Ago", cirurgias: 46, ganhoA: 12600, ganhoB: 4900, ganhoC: 13300, ganhoProcedimentos: 14800, honorarioBase: 497000, glosa: 10.4 },
  { mes: "Set", cirurgias: 48, ganhoA: 13800, ganhoB: 5200, ganhoC: 12800, ganhoProcedimentos: 16100, honorarioBase: 521000, glosa: 8.7 },
];

export const mesReferencia = "setembro de 2026";

export const resultadoMes = (m: MesHistorico, cfg: HospitalConfig) => {
  const p = cfg.rentabilidadeHabilitada ? cfg.proporcaoMedico / 100 : 0;
  const complementar = Math.round(
    p * (m.ganhoA * cfg.fatorFaixa.A + m.ganhoB * cfg.fatorFaixa.B + m.ganhoC * cfg.fatorFaixa.C) / 100,
  );
  const bruto = m.ganhoA + m.ganhoB + m.ganhoC + m.ganhoProcedimentos;
  return {
    mes: m.mes,
    cirurgias: m.cirurgias,
    complementar,
    margem: bruto - complementar,
    honorarios: m.honorarioBase + complementar,
    glosa: m.glosa,
  };
};

// ── Médicos ──────────────────────────────────────────────────────
export type StatusMedico = "referencia" | "oportunidade" | "atencao" | "estavel";

export interface MedicoConsultoria {
  id: string;
  nome: string;
  especialidade: string;
  cirurgias: number;          // últimos 6 meses
  honorarioMedio: number;     // por cirurgia
  margemGerada: number;       // para o hospital, 6 meses
  glosa: number;              // %
  faixas: { A: number; B: number; C: number }; // % dos itens
  status: StatusMedico;
  resumo: string;
  pontos: string[];
  oportunidade: { texto: string; valorMes: number };
}

export const medicos: MedicoConsultoria[] = [
  {
    id: "1", nome: "Dr. Ricardo Almeida", especialidade: "Ortopedia",
    cirurgias: 92, honorarioMedio: 13900, margemGerada: 21400, glosa: 12,
    faixas: { A: 58, B: 14, C: 28 }, status: "oportunidade",
    resumo: "Maior volume do hospital, mas 28% dos itens fora da padronização.",
    pontos: [
      "Usa Âncora Bio-Compósita e Implante de Titânio (faixa C, dão prejuízo) com frequência",
      "Glosa acima da média em Hapvida, puxada pela Lâmina Shaver Agressiva",
    ],
    oportunidade: { texto: "Migrar âncoras e implantes para PEEK (faixa A)", valorMes: 3900 },
  },
  {
    id: "7", nome: "Dr. André Lopes", especialidade: "Ortopedia",
    cirurgias: 61, honorarioMedio: 6200, margemGerada: 15800, glosa: 5,
    faixas: { A: 91, B: 7, C: 2 }, status: "referencia",
    resumo: "Referência em padronização e a menor glosa do hospital.",
    pontos: [
      "Atende muitos planos de baixa remuneração — honorário médio mais baixo",
      "Bom candidato para apresentar o modelo de complementar aos colegas",
    ],
    oportunidade: { texto: "Nenhuma ação necessária — manter acompanhamento", valorMes: 0 },
  },
  {
    id: "2", nome: "Dra. Marina Santos", especialidade: "Cirurgia Geral",
    cirurgias: 48, honorarioMedio: 7400, margemGerada: 9600, glosa: 9,
    faixas: { A: 74, B: 18, C: 8 }, status: "oportunidade",
    resumo: "Deixa de incluir procedimentos secundários em 35% das guias.",
    pontos: [
      "Procedimentos secundários indicados ficam de fora com frequência",
      "Adesão à padronização boa e estável",
    ],
    oportunidade: { texto: "Incluir secundários indicados (ganho para os dois lados)", valorMes: 1400 },
  },
  {
    id: "3", nome: "Dr. Paulo Mendes", especialidade: "Neurocirurgia",
    cirurgias: 27, honorarioMedio: 18600, margemGerada: 12900, glosa: 17,
    faixas: { A: 66, B: 20, C: 14 }, status: "atencao",
    resumo: "Glosa de 17%, quase o dobro da média — principalmente por documentação.",
    pontos: [
      "Relatório médico incompleto é a causa mais comum de glosa",
      "Ticket alto: cada glosa evitada pesa bastante",
    ],
    oportunidade: { texto: "Checklist de documentos antes do envio", valorMes: 2100 },
  },
  {
    id: "5", nome: "Dr. Fernando Costa", especialidade: "Urologia",
    cirurgias: 34, honorarioMedio: 8100, margemGerada: 7200, glosa: 7,
    faixas: { A: 80, B: 12, C: 8 }, status: "estavel",
    resumo: "Resultados estáveis, sem desvios relevantes.",
    pontos: ["Indicadores dentro da média em todos os critérios"],
    oportunidade: { texto: "Nenhuma ação imediata", valorMes: 0 },
  },
];

// ── Recomendações ────────────────────────────────────────────────
export type Beneficiario = "hospital" | "medico" | "ambos";

export interface Recomendacao {
  id: string;
  titulo: string;
  vimos: string;
  fazer: string;
  hospitalMes: number;
  medicoMes: number;
  beneficiario: Beneficiario;
}

const brlCurto = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

export const gerarRecomendacoes = (cfg: HospitalConfig): Recomendacao[] => {
  const p = cfg.rentabilidadeHabilitada ? cfg.proporcaoMedico / 100 : 0;
  const compA = (ganho: number) => ganho * p * (cfg.fatorFaixa.A / 100);

  // Troca de itens que dão prejuízo (faixa C) pelos equivalentes PEEK (faixa A)
  const ancora = { de: catalogoMatMed["Âncora Bio-Compósita 5.5mm"].ganho, para: catalogoMatMed["Âncora PEEK 5.5mm"].ganho, porMes: 12 };
  const implante = { de: catalogoMatMed["Implante Interferencial Titânio 7x23"].ganho, para: catalogoMatMed["Implante Interferencial PEEK 7x23"].ganho, porMes: 4 };
  const trocaHospital = [ancora, implante].reduce((a, t) => a + t.porMes * (t.para - compA(t.para) - t.de), 0);
  const trocaMedico = [ancora, implante].reduce((a, t) => a + t.porMes * compA(t.para), 0);

  // Custo de subir a proporção em 10 pontos, com base no último mês
  const ultimo = historico[historico.length - 1];
  const baseFaixas = (ultimo.ganhoA * cfg.fatorFaixa.A + ultimo.ganhoB * cfg.fatorFaixa.B + ultimo.ganhoC * cfg.fatorFaixa.C) / 100;
  const custoMais10 = Math.round(baseFaixas * 0.1);
  const novaProporcao = Math.min(60, cfg.proporcaoMedico + 10);

  const recs: Recomendacao[] = [
    {
      id: "secundarios",
      titulo: "Procedimentos secundários ficando de fora",
      vimos: "A condroplastia ficou fora de 31% das artroscopias de joelho em que era indicada — 14 casos em 6 meses.",
      fazer: "Manter a sugestão automática no wizard e alertar as secretárias quando um secundário indicado não for incluído.",
      hospitalMes: 1910,
      medicoMes: 7470,
      beneficiario: "ambos",
    },
    {
      id: "troca-peek",
      titulo: "Itens que dão prejuízo ainda em uso",
      vimos: "Âncora Bio-Compósita e Implante de Titânio (faixa C) aparecem em cerca de 10 guias por mês e geram prejuízo ao hospital.",
      fazer: "Padronizar os equivalentes em PEEK (faixa A). O médico passa a receber complementar e o hospital deixa de perder.",
      hospitalMes: Math.round(trocaHospital),
      medicoMes: Math.round(trocaMedico),
      beneficiario: trocaMedico > 0 ? "ambos" : "hospital",
    },
    {
      id: "glosa-hapvida",
      titulo: "Glosa concentrada em uma operadora",
      vimos: "A Hapvida glosa 18% das guias, contra 8,7% da média. 60% dessas glosas vêm da Lâmina Shaver Agressiva.",
      fazer: "Substituir a lâmina nas guias Hapvida ou anexar justificativa clínica padrão quando ela for indispensável.",
      hospitalMes: 2300,
      medicoMes: 0,
      beneficiario: "hospital",
    },
    {
      id: "plano-baixo",
      titulo: "Plano que paga pouco derruba a margem",
      vimos: "LCA pelo Hapvida Básico tem margem 40% abaixo da média do procedimento, e o honorário do médico é de R$ 2.400.",
      fazer: "Renegociar o pacote de LCA com a Hapvida ou definir um kit de OPME específico para planos básicos.",
      hospitalMes: 1500,
      medicoMes: 0,
      beneficiario: "hospital",
    },
  ];

  if (cfg.rentabilidadeHabilitada && cfg.proporcaoMedico < 60) {
    recs.push({
      id: "proporcao",
      titulo: `Proporção do médico: manter em ${cfg.proporcaoMedico}% por enquanto`,
      vimos: `Subir para ${novaProporcao}% custaria cerca de ${brlCurto(custoMais10)} por mês ao hospital, sem garantia de mais adesão.`,
      fazer: "Medir o efeito das ações acima por 2 meses antes de mexer na proporção. Reavaliar se a adesão à faixa A não passar de 75%.",
      hospitalMes: 0,
      medicoMes: 0,
      beneficiario: "hospital",
    });
  }

  return recs.sort((a, b) => b.hospitalMes + b.medicoMes - (a.hospitalMes + a.medicoMes));
};
