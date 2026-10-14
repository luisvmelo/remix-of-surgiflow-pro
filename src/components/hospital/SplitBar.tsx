import { brl } from "@/lib/remuneracao";

/** Barra que mostra como um valor se divide entre hospital (azul) e médico (verde-azulado). */
const SplitBar = ({ hospital, medico, showLabels = true }: { hospital: number; medico: number; showLabels?: boolean }) => {
  const total = Math.max(1, hospital + medico);
  const hPct = Math.max(0, (hospital / total) * 100);
  const mPct = Math.max(0, (medico / total) * 100);

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        <div className="transition-all duration-500" style={{ width: `${hPct}%`, background: "var(--serie-hospital)" }} />
        <div className="transition-all duration-500 border-l-2 border-card" style={{ width: `${mPct}%`, background: "var(--serie-medico)" }} />
      </div>
      {showLabels && (
        <div className="flex justify-between mt-1.5 text-[11px] tabular-nums">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--serie-hospital)" }} />
            Hospital fica com <strong className="text-foreground">{brl(hospital)}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            Médico recebe <strong className="text-foreground">{brl(medico)}</strong>
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--serie-medico)" }} />
          </span>
        </div>
      )}
    </div>
  );
};

export default SplitBar;
