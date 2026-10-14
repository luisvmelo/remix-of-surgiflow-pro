// ============================================================
// DOMÍNIO — dados de exemplo (sem banco de dados)
// ============================================================

import type {
  ConfigHospital, ContratoMedico, ContratoOperadora, Dominio, Hospital, ItemCatalogo, ItemPadrao, Marca, Medico,
  NivelPlano, Operadora, Padrao, Pedido, Procedimento,
} from "./tipos";
import { pedidoSugerido, compraRapida } from "./motor";

const TODAS = ["1", "2", "3", "4", "5", "6"];
const SEM_HAPVIDA = ["1", "2", "3", "4", "5"];

export const HOSPITAIS: Hospital[] = [
  {
    id: "rhp", nome: "Real Hospital Português", cidade: "Recife, PE", erp: "MV Soul", implantacao: "2026-04-01",
    fontes: [
      { tabela: "Avisos e cirurgias (MV Soul)", periodo: "abr–set/2026", registros: 1284 },
      { tabela: "Itens de OPME consumidos", periodo: "abr–set/2026", registros: 9812 },
      { tabela: "Contas e glosas", periodo: "abr–set/2026", registros: 3420 },
      { tabela: "Contratos com operadoras", periodo: "vigentes", registros: 18 },
      { tabela: "Contratos médico–hospital", periodo: "vigentes", registros: 46 },
    ],
  },
  {
    id: "scmr", nome: "Santa Casa de Misericórdia do Recife", cidade: "Recife, PE", erp: "Tasy", implantacao: "2026-09-01",
    fontes: [{ tabela: "Avisos e cirurgias (Tasy)", periodo: "mar–ago/2026", registros: 812 }],
  },
  {
    id: "sjr", nome: "Hospital Santa Joana Recife", cidade: "Recife, PE", erp: "MV Soul", implantacao: "2026-07-15",
    fontes: [{ tabela: "Avisos e cirurgias (MV Soul)", periodo: "jan–jun/2026", registros: 1530 }],
  },
];

export const MEDICOS: Medico[] = [
  { id: "1", nome: "Dr. Ricardo Almeida", especialidade: "Ortopedia e coluna", crm: "CRM/PE 12345" },
  { id: "2", nome: "Dra. Marina Santos", especialidade: "Cirurgia geral", crm: "CRM/PE 67890" },
  { id: "3", nome: "Dr. Paulo Mendes", especialidade: "Neurocirurgia", crm: "CRM/PE 11223" },
  { id: "4", nome: "Dra. Carla Ribeiro", especialidade: "Cardiologia intervencionista", crm: "CRM/PE 44556" },
  { id: "7", nome: "Dr. André Lopes", especialidade: "Ortopedia", crm: "CRM/PE 55667" },
];

export const OPERADORAS: Operadora[] = [
  { id: "1", nome: "Unimed", fatorPlano: { Básico: 0.4, Especial: 0.65, Executivo: 1 }, prazoPagamentoDias: 45 },
  { id: "2", nome: "Bradesco Saúde", fatorPlano: { Básico: 0.45, Especial: 0.7, Executivo: 0.95 }, prazoPagamentoDias: 60 },
  { id: "3", nome: "Amil", fatorPlano: { Básico: 0.35, Especial: 0.55, Executivo: 0.85 }, prazoPagamentoDias: 50 },
  { id: "4", nome: "SulAmérica", fatorPlano: { Básico: 0.45, Especial: 0.75, Executivo: 1 }, prazoPagamentoDias: 40 },
  { id: "5", nome: "Porto Seguro Saúde", fatorPlano: { Básico: 0.4, Especial: 0.65, Executivo: 0.9 }, prazoPagamentoDias: 55 },
  { id: "6", nome: "Hapvida NotreDame", fatorPlano: { Básico: 0.15, Especial: 0.2, Executivo: 0.28 }, prazoPagamentoDias: 75 },
];

export const PROCEDIMENTOS: Procedimento[] = [
  { id: "artroscopia-joelho", codigo: "30725119", nome: "Artroscopia de joelho — meniscectomia", linha: "ortopedia", honorarioReferencia: 14000, volumeMes: 22, tempoCirurgiaMin: 70 },
  { id: "lca", codigo: "30725097", nome: "Reconstrução de LCA", linha: "ortopedia", honorarioReferencia: 16000, volumeMes: 9, tempoCirurgiaMin: 110 },
  { id: "ombro", codigo: "30725038", nome: "Artroscopia de ombro — reparo do manguito", linha: "ortopedia", honorarioReferencia: 13000, volumeMes: 7, tempoCirurgiaMin: 120 },
  { id: "quadril", codigo: "30725060", nome: "Artroplastia total de quadril", linha: "ortopedia", honorarioReferencia: 18000, volumeMes: 5, tempoCirurgiaMin: 150 },
  { id: "punho", codigo: "30715016", nome: "Osteossíntese de fratura de punho", linha: "trauma", honorarioReferencia: 9500, volumeMes: 11, tempoCirurgiaMin: 80 },
  { id: "plato", codigo: "30725080", nome: "Osteossíntese de platô tibial", linha: "trauma", honorarioReferencia: 12500, volumeMes: 6, tempoCirurgiaMin: 130 },
  { id: "artrodese-lombar", codigo: "30715036", nome: "Artrodese lombar 1 nível", linha: "neuro", honorarioReferencia: 15000, volumeMes: 21, tempoCirurgiaMin: 180 },
  { id: "microdiscectomia", codigo: "30715052", nome: "Microdiscectomia lombar", linha: "neuro", honorarioReferencia: 11000, volumeMes: 17, tempoCirurgiaMin: 90 },
  { id: "angioplastia", codigo: "30912059", nome: "Angioplastia coronária com 1 stent", linha: "hemodinamica", honorarioReferencia: 7000, volumeMes: 34, tempoCirurgiaMin: 60 },
  { id: "tavi", codigo: "30904102", nome: "TAVI (implante valvar transcateter)", linha: "hemodinamica", honorarioReferencia: 16000, volumeMes: 2, tempoCirurgiaMin: 120 },
  { id: "marcapasso", codigo: "30904030", nome: "Implante de marcapasso dupla câmara", linha: "cardio", honorarioReferencia: 6500, volumeMes: 8, tempoCirurgiaMin: 75 },
  { id: "histerectomia", codigo: "31303080", nome: "Histerectomia videolaparoscópica", linha: "obstetricia", honorarioReferencia: 8000, volumeMes: 12, tempoCirurgiaMin: 100 },
];

export const ITENS: ItemCatalogo[] = [
  { id: "parafuso-pedicular", nome: "Parafuso pedicular poliaxial", caracteristica: "Titânio · 5,5 mm", classe: "OP" },
  { id: "haste", nome: "Haste longitudinal", caracteristica: "Titânio · 5,5 mm · 40–60 mm", classe: "OP" },
  { id: "cage", nome: "Cage intersomático", caracteristica: "PEEK · lombar", classe: "OP" },
  { id: "enxerto", nome: "Enxerto ósseo sintético", caracteristica: "Fosfato de cálcio · 5 cc", classe: "ME" },
  { id: "neuromonitor", nome: "Neuromonitorização intraoperatória", caracteristica: "Kit descartável", classe: "ME" },
  { id: "selante-dural", nome: "Selante dural", caracteristica: "Hidrogel · 5 ml", classe: "ME" },
  { id: "canula", nome: "Cânula artroscópica", caracteristica: "7 mm · descartável", classe: "ME" },
  { id: "lamina-shaver", nome: "Lâmina de shaver", caracteristica: "5,5 mm", classe: "ME" },
  { id: "ponteira-rf", nome: "Ponteira de radiofrequência", caracteristica: "Ablação · 90°", classe: "ME" },
  { id: "ancora", nome: "Âncora de sutura", caracteristica: "5,5 mm", classe: "OP" },
  { id: "fio-ar", nome: "Fio de alta resistência", caracteristica: "Nº 2", classe: "ME" },
  { id: "stent", nome: "Stent farmacológico", caracteristica: "Everolimus · 3,0 × 28 mm", classe: "OP" },
  { id: "cateter-guia", nome: "Cateter-guia", caracteristica: "6F", classe: "ME" },
  { id: "fio-guia", nome: "Fio-guia coronário", caracteristica: "0,014 pol", classe: "ME" },
  { id: "balao", nome: "Balão de pré-dilatação", caracteristica: "2,5 × 15 mm", classe: "ME" },
  { id: "introdutor", nome: "Introdutor arterial", caracteristica: "6F · radial", classe: "ME" },
  { id: "placa-bloqueada", nome: "Placa bloqueada", caracteristica: "3,5 mm · titânio", classe: "OP" },
  { id: "parafuso-cortical", nome: "Parafuso cortical", caracteristica: "3,5 mm", classe: "OP" },
  { id: "implante-interferencial", nome: "Parafuso de interferência", caracteristica: "PEEK · 7 × 23 mm", classe: "OP" },
  { id: "protese-quadril", nome: "Prótese total de quadril", caracteristica: "Não cimentada", classe: "OP" },
  { id: "valvula-tavi", nome: "Válvula transcateter", caracteristica: "Balão-expansível · 26 mm", classe: "OP" },
  { id: "marcapasso-gerador", nome: "Marcapasso dupla câmara", caracteristica: "Compatível com RM", classe: "OP" },
  { id: "trocarte", nome: "Trocarte descartável", caracteristica: "5–12 mm", classe: "ME" },
  { id: "selador", nome: "Selador vascular", caracteristica: "Bipolar · 37 cm", classe: "ME" },
];

// id, itemId, fabricante, fornecedor, custo, liberação, glosa, entrega, Δ tempo cirurgia, prazo de pagamento, homologada em
type M = [string, string, string, string, number, number, number, number, number, number, string[]];
const m = ([id, itemId, fabricante, fornecedor, custo, liberacaoDias, glosaPct, entregaDias, tempoCirurgiaDeltaMin, prazoPagamentoDias, homologadaEm]: M): Marca =>
  ({ id, itemId, fabricante, fornecedor, custo, liberacaoDias, glosaPct, entregaDias, tempoCirurgiaDeltaMin, prazoPagamentoDias, homologadaEm });

export const MARCAS: Marca[] = ([
  ["pp-a", "parafuso-pedicular", "Medtronic", "OrtoMed", 1150, 3, 1, 2, -5, 90, TODAS],
  ["pp-b", "parafuso-pedicular", "Synthes", "Coluna Sul", 980, 5, 2, 3, 0, 120, TODAS],
  ["pp-c", "parafuso-pedicular", "Globus", "Neo Implantes", 1300, 4, 3, 2, -10, 60, SEM_HAPVIDA],
  ["pp-d", "parafuso-pedicular", "Ulrich", "OrtoMed", 1050, 9, 7, 4, 10, 90, ["1", "2", "3", "4", "6"]],
  ["pp-e", "parafuso-pedicular", "Genérica BR", "MedSupply", 820, 19, 21, 6, 20, 120, ["1", "3"]],
  ["ha-a", "haste", "Medtronic", "OrtoMed", 620, 3, 1, 2, 0, 90, TODAS],
  ["ha-b", "haste", "Synthes", "Coluna Sul", 540, 6, 2, 3, 0, 120, TODAS],
  ["ha-c", "haste", "Globus", "Neo Implantes", 700, 4, 2, 2, -5, 60, SEM_HAPVIDA],
  ["ca-a", "cage", "Medtronic", "OrtoMed", 4800, 4, 2, 3, -10, 90, TODAS],
  ["ca-b", "cage", "Synthes", "Coluna Sul", 4100, 7, 4, 4, 0, 120, TODAS],
  ["ca-c", "cage", "Globus", "Neo Implantes", 5600, 3, 1, 2, -15, 60, SEM_HAPVIDA],
  ["ca-d", "cage", "Genérica BR", "MedSupply", 3200, 15, 18, 7, 15, 120, ["1"]],
  ["en-a", "enxerto", "Baxter", "OrtoMed", 2100, 5, 6, 3, 0, 90, ["1", "3", "4"]],
  ["en-b", "enxerto", "Biomecânica", "MedSupply", 1700, 8, 9, 4, 0, 120, TODAS],
  ["nm-a", "neuromonitor", "Natus", "NeuroTech", 1800, 6, 12, 3, 0, 90, ["1", "2", "4"]],
  ["sd-a", "selante-dural", "Baxter", "OrtoMed", 1600, 4, 3, 2, 0, 90, TODAS],
  ["sd-b", "selante-dural", "Integra", "NeuroTech", 1450, 5, 4, 3, 0, 120, TODAS],
  ["sd-c", "selante-dural", "Genérica BR", "MedSupply", 900, 9, 11, 5, 0, 120, ["1", "3"]],
  ["cn-a", "canula", "Smith & Nephew", "Artro Brasil", 260, 2, 1, 1, 0, 90, TODAS],
  ["cn-b", "canula", "Arthrex", "Artrex Distribuidora", 300, 3, 1, 2, 0, 60, TODAS],
  ["cn-c", "canula", "Stryker", "Stryker Brasil", 240, 4, 2, 2, 0, 120, SEM_HAPVIDA],
  ["ls-a", "lamina-shaver", "Smith & Nephew", "Artro Brasil", 380, 3, 2, 2, 0, 90, TODAS],
  ["ls-b", "lamina-shaver", "Arthrex (agressiva)", "Artrex Distribuidora", 420, 9, 18, 3, 0, 60, ["1", "3", "5"]],
  ["ls-c", "lamina-shaver", "Stryker", "Stryker Brasil", 350, 4, 3, 2, 0, 120, TODAS],
  ["rf-a", "ponteira-rf", "Smith & Nephew", "Artro Brasil", 900, 3, 2, 2, -5, 90, TODAS],
  ["rf-b", "ponteira-rf", "Arthrex", "Artrex Distribuidora", 980, 4, 2, 2, -5, 60, TODAS],
  ["rf-c", "ponteira-rf", "Conmed", "MedSupply", 760, 6, 5, 4, 0, 120, SEM_HAPVIDA],
  ["an-a", "ancora", "Arthrex PEEK", "Artrex Distribuidora", 1350, 4, 2, 2, 0, 60, TODAS],
  ["an-b", "ancora", "Arthrex bio-compósita", "Artrex Distribuidora", 1500, 11, 16, 5, 10, 90, ["1", "3"]],
  ["an-c", "ancora", "Smith & Nephew PEEK", "Artro Brasil", 1250, 4, 3, 2, 0, 90, TODAS],
  ["an-d", "ancora", "Stryker", "Stryker Brasil", 1300, 5, 3, 3, 0, 120, SEM_HAPVIDA],
  ["fa-a", "fio-ar", "Arthrex", "Artrex Distribuidora", 150, 2, 1, 1, 0, 60, TODAS],
  ["fa-b", "fio-ar", "Smith & Nephew", "Artro Brasil", 140, 3, 1, 2, 0, 90, TODAS],
  ["fa-c", "fio-ar", "Stryker", "Stryker Brasil", 130, 3, 2, 2, 0, 120, TODAS],
  ["st-a", "stent", "Abbott Xience", "CardioMed", 5200, 2, 1, 1, 0, 90, TODAS],
  ["st-b", "stent", "Boston Synergy", "Hemo Brasil", 4900, 2, 1, 1, 0, 90, TODAS],
  ["st-c", "stent", "Medtronic Onyx", "CardioMed", 5000, 3, 2, 1, 0, 60, TODAS],
  ["st-d", "stent", "Biotronik Orsiro", "Hemo Brasil", 4300, 3, 2, 2, 0, 120, SEM_HAPVIDA],
  ["st-e", "stent", "Meril BioMime", "MedSupply", 3600, 8, 9, 4, 0, 120, ["1", "3", "6"]],
  ["cg-a", "cateter-guia", "Medtronic", "CardioMed", 420, 2, 1, 1, 0, 90, TODAS],
  ["cg-b", "cateter-guia", "Boston", "Hemo Brasil", 390, 2, 1, 1, 0, 90, TODAS],
  ["cg-c", "cateter-guia", "Cordis", "MedSupply", 360, 3, 2, 2, 0, 120, TODAS],
  ["fg-a", "fio-guia", "Abbott", "CardioMed", 480, 2, 1, 1, 0, 90, TODAS],
  ["fg-b", "fio-guia", "Asahi", "Hemo Brasil", 520, 2, 1, 1, 0, 60, TODAS],
  ["fg-c", "fio-guia", "Boston", "Hemo Brasil", 450, 3, 2, 2, 0, 120, TODAS],
  ["ba-a", "balao", "Boston", "Hemo Brasil", 950, 2, 1, 1, 0, 90, TODAS],
  ["ba-b", "balao", "Abbott", "CardioMed", 980, 2, 1, 1, 0, 90, TODAS],
  ["ba-c", "balao", "Biotronik", "Hemo Brasil", 820, 3, 3, 2, 0, 120, TODAS],
  ["in-a", "introdutor", "Terumo", "CardioMed", 210, 2, 1, 1, 0, 90, TODAS],
  ["in-b", "introdutor", "Cordis", "MedSupply", 190, 2, 1, 1, 0, 120, TODAS],
  ["in-c", "introdutor", "Merit", "Hemo Brasil", 180, 3, 2, 2, 0, 120, TODAS],
  ["pb-a", "placa-bloqueada", "Synthes LCP", "Coluna Sul", 2200, 4, 2, 2, 0, 90, TODAS],
  ["pb-b", "placa-bloqueada", "Synthes VA-LCP", "Coluna Sul", 2500, 3, 1, 2, -5, 60, TODAS],
  ["pb-c", "placa-bloqueada", "Stryker", "Stryker Brasil", 2100, 5, 3, 3, 0, 120, SEM_HAPVIDA],
  ["pb-d", "placa-bloqueada", "Genérica BR", "MedSupply", 1500, 14, 15, 6, 15, 120, ["1", "6"]],
  ["pc-a", "parafuso-cortical", "Synthes", "Coluna Sul", 180, 3, 1, 2, 0, 90, TODAS],
  ["pc-b", "parafuso-cortical", "Stryker", "Stryker Brasil", 170, 4, 2, 2, 0, 120, TODAS],
  ["pc-c", "parafuso-cortical", "Ortosíntese", "MedSupply", 120, 6, 4, 3, 0, 120, TODAS],
  ["ii-a", "implante-interferencial", "Arthrex PEEK", "Artrex Distribuidora", 1900, 4, 2, 2, 0, 60, TODAS],
  ["ii-b", "implante-interferencial", "Arthrex titânio", "Artrex Distribuidora", 1700, 10, 20, 4, 0, 90, ["1", "3"]],
  ["ii-c", "implante-interferencial", "Smith & Nephew PEEK", "Artro Brasil", 1850, 4, 3, 2, 0, 90, TODAS],
  ["ii-d", "implante-interferencial", "Conmed PEEK", "MedSupply", 1650, 5, 4, 3, 0, 120, SEM_HAPVIDA],
  ["pq-a", "protese-quadril", "Zimmer", "OrtoMed", 14500, 6, 3, 4, 0, 90, TODAS],
  ["pq-b", "protese-quadril", "Stryker", "Stryker Brasil", 13800, 6, 3, 4, 0, 90, TODAS],
  ["pq-c", "protese-quadril", "DePuy", "Coluna Sul", 14000, 7, 4, 5, 0, 120, SEM_HAPVIDA],
  ["tv-a", "valvula-tavi", "Edwards Sapien", "CardioMed", 98000, 12, 6, 5, 0, 90, ["1", "2", "4", "5"]],
  ["tv-b", "valvula-tavi", "Medtronic Evolut", "CardioMed", 92000, 12, 6, 5, 0, 90, ["1", "2", "4"]],
  ["tv-c", "valvula-tavi", "Boston Acurate", "Hemo Brasil", 88000, 14, 8, 6, 0, 120, ["1", "4"]],
  ["mp-a", "marcapasso-gerador", "Medtronic", "CardioMed", 18000, 5, 2, 3, 0, 90, TODAS],
  ["mp-b", "marcapasso-gerador", "Abbott", "CardioMed", 17000, 5, 2, 3, 0, 90, TODAS],
  ["mp-c", "marcapasso-gerador", "Biotronik", "Hemo Brasil", 15500, 6, 3, 4, 0, 120, TODAS],
  ["tr-a", "trocarte", "Ethicon", "VideoMed", 380, 2, 1, 1, 0, 90, TODAS],
  ["tr-b", "trocarte", "Covidien", "VideoMed", 360, 2, 1, 1, 0, 90, TODAS],
  ["tr-c", "trocarte", "Genérico", "MedSupply", 210, 5, 4, 3, 0, 120, TODAS],
  ["sl-a", "selador", "Medtronic LigaSure", "VideoMed", 2900, 3, 3, 2, -10, 90, TODAS],
  ["sl-b", "selador", "Ethicon Enseal", "VideoMed", 2700, 3, 3, 2, -10, 90, TODAS],
  ["sl-c", "selador", "Genérico", "MedSupply", 1600, 8, 12, 5, 0, 120, ["1", "3"]],
] as M[]).map(m);

// ---------------- Padrões ----------------

const documentosPadrao = ["Relatório médico", "Exames de imagem", "Termo de consentimento"];

/** Pré-modelo da IA: as marcas sem glosa alta entram no leque; a mais rápida de liberar é a preferencial. */
/**
 * Protocolos clínicos que o hospital já tem escritos (lidos do sistema do hospital).
 * O pré-modelo da IA parte deles; a comissão revisa e ajusta.
 */
export const PROTOCOLOS_INSTITUCIONAIS: Record<string, { criterios: string[]; documentos: string[]; fonte: string }> = {
  lca: {
    criterios: ["Ruptura do LCA confirmada por RM", "Instabilidade funcional do joelho", "Paciente ativo, sem artrose avançada"],
    documentos: ["Relatório médico", "RM de joelho", "Termo de consentimento"],
    fonte: "Protocolo institucional de joelho (RHP, 2025)",
  },
  ombro: {
    criterios: ["Lesão do manguito rotador confirmada por RM ou US", "Dor ou perda de força por mais de 3 meses", "Falha da fisioterapia"],
    documentos: ["Relatório médico", "RM de ombro", "Termo de consentimento"],
    fonte: "Protocolo institucional de ombro (RHP, 2025)",
  },
  quadril: {
    criterios: ["Artrose ou necrose da cabeça femoral com limitação funcional", "Falha do tratamento clínico", "Avaliação de risco cirúrgico"],
    documentos: ["Relatório médico", "Radiografia de bacia", "Risco cirúrgico", "Termo de consentimento"],
    fonte: "Protocolo institucional de artroplastia (RHP, 2024)",
  },
  plato: {
    criterios: ["Fratura do platô tibial com desvio articular", "Tomografia para planejamento"],
    documentos: ["Relatório médico", "Tomografia do joelho", "Termo de consentimento"],
    fonte: "Protocolo institucional de trauma (RHP, 2025)",
  },
  tavi: {
    criterios: ["Estenose aórtica grave sintomática", "Decisão do Heart Team", "Risco cirúrgico intermediário ou alto (STS)"],
    documentos: ["Relatório médico", "Ecocardiograma", "Angiotomografia", "Ata do Heart Team", "Termo de consentimento"],
    fonte: "Diretriz SBC de valvopatias · protocolo do Heart Team (RHP)",
  },
  marcapasso: {
    criterios: ["Bradiarritmia sintomática ou BAV avançado documentado", "Causa reversível descartada"],
    documentos: ["Relatório médico", "Eletrocardiograma", "Holter", "Termo de consentimento"],
    fonte: "Diretriz SBC de dispositivos cardíacos · protocolo institucional",
  },
  histerectomia: {
    criterios: ["Miomatose sintomática ou sangramento uterino refratário", "Falha ou contraindicação do tratamento clínico"],
    documentos: ["Relatório médico", "Ultrassonografia transvaginal", "Termo de consentimento"],
    fonte: "Protocolo institucional de ginecologia (RHP, 2025)",
  },
};

function preModelo(procedimentoId: string, itens: [string, number][]): Padrao {
  const proc = PROCEDIMENTOS.find((p) => p.id === procedimentoId)!;
  const institucional = PROTOCOLOS_INSTITUCIONAIS[procedimentoId];
  return {
    procedimentoId,
    versao: 0,
    status: "pre_modelo",
    itens: itens.map(([itemId, qtdTipica]): ItemPadrao => {
      const marcas = MARCAS.filter((x) => x.itemId === itemId && x.glosaPct < 15).sort((a, b) => a.liberacaoDias - b.liberacaoDias);
      return { itemId, qtdTipica, aceitas: marcas.map((x) => x.id), preferenciais: marcas.slice(0, 1).map((x) => x.id) };
    }),
    codigosRecomendados: [{ codigo: proc.codigo, descricao: proc.nome }],
    codigosAlerta: [],
    protocolo: {
      criterios: institucional?.criterios ?? ["Indicação conforme a diretriz da sociedade de especialidade"],
      documentos: institucional?.documentos ?? documentosPadrao,
      fonte: institucional ? `${institucional.fonte} · lido pela IA, a revisar pela comissão` : "Pré-modelo gerado pela IA a partir do histórico do hospital",
      revisao: "",
    },
    complemento: { modo: "predefinido", valor: 1000 },
    pedidosPorFora: [],
    sugestoes: [],
    historico: [],
  };
}

export const PADROES: Record<string, Padrao> = {
  "artroscopia-joelho": {
    procedimentoId: "artroscopia-joelho",
    versao: 2,
    status: "vigente",
    aprovadoEm: "2026-08-12",
    revisaoEm: "2027-08-12",
    itens: [
      { itemId: "canula", qtdTipica: 1, aceitas: ["cn-a", "cn-b", "cn-c"], preferenciais: ["cn-a"] },
      { itemId: "lamina-shaver", qtdTipica: 2, aceitas: ["ls-a", "ls-c"], preferenciais: ["ls-a"] },
      { itemId: "ponteira-rf", qtdTipica: 1, aceitas: ["rf-a", "rf-b", "rf-c"], preferenciais: ["rf-b"] },
      { itemId: "fio-ar", qtdTipica: 2, aceitas: ["fa-a", "fa-b", "fa-c"], preferenciais: ["fa-a"] },
    ],
    codigosRecomendados: [{ codigo: "30725119", descricao: "Meniscectomia artroscópica" }],
    codigosAlerta: [{ codigo: "30725038", descricao: "Desbridamento articular", glosaPct: 28 }],
    protocolo: {
      criterios: ["Lesão meniscal sintomática confirmada por RM", "Falha do tratamento conservador por pelo menos 6 semanas"],
      documentos: ["Relatório médico", "RM de joelho", "Termo de consentimento"],
      fonte: "Diretriz SBOT · protocolo institucional",
      revisao: "2027-08-12",
    },
    complemento: { modo: "predefinido", valor: 1500 },
    pedidosPorFora: [{ itemId: "ancora", freqPct: 12 }],
    sugestoes: [],
    historico: [
      { versao: 1, data: "2026-03-02", mudanca: "Padrão inicial aprovado pela comissão" },
      { versao: 2, data: "2026-08-12", mudanca: "Lâmina de shaver agressiva saiu do leque (glosa de 18%)" },
    ],
  },
  "artrodese-lombar": {
    procedimentoId: "artrodese-lombar",
    versao: 1,
    status: "em_ajuste",
    itens: [
      { itemId: "parafuso-pedicular", qtdTipica: 4, aceitas: ["pp-a", "pp-b", "pp-c"], preferenciais: ["pp-a", "pp-b"] },
      { itemId: "haste", qtdTipica: 2, aceitas: ["ha-a", "ha-b", "ha-c"], preferenciais: ["ha-a"] },
      { itemId: "cage", qtdTipica: 1, aceitas: ["ca-a", "ca-b", "ca-c"], preferenciais: ["ca-a"] },
    ],
    codigosRecomendados: [
      { codigo: "30715036", descricao: "Artrodese via posterior — 1 nível" },
      { codigo: "30715044", descricao: "Descompressão neural" },
    ],
    codigosAlerta: [{ codigo: "30715079", descricao: "Artrodese com instrumentação (forma alternativa)", glosaPct: 24 }],
    protocolo: {
      criterios: ["Dor lombar refratária a pelo menos 6 semanas de tratamento conservador", "Instabilidade comprovada em RX dinâmico ou RM"],
      documentos: ["Relatório médico", "RM lombar", "RX dinâmico", "Termo de consentimento"],
      fonte: "Diretrizes SBOT e SBN · protocolo institucional",
      revisao: "2027-10-01",
    },
    complemento: {
      modo: "condicoes",
      condicoes: [
        { tipo: "homologados", valor: 1000 },
        { tipo: "dentro_padrao", valor: 2000 },
        { tipo: "documentos", valor: 500 },
        { tipo: "prazo_liberacao", valor: 500, parametro: 5 },
        { tipo: "margem_minima", valor: 500, parametro: 10 },
      ],
    },
    pedidosPorFora: [{ itemId: "enxerto", freqPct: 38 }, { itemId: "neuromonitor", freqPct: 22 }],
    sugestoes: [],
    historico: [],
  },
  angioplastia: {
    procedimentoId: "angioplastia",
    versao: 1,
    status: "vigente",
    aprovadoEm: "2026-06-20",
    revisaoEm: "2026-12-20",
    itens: [
      { itemId: "stent", qtdTipica: 1, aceitas: ["st-a", "st-b", "st-c", "st-d", "st-e"], preferenciais: ["st-b", "st-c", "st-d"] },
      { itemId: "cateter-guia", qtdTipica: 1, aceitas: ["cg-a", "cg-b", "cg-c"], preferenciais: ["cg-b"] },
      { itemId: "fio-guia", qtdTipica: 1, aceitas: ["fg-a", "fg-b", "fg-c"], preferenciais: ["fg-a"] },
      { itemId: "balao", qtdTipica: 1, aceitas: ["ba-a", "ba-b", "ba-c"], preferenciais: ["ba-a"] },
      { itemId: "introdutor", qtdTipica: 1, aceitas: ["in-a", "in-b", "in-c"], preferenciais: ["in-b"] },
    ],
    codigosRecomendados: [{ codigo: "30912059", descricao: "Angioplastia coronária com implante de stent" }],
    codigosAlerta: [{ codigo: "30912040", descricao: "Angioplastia transluminal (forma B)", glosaPct: 22 }],
    protocolo: {
      criterios: ["Isquemia documentada (teste funcional ou FFR)", "Lesão de pelo menos 70% em artéria epicárdica"],
      documentos: ["Relatório médico", "Cateterismo diagnóstico", "Termo de consentimento"],
      fonte: "Diretriz SBHCI",
      revisao: "2026-12-20",
    },
    complemento: { modo: "predefinido", valor: 800 },
    pedidosPorFora: [],
    sugestoes: [
      {
        id: "s-ang-1",
        titulo: "Trocar o stent Meril pelo Biotronik no leque",
        motivo: "O Meril passou a levar 8 dias para liberar e tem 9% de glosa nos últimos 3 meses",
        tipo: "trocar_marca",
        itemId: "stent",
        de: "st-e",
        para: "st-d",
        antes: "8 dias para liberar · glosa 9%",
        depois: "3 dias para liberar · glosa 2%",
      },
    ],
    historico: [{ versao: 1, data: "2026-06-20", mudanca: "Padrão inicial: 5 marcas aceitas, 3 direcionadas" }],
  },
  microdiscectomia: {
    ...preModelo("microdiscectomia", [["selante-dural", 1]]),
    versao: 1,
    status: "vigente",
    aprovadoEm: "2026-05-10",
    revisaoEm: "2027-05-10",
    itens: [{ itemId: "selante-dural", qtdTipica: 1, aceitas: ["sd-a", "sd-b", "sd-c"], preferenciais: ["sd-b"] }],
    protocolo: {
      criterios: ["Hérnia discal com radiculopatia correspondente", "Falha do tratamento conservador por pelo menos 6 semanas"],
      documentos: ["Relatório médico", "RM lombar", "Termo de consentimento"],
      fonte: "Diretriz SBN · protocolo institucional",
      revisao: "2027-05-10",
    },
    complemento: { modo: "predefinido", valor: 700 },
    sugestoes: [
      {
        id: "s-mic-1",
        titulo: "Tirar o selante genérico do leque",
        motivo: "Glosa de 11% e 9 dias para liberar nos últimos 3 meses",
        tipo: "trocar_marca",
        itemId: "selante-dural",
        de: "sd-c",
        para: "sd-a",
        antes: "9 dias para liberar · glosa 11%",
        depois: "4 dias para liberar · glosa 3%",
      },
    ],
    historico: [{ versao: 1, data: "2026-05-10", mudanca: "Padrão inicial aprovado pela comissão" }],
  },
  punho: {
    ...preModelo("punho", [["placa-bloqueada", 1], ["parafuso-cortical", 6]]),
    versao: 1,
    status: "vigente",
    aprovadoEm: "2026-07-01",
    revisaoEm: "2027-07-01",
  },
  lca: preModelo("lca", [["implante-interferencial", 2], ["ancora", 1], ["fio-ar", 2], ["canula", 1]]),
  ombro: preModelo("ombro", [["ancora", 3], ["fio-ar", 4], ["canula", 2], ["lamina-shaver", 1]]),
  quadril: preModelo("quadril", [["protese-quadril", 1]]),
  plato: preModelo("plato", [["placa-bloqueada", 2], ["parafuso-cortical", 8]]),
  tavi: preModelo("tavi", [["valvula-tavi", 1], ["introdutor", 1], ["fio-guia", 1]]),
  marcapasso: preModelo("marcapasso", [["marcapasso-gerador", 1], ["introdutor", 1]]),
  histerectomia: preModelo("histerectomia", [["trocarte", 3], ["selador", 1]]),
};

// ---------------- Contratos ----------------

const TETO_BASE: Record<string, number> = {
  "artroscopia-joelho": 16000, lca: 24000, ombro: 26000, quadril: 48000, punho: 14000, plato: 22000,
  "artrodese-lombar": 50000, microdiscectomia: 15000, angioplastia: 20000, tavi: 150000, marcapasso: 32000, histerectomia: 15000,
};
const FATOR_TETO: Record<string, number> = { "2": 0.95, "4": 1, "6": 0.7 };
const MARKUP_TABELA: Record<string, number> = { "1": 1.4, "3": 1.3, "5": 1.35 };

const arred = (v: number, passo = 10) => Math.round(v / passo) * passo;

const custoMedio = (itemId: string) => {
  const marcas = MARCAS.filter((x) => x.itemId === itemId);
  return marcas.reduce((a, x) => a + x.custo, 0) / marcas.length;
};

export const CONTRATOS_OPERADORA: ContratoOperadora[] = PROCEDIMENTOS.flatMap((proc) =>
  OPERADORAS.map((op): ContratoOperadora => {
    const honorario = Object.fromEntries(
      (Object.keys(op.fatorPlano) as NivelPlano[]).map((n) => [n, arred(proc.honorarioReferencia * op.fatorPlano[n])]),
    ) as Record<NivelPlano, number>;
    if (op.id in FATOR_TETO) {
      const teto = arred(TETO_BASE[proc.id] * FATOR_TETO[op.id], 100);
      return { operadoraId: op.id, procedimentoId: proc.id, tipo: "pacote", teto, custoHospitalar: arred(teto * 0.56, 100), honorario };
    }
    const tabelaItem = Object.fromEntries(ITENS.map((it) => [it.id, arred(custoMedio(it.id) * MARKUP_TABELA[op.id])]));
    return { operadoraId: op.id, procedimentoId: proc.id, tipo: "aberta", tabelaItem, honorario };
  }),
);

export const CONTRATOS_MEDICO: ContratoMedico[] = [
  { medicoId: "1", procedimentos: ["artroscopia-joelho", "lca", "ombro", "quadril", "punho", "plato", "artrodese-lombar"], participaComplemento: true, repasseEletivaDias: 60, repasseUrgenciaDias: 100, vigencia: "2026-04-01" },
  { medicoId: "2", procedimentos: ["histerectomia"], participaComplemento: false, repasseEletivaDias: 60, repasseUrgenciaDias: 100, vigencia: "2026-04-01" },
  { medicoId: "3", procedimentos: ["artrodese-lombar", "microdiscectomia"], participaComplemento: true, repasseEletivaDias: 60, repasseUrgenciaDias: 100, vigencia: "2026-04-01" },
  { medicoId: "4", procedimentos: ["angioplastia", "tavi", "marcapasso"], participaComplemento: true, repasseEletivaDias: 45, repasseUrgenciaDias: 90, vigencia: "2026-05-01" },
  { medicoId: "7", procedimentos: ["artroscopia-joelho", "lca", "ombro", "punho", "plato"], participaComplemento: true, repasseEletivaDias: 60, repasseUrgenciaDias: 100, vigencia: "2026-04-01" },
];

export const CONFIG_PADRAO: ConfigHospital = { considerarMargem: true, pesos: { liberacao: 40, glosa: 35, margem: 25 } };

export const DOMINIO_SEMENTE: Dominio = {
  config: CONFIG_PADRAO,
  hospitais: HOSPITAIS,
  medicos: MEDICOS,
  operadoras: OPERADORAS,
  procedimentos: PROCEDIMENTOS,
  itens: ITENS,
  marcas: MARCAS,
  padroes: PADROES,
  contratosOperadora: CONTRATOS_OPERADORA,
  contratosMedico: CONTRATOS_MEDICO,
};

// ---------------- Pedidos de exemplo ----------------

function pedido(
  id: string, medicoId: string, paciente: string, procedimentoId: string, operadoraId: string, plano: NivelPlano,
  status: Pedido["status"], dataCirurgia: string, extra: Partial<Pedido> = {},
): Pedido {
  const s = pedidoSugerido(procedimentoId, operadoraId, DOMINIO_SEMENTE);
  return {
    id, medicoId, paciente: { nome: paciente, cpf: "***.***.***-**" }, operadoraId, plano, procedimentoId,
    codigos: s.codigos, itens: s.itens, documentos: [...PADROES[procedimentoId].protocolo.documentos],
    status, ajustes: [], urgencia: false, criadoEm: "2026-10-01", dataCirurgia, ...extra,
  };
}

const trocarMarca = (p: Pedido, itemId: string, marcaId: string): Pedido["itens"] =>
  p.itens.map((i) => (i.itemId === itemId ? { ...i, marcaId } : i));

const p3 = pedido("p3", "1", "Ana Paula Ferreira", "artrodese-lombar", "6", "Básico", "esperando_confirmacao", "2026-11-03", { secretaria: "Camila Souza" });
p3.itens = [...trocarMarca(p3, "parafuso-pedicular", "pp-c"), { itemId: "enxerto", marcaId: "en-b", qtd: 1 }];
p3.justificativa = "Paciente com osteopenia: enxerto necessário para fusão";
p3.ajustes = [{ id: "a1", itemId: "parafuso-pedicular", motivo: "Parafuso Globus não é homologado na Hapvida — trocar por Medtronic ou Synthes", resolvido: false }];

const p8 = pedido("p8", "1", "Patrícia Gomes", "ombro", "1", "Especial", "confirmado", "2026-09-22");
p8.itens = trocarMarca(p8, "ancora", "an-b");
p8.justificativa = "Paciente com alergia documentada a PEEK";
p8.aceitoForaPadrao = { motivo: "Alergia a PEEK confirmada no prontuário" };

const p4 = pedido("p4", "1", "Carlos Eduardo Martins", "lca", "2", "Especial", "aguardando_medico", "2026-11-12", { secretaria: "Camila Souza" });

const p9 = pedido("p9", "1", "Roberta Lins", "artroscopia-joelho", "5", "Executivo", "confirmado", "2026-11-18");
p9.itens = compraRapida("artroscopia-joelho", "5", DOMINIO_SEMENTE);

export const PEDIDOS_SEMENTE: Pedido[] = [
  pedido("p1", "1", "João Carlos Silva", "artroscopia-joelho", "1", "Executivo", "confirmado", "2026-10-08"),
  pedido("p2", "1", "Mariana Souza Lima", "artrodese-lombar", "4", "Especial", "esperando_confirmacao", "2026-10-28"),
  p3,
  p4,
  pedido("p5", "1", "Roberto Nascimento", "punho", "3", "Básico", "rascunho", "2026-11-20", { secretaria: "Camila Souza", documentos: ["Relatório médico"] }),
  pedido("p6", "4", "Fernanda Oliveira", "angioplastia", "4", "Executivo", "confirmado", "2026-10-05"),
  pedido("p7", "3", "Lucas Pereira", "microdiscectomia", "5", "Especial", "esperando_confirmacao", "2026-11-04"),
  p8,
  p9,
];
