export const mockDoctors = [
  { id: "1", name: "Dr. Ricardo Almeida", specialty: "Ortopedia", crm: "CRM/SP 12345" },
  { id: "2", name: "Dra. Marina Santos", specialty: "Cirurgia Geral", crm: "CRM/SP 67890" },
  { id: "3", name: "Dr. Paulo Mendes", specialty: "Neurocirurgia", crm: "CRM/RJ 11223" },
  { id: "4", name: "Dra. Carla Ribeiro", specialty: "Cardiologia", crm: "CRM/MG 44556" },
];

export const mockOperadoras = [
  { id: "1", name: "Unimed" },
  { id: "2", name: "Bradesco Saúde" },
  { id: "3", name: "Amil" },
  { id: "4", name: "SulAmérica" },
  { id: "5", name: "Porto Seguro Saúde" },
];

export const mockPatients = [
  { id: "1", name: "João Carlos Silva", cpf: "123.456.789-00", birthDate: "1985-03-15", phone: "(11) 99876-5432", motherName: "Maria da Silva", operadoraId: "1" },
  { id: "2", name: "Ana Paula Ferreira", cpf: "987.654.321-00", birthDate: "1990-07-22", phone: "(21) 98765-4321", motherName: "Rosa Ferreira", operadoraId: "2" },
  { id: "3", name: "Carlos Eduardo Martins", cpf: "456.789.123-00", birthDate: "1978-11-08", phone: "(31) 97654-3210", motherName: "Teresa Martins", operadoraId: "3" },
];

export const mockExtractedItems = [
  { id: "1", name: "Placa de Titânio 3.5mm", supplier: "Synthes", quantity: 2, type: "OPME", uncertain: false },
  { id: "2", name: "Parafuso Cortical 3.5x40mm", supplier: "Synthes", quantity: 8, type: "OPME", uncertain: false },
  { id: "3", name: "Parafuso Bloqueado 3.5x30mm", supplier: "", quantity: 4, type: "OPME", uncertain: true },
  { id: "4", name: "Kit de Instrumental Ortopédico", supplier: "Synthes", quantity: 1, type: "Material", uncertain: false },
  { id: "5", name: "Fio de Sutura Vicryl 2-0", supplier: "Ethicon", quantity: 3, type: "Material", uncertain: false },
];

export const mockProcedures = [
  { code: "30725119", name: "Osteossíntese de fratura de rádio distal", common: true, doctorUses: true },
  { code: "30715016", name: "Tratamento cirúrgico de fratura de punho", common: true, doctorUses: true },
  { code: "30725097", name: "Redução incruenta de fratura de rádio", common: false, doctorUses: false },
];

export const mockLinkedProcedures = [
  { code: "30725020", name: "Retirada de material de síntese", approvalRate: 92, glossRate: 8, rentabilityDelta: "+R$ 450", reason: "Comumente pedido junto", doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true },
  { code: "30715024", name: "Tenorrafia de extensores", approvalRate: 78, glossRate: 22, rentabilityDelta: "-R$ 120", reason: "Alta taxa de glosa nesta operadora", doctorUses: false, isOfensor: true, isGlosado: true, improvesRent: false },
  { code: "30725038", name: "Artroscopia diagnóstica", approvalRate: 85, glossRate: 15, rentabilityDelta: "+R$ 680", reason: "Melhora rentabilidade com extrapacote", doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true },
  { code: "31003079", name: "Bloqueio anestésico regional", approvalRate: 95, glossRate: 5, rentabilityDelta: "+R$ 320", reason: "Procedimento padrão complementar", doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true },
];

export const mockRecommendedOPMEs = [
  { name: "Placa LCP 3.5mm Distal Radius", supplier: "Synthes", inGuide: true, recommended: true, doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true },
  { name: "Parafuso Bloqueado 3.5x28mm", supplier: "Synthes", inGuide: false, recommended: true, doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: false },
  { name: "Placa Volar Variável", supplier: "Orthofix", inGuide: false, recommended: true, doctorUses: false, isOfensor: true, isGlosado: false, improvesRent: false },
  { name: "K-Wire 1.6mm", supplier: "Synthes", inGuide: true, recommended: true, doctorUses: true, isOfensor: false, isGlosado: false, improvesRent: true },
];

export const mockDocuments = [
  { name: "Guia TISS preenchida", required: true, attachedPercent: 98, attached: false },
  { name: "Relatório médico detalhado", required: true, attachedPercent: 95, attached: false },
  { name: "Exames de imagem (RX/TC)", required: true, attachedPercent: 89, attached: false },
  { name: "Exames pré-operatórios", required: true, attachedPercent: 82, attached: false },
  { name: "Termo de consentimento", required: false, attachedPercent: 67, attached: false },
  { name: "Cotação de OPME", required: false, attachedPercent: 72, attached: false },
];

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
}
