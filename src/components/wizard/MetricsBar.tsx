import { useSurgical } from "@/contexts/SurgicalContext";
import { TrendingUp, AlertTriangle, Shield } from "lucide-react";
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
    <div className="bg-card/95 backdrop-blur-sm border-b shadow-sm px-6 py-4 flex items-center justify-center gap-6 shrink-0">
      {/* Rentabilidade */}
      <div className={cn(
        "flex items-center gap-4 px-5 py-3 rounded-xl border-2 transition-all duration-300 min-w-[280px]",
        `border-${rentColor}/30 bg-${rentColor}/5`
      )}
        style={{
          borderColor: `hsl(var(--${rentColor}) / 0.3)`,
          backgroundColor: `hsl(var(--${rentColor}) / 0.06)`,
        }}
      >
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
        )}
          style={{ backgroundColor: `hsl(var(--${rentColor}) / 0.15)` }}
        >
          <TrendingUp className="w-5 h-5" style={{ color: `hsl(var(--${rentColor}))` }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rentabilidade</span>
            <span
              className="text-lg font-extrabold tabular-nums tracking-tight"
              style={{ color: `hsl(var(--${rentColor}))` }}
            >
              {rent > 0 ? "+" : ""}{rent}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${rentPercent}%`,
                backgroundColor: `hsl(var(--${rentColor}))`,
                boxShadow: `0 0 8px hsl(var(--${rentColor}) / 0.4)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Risco de Glosa */}
      <div className={cn(
        "flex items-center gap-4 px-5 py-3 rounded-xl border-2 transition-all duration-300 min-w-[280px]",
      )}
        style={{
          borderColor: `hsl(var(--${glossColor}) / 0.3)`,
          backgroundColor: `hsl(var(--${glossColor}) / 0.06)`,
        }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `hsl(var(--${glossColor}) / 0.15)` }}
        >
          <Shield className="w-5 h-5" style={{ color: `hsl(var(--${glossColor}))` }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risco de Glosa</span>
            <span
              className="text-lg font-extrabold tabular-nums tracking-tight"
              style={{ color: `hsl(var(--${glossColor}))` }}
            >
              {gloss}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${glossPercent}%`,
                backgroundColor: `hsl(var(--${glossColor}))`,
                boxShadow: `0 0 8px hsl(var(--${glossColor}) / 0.4)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsBar;
