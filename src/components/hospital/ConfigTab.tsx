import { useSurgical } from "@/contexts/SurgicalContext";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { FaixaBadge } from "@/components/hospital/HonorarioTags";
import { calcularGuiaMock, mockGuias } from "@/lib/guias";
import {
  brl, defaultHospitalConfig, escolherEquilibrio, faixaDescricao,
  type Faixa, type HospitalConfig,
} from "@/lib/remuneracao";
import { cn } from "@/lib/utils";
import { Building2, Lightbulb, RotateCcw, Scale, Stethoscope } from "lucide-react";
import SplitBar from "./SplitBar";

const EXEMPLO = 1000;

// Exemplo didático: três placas equivalentes para a mesma fratura.
const opcoesExemplo: { id: string; nome: string; faixa: Faixa; ganho: number }[] = [
  { id: "x", nome: "Placa X", faixa: "C", ganho: 1000 },
  { id: "y", nome: "Placa Y", faixa: "B", ganho: 850 },
  { id: "z", nome: "Placa Z", faixa: "A", ganho: 700 },
];

const Section = ({ title, subtitle, children, disabled }: {
  title: string; subtitle: string; children: React.ReactNode; disabled?: boolean;
}) => (
  <section className={cn("glass-card rounded-xl p-5 transition-opacity", disabled && "opacity-50 pointer-events-none")}>
    <h3 className="text-sm font-bold text-foreground">{title}</h3>
    <p className="text-xs text-muted-foreground mt-0.5 mb-4">{subtitle}</p>
    {children}
  </section>
);

const ConfigTab = () => {
  const { hospitalConfig: cfg, setHospitalConfig } = useSurgical();
  const set = (partial: Partial<HospitalConfig>) => setHospitalConfig({ ...cfg, ...partial });
  const setFaixa = (f: Faixa, v: number) => set({ fatorFaixa: { ...cfg.fatorFaixa, [f]: v } });

  const off = !cfg.rentabilidadeHabilitada;
  const p = cfg.proporcaoMedico / 100;

  // Simulador
  const opcoes = opcoesExemplo.map((o) => {
    const medico = Math.round(o.ganho * p * (cfg.fatorFaixa[o.faixa] / 100));
    return { ...o, medico, hospital: o.ganho - medico };
  });
  const melhorHospital = opcoes.reduce((a, b) => (b.hospital > a.hospital ? b : a)).id;
  const melhorMedico = opcoes.reduce((a, b) => (b.medico > a.medico ? b : a)).id;
  const equilibrio = escolherEquilibrio(opcoes, p);

  // Efeito da configuração nas guias do período
  const periodo = mockGuias.map((g) => calcularGuiaMock(g, cfg));
  const periodoComplementar = periodo.reduce((a, c) => a + c.honorarioComplementar, 0);
  const periodoMargem = periodo.reduce((a, c) => a + c.margemHospital, 0);

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
      <div className="space-y-5">
        {/* 1. Liga/desliga */}
        <section className="glass-card rounded-xl p-5 flex items-start justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-foreground">Rentabilidade habilitada</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Ligada: o sistema sugere escolhas que melhoram o resultado e paga honorário complementar ao médico.
              Desligada: o sistema vira apenas solicitação + prevenção de glosa, e o médico recebe só o honorário base do plano.
            </p>
          </div>
          <Switch checked={cfg.rentabilidadeHabilitada} onCheckedChange={(v) => set({ rentabilidadeHabilitada: v })} />
        </section>

        {/* 2. Proporção */}
        <Section
          disabled={off}
          title="Proporção máxima para o médico"
          subtitle="Do ganho extra que cada escolha de material gera, quanto pode virar honorário complementar do médico."
        >
          <div className="flex items-center gap-4">
            <Slider
              value={[cfg.proporcaoMedico]}
              min={0}
              max={60}
              step={5}
              onValueChange={([v]) => set({ proporcaoMedico: v })}
              className="flex-1"
            />
            <span className="text-2xl font-extrabold text-primary tabular-nums w-16 text-right">{cfg.proporcaoMedico}%</span>
          </div>
          <div className="mt-5 rounded-lg bg-muted/40 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-3">
              <Lightbulb className="w-3.5 h-3.5 text-accent" />
              Exemplo: o médico escolhe um material (faixa A) que gera {brl(EXEMPLO)} a mais
            </div>
            <SplitBar hospital={EXEMPLO * (1 - p)} medico={EXEMPLO * p} />
          </div>
        </Section>

        {/* 3. Faixas */}
        <Section
          disabled={off}
          title="Faixas de MatMed"
          subtitle="Quanto da proporção cada faixa recebe. Use para premiar a adesão à padronização do hospital."
        >
          <div className="space-y-4">
            {(["A", "B", "C"] as Faixa[]).map((f) => {
              const medico = EXEMPLO * p * (cfg.fatorFaixa[f] / 100);
              return (
                <div key={f} className="grid grid-cols-[150px_1fr_56px_210px] items-center gap-4">
                  <div>
                    <FaixaBadge faixa={f} />
                    <div className="text-[11px] text-muted-foreground mt-1">{faixaDescricao[f]}</div>
                  </div>
                  <Slider value={[cfg.fatorFaixa[f]]} min={0} max={100} step={10} onValueChange={([v]) => setFaixa(f, v)} />
                  <span className="text-sm font-bold tabular-nums text-right">{cfg.fatorFaixa[f]}%</span>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {brl(EXEMPLO)} gerados → médico <strong className="text-primary">{brl(medico)}</strong>
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 4. Simulador de equilíbrio */}
        <Section
          disabled={off}
          title="Simulador: onde fica o equilíbrio"
          subtitle="Três placas equivalentes para a mesma fratura. Cada uma gera um ganho diferente e está numa faixa diferente."
        >
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-[1fr_70px_110px_110px_150px] px-4 py-2 bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Opção</span><span>Faixa</span><span className="text-right">Hospital fica</span><span className="text-right">Médico recebe</span><span />
            </div>
            {opcoes.map((o) => (
              <div
                key={o.id}
                className={cn(
                  "grid grid-cols-[1fr_70px_110px_110px_150px] px-4 py-3 items-center border-t text-sm",
                  o.id === equilibrio && "bg-success/5",
                )}
              >
                <span className="font-semibold text-foreground">
                  {o.nome} <span className="text-[11px] font-normal text-muted-foreground">· gera {brl(o.ganho)}</span>
                </span>
                <span><FaixaBadge faixa={o.faixa} /></span>
                <span className="text-right tabular-nums text-info font-semibold">{brl(o.hospital)}</span>
                <span className="text-right tabular-nums text-primary font-semibold">{brl(o.medico)}</span>
                <span className="flex flex-wrap justify-end gap-1">
                  {o.id === melhorHospital && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-info/15 text-info border border-info/30 flex items-center gap-0.5">
                      <Building2 className="w-2.5 h-2.5" /> Melhor p/ hospital
                    </span>
                  )}
                  {o.id === melhorMedico && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full badge-doctor flex items-center gap-0.5">
                      <Stethoscope className="w-2.5 h-2.5" /> Melhor p/ médico
                    </span>
                  )}
                  {o.id === equilibrio && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full badge-success font-bold flex items-center gap-0.5">
                      <Scale className="w-2.5 h-2.5" /> Equilíbrio
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Como o equilíbrio é escolhido:</strong> o sistema procura a opção em que
            <em> os dois lados</em> ganham em relação ao seu pior cenário, em vez de maximizar só um. Como o hospital é a fonte
            pagadora, ele pesa mais: o peso do médico é a própria proporção ({cfg.proporcaoMedico}%). Mexa na proporção e nas
            faixas acima e veja os valores — e a escolha — se ajustarem.
          </div>
        </Section>
      </div>

      {/* Lateral: efeito no período */}
      <aside className="space-y-4 lg:sticky lg:top-4">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground">Efeito nas guias do período</h3>
          <p className="text-[11px] text-muted-foreground mb-4">{mockGuias.length} guias recalculadas com esta configuração</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-info" /> Margem do hospital</span>
              <span className="text-lg font-extrabold tabular-nums text-info">{brl(periodoMargem)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5 text-primary" /> Complementar aos médicos</span>
              <span className="text-lg font-extrabold tabular-nums text-primary">{brl(periodoComplementar)}</span>
            </div>
          </div>
          <div className="mt-4">
            <SplitBar hospital={Math.max(0, periodoMargem)} medico={periodoComplementar} showLabels={false} />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground block mb-1">O que o médico vê</strong>
          Médico e secretária enxergam apenas o honorário do médico (base do plano + complementar) e o risco de glosa.
          A margem do hospital aparece só nesta tela.
        </div>

        <Button variant="outline" className="w-full" onClick={() => setHospitalConfig(defaultHospitalConfig)}>
          <RotateCcw className="w-4 h-4 mr-2" /> Restaurar padrão
        </Button>
      </aside>
    </div>
  );
};

export default ConfigTab;
