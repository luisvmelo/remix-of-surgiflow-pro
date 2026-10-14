import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { calcularGuiaMock, mockGuias, operadoraNome, type GuiaMock } from "@/lib/guias";
import { mockOperadoras, mockProcedures } from "@/lib/mockData";
import { brl, honorarioPrincipal, niveisPlano, type NivelPlano } from "@/lib/remuneracao";
import { cn } from "@/lib/utils";
import { Building2, Stethoscope, HandCoins, ShieldAlert, ChevronRight, PowerOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SplitBar from "./SplitBar";
import GuiaDetailSheet from "./GuiaDetailSheet";

const statusLabel: Record<GuiaMock["status"], { label: string; className: string }> = {
  "awaiting-validation": { label: "Aguardando médico", className: "badge-warning" },
  approved: { label: "Aprovada", className: "badge-success" },
  sent: { label: "Enviada", className: "badge-info" },
};

const NumerosTab = () => {
  const { hospitalConfig } = useSurgical();
  const [selected, setSelected] = useState<GuiaMock | null>(null);
  const [nivelMatriz, setNivelMatriz] = useState<NivelPlano>("Especial");

  const linhas = mockGuias.map((g) => ({ guia: g, calc: calcularGuiaMock(g, hospitalConfig) }));
  const totalMargem = linhas.reduce((a, l) => a + l.calc.margemHospital, 0);
  const totalHonorario = linhas.reduce((a, l) => a + l.calc.honorarioTotal, 0);
  const totalComplementar = linhas.reduce((a, l) => a + l.calc.honorarioComplementar, 0);
  const totalBruto = linhas.reduce((a, l) => a + l.calc.ganhoBrutoHospital, 0);
  const glosaMedia = Math.round(mockGuias.reduce((a, g) => a + g.glossRisk, 0) / mockGuias.length);

  const kpis = [
    {
      label: "Margem do hospital", value: brl(totalMargem), icon: Building2, tone: "info",
      hint: `Ganho bruto ${brl(totalBruto)} menos o complementar pago`,
    },
    {
      label: "Honorários médicos", value: brl(totalHonorario), icon: Stethoscope, tone: "primary",
      hint: "Base dos planos + complementar",
    },
    {
      label: "Complementar pago pelo hospital", value: brl(totalComplementar), icon: HandCoins, tone: "primary",
      hint: totalBruto > 0 ? `${Math.round((totalComplementar / totalBruto) * 100)}% do ganho bruto` : "—",
    },
    {
      label: "Risco de glosa médio", value: `${glosaMedia}%`, icon: ShieldAlert, tone: glosaMedia > 15 ? "warning" : "success",
      hint: `${mockGuias.length} guias no período`,
    },
  ];

  return (
    <div className="space-y-5">
      {!hospitalConfig.rentabilidadeHabilitada && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <PowerOff className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <div>
            <strong className="text-foreground">Rentabilidade desabilitada.</strong>{" "}
            <span className="text-muted-foreground">
              Não há honorário complementar nem otimização — médicos veem apenas o honorário base do plano.
            </span>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <k.icon className="w-4 h-4" style={{ color: `hsl(var(--${k.tone}))` }} />
              {k.label}
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums mt-2">{k.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{k.hint}</div>
          </div>
        ))}
      </div>

      {/* Divisão do ganho */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h3 className="text-sm font-bold text-foreground">Como o ganho das escolhas foi dividido</h3>
          <span className="text-[11px] text-muted-foreground">
            Proporção máxima ao médico: <strong className="text-foreground">{hospitalConfig.proporcaoMedico}%</strong>
          </span>
        </div>
        <SplitBar hospital={Math.max(0, totalMargem)} medico={totalComplementar} />
      </div>

      {/* Guias */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Guias do período</h3>
          <span className="text-[11px] text-muted-foreground">Clique em uma guia para ver o detalhe</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold px-4 py-2">Procedimento / Paciente</th>
                <th className="text-left font-semibold px-3 py-2">Médico</th>
                <th className="text-left font-semibold px-3 py-2">Plano</th>
                <th className="text-right font-semibold px-3 py-2">Honorário base</th>
                <th className="text-right font-semibold px-3 py-2">Complementar</th>
                <th className="text-right font-semibold px-3 py-2 text-primary">Médico total</th>
                <th className="text-right font-semibold px-3 py-2 text-info">Margem hospital</th>
                <th className="text-right font-semibold px-3 py-2">Glosa</th>
                <th className="text-left font-semibold px-3 py-2">Status</th>
                <th className="px-2" />
              </tr>
            </thead>
            <tbody>
              {linhas.map(({ guia, calc }) => (
                <tr
                  key={guia.id}
                  onClick={() => setSelected(guia)}
                  className="border-t border-border/60 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-foreground">{guia.procedure}</div>
                    <div className="text-[10px] text-muted-foreground">{guia.patient}</div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{guia.doctor}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-foreground">{operadoraNome(guia.operadoraId)}</div>
                    <div className="text-[10px] text-muted-foreground">{guia.nivel}</div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{brl(calc.honorarioBase)}</td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums", calc.honorarioComplementar > 0 ? "text-primary" : "text-muted-foreground")}>
                    {calc.honorarioComplementar > 0 ? brl(calc.honorarioComplementar) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-primary">{brl(calc.honorarioTotal)}</td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums font-bold", calc.margemHospital >= 0 ? "text-info" : "text-destructive")}>
                    {brl(calc.margemHospital)}
                  </td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums", guia.glossRisk > 15 ? "text-warning font-semibold" : "text-muted-foreground")}>
                    {guia.glossRisk}%
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap", statusLabel[guia.status].className)}>
                      {statusLabel[guia.status].label}
                    </span>
                  </td>
                  <td className="px-2"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cruzamento procedimento × plano */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Honorário base: procedimento × plano</h3>
            <p className="text-[11px] text-muted-foreground">O mesmo procedimento paga muito diferente conforme a operadora e o nível do plano</p>
          </div>
          <Select value={nivelMatriz} onValueChange={(v) => setNivelMatriz(v as NivelPlano)}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {niveisPlano.map((n) => <SelectItem key={n} value={n}>Plano {n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold px-4 py-2">Procedimento</th>
                {mockOperadoras.map((o) => (
                  <th key={o.id} className="text-right font-semibold px-3 py-2 whitespace-nowrap">{o.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockProcedures.map((p) => {
                const valores = mockOperadoras.map((o) => honorarioPrincipal(p.code, o.id, nivelMatriz));
                const max = Math.max(...valores);
                const min = Math.min(...valores);
                return (
                  <tr key={p.code} className="border-t border-border/60">
                    <td className="px-4 py-2 text-foreground">{p.name}</td>
                    {valores.map((v, i) => (
                      <td
                        key={mockOperadoras[i].id}
                        className={cn(
                          "px-3 py-2 text-right tabular-nums",
                          v === max && "text-success font-bold",
                          v === min && "text-destructive font-semibold",
                        )}
                      >
                        {brl(v)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <GuiaDetailSheet guia={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default NumerosTab;
