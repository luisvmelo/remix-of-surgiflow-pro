import { useSurgical } from "@/contexts/SurgicalContext";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const RentabilityIndicator = () => {
  const { state } = useSurgical();
  const score = state.rentabilityScore;
  const risk = state.glossRisk;

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
        {score >= 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
        <span className="font-semibold text-success">
          Rent. {score > 0 ? "+" : ""}{score}%
        </span>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${risk > 30 ? "bg-destructive/10 border border-destructive/20" : "bg-muted border border-border"}`}>
        <Minus className="w-4 h-4 text-muted-foreground" />
        <span className={`font-semibold ${risk > 30 ? "text-destructive" : "text-muted-foreground"}`}>
          Glosa {risk}%
        </span>
      </div>
    </div>
  );
};

export default RentabilityIndicator;
