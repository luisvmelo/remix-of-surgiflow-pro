import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FaixaBadge } from "@/components/wizard/items/HonorarioTags";
import type { MedicoConsultoria } from "@/lib/consultoria";
import { brl } from "@/lib/remuneracao";
import { cn } from "@/lib/utils";
import { CircleDot, Target } from "lucide-react";
import { statusMedico } from "./statusMedico";

const faixaCor = { A: "hsl(var(--success))", B: "hsl(var(--warning))", C: "hsl(var(--muted-foreground) / 0.5)" };

const MedicoSheet = ({ medico, onClose }: { medico: MedicoConsultoria | null; onClose: () => void }) => (
  <Sheet open={!!medico} onOpenChange={(open) => !open && onClose()}>
    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
      {medico && <Perfil m={medico} />}
    </SheetContent>
  </Sheet>
);

const Perfil = ({ m }: { m: MedicoConsultoria }) => {
  const s = statusMedico[m.status];
  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle className="text-base">{m.nome}</SheetTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{m.especialidade}</span>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1", s.className)}>
            <s.icon className="w-3 h-3" /> {s.label}
          </span>
        </div>
      </SheetHeader>

      <p className="text-sm text-foreground mt-5 leading-relaxed">{m.resumo}</p>

      <div className="grid grid-cols-2 gap-3 mt-5">
        {[
          ["Cirurgias (6 meses)", String(m.cirurgias)],
          ["Honorário médio", brl(m.honorarioMedio)],
          ["Margem gerada ao hospital", brl(m.margemGerada)],
          ["Glosa", `${m.glosa}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-muted/40 p-3">
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="text-lg font-bold tabular-nums text-foreground mt-0.5">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold text-foreground mb-2">Adesão à padronização</div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
          {(["A", "B", "C"] as const).map((f, i) => (
            <div
              key={f}
              className={cn(i > 0 && "border-l-2 border-card")}
              style={{ width: `${m.faixas[f]}%`, background: faixaCor[f] }}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          {(["A", "B", "C"] as const).map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FaixaBadge faixa={f} /> <span className="tabular-nums text-foreground font-semibold">{m.faixas[f]}%</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold text-foreground mb-2">Pontos de atenção</div>
        <ul className="space-y-2">
          {m.pontos.map((p) => (
            <li key={p} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
              <CircleDot className="w-3.5 h-3.5 mt-1 shrink-0" /> {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border-2 border-info/30 bg-info/5 p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-info">
          <Target className="w-3.5 h-3.5" /> Oportunidade
        </div>
        <p className="text-sm text-foreground mt-1">{m.oportunidade.texto}</p>
        {m.oportunidade.valorMes > 0 && (
          <p className="text-sm font-bold tabular-nums text-foreground mt-1">+{brl(m.oportunidade.valorMes)} por mês</p>
        )}
      </div>
    </>
  );
};

export default MedicoSheet;
