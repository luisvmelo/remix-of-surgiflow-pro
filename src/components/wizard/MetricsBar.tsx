import { useSurgical } from "@/contexts/SurgicalContext";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const MetricsBar = () => {
  const { state } = useSurgical();
  const rent = state.rentabilityScore;
  const gloss = state.glossRisk;

  // Rentability: 0-50 scale mapped to gauge
  const rentPercent = Math.min(100, Math.max(0, ((rent + 10) / 50) * 100));
  // Gloss: 0-50 scale
  const glossPercent = Math.min(100, Math.max(0, (gloss / 50) * 100));

  return (
    <div className="bg-card border-b px-6 py-3 flex items-center gap-8 shrink-0">
      {/* Rentabilidade */}
      <div className="flex items-center gap-3 flex-1 max-w-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <TrendingUp className={cn("w-4 h-4", rent >= 10 ? "text-success" : rent >= 0 ? "text-warning" : "text-destructive")} />
          <span className="text-xs font-semibold text-muted-foreground">Rentabilidade</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                rent >= 15 ? "bg-success" : rent >= 5 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${rentPercent}%` }}
            />
          </div>
          <span className={cn(
            "text-sm font-bold tabular-nums min-w-[3rem] text-right",
            rent >= 10 ? "text-success" : rent >= 0 ? "text-warning" : "text-destructive"
          )}>
            {rent > 0 ? "+" : ""}{rent}%
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Risco de Glosa */}
      <div className="flex items-center gap-3 flex-1 max-w-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <AlertTriangle className={cn("w-4 h-4", gloss <= 10 ? "text-success" : gloss <= 25 ? "text-warning" : "text-destructive")} />
          <span className="text-xs font-semibold text-muted-foreground">Risco Glosa</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                gloss <= 10 ? "bg-success" : gloss <= 25 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${glossPercent}%` }}
            />
          </div>
          <span className={cn(
            "text-sm font-bold tabular-nums min-w-[3rem] text-right",
            gloss <= 10 ? "text-success" : gloss <= 25 ? "text-warning" : "text-destructive"
          )}>
            {gloss}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricsBar;
