import { Award, Eye, Minus, Target } from "lucide-react";
import type { StatusMedico } from "@/lib/consultoria";

export const statusMedico: Record<StatusMedico, { label: string; icon: typeof Award; className: string }> = {
  referencia: { label: "Referência", icon: Award, className: "badge-success" },
  oportunidade: { label: "Oportunidade", icon: Target, className: "badge-info" },
  atencao: { label: "Atenção", icon: Eye, className: "badge-warning" },
  estavel: { label: "Estável", icon: Minus, className: "bg-muted text-muted-foreground border border-border" },
};
