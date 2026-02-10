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
    <div className="flex items-center gap-3 shrink-0">
      {/* Rentabilidade */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border transition-all duration-300 min-w-[200px]"
        style={{
          borderColor: `hsl(var(--${rentColor}) / 0.3)`,
          backgroundColor: `hsl(var(--${rentColor}) / 0.05)`,
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `hsl(var(--${rentColor}) / 0.15)` }}
        >
          <TrendingUp className="w-3.5 h-3.5" style={{ color: `hsl(var(--${rentColor}))` }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Rentabilidade</span>
            <span
              className="text-sm font-extrabold tabular-nums"
              style={{ color: `hsl(var(--${rentColor}))` }}
            >
              {rent > 0 ? "+" : ""}{rent}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${rentPercent}%`,
                backgroundColor: `hsl(var(--${rentColor}))`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Risco de Glosa */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border transition-all duration-300 min-w-[200px]"
        style={{
          borderColor: `hsl(var(--${glossColor}) / 0.3)`,
          backgroundColor: `hsl(var(--${glossColor}) / 0.05)`,
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `hsl(var(--${glossColor}) / 0.15)` }}
        >
          <Shield className="w-3.5 h-3.5" style={{ color: `hsl(var(--${glossColor}))` }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Risco Glosa</span>
            <span
              className="text-sm font-extrabold tabular-nums"
              style={{ color: `hsl(var(--${glossColor}))` }}
            >
              {gloss}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${glossPercent}%`,
                backgroundColor: `hsl(var(--${glossColor}))`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsBar;
