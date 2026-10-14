import { cn } from "@/lib/utils";
import { brlDelta, faixaDescricao, type Faixa } from "@/lib/remuneracao";

const faixaStyle: Record<Faixa, string> = {
  A: "bg-success/15 text-success border-success/30",
  B: "bg-warning/15 text-warning border-warning/30",
  C: "bg-muted text-muted-foreground border-border",
};

export const FaixaBadge = ({ faixa }: { faixa?: Faixa }) => {
  if (!faixa) return null;
  return (
    <span
      title={faixaDescricao[faixa]}
      className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-semibold", faixaStyle[faixa])}
    >
      Faixa {faixa}
    </span>
  );
};

/** Quanto a escolha soma ao honorário do médico (honorário complementar). */
export const ComplementarValue = ({ value, className }: { value: number; className?: string }) => (
  <span
    className={cn(
      "text-xs font-bold tabular-nums",
      value > 0 ? "text-success" : "text-muted-foreground",
      className,
    )}
  >
    {value > 0 ? brlDelta(value) : "Sem adicional"}
  </span>
);
