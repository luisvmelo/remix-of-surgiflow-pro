// ============================================================
// GUIAS — composição das solicitações já montadas (mock).
// A tela do hospital e as telas do médico calculam honorário e
// margem a partir daqui, usando a configuração atual do hospital.
// ============================================================

import { mockOperadoras } from "./mockData";
import { calcularGuia, type HospitalConfig, type NivelPlano } from "./remuneracao";

export interface GuiaMock {
  id: string;
  patient: string;
  doctorId: string;
  doctor: string;
  operadoraId: string;
  nivel: NivelPlano;
  procedure: string;
  code: string;
  date: string;
  vinculados: string[];
  itens: { name: string; quantity: number }[];
  glossRisk: number;
  status: "awaiting-validation" | "approved" | "sent";
}

export const mockGuias: GuiaMock[] = [
  {
    id: "d1", patient: "João Carlos Silva", doctorId: "1", doctor: "Dr. Ricardo Almeida",
    operadoraId: "1", nivel: "Executivo",
    procedure: "Artroscopia de Joelho — Meniscectomia", code: "30725119", date: "2026-02-18",
    vinculados: ["30725020", "31003079"],
    itens: [
      { name: "Placa LCP 3.5mm Distal Radius", quantity: 2 },
      { name: "Parafuso Bloqueado 3.5x28mm", quantity: 8 },
      { name: "Cânula Artroscópica 7mm", quantity: 1 },
      { name: "K-Wire 1.6mm", quantity: 2 },
      { name: "Fio de Alta Resistência #2", quantity: 3 },
    ],
    glossRisk: 8, status: "awaiting-validation",
  },
  {
    id: "d2", patient: "Ana Paula Ferreira", doctorId: "1", doctor: "Dr. Ricardo Almeida",
    operadoraId: "2", nivel: "Especial",
    procedure: "Reconstrução de LCA", code: "30725097", date: "2026-02-25",
    vinculados: ["30715024"],
    itens: [
      { name: "Implante Interferencial Titânio 7x23", quantity: 1 },
      { name: "Âncora Bio-Compósita 5.5mm", quantity: 2 },
      { name: "Parafuso Bloqueado 3.5x28mm", quantity: 6 },
      { name: "Fio de Alta Resistência #2", quantity: 4 },
    ],
    glossRisk: 22, status: "awaiting-validation",
  },
  {
    id: "d3", patient: "Mariana Souza Lima", doctorId: "1", doctor: "Dr. Ricardo Almeida",
    operadoraId: "1", nivel: "Especial",
    procedure: "Artroscopia de Ombro — Reparo do manguito", code: "30725038", date: "2026-03-12",
    vinculados: ["30725020", "30725052"],
    itens: [
      { name: "Cânula Artroscópica 7mm", quantity: 2 },
      { name: "Lâmina Shaver Agressiva", quantity: 1 },
      { name: "Fio de Alta Resistência #2", quantity: 6 },
    ],
    glossRisk: 5, status: "awaiting-validation",
  },
  {
    id: "d4", patient: "Carlos Eduardo Martins", doctorId: "1", doctor: "Dr. Ricardo Almeida",
    operadoraId: "3", nivel: "Básico",
    procedure: "Tratamento cirúrgico de fratura de punho", code: "30715016", date: "2026-03-05",
    vinculados: ["31003079"],
    itens: [
      { name: "Placa LCP 3.5mm Distal Radius", quantity: 1 },
      { name: "Parafuso Bloqueado 3.5x28mm", quantity: 6 },
      { name: "K-Wire 1.6mm", quantity: 2 },
    ],
    glossRisk: 4, status: "approved",
  },
  {
    id: "d5", patient: "Roberto Nascimento", doctorId: "1", doctor: "Dr. Ricardo Almeida",
    operadoraId: "4", nivel: "Executivo",
    procedure: "Osteossíntese de platô tibial", code: "30725080", date: "2026-03-20",
    vinculados: ["30725020"],
    itens: [
      { name: "Placa VA-LCP 3.5mm", quantity: 2 },
      { name: "Parafuso Bloqueado 3.5x28mm", quantity: 8 },
    ],
    glossRisk: 3, status: "approved",
  },
  {
    id: "h6", patient: "Fernanda Oliveira", doctorId: "7", doctor: "Dr. André Lopes",
    operadoraId: "6", nivel: "Básico",
    procedure: "Reconstrução de LCA", code: "30725097", date: "2026-03-08",
    vinculados: [],
    itens: [
      { name: "Implante Interferencial PEEK 7x23", quantity: 1 },
      { name: "Âncora PEEK 5.5mm", quantity: 2 },
      { name: "Fio de Alta Resistência #2", quantity: 4 },
    ],
    glossRisk: 9, status: "sent",
  },
  {
    id: "h7", patient: "Lucas Pereira", doctorId: "7", doctor: "Dr. André Lopes",
    operadoraId: "5", nivel: "Especial",
    procedure: "Tratamento cirúrgico de fratura de punho", code: "30715016", date: "2026-03-15",
    vinculados: [],
    itens: [
      { name: "Placa VA-LCP 3.5mm", quantity: 1 },
      { name: "Parafuso Bloqueado 3.5x28mm", quantity: 4 },
    ],
    glossRisk: 6, status: "sent",
  },
  {
    id: "h8", patient: "Patrícia Gomes", doctorId: "1", doctor: "Dr. Ricardo Almeida",
    operadoraId: "6", nivel: "Especial",
    procedure: "Artroscopia de Joelho — Meniscectomia", code: "30725119", date: "2026-03-22",
    vinculados: ["30725045"],
    itens: [
      { name: "Cânula Artroscópica 7mm", quantity: 1 },
      { name: "Lâmina Shaver Agressiva", quantity: 2 },
    ],
    glossRisk: 18, status: "sent",
  },
];

export const operadoraNome = (id: string) => mockOperadoras.find((o) => o.id === id)?.name || "—";

export const calcularGuiaMock = (g: GuiaMock, config: HospitalConfig) =>
  calcularGuia(
    { procedimentoCode: g.code, operadoraId: g.operadoraId, nivel: g.nivel, vinculados: g.vinculados, itens: g.itens },
    config,
  );
