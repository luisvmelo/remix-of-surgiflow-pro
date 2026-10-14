import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, Check, Layers, ShieldAlert, TrendingDown, Wallet } from "lucide-react";
import { biGeralProvider } from "@opme/services/biGeralProvider";
import { usePatients } from "@opme/hooks/usePatients";
import { useEscolhas } from "@opme/contexts/EscolhasContext";
import { useHospital } from "@opme/contexts/HospitalContext";
import { SEVERIDADE_GLOSA, custoOpcao, formatBRL, formatPct, opcaoAtual, resumoCirurgia, valorExposto } from "@opme/lib/produto";
import { ClasseOpme, LABEL_CLASSE } from "@opme/types/produto";
import { cn } from "@opme/lib/utils";
import { ComparadorOperadoras } from "./ComparadorOperadoras";

const AZUL = "#008DDF";

/** Glosa, margem e escolhas de Compras: a visão de resultado para o Comercial */
export const PainelGlosaMargem = () => {
  const { data: patients = [] } = usePatients();
  const { escolhas } = useEscolhas();
  const { isRede, nomeAtual } = useHospital();

  const { data: indicadores } = useQuery({
    queryKey: ["indicadores-glosa"],
    queryFn: () => biGeralProvider.getIndicadoresGlosa(),
  });

  const pipeline = useMemo(() => {
    const futuras = patients.filter((p) => (p.diasAteCirurgia ?? 0) >= 0);
    const resumos = futuras.map((p) => ({ p, r: resumoCirurgia(p, escolhas) }));
    const porOperadora = new Map<string, { margem: number; exposto: number; cirurgias: number; risco: number }>();
    resumos.forEach(({ p, r }) => {
      const atual = porOperadora.get(p.convenio) ?? { margem: 0, exposto: 0, cirurgias: 0, risco: 0 };
      porOperadora.set(p.convenio, {
        margem: atual.margem + r.margemAtual,
        exposto: atual.exposto + r.valorEmRisco,
        cirurgias: atual.cirurgias + 1,
        risco: atual.risco + r.riscoAtual,
      });
    });
    const operadoras = Array.from(porOperadora.entries())
      .map(([nome, v]) => ({ nome, ...v, risco: Math.round(v.risco / v.cirurgias), margemMedia: v.margem / v.cirurgias }))
      .sort((a, b) => b.margem - a.margem);

    // Glosa prevista e custo por classe (OP × ME), com as escolhas de Compras
    const classes: Record<ClasseOpme, { receita: number; perda: number; custo: number }> = {
      OP: { receita: 0, perda: 0, custo: 0 },
      ME: { receita: 0, perda: 0, custo: 0 },
    };
    // Ticket médio de OPME por tipo de cirurgia
    const porCirurgia = new Map<string, { cirurgias: number; op: number; me: number; margem: number; risco: number }>();
    futuras.forEach((p) => {
      const linha = porCirurgia.get(p.procedimento) ?? { cirurgias: 0, op: 0, me: 0, margem: 0, risco: 0 };
      (p.itensPedido ?? []).forEach((item) => {
        const o = opcaoAtual(item, escolhas);
        const c = classes[item.classe];
        c.receita += (o?.cobradoUnitario ?? 0) * item.quantidade;
        c.perda += valorExposto(o, item.quantidade) * SEVERIDADE_GLOSA;
        c.custo += custoOpcao(o, item.quantidade);
        if (item.classe === "OP") linha.op += custoOpcao(o, item.quantidade);
        else linha.me += custoOpcao(o, item.quantidade);
      });
      const r = resumos.find((x) => x.p.id === p.id)?.r;
      linha.cirurgias += 1;
      linha.margem += r?.margemAtual ?? 0;
      linha.risco += r?.riscoAtual ?? 0;
      porCirurgia.set(p.procedimento, linha);
    });
    const tickets = Array.from(porCirurgia.entries())
      .map(([nome, v]) => ({
        nome,
        cirurgias: v.cirurgias,
        ticket: (v.op + v.me) / v.cirurgias,
        op: v.op / v.cirurgias,
        me: v.me / v.cirurgias,
        margem: v.margem / v.cirurgias,
        risco: Math.round(v.risco / v.cirurgias),
      }))
      .sort((a, b) => b.ticket - a.ticket);

    return {
      margem: resumos.reduce((s, { r }) => s + r.margemAtual, 0),
      exposto: resumos.reduce((s, { r }) => s + r.valorEmRisco, 0),
      operadoras,
      definidos: resumos.reduce((s, { r }) => s + r.definidos, 0),
      aDefinir: resumos.reduce((s, { r }) => s + r.aDefinir, 0),
      margemCapturada: resumos.reduce((s, { r }) => s + (r.margemAtual - r.margem), 0),
      classes,
      tickets,
    };
  }, [patients, escolhas]);

  const serie = indicadores?.serie ?? [];
  const taxaAtual = serie.length ? serie.slice(-3).reduce((s, m) => s + m.taxaGlosa, 0) / Math.min(3, serie.length) : 0;
  const taxaAnterior = serie.length >= 6 ? serie.slice(0, 3).reduce((s, m) => s + m.taxaGlosa, 0) / 3 : taxaAtual;
  const valorGlosado12m = serie.reduce((s, m) => s + m.valorGlosado, 0);
  const maxMargem = Math.max(1, ...pipeline.operadoras.map((o) => Math.abs(o.margem)));

  // Taxa por classe: proporção da glosa prevista de cada classe, calibrada para somar a taxa observada
  const { OP, ME } = pipeline.classes;
  const taxaPrevista = (c: { receita: number; perda: number }) => (c.receita > 0 ? (c.perda / c.receita) * 100 : 0);
  const taxaPrevistaTotal = OP.receita + ME.receita > 0 ? ((OP.perda + ME.perda) / (OP.receita + ME.receita)) * 100 : 0;
  const calibra = taxaPrevistaTotal > 0 ? taxaAtual / taxaPrevistaTotal : 0;
  const taxaClasse: Record<ClasseOpme, number> = { OP: taxaPrevista(OP) * calibra, ME: taxaPrevista(ME) * calibra };
  const totalPerda = OP.perda + ME.perda || 1;
  const totalCusto = OP.custo + ME.custo || 1;

  const tiles = [
    {
      label: "Taxa de glosa OPME (últimos 3 meses)",
      valor: `${taxaAtual.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
      detalhe: `OP ${formatPct(taxaClasse.OP, 1)} · ME ${formatPct(taxaClasse.ME, 1)} · ${taxaAtual <= taxaAnterior ? "−" : "+"}${Math.abs(taxaAtual - taxaAnterior).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} p.p. em 12 meses`,
      icon: TrendingDown,
      tom: "text-[#325AA4]",
    },
    { label: "Valor glosado em 12 meses", valor: formatBRL(valorGlosado12m), detalhe: "Itens OPME, contas fechadas", icon: ShieldAlert, tom: "text-status-error-text" },
    { label: "Margem OPME prevista (agendadas)", valor: formatBRL(pipeline.margem), detalhe: `${formatBRL(pipeline.exposto)} expostos a glosa`, icon: Wallet, tom: "text-status-success-text" },
    {
      label: "Margem capturada por Compras",
      valor: formatBRL(pipeline.margemCapturada),
      detalhe: `${pipeline.definidos} ${pipeline.definidos === 1 ? "item definido" : "itens definidos"} · ${pipeline.aDefinir} a definir`,
      icon: Check,
      tom: "text-[#008DDF]",
    },
  ];

  return (
    <section className="space-y-6" aria-labelledby="glosa-margem-title">
      <div>
        <h2 id="glosa-margem-title" className="section-title">Glosa e margem</h2>
        <p className="text-[12px] text-cinza-500 mt-1">{nomeAtual} · cirurgias agendadas e histórico de contas</p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {tiles.map(({ label, valor, detalhe, icon: Icon, tom }) => (
          <div key={label} className="rounded-xl border-2 border-cinza-200 bg-white p-5">
            <p className="flex items-center gap-2 text-[12px] font-semibold text-cinza-600 uppercase tracking-wide">
              <Icon className={cn("w-4 h-4", tom)} />
              {label}
            </p>
            <p className={cn("text-[28px] font-bold mt-2 tabular-nums", tom)}>{valor}</p>
            <p className="text-[12px] text-cinza-500">{detalhe}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Série mensal da taxa de glosa */}
        <div className="rounded-xl border-2 border-cinza-200 bg-white p-5">
          <h3 className="text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">Taxa de glosa OPME por mês (%)</h3>
          <p className="text-[12px] text-cinza-500 mb-4">Valor glosado sobre valor faturado em OPME, últimos 12 meses</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serie} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#EEF0F3" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#7A8394" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#7A8394" }} axisLine={false} tickLine={false} domain={[0, "auto"]} />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`, "Taxa de glosa"]}
                  contentStyle={{ borderRadius: 8, borderColor: "#E1E4E9", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="taxaGlosa" stroke={AZUL} strokeWidth={2} dot={{ r: 3, fill: AZUL }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margem prevista por operadora */}
        <div className="rounded-xl border-2 border-cinza-200 bg-white p-5">
          <h3 className="text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">Margem OPME prevista por operadora</h3>
          <p className="text-[12px] text-cinza-500 mb-4">Cirurgias agendadas, já com as escolhas de Compras</p>
          <div className="space-y-3">
            {pipeline.operadoras.map((o) => (
              <div key={o.nome} title={`${o.cirurgias} cirurgias · risco médio ${o.risco}% · ${formatBRL(o.exposto)} expostos`}>
                <div className="flex items-center justify-between text-[13px] mb-1">
                  <span className="text-cinza-700 font-medium">{o.nome}</span>
                  <span className={cn("font-semibold tabular-nums", o.margem >= 0 ? "text-cinza-700" : "text-status-error-text")}>
                    {formatBRL(o.margem)} <span className="text-[11px] font-normal text-cinza-500">· {o.cirurgias} cir. · risco {o.risco}%</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-cinza-100 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", o.margem >= 0 ? "bg-[#008DDF]" : "bg-status-error-text")}
                    style={{ width: `${(Math.abs(o.margem) / maxMargem) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Glosa por classe: OP × ME */}
        <div className="lg:col-span-4 rounded-xl border-2 border-cinza-200 bg-white p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-[#325AA4]" />
            Glosa por classe
          </h3>
          <p className="text-[12px] text-cinza-500 mb-4">Órteses e próteses (OP) × materiais especiais (ME)</p>
          <div className="space-y-5">
            {(["OP", "ME"] as ClasseOpme[]).map((c) => (
              <div key={c}>
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] font-semibold text-cinza-700">{c} · {LABEL_CLASSE[c]}</p>
                  <p className="text-[20px] font-bold tabular-nums text-cinza-700">{formatPct(taxaClasse[c], 1)}</p>
                </div>
                <div className="mt-2 space-y-1.5 text-[12px] text-cinza-600">
                  <div className="flex items-center gap-2">
                    <span className="w-28 shrink-0">Custo de OPME</span>
                    <div className="flex-1 h-2 rounded-full bg-cinza-100 overflow-hidden">
                      <div className="h-full rounded-full bg-[#325AA4]" style={{ width: `${(pipeline.classes[c].custo / totalCusto) * 100}%` }} />
                    </div>
                    <span className="w-10 text-right tabular-nums">{Math.round((pipeline.classes[c].custo / totalCusto) * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-28 shrink-0">Glosa prevista</span>
                    <div className="flex-1 h-2 rounded-full bg-cinza-100 overflow-hidden">
                      <div className="h-full rounded-full bg-status-error-text" style={{ width: `${(pipeline.classes[c].perda / totalPerda) * 100}%` }} />
                    </div>
                    <span className="w-10 text-right tabular-nums">{Math.round((pipeline.classes[c].perda / totalPerda) * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-cinza-500 mt-4">Taxa de cada classe nos últimos 3 meses; fatias de custo e glosa nas cirurgias agendadas.</p>
        </div>

        {/* Ticket médio de OPME por tipo de cirurgia */}
        <div className="lg:col-span-8 rounded-xl border-2 border-cinza-200 bg-white p-5">
          <h3 className="text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">Ticket médio de OPME por tipo de cirurgia</h3>
          <p className="text-[12px] text-cinza-500 mb-4">Custo de OPME por cirurgia agendada, com as escolhas de Compras</p>
          <div className="max-h-[360px] overflow-y-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-cinza-200 text-[11px] uppercase tracking-wide text-cinza-500">
                  <th className="text-left py-2.5 pr-3 font-semibold">Cirurgia</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Agendadas</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Ticket OPME</th>
                  <th className="text-right py-2.5 px-3 font-semibold">OP</th>
                  <th className="text-right py-2.5 px-3 font-semibold">ME</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Margem média</th>
                  <th className="text-right py-2.5 pl-3 font-semibold">Risco</th>
                </tr>
              </thead>
              <tbody>
                {pipeline.tickets.map((t) => (
                  <tr key={t.nome} className="border-b border-cinza-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-cinza-700">{t.nome}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-cinza-600">{t.cirurgias}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-cinza-700">{formatBRL(t.ticket)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-cinza-600">{formatBRL(t.op)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-cinza-600">{formatBRL(t.me)}</td>
                    <td className={cn("py-2.5 px-3 text-right tabular-nums font-semibold", t.margem >= 0 ? "text-status-success-text" : "text-status-error-text")}>
                      {formatBRL(t.margem)}
                    </td>
                    <td className="py-2.5 pl-3 text-right tabular-nums text-cinza-600">{t.risco}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comparador de operadoras */}
      <ComparadorOperadoras />

      {/* Visão de rede: hospitais lado a lado */}
      {isRede && indicadores && (
        <div className="rounded-xl border-2 border-cinza-200 bg-white p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-cinza-700 uppercase tracking-wide mb-4">
            <Building2 className="w-4 h-4 text-[#325AA4]" />
            Hospitais da rede
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead>
                <tr className="border-b border-cinza-200 text-[11px] uppercase tracking-wide text-cinza-500">
                  <th className="text-left py-2.5 pr-3 font-semibold">Hospital</th>
                  <th className="text-left py-2.5 px-3 font-semibold">ERP</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Cirurgias agendadas</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Risco médio</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Taxa de glosa (3 m)</th>
                  <th className="text-right py-2.5 pl-3 font-semibold">Glosado em 12 m</th>
                </tr>
              </thead>
              <tbody>
                {indicadores.porHospital.map((h) => (
                  <tr key={h.hospitalId} className="border-b border-cinza-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-cinza-700">{h.hospital}</td>
                    <td className="py-2.5 px-3 text-cinza-600">{h.erp}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{h.cirurgiasAgendadas}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{h.riscoMedio}%</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{h.taxaGlosa.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</td>
                    <td className="py-2.5 pl-3 text-right tabular-nums font-semibold text-status-error-text">{formatBRL(h.valorGlosado12m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </section>
  );
};
