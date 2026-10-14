import { cn } from "@opme/lib/utils";
import { nivelDoRisco } from "@opme/types/produto";

const ESTILO_NIVEL = {
  alto: "bg-status-error-bg text-status-error-text border-red-200",
  medio: "bg-status-warning-bg text-status-warning-text border-amber-200",
  baixo: "bg-status-success-bg text-status-success-text border-emerald-200",
};

const LABEL_NIVEL = { alto: "Risco alto", medio: "Risco médio", baixo: "Risco baixo" };

interface RiscoBadgeProps {
  risco: number;
  /** Mostra "Risco alto" antes do percentual */
  comLabel?: boolean;
  className?: string;
}

/** Selo com o risco de glosa (0-100) e a cor do nível */
const RiscoBadge = ({ risco, comLabel = false, className }: RiscoBadgeProps) => {
  const nivel = nivelDoRisco(risco);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold tabular-nums whitespace-nowrap",
        ESTILO_NIVEL[nivel],
        className
      )}
      title={`${LABEL_NIVEL[nivel]}: ${risco}% de chance de glosa`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {comLabel && <span className="font-semibold">{LABEL_NIVEL[nivel]}</span>}
      {risco}%
    </span>
  );
};

export default RiscoBadge;
