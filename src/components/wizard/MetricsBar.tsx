import { useSurgical } from "@/contexts/SurgicalContext";
import { useRemuneracao } from "@/hooks/useRemuneracao";
import { brl } from "@/lib/remuneracao";
import { Wallet, Shield } from "lucide-react";

// Visão do médico/secretária: só o honorário do médico e o risco de glosa.
const MetricsBar = () => {
  const { state } = useSurgical();
  const { calculo, config } = useRemuneracao();
  const gloss = state.glossRisk;

  const extra = calculo.honorarioTotal - calculo.honorarioPrincipal;
  const glossPercent = Math.min(100, Math.max(0, (gloss / 50) * 100));
  const glossColor = gloss <= 10 ? "success" : gloss <= 25 ? "warning" : "destructive";

  return (
    <div className="flex items-center gap-4 shrink-0">
      {/* Honorário do médico */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[260px]"
        style={{ borderColor: "hsl(var(--primary) / 0.3)", backgroundColor: "hsl(var(--primary) / 0.05)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}
        >
          <Wallet className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Honorário médico</span>
            <span className="text-base font-extrabold tabular-nums text-primary">{brl(calculo.honorarioTotal)}</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">
            Base {brl(calculo.honorarioPrincipal)}
            {extra > 0 && <span className="text-success font-semibold"> · +{brl(extra)} pelas escolhas</span>}
            {!config.rentabilidadeHabilitada && <span> · sem complementar</span>}
          </div>
        </div>
      </div>

      {/* Risco de Glosa */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[220px]"
        style={{
          borderColor: `hsl(var(--${glossColor}) / 0.3)`,
          backgroundColor: `hsl(var(--${glossColor}) / 0.05)`,
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `hsl(var(--${glossColor}) / 0.15)` }}
        >
          <Shield className="w-4.5 h-4.5" style={{ color: `hsl(var(--${glossColor}))` }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Risco Glosa</span>
            <span
              className="text-base font-extrabold tabular-nums"
              style={{ color: `hsl(var(--${glossColor}))` }}
            >
              {gloss}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mt-1.5">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${glossPercent}%`,
                backgroundColor: `hsl(var(--${glossColor}))`,
                boxShadow: `0 0 6px hsl(var(--${glossColor}) / 0.3)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsBar;
