import type { StatusPedido } from "@/dominio/tipos";

export const brl = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

export const dataBR = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const LABEL_STATUS: Record<StatusPedido, string> = {
  rascunho: "Rascunho",
  aguardando_medico: "Aguardando o médico",
  esperando_confirmacao: "Esperando confirmação",
  confirmado: "Confirmado",
};
