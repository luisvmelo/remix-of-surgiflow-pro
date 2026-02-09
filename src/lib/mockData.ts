// ============================================================
// MOCK DATA — Protótipo visual "SolicitaCirurg"
// ============================================================

export const mockDoctors = [
  { id: "1", name: "Dr. Ricardo Almeida", specialty: "Ortopedia", crm: "CRM/SP 12345", active: true },
  { id: "2", name: "Dra. Marina Santos", specialty: "Cirurgia Geral", crm: "CRM/SP 67890", active: true },
  { id: "3", name: "Dr. Paulo Mendes", specialty: "Neurocirurgia", crm: "CRM/RJ 11223", active: true },
  { id: "4", name: "Dra. Carla Ribeiro", specialty: "Cardiologia", crm: "CRM/MG 44556", active: false },
  { id: "5", name: "Dr. Fernando Costa", specialty: "Urologia", crm: "CRM/SP 78901", active: true },
  { id: "6", name: "Dra. Juliana Pires", specialty: "Ginecologia", crm: "CRM/RJ 33445", active: true },
  { id: "7", name: "Dr. André Lopes", specialty: "Ortopedia", crm: "CRM/MG 55667", active: true },
  { id: "8", name: "Dra. Beatriz Tavares", specialty: "Cirurgia Plástica", crm: "CRM/SP 99012", active: false },
];

export const mockOperadoras = [
  { id: "1", name: "Unimed" },
  { id: "2", name: "Bradesco Saúde" },
  { id: "3", name: "Amil" },
  { id: "4", name: "SulAmérica" },
  { id: "5", name: "Porto Seguro Saúde" },
  { id: "6", name: "Hapvida NotreDame" },
];

export const mockPatients = [
  { id: "1", name: "João Carlos Silva", cpf: "123.456.789-00", birthDate: "1985-03-15", phone: "(11) 99876-5432", motherName: "Maria da Silva", operadoraId: "1" },
  { id: "2", name: "Ana Paula Ferreira", cpf: "987.654.321-00", birthDate: "1990-07-22", phone: "(21) 98765-4321", motherName: "Rosa Ferreira", operadoraId: "2" },
  { id: "3", name: "Carlos Eduardo Martins", cpf: "456.789.123-00", birthDate: "1978-11-08", phone: "(31) 97654-3210", motherName: "Teresa Martins", operadoraId: "3" },
  { id: "4", name: "Mariana Souza Lima", cpf: "321.654.987-00", birthDate: "1992-01-30", phone: "(11) 96543-2109", motherName: "Lucia Souza", operadoraId: "1" },
  { id: "5", name: "Roberto Nascimento", cpf: "654.321.789-00", birthDate: "1965-09-12", phone: "(21) 95432-1098", motherName: "Sônia Nascimento", operadoraId: "4" },
];

export const mockExtractedItems = [
  { id: "1", name: "Placa de Titânio 3.5mm", supplier: "Synthes", quantity: 2, type: "OPME" as const, uncertain: false, status: "ok" as const },
  { id: "2", name: "Parafuso Cortical 3.5x40mm", supplier: "Synthes", quantity: 8, type: "OPME" as const, uncertain: false, status: "ok" as const },
  { id: "3", name: "Parafuso Bloqueado 3.5x30mm", supplier: "", quantity: 4, type: "OPME" as const, uncertain: true, status: "no-supplier" as const },
  { id: "4", name: "Kit de Instrumental Ortopédico", supplier: "Synthes", quantity: 1, type: "Material" as const, uncertain: false, status: "ok" as const },
  { id: "5", name: "Fio de Sutura Vicryl 2-0", supplier: "Ethicon", quantity: 3, type: "Material" as const, uncertain: false, status: "ok" as const },
  { id: "6", name: "Âncora de Sutura 5.5mm", supplier: "Arthrex", quantity: 2, type: "OPME" as const, uncertain: false, status: "ok" as const },
  { id: "7", name: "Cânula Artroscópica 8mm", supplier: "", quantity: 1, type: "OPME" as const, uncertain: true, status: "no-supplier" as const },
  { id: "8", name: "Lâmina de Shaver 5.5mm", supplier: "Smith & Nephew", quantity: 2, type: "Material" as const, uncertain: false, status: "ok" as const },
  { id: "9", name: "Dreno Portovac 3.2mm", supplier: "BBraun", quantity: 1, type: "Material" as const, uncertain: false, status: "ok" as const },
  { id: "10", name: "Fio Guia 2.0mm", supplier: "Synthes", quantity: 2, type: "OPME" as const, uncertain: false, status: "ok" as const },
];

export const mockExtractedProcedure = {
  code: "30725119",
  name: "Artroscopia de Joelho — Meniscectomia",
};

export const mockProcedures = [
  { code: "30725119", name: "Artroscopia de Joelho — Meniscectomia", common: true, doctorUses: true },
  { code: "30715016", name: "Tratamento cirúrgico de fratura de punho", common: true, doctorUses: true },
  { code: "30725097", name: "Reconstrução de LCA", common: true, doctorUses: true },
  { code: "30725080", name: "Osteossíntese de platô tibial", common: false, doctorUses: false },
  { code: "30725038", name: "Artroscopia de Ombro — Reparo do manguito", common: true, doctorUses: true },
  { code: "30725060", name: "Artroplastia total de quadril", common: false, doctorUses: false },
];

export const mockLinkedProcedures = [
  { code: "30725020", name: "Condroplastia artroscópica", approvalRate: 94, glossRate: 6, rentabilityDelta: "+R$ 820", reason: "Procedimento complementar mais comum", doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true, isExtrapacote: false },
  { code: "30715024", name: "Sinovectomia parcial", approvalRate: 88, glossRate: 12, rentabilityDelta: "+R$ 350", reason: "Melhora rentabilidade com extrapacote", doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true, isExtrapacote: true },
  { code: "30725038", name: "Desbridamento articular", approvalRate: 72, glossRate: 28, rentabilityDelta: "-R$ 180", reason: "Alta taxa de glosa nesta operadora", doctorUses: false, isOfensor: true, isGlosado: true, improvesRent: false, isExtrapacote: false },
  { code: "31003079", name: "Bloqueio anestésico regional", approvalRate: 96, glossRate: 4, rentabilityDelta: "+R$ 420", reason: "Procedimento padrão complementar", doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true, isExtrapacote: false },
  { code: "30725045", name: "Capsulotomia artroscópica", approvalRate: 65, glossRate: 35, rentabilityDelta: "-R$ 290", reason: "Comumente glosado — atenção", doctorUses: false, isOfensor: true, isGlosado: true, improvesRent: false, isExtrapacote: false },
  { code: "30725052", name: "Liberação de retináculo lateral", approvalRate: 82, glossRate: 18, rentabilityDelta: "+R$ 180", reason: "Melhora com extrapacote", doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true, isExtrapacote: true },
];

export const mockRecommendedOPMEs = [
  { name: "Placa LCP 3.5mm Distal Radius", supplier: "Synthes", inGuide: true, recommended: true, doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true, impactDelta: "+R$ 0" },
  { name: "Parafuso Bloqueado 3.5x28mm", supplier: "Synthes", inGuide: false, recommended: true, doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: false, impactDelta: "+R$ 120" },
  { name: "Âncora Bio-Compósita 5.5mm", supplier: "Arthrex", inGuide: false, recommended: true, doctorUses: false, isOfensor: true, isGlosado: false, improvesRent: false, impactDelta: "-R$ 340" },
  { name: "K-Wire 1.6mm", supplier: "Synthes", inGuide: true, recommended: true, doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true, impactDelta: "+R$ 0" },
  { name: "Cânula Artroscópica 7mm", supplier: "Smith & Nephew", inGuide: false, recommended: true, doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true, impactDelta: "+R$ 260" },
  { name: "Lâmina Shaver Agressiva", supplier: "Smith & Nephew", inGuide: true, recommended: true, doctorUses: true, isOfensor: false, isGlosado: true, improvesRent: false, impactDelta: "-R$ 80" },
  { name: "Implante Interferencial Titânio 7x23", supplier: "Arthrex", inGuide: false, recommended: true, doctorUses: false, isOfensor: true, isGlosado: true, improvesRent: false, impactDelta: "-R$ 520" },
  { name: "Fio de Alta Resistência #2", supplier: "Arthrex", inGuide: true, recommended: true, doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true, impactDelta: "+R$ 0" },
];

export const mockDocuments = [
  { name: "Guia TISS preenchida", required: true, attachedPercent: 98, attached: false },
  { name: "Relatório médico detalhado", required: true, attachedPercent: 95, attached: false },
  { name: "Exames de imagem (RX/TC/RM)", required: true, attachedPercent: 89, attached: false },
  { name: "Exames pré-operatórios", required: true, attachedPercent: 82, attached: false },
  { name: "Termo de consentimento", required: false, attachedPercent: 67, attached: false },
  { name: "Cotação de OPME (3 fornecedores)", required: false, attachedPercent: 72, attached: false },
  { name: "Justificativa clínica complementar", required: false, attachedPercent: 45, attached: false },
];

// ============ Types ============

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;

export interface WizardState {
  currentStep: WizardStep;
  doctor: typeof mockDoctors[0] | null;
  patient: typeof mockPatients[0] | null;
  operadora: typeof mockOperadoras[0] | null;
  uploadedFile: string | null;
  extractedItems: typeof mockExtractedItems;
  confirmedItems: boolean;
  selectedProcedure: typeof mockProcedures[0] | null;
  linkedProcedures: string[];
  documents: typeof mockDocuments;
  rentabilityScore: number;
  glossRisk: number;
  historicalPercentile: number;
  bestPossible: number;
}

export interface SavedRequest {
  id: string;
  patient: string;
  operadora: string;
  procedure: string;
  code: string;
  doctor: string;
  date: string;
  itemCount: number;
  status: "draft" | "awaiting-auth" | "docs-pending" | "authorized";
  statusLabel: string;
  missingDocs: number;
  hasOffenders: boolean;
  hasGlossRisk: boolean;
}
