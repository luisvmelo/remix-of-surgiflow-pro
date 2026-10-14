// ============================================================
// CATÁLOGO FICTÍCIO DO MOCK
// Hospitais, operadoras, fornecedores e médicos são inventados.
// Valores e perfis de glosa são ilustrativos, não dados reais.
// ============================================================

import { ClasseOpme, Hospital, TipoGlosa } from "@opme/types/produto";

export const HOSPITAIS: Hospital[] = [
  { id: "h-aurora", nome: "Hospital Aurora", cidade: "São Paulo, SP", erp: "MV Soul" },
  { id: "h-horizonte", nome: "Hospital Horizonte", cidade: "Belo Horizonte, MG", erp: "Tasy" },
];

export const NOME_REDE = "Rede Aurora Saúde";

export interface Operadora {
  cd: number;
  nome: string;
  /** Multiplicador do risco de glosa (1 = média) */
  fatorGlosa: number;
  /** Multiplicador sobre o valor pago (1 = tabela de referência) */
  fatorPagamento: number;
  /** Tempo médio de autorização em dias corridos */
  prazoAutorizacao: number;
  peso: number;
}

export const OPERADORAS: Operadora[] = [
  { cd: 12, nome: "Vitalis Saúde", fatorGlosa: 1.0, fatorPagamento: 1.0, prazoAutorizacao: 13, peso: 22 },
  { cd: 8, nome: "Previa Seguros Saúde", fatorGlosa: 0.65, fatorPagamento: 1.06, prazoAutorizacao: 9, peso: 18 },
  { cd: 60, nome: "Nobre Saúde", fatorGlosa: 1.4, fatorPagamento: 0.92, prazoAutorizacao: 19, peso: 14 },
  { cd: 86, nome: "Amparo Assistência Médica", fatorGlosa: 1.15, fatorPagamento: 0.97, prazoAutorizacao: 15, peso: 13 },
  { cd: 21, nome: "Solaris Saúde", fatorGlosa: 0.85, fatorPagamento: 1.02, prazoAutorizacao: 11, peso: 12 },
  { cd: 33, nome: "Integra Planos", fatorGlosa: 1.25, fatorPagamento: 0.94, prazoAutorizacao: 17, peso: 11 },
  { cd: 1, nome: "Particular", fatorGlosa: 0.15, fatorPagamento: 1.1, prazoAutorizacao: 2, peso: 5 },
  { cd: 99, nome: "SUS", fatorGlosa: 0.5, fatorPagamento: 0.55, prazoAutorizacao: 25, peso: 5 },
];

export interface Fornecedor {
  nome: string;
  /** Multiplicador do risco de glosa histórico do fornecedor */
  fatorGlosa: number;
  /** Multiplicador sobre o custo de compra */
  fatorPreco: number;
}

export const FORNECEDORES: Record<string, Fornecedor> = {
  "Ortomax Implantes": { nome: "Ortomax Implantes", fatorGlosa: 1.25, fatorPreco: 1.08 },
  "BioOrto Distribuidora": { nome: "BioOrto Distribuidora", fatorGlosa: 0.75, fatorPreco: 0.97 },
  "Implantec": { nome: "Implantec", fatorGlosa: 1.0, fatorPreco: 1.0 },
  "Vértebra Medical": { nome: "Vértebra Medical", fatorGlosa: 1.3, fatorPreco: 1.1 },
  "NeoSpine Brasil": { nome: "NeoSpine Brasil", fatorGlosa: 0.7, fatorPreco: 0.95 },
  "Coluna Sul OPME": { nome: "Coluna Sul OPME", fatorGlosa: 1.0, fatorPreco: 0.99 },
  "Cardiolink Distribuidora": { nome: "Cardiolink Distribuidora", fatorGlosa: 0.8, fatorPreco: 1.0 },
  "Pulsar Cardio": { nome: "Pulsar Cardio", fatorGlosa: 1.2, fatorPreco: 1.05 },
  "Hemovia": { nome: "Hemovia", fatorGlosa: 1.0, fatorPreco: 0.96 },
  "Vascutec": { nome: "Vascutec", fatorGlosa: 0.85, fatorPreco: 1.02 },
  "Endoarte Vascular": { nome: "Endoarte Vascular", fatorGlosa: 1.2, fatorPreco: 1.04 },
  "Uromed Soluções": { nome: "Uromed Soluções", fatorGlosa: 0.9, fatorPreco: 1.0 },
  "Litotec": { nome: "Litotec", fatorGlosa: 1.15, fatorPreco: 0.98 },
  "Nasalis Cirúrgica": { nome: "Nasalis Cirúrgica", fatorGlosa: 1.1, fatorPreco: 1.0 },
  "Otomed Brasil": { nome: "Otomed Brasil", fatorGlosa: 0.8, fatorPreco: 1.03 },
  // Fornecedores mais baratos, com glosa na média: costumam vencer em rentabilidade
  "Prime Ortho": { nome: "Prime Ortho", fatorGlosa: 1.05, fatorPreco: 0.86 },
  "Axis Spine": { nome: "Axis Spine", fatorGlosa: 1.05, fatorPreco: 0.87 },
  "Coronária Medical": { nome: "Coronária Medical", fatorGlosa: 1.05, fatorPreco: 0.86 },
  "Angiomed": { nome: "Angiomed", fatorGlosa: 1.05, fatorPreco: 0.87 },
  "Nefron Medical": { nome: "Nefron Medical", fatorGlosa: 1.05, fatorPreco: 0.88 },
  "Sinus Tech": { nome: "Sinus Tech", fatorGlosa: 1.05, fatorPreco: 0.87 },
  "Cirúrgica Econômica": { nome: "Cirúrgica Econômica", fatorGlosa: 1.08, fatorPreco: 0.85 },
  "Lente Clara": { nome: "Lente Clara", fatorGlosa: 1.05, fatorPreco: 0.85 },
  // Demais fornecedores das novas especialidades
  "Valvetec": { nome: "Valvetec", fatorGlosa: 0.72, fatorPreco: 0.99 },
  "Laparo Brasil": { nome: "Laparo Brasil", fatorGlosa: 1.2, fatorPreco: 1.04 },
  "MedSutura": { nome: "MedSutura", fatorGlosa: 0.75, fatorPreco: 1.0 },
  "Gineco Supply": { nome: "Gineco Supply", fatorGlosa: 1.15, fatorPreco: 1.03 },
  "Femina Medical": { nome: "Femina Medical", fatorGlosa: 0.75, fatorPreco: 0.99 },
  "Visiotec": { nome: "Visiotec", fatorGlosa: 1.2, fatorPreco: 1.06 },
  "Oculus Lens": { nome: "Oculus Lens", fatorGlosa: 0.7, fatorPreco: 1.0 },
  "Retina Med": { nome: "Retina Med", fatorGlosa: 1.0, fatorPreco: 0.97 },
  "Toraxmed": { nome: "Toraxmed", fatorGlosa: 1.0, fatorPreco: 0.98 },
  "Esthetic Implants": { nome: "Esthetic Implants", fatorGlosa: 1.2, fatorPreco: 1.07 },
  "Silhueta Medical": { nome: "Silhueta Medical", fatorGlosa: 0.72, fatorPreco: 1.0 },
  "Maxilo Tech": { nome: "Maxilo Tech", fatorGlosa: 1.15, fatorPreco: 1.04 },
  "Endoview": { nome: "Endoview", fatorGlosa: 1.15, fatorPreco: 1.03 },
  "GastroMed": { nome: "GastroMed", fatorGlosa: 0.75, fatorPreco: 0.99 },
};

/**
 * Prazo de entrega do fornecedor, em dias corridos entre o pedido de compra e o material no hospital.
 * Fictício e determinístico por fornecedor (1 a 6 dias).
 */
export function prazoEntrega(fornecedor: string): number {
  let h = 2166136261;
  for (let i = 0; i < fornecedor.length; i++) h = Math.imul(h ^ fornecedor.charCodeAt(i), 16777619);
  return 1 + ((h >>> 0) % 6);
}

const fnv = (texto: string) => {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
};

/**
 * Homologação do fornecedor para o item na operadora (fictícia e determinística).
 * É o que a regulação conferia à mão: a maior parte é liberada; equivalentes têm mais restrição.
 */
export function homologadoPor(operadora: number, fornecedor: string, item: string, equivalente = false): boolean {
  return fnv(`hom-${operadora}-${fornecedor}-${item}`) % 100 >= (equivalente ? 18 : 7);
}

/**
 * Compradores fictícios. "aproveitamento" é a chance de fecharem o item na maior margem
 * disponível; no resto fecham com o preferido do médico.
 */
export const COMPRADORES: Array<{ nome: string; aproveitamento: number }> = [
  { nome: "Ana Ribeiro", aproveitamento: 0.85 },
  { nome: "Bruno Teixeira", aproveitamento: 0.35 },
  { nome: "Carla Mendes", aproveitamento: 0.6 },
  { nome: "Diego Farias", aproveitamento: 0.2 },
];

export const FORNECEDORES_POR_ESPECIALIDADE: Record<string, string[]> = {
  "Ortopedia": ["Ortomax Implantes", "BioOrto Distribuidora", "Implantec", "Prime Ortho"],
  "Neurocirurgia": ["Vértebra Medical", "NeoSpine Brasil", "Coluna Sul OPME", "Axis Spine"],
  "Cardiologia": ["Pulsar Cardio", "Cardiolink Distribuidora", "Hemovia", "Coronária Medical"],
  "Cirurgia Vascular": ["Endoarte Vascular", "Vascutec", "Hemovia", "Angiomed"],
  "Urologia": ["Litotec", "Uromed Soluções", "Implantec", "Nefron Medical"],
  "Otorrinolaringologia": ["Nasalis Cirúrgica", "Otomed Brasil", "Implantec", "Sinus Tech"],
  "Cirurgia Cardíaca": ["Pulsar Cardio", "Valvetec", "Hemovia", "Coronária Medical"],
  "Cirurgia Geral": ["Laparo Brasil", "MedSutura", "Implantec", "Cirúrgica Econômica"],
  "Ginecologia": ["Gineco Supply", "Femina Medical", "MedSutura", "Cirúrgica Econômica"],
  "Oftalmologia": ["Visiotec", "Oculus Lens", "Retina Med", "Lente Clara"],
  "Cirurgia Torácica": ["Laparo Brasil", "MedSutura", "Toraxmed", "Cirúrgica Econômica"],
  "Cirurgia Plástica": ["Esthetic Implants", "Silhueta Medical", "Implantec", "Cirúrgica Econômica"],
  "Bucomaxilofacial": ["Maxilo Tech", "BioOrto Distribuidora", "Implantec", "Prime Ortho"],
  "Gastroenterologia": ["Endoview", "GastroMed", "Laparo Brasil", "Cirúrgica Econômica"],
  "Mastologia": ["Esthetic Implants", "Femina Medical", "Silhueta Medical", "Cirúrgica Econômica"],
};

export interface Medico {
  cd: number;
  nome: string;
  crm: string;
  especialidade: string;
  /** Tendência a pedir itens de maior risco (1 = média) */
  fatorGlosa: number;
}

export const MEDICOS: Medico[] = [
  { cd: 2101, nome: "Rafael Menezes Couto", crm: "CRM 118.204", especialidade: "Ortopedia", fatorGlosa: 1.3 },
  { cd: 2102, nome: "Juliana Prado Vasconcelos", crm: "CRM 124.771", especialidade: "Ortopedia", fatorGlosa: 0.8 },
  { cd: 2103, nome: "Marcelo Tavares Lins", crm: "CRM 109.532", especialidade: "Ortopedia", fatorGlosa: 1.0 },
  { cd: 2104, nome: "Fernanda Aguiar Rocha", crm: "CRM 131.086", especialidade: "Ortopedia", fatorGlosa: 0.9 },
  { cd: 2201, nome: "Gustavo Ribeiro Moraes", crm: "CRM 102.448", especialidade: "Neurocirurgia", fatorGlosa: 1.35 },
  { cd: 2202, nome: "Patrícia Queiroz Leal", crm: "CRM 127.913", especialidade: "Neurocirurgia", fatorGlosa: 0.85 },
  { cd: 2203, nome: "André Siqueira Paiva", crm: "CRM 115.360", especialidade: "Neurocirurgia", fatorGlosa: 1.1 },
  { cd: 2301, nome: "Cláudia Bastos Nogueira", crm: "CRM 098.771", especialidade: "Cardiologia", fatorGlosa: 0.9 },
  { cd: 2302, nome: "Eduardo Lacerda Pimentel", crm: "CRM 112.905", especialidade: "Cardiologia", fatorGlosa: 1.15 },
  { cd: 2303, nome: "Renata Falcão Amaral", crm: "CRM 133.642", especialidade: "Cardiologia", fatorGlosa: 1.0 },
  { cd: 2401, nome: "Thiago Moura Brandão", crm: "CRM 120.117", especialidade: "Cirurgia Vascular", fatorGlosa: 1.2 },
  { cd: 2402, nome: "Beatriz Cunha Salgado", crm: "CRM 126.498", especialidade: "Cirurgia Vascular", fatorGlosa: 0.85 },
  { cd: 2501, nome: "Leonardo Frota Campos", crm: "CRM 111.823", especialidade: "Urologia", fatorGlosa: 1.0 },
  { cd: 2502, nome: "Camila Rezende Torres", crm: "CRM 129.354", especialidade: "Urologia", fatorGlosa: 1.1 },
  { cd: 2601, nome: "Rodrigo Albuquerque Sena", crm: "CRM 107.269", especialidade: "Otorrinolaringologia", fatorGlosa: 1.3 },
  { cd: 2602, nome: "Larissa Montenegro Dias", crm: "CRM 132.015", especialidade: "Otorrinolaringologia", fatorGlosa: 0.9 },
  { cd: 2701, nome: "Henrique Castelo Branco", crm: "CRM 101.774", especialidade: "Cirurgia Cardíaca", fatorGlosa: 1.15 },
  { cd: 2702, nome: "Mariana Teixeira Lobo", crm: "CRM 125.330", especialidade: "Cirurgia Cardíaca", fatorGlosa: 0.9 },
  { cd: 2801, nome: "Paulo Sérgio Maranhão", crm: "CRM 108.412", especialidade: "Cirurgia Geral", fatorGlosa: 1.1 },
  { cd: 2802, nome: "Aline Batista Correia", crm: "CRM 130.268", especialidade: "Cirurgia Geral", fatorGlosa: 0.85 },
  { cd: 2901, nome: "Carolina Viana Fontes", crm: "CRM 119.845", especialidade: "Ginecologia", fatorGlosa: 1.1 },
  { cd: 2902, nome: "Débora Lima Assunção", crm: "CRM 134.107", especialidade: "Ginecologia", fatorGlosa: 0.9 },
  { cd: 3001, nome: "Vinícius Prates Holanda", crm: "CRM 113.590", especialidade: "Oftalmologia", fatorGlosa: 1.3 },
  { cd: 3002, nome: "Tatiana Serpa Gouveia", crm: "CRM 128.736", especialidade: "Oftalmologia", fatorGlosa: 0.85 },
  { cd: 3101, nome: "Otávio Rangel Barreto", crm: "CRM 104.921", especialidade: "Cirurgia Torácica", fatorGlosa: 1.05 },
  { cd: 3102, nome: "Simone Cardoso Peixoto", crm: "CRM 122.483", especialidade: "Cirurgia Torácica", fatorGlosa: 0.9 },
  { cd: 3201, nome: "Daniela Furtado Lemos", crm: "CRM 117.066", especialidade: "Cirurgia Plástica", fatorGlosa: 1.2 },
  { cd: 3202, nome: "Bruno Accioly Miranda", crm: "CRM 131.559", especialidade: "Cirurgia Plástica", fatorGlosa: 0.95 },
  { cd: 3301, nome: "Fábio Guedes Pontes", crm: "CRM 110.338", especialidade: "Bucomaxilofacial", fatorGlosa: 1.1 },
  { cd: 3302, nome: "Isabela Rocha Medeiros", crm: "CRM 126.842", especialidade: "Bucomaxilofacial", fatorGlosa: 0.9 },
  { cd: 3401, nome: "Ricardo Neves Quintela", crm: "CRM 106.715", especialidade: "Gastroenterologia", fatorGlosa: 1.05 },
  { cd: 3402, nome: "Luana Barros Coutinho", crm: "CRM 133.284", especialidade: "Gastroenterologia", fatorGlosa: 0.9 },
  { cd: 3501, nome: "Priscila Andrade Sampaio", crm: "CRM 118.957", especialidade: "Mastologia", fatorGlosa: 1.1 },
  { cd: 3502, nome: "Gabriel Moreira Toledo", crm: "CRM 129.603", especialidade: "Mastologia", fatorGlosa: 0.9 },
];

export interface ItemEquivalente {
  nome: string;
  anvisa: string;
  custo: number;
  cobrado: number;
  risco: number;
}

export interface ItemTemplate {
  nome: string;
  tuss: string;
  anvisa: string;
  custo: number;
  cobrado: number;
  /** Risco base de glosa (0-100) antes dos fatores de operadora, fornecedor e médico */
  risco: number;
  tipoGlosa: TipoGlosa;
  motivo: string;
  qtd: [number, number];
  equivalente?: ItemEquivalente;
}

export interface ProcedimentoTemplate {
  cd: number;
  nome: string;
  especialidade: string;
  porte: "P" | "M" | "G";
  cid: string;
  /** Probabilidade de o contrato ser pacote para este procedimento */
  pacoteProb: number;
  honorario: number;
  peso: number;
  itens: ItemTemplate[];
}

export const PROCEDIMENTOS: ProcedimentoTemplate[] = [
  // ---------------- ORTOPEDIA ----------------
  {
    cd: 1101, nome: "Artroplastia total de joelho", especialidade: "Ortopedia", porte: "G", cid: "M17.1",
    pacoteProb: 0.35, honorario: 9800, peso: 10,
    itens: [
      { nome: "Prótese total de joelho cimentada", tuss: "70540083", anvisa: "10349000781", custo: 18500, cobrado: 24800, risco: 22, tipoGlosa: "valor", motivo: "Valor acima da tabela negociada em parte das contas desta operadora", qtd: [1, 1],
        equivalente: { nome: "Prótese total de joelho cimentada (fabricante nacional)", anvisa: "80102510233", custo: 12900, cobrado: 22600, risco: 9 } },
      { nome: "Cimento ósseo com antibiótico", tuss: "70030140", anvisa: "10247530044", custo: 780, cobrado: 1150, risco: 44, tipoGlosa: "tecnica", motivo: "Operadora exige justificativa de risco infeccioso para cimento com antibiótico", qtd: [1, 2],
        equivalente: { nome: "Cimento ósseo sem antibiótico", anvisa: "10247530021", custo: 390, cobrado: 720, risco: 7 } },
      { nome: "Sistema de lavagem pulsátil", tuss: "70912010", anvisa: "80146170112", custo: 650, cobrado: 920, risco: 52, tipoGlosa: "administrativa", motivo: "Glosado com frequência por não estar discriminado no pedido médico", qtd: [1, 1] },
    ],
  },
  {
    cd: 1102, nome: "Artroplastia total de quadril", especialidade: "Ortopedia", porte: "G", cid: "M16.1",
    pacoteProb: 0.3, honorario: 10400, peso: 8,
    itens: [
      { nome: "Prótese total de quadril não cimentada", tuss: "70540121", anvisa: "10349000812", custo: 21000, cobrado: 27900, risco: 20, tipoGlosa: "valor", motivo: "Preço acima do referencial em contratos por pacote", qtd: [1, 1] },
      { nome: "Cabeça femoral cerâmica", tuss: "70540156", anvisa: "10349000829", custo: 5200, cobrado: 6150, risco: 47, tipoGlosa: "tecnica", motivo: "Cerâmica exige justificativa clínica (idade e nível de atividade) nesta operadora", qtd: [1, 1],
        equivalente: { nome: "Cabeça femoral metálica (cromo-cobalto)", anvisa: "10349000836", custo: 2300, cobrado: 4300, risco: 8 } },
      { nome: "Parafuso acetabular", tuss: "70540172", anvisa: "10349000843", custo: 450, cobrado: 610, risco: 14, tipoGlosa: "administrativa", motivo: "Quantidade acima do padrão histórico em alguns pedidos", qtd: [2, 3] },
    ],
  },
  {
    cd: 1103, nome: "Osteossíntese de fratura de rádio distal", especialidade: "Ortopedia", porte: "M", cid: "S52.5",
    pacoteProb: 0.5, honorario: 4200, peso: 9,
    itens: [
      { nome: "Placa bloqueada de rádio distal", tuss: "70010113", anvisa: "80080290187", custo: 3800, cobrado: 5250, risco: 28, tipoGlosa: "valor", motivo: "Placa anatômica premium paga pelo valor da placa convencional", qtd: [1, 1],
        equivalente: { nome: "Placa bloqueada de rádio distal (linha padrão)", anvisa: "80080290194", custo: 2600, cobrado: 4900, risco: 11 } },
      { nome: "Parafuso bloqueado 2,4 mm", tuss: "70010148", anvisa: "80080290201", custo: 180, cobrado: 265, risco: 19, tipoGlosa: "administrativa", motivo: "Quantidade acima do padrão histórico do procedimento", qtd: [6, 9] },
    ],
  },
  {
    cd: 1104, nome: "Reconstrução de ligamento cruzado anterior", especialidade: "Ortopedia", porte: "M", cid: "S83.5",
    pacoteProb: 0.45, honorario: 5600, peso: 8,
    itens: [
      { nome: "Parafuso de interferência bioabsorvível", tuss: "70560120", anvisa: "10223710066", custo: 2400, cobrado: 2950, risco: 61, tipoGlosa: "tecnica", motivo: "Material bioabsorvível fora da cobertura contratual sem justificativa", qtd: [1, 2],
        equivalente: { nome: "Parafuso de interferência de titânio", anvisa: "10223710073", custo: 950, cobrado: 1850, risco: 8 } },
      { nome: "Botão de fixação cortical", tuss: "70560155", anvisa: "10223710080", custo: 2100, cobrado: 2850, risco: 17, tipoGlosa: "valor", motivo: "Divergência pontual de preço com a tabela da operadora", qtd: [1, 1] },
    ],
  },
  // ---------------- NEUROCIRURGIA (COLUNA) ----------------
  {
    cd: 2101, nome: "Artrodese de coluna lombar (2 níveis)", especialidade: "Neurocirurgia", porte: "G", cid: "M43.1",
    pacoteProb: 0.15, honorario: 14200, peso: 9,
    itens: [
      { nome: "Parafuso pedicular poliaxial", tuss: "70580016", anvisa: "80045910112", custo: 1650, cobrado: 2350, risco: 33, tipoGlosa: "valor", motivo: "Preço unitário acima do referencial da operadora", qtd: [4, 6] },
      { nome: "Haste de titânio 5,5 mm", tuss: "70580024", anvisa: "80045910129", custo: 900, cobrado: 1320, risco: 9, tipoGlosa: "administrativa", motivo: "Baixo histórico de glosa", qtd: [2, 2] },
      { nome: "Cage intersomático PEEK", tuss: "70580059", anvisa: "80045910136", custo: 6800, cobrado: 8300, risco: 56, tipoGlosa: "tecnica", motivo: "Cage exige laudo de instabilidade e exame de imagem anexados", qtd: [1, 2],
        equivalente: { nome: "Cage intersomático de titânio", anvisa: "80045910143", custo: 5100, cobrado: 7950, risco: 21 } },
      { nome: "Substituto ósseo sintético", tuss: "70580083", anvisa: "80045910150", custo: 3200, cobrado: 3550, risco: 69, tipoGlosa: "tecnica", motivo: "Glosado sem justificativa de enxerto autólogo insuficiente", qtd: [1, 1],
        equivalente: { nome: "Enxerto ósseo liofilizado (banco de tecidos)", anvisa: "80045910167", custo: 1900, cobrado: 3300, risco: 27 } },
    ],
  },
  {
    cd: 2102, nome: "Microdiscectomia lombar", especialidade: "Neurocirurgia", porte: "M", cid: "M51.1",
    pacoteProb: 0.55, honorario: 6100, peso: 7,
    itens: [
      { nome: "Kit de discectomia descartável", tuss: "70580121", anvisa: "80045910174", custo: 1400, cobrado: 1620, risco: 50, tipoGlosa: "administrativa", motivo: "Kit descartável cobrado fora do pacote do procedimento", qtd: [1, 1] },
      { nome: "Selante de dura-máter", tuss: "70580148", anvisa: "80045910181", custo: 2600, cobrado: 2820, risco: 64, tipoGlosa: "tecnica", motivo: "Selante sem registro de fístula liquórica no pedido", qtd: [1, 1] },
    ],
  },
  // ---------------- CARDIOLOGIA / HEMODINÂMICA ----------------
  {
    cd: 3101, nome: "Angioplastia coronária com implante de stent", especialidade: "Cardiologia", porte: "G", cid: "I25.1",
    pacoteProb: 0.25, honorario: 7800, peso: 10,
    itens: [
      { nome: "Stent coronário farmacológico", tuss: "70700017", anvisa: "10332340321", custo: 7200, cobrado: 9900, risco: 26, tipoGlosa: "valor", motivo: "Stent de última geração pago como stent farmacológico padrão", qtd: [1, 2],
        equivalente: { nome: "Stent coronário farmacológico (fabricante nacional)", anvisa: "80209450044", custo: 4900, cobrado: 9300, risco: 12 } },
      { nome: "Cateter balão de alta pressão", tuss: "70700041", anvisa: "10332340338", custo: 1300, cobrado: 1920, risco: 18, tipoGlosa: "administrativa", motivo: "Segundo balão sem justificativa no relatório", qtd: [1, 2] },
      { nome: "Guia coronária 0,014\"", tuss: "70700068", anvisa: "10332340345", custo: 450, cobrado: 630, risco: 11, tipoGlosa: "administrativa", motivo: "Baixo histórico de glosa", qtd: [1, 2] },
    ],
  },
  {
    cd: 3102, nome: "Implante de marca-passo definitivo dupla câmara", especialidade: "Cardiologia", porte: "G", cid: "I44.2",
    pacoteProb: 0.2, honorario: 8400, peso: 6,
    itens: [
      { nome: "Gerador de marca-passo DDDR com telemetria", tuss: "70720018", anvisa: "10339190412", custo: 16800, cobrado: 21200, risco: 34, tipoGlosa: "valor", motivo: "Telemetria remota não coberta; operadora paga pelo modelo básico", qtd: [1, 1],
        equivalente: { nome: "Gerador de marca-passo DDDR", anvisa: "10339190429", custo: 11800, cobrado: 19600, risco: 10 } },
      { nome: "Eletrodo de fixação ativa", tuss: "70720034", anvisa: "10339190436", custo: 2300, cobrado: 3150, risco: 13, tipoGlosa: "administrativa", motivo: "Baixo histórico de glosa", qtd: [2, 2] },
    ],
  },
  // ---------------- CIRURGIA VASCULAR ----------------
  {
    cd: 6101, nome: "Correção endovascular de aneurisma de aorta", especialidade: "Cirurgia Vascular", porte: "G", cid: "I71.4",
    pacoteProb: 0.1, honorario: 16500, peso: 5,
    itens: [
      { nome: "Endoprótese aórtica bifurcada", tuss: "70760010", anvisa: "10332340512", custo: 58000, cobrado: 72500, risco: 30, tipoGlosa: "valor", motivo: "Valor acima do referencial; operadora solicita 3 cotações", qtd: [1, 1] },
      { nome: "Extensão ilíaca", tuss: "70760037", anvisa: "10332340529", custo: 9500, cobrado: 12100, risco: 25, tipoGlosa: "tecnica", motivo: "Segunda extensão exige medida em angiotomografia", qtd: [1, 2] },
      { nome: "Introdutor valvulado de grosso calibre", tuss: "70760053", anvisa: "10332340536", custo: 1400, cobrado: 1720, risco: 43, tipoGlosa: "administrativa", motivo: "Frequentemente considerado incluso no kit da endoprótese", qtd: [1, 2] },
    ],
  },
  {
    cd: 6102, nome: "Angioplastia de artéria femoral com stent", especialidade: "Cirurgia Vascular", porte: "M", cid: "I70.2",
    pacoteProb: 0.3, honorario: 6900, peso: 6,
    itens: [
      { nome: "Stent periférico autoexpansível", tuss: "70760088", anvisa: "10332340543", custo: 5200, cobrado: 6950, risco: 27, tipoGlosa: "valor", motivo: "Divergência de preço com a tabela da operadora", qtd: [1, 2] },
      { nome: "Balão farmacológico periférico", tuss: "70760096", anvisa: "10332340550", custo: 6300, cobrado: 6850, risco: 62, tipoGlosa: "tecnica", motivo: "Balão farmacológico exige comprovação de reestenose", qtd: [1, 1],
        equivalente: { nome: "Balão de angioplastia periférico convencional", anvisa: "10332340567", custo: 1200, cobrado: 2650, risco: 10 } },
    ],
  },
  // ---------------- UROLOGIA ----------------
  {
    cd: 5101, nome: "Ureterolitotripsia flexível a laser", especialidade: "Urologia", porte: "M", cid: "N20.1",
    pacoteProb: 0.5, honorario: 5200, peso: 8,
    itens: [
      { nome: "Fibra laser 272 µm", tuss: "70830018", anvisa: "80198510041", custo: 2100, cobrado: 2650, risco: 38, tipoGlosa: "valor", motivo: "Fibra de uso único paga como reprocessável por algumas operadoras", qtd: [1, 1] },
      { nome: "Bainha de acesso ureteral", tuss: "70830034", anvisa: "80198510058", custo: 1200, cobrado: 1520, risco: 45, tipoGlosa: "administrativa", motivo: "Bainha não discriminada no pedido médico", qtd: [1, 1] },
      { nome: "Cateter duplo J", tuss: "70830050", anvisa: "80198510065", custo: 380, cobrado: 530, risco: 9, tipoGlosa: "administrativa", motivo: "Baixo histórico de glosa", qtd: [1, 1] },
      { nome: "Cesta extratora de nitinol", tuss: "70830077", anvisa: "80198510072", custo: 1600, cobrado: 2020, risco: 33, tipoGlosa: "valor", motivo: "Nitinol pago pelo valor da cesta de aço", qtd: [1, 1],
        equivalente: { nome: "Cesta extratora de aço", anvisa: "80198510089", custo: 800, cobrado: 1550, risco: 12 } },
    ],
  },
  // ---------------- OTORRINOLARINGOLOGIA ----------------
  {
    cd: 4101, nome: "Septoplastia com turbinectomia", especialidade: "Otorrinolaringologia", porte: "P", cid: "J34.2",
    pacoteProb: 0.6, honorario: 3100, peso: 7,
    itens: [
      { nome: "Splint nasal de silicone", tuss: "70880016", anvisa: "80311730014", custo: 380, cobrado: 430, risco: 63, tipoGlosa: "administrativa", motivo: "Item considerado incluso no porte do procedimento", qtd: [2, 2] },
      { nome: "Ponteira de microdebridador", tuss: "70880032", anvisa: "80311730021", custo: 2900, cobrado: 3150, risco: 71, tipoGlosa: "tecnica", motivo: "Microdebridador sem justificativa técnica é glosado com frequência", qtd: [1, 1] },
    ],
  },
  {
    cd: 4102, nome: "Sinusectomia endoscópica", especialidade: "Otorrinolaringologia", porte: "M", cid: "J32.4",
    pacoteProb: 0.4, honorario: 4400, peso: 6,
    itens: [
      { nome: "Ponteira de shaver para seios paranasais", tuss: "70880059", anvisa: "80311730038", custo: 2700, cobrado: 3020, risco: 57, tipoGlosa: "tecnica", motivo: "Exige tomografia de seios da face anexada ao pedido", qtd: [1, 1] },
      { nome: "Espaçador de seio frontal", tuss: "70880075", anvisa: "80311730045", custo: 1800, cobrado: 1960, risco: 68, tipoGlosa: "tecnica", motivo: "Espaçador sem cobertura na maioria dos contratos", qtd: [1, 1] },
    ],
  },
  // ---------------- CIRURGIA CARDÍACA ----------------
  {
    cd: 7101, nome: "Troca valvar aórtica", especialidade: "Cirurgia Cardíaca", porte: "G", cid: "I35.0",
    pacoteProb: 0.15, honorario: 15800, peso: 5,
    itens: [
      { nome: "Prótese valvar aórtica biológica", tuss: "70740017", anvisa: "10332340611", custo: 16500, cobrado: 22100, risco: 26, tipoGlosa: "valor", motivo: "Prótese biológica paga pelo valor da mecânica em alguns contratos", qtd: [1, 1],
        equivalente: { nome: "Prótese valvar aórtica mecânica", anvisa: "10332340628", custo: 9800, cobrado: 17600, risco: 12 } },
      { nome: "Kit de circulação extracorpórea", tuss: "70740033", anvisa: "10332340635", custo: 4800, cobrado: 5650, risco: 38, tipoGlosa: "administrativa", motivo: "Kit cobrado separado do pacote de circulação extracorpórea", qtd: [1, 1] },
      { nome: "Cola biológica cirúrgica", tuss: "70740050", anvisa: "10332340642", custo: 2200, cobrado: 2450, risco: 58, tipoGlosa: "tecnica", motivo: "Cola biológica exige registro de sangramento no relatório cirúrgico", qtd: [1, 2] },
    ],
  },
  // ---------------- CIRURGIA GERAL ----------------
  {
    cd: 8101, nome: "Hernioplastia inguinal videolaparoscópica", especialidade: "Cirurgia Geral", porte: "M", cid: "K40.9",
    pacoteProb: 0.55, honorario: 3900, peso: 7,
    itens: [
      { nome: "Tela de polipropileno macroporosa", tuss: "70900017", anvisa: "80197430011", custo: 650, cobrado: 990, risco: 16, tipoGlosa: "valor", motivo: "Divergência pontual de preço com a tabela da operadora", qtd: [1, 1] },
      { nome: "Grampeador de fixação de tela (tacker)", tuss: "70900033", anvisa: "80197430028", custo: 2600, cobrado: 2920, risco: 60, tipoGlosa: "tecnica", motivo: "Fixação por tacker glosada quando há alternativa de sutura ou cola", qtd: [1, 1],
        equivalente: { nome: "Fixação de tela com cola de cianoacrilato", anvisa: "80197430035", custo: 900, cobrado: 1520, risco: 22 } },
      { nome: "Trocarte descartável 12 mm", tuss: "70900050", anvisa: "80197430042", custo: 380, cobrado: 465, risco: 45, tipoGlosa: "administrativa", motivo: "Trocarte descartável considerado incluso no porte do procedimento", qtd: [2, 3] },
    ],
  },
  // ---------------- GINECOLOGIA ----------------
  {
    cd: 8201, nome: "Histerectomia videolaparoscópica", especialidade: "Ginecologia", porte: "G", cid: "D25.9",
    pacoteProb: 0.4, honorario: 6200, peso: 6,
    itens: [
      { nome: "Pinça seladora de vasos descartável", tuss: "70920011", anvisa: "80197430059", custo: 3900, cobrado: 4320, risco: 55, tipoGlosa: "tecnica", motivo: "Selador de vasos exige justificativa de útero volumoso", qtd: [1, 1],
        equivalente: { nome: "Pinça bipolar reutilizável (taxa de uso)", anvisa: "80197430066", custo: 700, cobrado: 1420, risco: 14 } },
      { nome: "Manipulador uterino descartável", tuss: "70920038", anvisa: "80197430073", custo: 850, cobrado: 1060, risco: 40, tipoGlosa: "administrativa", motivo: "Manipulador descartável não discriminado no pedido", qtd: [1, 1] },
      { nome: "Trocarte descartável 5 mm", tuss: "70920054", anvisa: "80197430080", custo: 300, cobrado: 385, risco: 42, tipoGlosa: "administrativa", motivo: "Trocarte descartável considerado incluso no porte do procedimento", qtd: [3, 3] },
    ],
  },
  // ---------------- OFTALMOLOGIA ----------------
  {
    cd: 8301, nome: "Facectomia com implante de lente intraocular", especialidade: "Oftalmologia", porte: "P", cid: "H25.1",
    pacoteProb: 0.6, honorario: 2600, peso: 8,
    itens: [
      { nome: "Lente intraocular multifocal", tuss: "70940015", anvisa: "80146170211", custo: 4200, cobrado: 4950, risco: 64, tipoGlosa: "tecnica", motivo: "Lente multifocal fora do rol; a operadora paga apenas a monofocal", qtd: [1, 1],
        equivalente: { nome: "Lente intraocular monofocal asférica", anvisa: "80146170228", custo: 750, cobrado: 1660, risco: 6 } },
      { nome: "Viscoelástico coesivo", tuss: "70940031", anvisa: "80146170235", custo: 320, cobrado: 425, risco: 14, tipoGlosa: "administrativa", motivo: "Baixo histórico de glosa", qtd: [1, 1] },
      { nome: "Anel de tensão capsular", tuss: "70940058", anvisa: "80146170242", custo: 480, cobrado: 630, risco: 35, tipoGlosa: "tecnica", motivo: "Anel exige registro de fragilidade zonular no pedido", qtd: [1, 1] },
    ],
  },
  // ---------------- CIRURGIA TORÁCICA ----------------
  {
    cd: 8401, nome: "Lobectomia pulmonar videoassistida", especialidade: "Cirurgia Torácica", porte: "G", cid: "C34.1",
    pacoteProb: 0.2, honorario: 11200, peso: 4,
    itens: [
      { nome: "Grampeador endoscópico articulado", tuss: "70960019", anvisa: "80197430097", custo: 3400, cobrado: 4150, risco: 22, tipoGlosa: "valor", motivo: "Modelo articulado pago como grampeador reto", qtd: [1, 1] },
      { nome: "Carga de grampeador endoscópico", tuss: "70960035", anvisa: "80197430103", custo: 1150, cobrado: 1460, risco: 35, tipoGlosa: "administrativa", motivo: "Quantidade de cargas acima do padrão histórico", qtd: [3, 5] },
      { nome: "Selante pulmonar", tuss: "70960051", anvisa: "80197430110", custo: 2800, cobrado: 3020, risco: 60, tipoGlosa: "tecnica", motivo: "Selante sem registro de escape aéreo prolongado", qtd: [1, 1] },
    ],
  },
  // ---------------- CIRURGIA PLÁSTICA ----------------
  {
    cd: 8501, nome: "Reconstrução mamária com implante", especialidade: "Cirurgia Plástica", porte: "M", cid: "Z42.1",
    pacoteProb: 0.3, honorario: 5800, peso: 5,
    itens: [
      { nome: "Implante mamário de silicone texturizado", tuss: "70980013", anvisa: "80102510318", custo: 3200, cobrado: 4150, risco: 30, tipoGlosa: "valor", motivo: "Modelo premium pago como implante padrão", qtd: [1, 2],
        equivalente: { nome: "Implante mamário de silicone liso", anvisa: "80102510325", custo: 2200, cobrado: 3850, risco: 14 } },
      { nome: "Matriz dérmica acelular", tuss: "70980030", anvisa: "80102510332", custo: 9800, cobrado: 10550, risco: 66, tipoGlosa: "tecnica", motivo: "Matriz dérmica sem cobertura na maioria dos contratos", qtd: [1, 1] },
      { nome: "Expansor tecidual", tuss: "70980056", anvisa: "80102510349", custo: 4100, cobrado: 5250, risco: 20, tipoGlosa: "administrativa", motivo: "Baixo histórico de glosa", qtd: [1, 1] },
    ],
  },
  // ---------------- BUCOMAXILOFACIAL ----------------
  {
    cd: 8601, nome: "Osteossíntese de fratura de mandíbula", especialidade: "Bucomaxilofacial", porte: "M", cid: "S02.6",
    pacoteProb: 0.45, honorario: 4300, peso: 5,
    itens: [
      { nome: "Placa de titânio 2.0 mm", tuss: "70020011", anvisa: "80080290316", custo: 780, cobrado: 1060, risco: 18, tipoGlosa: "valor", motivo: "Divergência pontual de preço com a tabela da operadora", qtd: [2, 2] },
      { nome: "Parafuso de titânio 2.0 mm", tuss: "70020038", anvisa: "80080290323", custo: 95, cobrado: 142, risco: 30, tipoGlosa: "administrativa", motivo: "Quantidade acima do padrão histórico do procedimento", qtd: [8, 12] },
      { nome: "Placa reabsorvível", tuss: "70020054", anvisa: "80080290330", custo: 2900, cobrado: 3220, risco: 62, tipoGlosa: "tecnica", motivo: "Material reabsorvível sem justificativa pediátrica", qtd: [1, 1],
        equivalente: { nome: "Placa de titânio 2.0 mm de reconstrução", anvisa: "80080290347", custo: 950, cobrado: 1520, risco: 12 } },
    ],
  },
  // ---------------- GASTROENTEROLOGIA ----------------
  {
    cd: 8701, nome: "CPRE com implante de stent biliar", especialidade: "Gastroenterologia", porte: "M", cid: "K80.5",
    pacoteProb: 0.35, honorario: 3700, peso: 6,
    itens: [
      { nome: "Stent biliar metálico autoexpansível", tuss: "70800011", anvisa: "80198510126", custo: 5800, cobrado: 7250, risco: 40, tipoGlosa: "tecnica", motivo: "Stent metálico exige laudo de obstrução maligna", qtd: [1, 1],
        equivalente: { nome: "Stent biliar plástico", anvisa: "80198510133", custo: 700, cobrado: 1620, risco: 10 } },
      { nome: "Papilótomo descartável", tuss: "70800038", anvisa: "80198510140", custo: 1500, cobrado: 1820, risco: 25, tipoGlosa: "administrativa", motivo: "Segundo papilótomo sem justificativa no relatório", qtd: [1, 1] },
      { nome: "Balão extrator de cálculos", tuss: "70800054", anvisa: "80198510157", custo: 1300, cobrado: 1660, risco: 30, tipoGlosa: "valor", motivo: "Balão de três lúmens pago como balão simples", qtd: [1, 1] },
    ],
  },
  // ---------------- MASTOLOGIA ----------------
  {
    cd: 8801, nome: "Mastectomia com biópsia de linfonodo sentinela", especialidade: "Mastologia", porte: "M", cid: "C50.9",
    pacoteProb: 0.35, honorario: 5100, peso: 5,
    itens: [
      { nome: "Radiofármaco para linfonodo sentinela", tuss: "70820015", anvisa: "80198510164", custo: 1200, cobrado: 1460, risco: 22, tipoGlosa: "administrativa", motivo: "Radiofármaco cobrado sem registro da medicina nuclear", qtd: [1, 1] },
      { nome: "Clipe marcador de mama", tuss: "70820031", anvisa: "80198510171", custo: 650, cobrado: 810, risco: 35, tipoGlosa: "tecnica", motivo: "Clipe sem registro de lesão impalpável no pedido", qtd: [1, 2] },
      { nome: "Bisturi ultrassônico descartável", tuss: "70820058", anvisa: "80198510188", custo: 3600, cobrado: 3920, risco: 58, tipoGlosa: "tecnica", motivo: "Bisturi ultrassônico sem justificativa técnica", qtd: [1, 1],
        equivalente: { nome: "Bisturi elétrico com ponteira reutilizável", anvisa: "80198510195", custo: 250, cobrado: 720, risco: 8 } },
    ],
  },
];

// Órteses e próteses: implantáveis que substituem ou auxiliam uma função (próteses, placas, parafusos, stents...).
// Materiais especiais: descartáveis e insumos de uso no ato cirúrgico (kits, cateteres, selantes, trocartes...).
const TERMOS_OP = ["prótese", "cabeça femoral", "placa", "parafuso", "haste", "cage", "stent", "endoprótese", "extensão ilíaca",
  "gerador de marca-passo", "eletrodo", "lente intraocular", "anel de tensão", "implante mamário", "expansor", "botão de fixação",
  "tela de polipropileno", "substituto ósseo", "enxerto", "splint", "espaçador", "duplo j", "clipe marcador"];

export function classeDoItem(nome: string): ClasseOpme {
  const n = nome.toLowerCase();
  return TERMOS_OP.some((t) => n.includes(t)) ? "OP" : "ME";
}

/** Prazo esperado em cada etapa (dias); a autorização usa o prazo médio da operadora */
export const SLA_ETAPA: Record<string, number> = {
  "Aguardando Cotação": 2,
  "Em Cotação": 3,
  "Aguardando Autorização": 0,
  "Em Análise": 0,
  "Autorizado": 4,
  "Aguardando Realização": 0,
  "Confirmação": 2,
};

export const ETAPAS_PROCESSO: Array<{ nome: string; peso: number }> = [
  { nome: "Aguardando Cotação", peso: 17 },
  { nome: "Em Cotação", peso: 14 },
  { nome: "Aguardando Autorização", peso: 20 },
  { nome: "Em Análise", peso: 16 },
  { nome: "Autorizado", peso: 15 },
  { nome: "Aguardando Realização", peso: 12 },
  { nome: "Confirmação", peso: 6 },
];

export const USUARIO_DEMO = { username: "opme.demo", nome: "Compras e Comercial (demo)" };
