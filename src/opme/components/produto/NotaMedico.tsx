import { Star } from "lucide-react";
import { cn } from "@opme/lib/utils";

/** Nota de preferência do médico (0 a 5 estrelas), derivada do histórico de uso */
const NotaMedico = ({ nota, className }: { nota: number; className?: string }) => (
  <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Preferência do médico: ${nota} de 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={cn("w-3.5 h-3.5", i <= nota ? "fill-amber-400 text-amber-400" : "fill-transparent text-cinza-300")}
        strokeWidth={1.8}
      />
    ))}
  </span>
);

export default NotaMedico;
