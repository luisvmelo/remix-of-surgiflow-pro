import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useSurgical } from "@/contexts/SurgicalContext";
import {
  gerarRecomendacoes, historico, medicos, mesReferencia, resultadoMes,
  type Beneficiario, type MedicoConsultoria,
} from "@/lib/consultoria";
import { brl, brlDelta } from "@/lib/remuneracao";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight, ArrowUpRight, Building2, ChevronRight, Lightbulb, Stethoscope,
} from "lucide-react";
import MedicoSheet from "./MedicoSheet";
import { statusMedico } from "./statusMedico";

const chartConfig = {
  margem: { label: "Fica com o hospital", color: "var(--serie-hospital)" },
  complementar: { label: "Complementar dos médicos", color: "var(--serie-medico)" },
} satisfies ChartConfig;

const beneficiarioLabel: Record<Beneficiario, string> = {
  hospital: "Ganha o hospital",
  medico: "Ganha o médico",
  ambos: "Ganham os dois",
};

const pct = (atual: number, anterior: number) => ((atual - anterior) / anterior) * 100;

const Delta = ({ value, goodWhenUp, suffix = "%" }: { value: number; goodWhenUp: boolean | null; suffix?: string }) => {
  const up = value >= 0;
  const tone = goodWhenUp === null ? "text-muted-foreground" : up === goodWhenUp ? "text-success" : "text-destructive";
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums", tone)}>
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}{suffix}
    </span>
  );
};

const ConsultoriaTab = () => {
  const { hospitalConfig } = useSurgical();
  const [medico, setMedico] = useState<MedicoConsultoria | null>(null);

  const serie = historico.map((m) => resultadoMes(m, hospitalConfig));
  const atual = serie[serie.length - 1];
  const anterior = serie[serie.length - 2];
  const recs = gerarRecomendacoes(hospitalConfig);
  const oportunidadeMes = recs.reduce((a, r) => a + r.hospitalMes, 0);

  const variacaoMargem = pct(atual.margem, anterior.margem);

  return (
    <div className="space-y-8">
      {/* 1. Resumo */}
      <section>
        <p className="text-sm text-muted-foreground mb-1">{mesReferencia.charAt(0).toUpperCase() + mesReferencia.slice(1)}</p>
        <h2 className="text-lg font-semibold text-foreground leading-snug max-w-3xl">
          A margem do hospital {variacaoMargem >= 0 ? "subiu" : "caiu"}{" "}
          {Math.abs(variacaoMargem).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% no mês, com{" "}
          {atual.cirurgias} cirurgias. A glosa {atual.glosa < anterior.glosa ? "caiu" : "subiu"} para{" "}
          {atual.glosa.toLocaleString("pt-BR")}%, e identificamos{" "}
          <span className="text-info">{brl(oportunidadeMes)}/mês</span> em oportunidades para o hospital.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="glass-card rounded-xl p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" style={{ color: "var(--serie-hospital)" }} /> Margem do hospital
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums">{brl(atual.margem)}</span>
              <Delta value={variacaoMargem} goodWhenUp />
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">vs. {brl(anterior.margem)} em agosto</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" style={{ color: "var(--serie-medico)" }} /> Honorários dos médicos
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums">{brl(atual.honorarios)}</span>
              <Delta value={pct(atual.honorarios, anterior.honorarios)} goodWhenUp={null} />
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Base dos planos + {brl(atual.complementar)} de complementar
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Glosa</div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums">
                {atual.glosa.toLocaleString("pt-BR")}%
              </span>
              <Delta value={atual.glosa - anterior.glosa} goodWhenUp={false} suffix=" p.p." />
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">vs. {anterior.glosa.toLocaleString("pt-BR")}% em agosto</div>
          </div>
        </div>
      </section>

      {/* 2. Tendência */}
      <section className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Ganho gerado pelas escolhas, mês a mês</h3>
            <p className="text-xs text-muted-foreground">Quanto ficou com o hospital e quanto virou complementar dos médicos</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--serie-hospital)" }} /> Hospital
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--serie-medico)" }} /> Médicos
            </span>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[240px] w-full aspect-auto">
          <BarChart data={serie} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barCategoryGap="32%">
            <CartesianGrid vertical={false} strokeDasharray="0" className="stroke-border/60" />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(v: number) => `${Math.round(v / 1000)} mil`}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as typeof serie[number];
                return (
                  <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm space-y-1 min-w-[190px]">
                    <div className="font-semibold text-foreground">{label} · {d.cirurgias} cirurgias</div>
                    <div className="flex justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-2 h-2 rounded-sm" style={{ background: "var(--serie-hospital)" }} /> Hospital
                      </span>
                      <span className="tabular-nums font-semibold text-foreground">{brl(d.margem)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-2 h-2 rounded-sm" style={{ background: "var(--serie-medico)" }} /> Médicos
                      </span>
                      <span className="tabular-nums font-semibold text-foreground">{brl(d.complementar)}</span>
                    </div>
                    <div className="flex justify-between gap-4 pt-1 border-t text-muted-foreground">
                      <span>Glosa</span><span className="tabular-nums">{d.glosa.toLocaleString("pt-BR")}%</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="margem" stackId="g" fill="var(--color-margem)" stroke="hsl(var(--card))" strokeWidth={2} radius={0} isAnimationActive={false} />
            <Bar dataKey="complementar" stackId="g" fill="var(--color-complementar)" stroke="hsl(var(--card))" strokeWidth={2} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
      </section>

      {/* 3. Recomendações */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-4 h-4 text-accent" />
          <h3 className="text-base font-bold text-foreground">Recomendações</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Ordenadas pelo valor que geram por mês</p>
        <div className="space-y-3">
          {recs.map((r, i) => (
            <article key={r.id} className="glass-card rounded-xl p-5 grid md:grid-cols-[1fr_200px] gap-5">
              <div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-muted text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-foreground leading-snug">{r.titulo}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">O que vimos: </span>{r.vimos}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">O que fazer: </span>{r.fazer}
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:border-l md:pl-5 flex flex-col justify-center gap-2">
                {r.hospitalMes === 0 && r.medicoMes === 0 ? (
                  <span className="text-xs text-muted-foreground">Recomendação de gestão — sem valor direto</span>
                ) : (
                  <>
                    <span className="text-[11px] text-muted-foreground">Quanto vale por mês</span>
                    {r.hospitalMes !== 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5" style={{ color: "var(--serie-hospital)" }} /> Hospital
                        </span>
                        <span className="font-bold tabular-nums text-foreground">{brlDelta(r.hospitalMes)}</span>
                      </div>
                    )}
                    {r.medicoMes !== 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Stethoscope className="w-3.5 h-3.5" style={{ color: "var(--serie-medico)" }} /> Médicos
                        </span>
                        <span className="font-bold tabular-nums text-foreground">{brlDelta(r.medicoMes)}</span>
                      </div>
                    )}
                    <span
                      className={cn(
                        "self-start text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1",
                        r.beneficiario === "ambos" ? "badge-success" : "bg-muted text-muted-foreground border border-border",
                      )}
                    >
                      {beneficiarioLabel[r.beneficiario]}
                    </span>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Médicos */}
      <section>
        <h3 className="text-base font-bold text-foreground mb-1">Médicos</h3>
        <p className="text-xs text-muted-foreground mb-4">Últimos 6 meses · clique para ver o perfil</p>
        <div className="glass-card rounded-xl divide-y divide-border/60 overflow-hidden">
          {medicos.map((m) => {
            const s = statusMedico[m.status];
            return (
              <button
                key={m.id}
                onClick={() => setMedico(m)}
                className="w-full text-left px-5 py-4 grid grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,0.7fr))_20px] items-center gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">{m.nome}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0", s.className)}>
                      <s.icon className="w-3 h-3" /> {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.resumo}</p>
                </div>
                <Stat label="Cirurgias" value={String(m.cirurgias)} />
                <Stat label="Margem gerada" value={brl(m.margemGerada)} />
                <Stat label="Glosa" value={`${m.glosa}%`} warn={m.glosa > 12} />
                <Stat label="Faixa A" value={`${m.faixas.A}%`} warn={m.faixas.A < 65} />
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </section>

      <MedicoSheet medico={medico} onClose={() => setMedico(null)} />
    </div>
  );
};

const Stat = ({ label, value, warn }: { label: string; value: string; warn?: boolean }) => (
  <div>
    <div className="text-[10px] text-muted-foreground">{label}</div>
    <div className={cn("text-sm font-semibold tabular-nums", warn ? "text-warning" : "text-foreground")}>{value}</div>
  </div>
);

export default ConsultoriaTab;
