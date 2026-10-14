import { Ban, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { AnaliseCirurgia, LABEL_STATUS } from "@opme/lib/otimizador";
import { formatBRL } from "@opme/lib/produto";
import { cn } from "@opme/lib/utils";

/** Selo do status de otimização da cirurgia, sempre com o quanto pode ganhar (ou já ganhou) */
const StatusOtimizacao = ({ analise, className }: { analise: AnaliseCirurgia; className?: string }) => {
  const { status, ganho, capturado, motivo } = analise;
  const estilo = {
    sugerida: "bg-[#325AA4] border-[#325AA4] text-white",
    otimizavel: "bg-emerald-50 border-emerald-300 text-emerald-800",
    melhor_margem: "bg-cinza-100 border-cinza-200 text-cinza-600",
    nao_otimizavel: "bg-red-50 border-red-200 text-red-700",
    definida: "bg-emerald-600 border-emerald-600 text-white",
  }[status];
  const Icon = { sugerida: Sparkles, otimizavel: TrendingUp, melhor_margem: CheckCircle2, nao_otimizavel: Ban, definida: CheckCircle2 }[status];
  const texto =
    status === "sugerida" || status === "otimizavel"
      ? `${LABEL_STATUS[status]} +${formatBRL(ganho)}`
      : status === "definida" && capturado > 0
        ? `${LABEL_STATUS[status]} · +${formatBRL(capturado)}`
        : LABEL_STATUS[status];
  return (
    <span
      title={status === "nao_otimizavel" ? motivo : status === "melhor_margem" ? "Já está no fornecedor de maior margem entre os indicados: não mexe" : undefined}
      className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[12px] font-semibold whitespace-nowrap tabular-nums", estilo, className)}
    >
      <Icon className="w-3.5 h-3.5" />
      {texto}
    </span>
  );
};

export default StatusOtimizacao;
