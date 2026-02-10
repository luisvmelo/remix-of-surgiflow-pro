import { useSurgical } from "@/contexts/SurgicalContext";
import { TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const MetricsBar = () => {
  const { state } = useSurgical();
  const rent = state.rentabilityScore;
  const gloss = state.glossRisk;

  const rentPercent = Math.min(100, Math.max(0, ((rent + 10) / 50) * 100));
  const glossPercent = Math.min(100, Math.max(0, (gloss / 50) * 100));

  const rentColor = rent >= 15 ? "success" : rent >= 5 ? "warning" : "destructive";
  const glossColor = gloss <= 10 ? "success" : gloss <= 25 ? "warning" : "destructive";

  return (
    <div className="flex items-center gap-4 shrink-0">
      {/* Rentabilidade */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[240px]"
        style={{
          borderColor: `hsl(var(--${rentColor}) / 0.3)`,
          backgroundColor: `hsl(var(--${rentColor}) / 0.05)`,
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `hsl(var(--${rentColor}) / 0.15)` }}
        >
          <TrendingUp className="w-4.5 h-4.5" style={{ color: `hsl(var(--${rentColor}))` }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rentabilidade</span>
            <span
              className="text-base font-extrabold tabular-nums"
              style={{ color: `hsl(var(--${rentColor}))` }}
            >
              {rent > 0 ? "+" : ""}{rent}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mt-1.5">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${rentPercent}%`,
                backgroundColor: `hsl(var(--${rentColor}))`,
                boxShadow: `0 0 6px hsl(var(--${rentColor}) / 0.3)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Risco de Glosa */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[240px]"
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
    </div>
  );
};

export default MetricsBar;
