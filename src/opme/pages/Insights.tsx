import { useMemo, useState } from "react";
import { Building2, HeartPulse, Lightbulb, Package, ShieldAlert, Sparkles } from "lucide-react";
import Sidebar from "@opme/components/Sidebar";
import HospitalSelector from "@opme/components/produto/HospitalSelector";
import { usePatients } from "@opme/hooks/usePatients";
import { useEscolhas } from "@opme/contexts/EscolhasContext";
import { formatBRL } from "@opme/lib/produto";
import { DESCONTO_PACOTE, DESCONTO_VOLUME, Insight, LABEL_TIPO_INSIGHT, TipoInsight, gerarInsights } from "@opme/lib/insights";
import { cn } from "@opme/lib/utils";

const ICONE: Record<TipoInsight, typeof Lightbulb> = {
  operadora: Building2,
  fornecedor: Package,
  medico: HeartPulse,
  glosa: ShieldAlert,
};

const COR: Record<TipoInsight, string> = {
  operadora: "bg-[#EEF2FA] text-[#325AA4] border-[#D5DEF0]",
  fornecedor: "bg-teal-50 text-teal-700 border-teal-200",
  medico: "bg-amber-50 text-amber-800 border-amber-200",
  glosa: "bg-red-50 text-red-700 border-red-200",
};

const CartaoInsight = ({ insight }: { insight: Insight }) => {
  const Icon = ICONE[insight.tipo];
  return (
    <article className="rounded-xl border-2 border-cinza-200 bg-white p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wide", COR[insight.tipo])}>
          <Icon className="w-3.5 h-3.5" />
          {LABEL_TIPO_INSIGHT[insight.tipo]}
        </span>
        <span className="text-right">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-cinza-500">Impacto em 12 meses</span>
          <span className="text-[18px] font-bold text-status-success-text tabular-nums">{formatBRL(insight.impacto)}</span>
        </span>
      </div>
      <div>
        <h3 className="text-[17px] font-bold text-cinza-700 leading-snug">{insight.titulo}</h3>
        <p className="text-[13px] text-cinza-600 mt-2 leading-relaxed">{insight.texto}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-cinza-50 border border-cinza-100 p-3">
        {insight.metricas.map((m) => (
          <div key={m.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-cinza-500">{m.label}</p>
            <p className={cn("text-[14px] font-bold tabular-nums", m.destaque ? "text-status-success-text" : "text-cinza-700")}>{m.valor}</p>
          </div>
        ))}
      </div>
      <p className="mt-auto flex items-start gap-2 text-[13px] font-semibold text-[#325AA4]">
        <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
        {insight.acao}
      </p>
    </article>
  );
};

/** Módulo estratégico: insights prontos para o Comercial, não um BI de arrastar e montar */
const Insights = () => {
  const { data: patients = [], isLoading } = usePatients();
  const { escolhas } = useEscolhas();
  const [filtro, setFiltro] = useState<TipoInsight | null>(null);

  const insights = useMemo(() => gerarInsights(patients, escolhas), [patients, escolhas]);
  const visiveis = insights.filter((i) => !filtro || i.tipo === filtro);
  const tipos: TipoInsight[] = ["operadora", "fornecedor", "medico", "glosa"];
  const impactoDe = (t: TipoInsight | null) => insights.filter((i) => !t || i.tipo === t).reduce((s, i) => s + i.impacto, 0);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full min-w-0 page-scroll overflow-y-auto">
        <header className="bg-neutral-0 px-6 py-5 border-b border-neutral-100 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#008DDF]">Estratégico · Comercial</p>
            <h1 className="text-[28px] leading-9 font-bold text-cinza-700 mt-1">Insights</h1>
            <p className="text-[14px] text-cinza-500 mt-1 max-w-3xl">
              Oportunidades para negociar com operadoras e fornecedores, tiradas das cirurgias agendadas e do histórico. Cada uma já traz o número e o que fazer.
            </p>
          </div>
          <div className="shrink-0">
            <HospitalSelector />
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 max-w-[1500px] w-full mx-auto">
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-3" aria-label="Potencial por tipo">
            <button
              onClick={() => setFiltro(null)}
              className={cn("text-left rounded-lg border-2 bg-white p-4", !filtro ? "border-[#325AA4]" : "border-cinza-200 hover:border-cinza-300")}
            >
              <p className="flex items-center gap-2 text-[12px] font-semibold text-cinza-600">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Potencial em 12 meses
              </p>
              <p className="text-[24px] font-bold text-status-success-text tabular-nums mt-1">{formatBRL(impactoDe(null))}</p>
              <p className="text-[11px] text-cinza-500">{insights.length} oportunidades</p>
            </button>
            {tipos.map((t) => {
              const Icon = ICONE[t];
              const n = insights.filter((i) => i.tipo === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setFiltro(filtro === t ? null : t)}
                  className={cn("text-left rounded-lg border-2 bg-white p-4", filtro === t ? "border-[#325AA4]" : "border-cinza-200 hover:border-cinza-300")}
                >
                  <p className="flex items-center gap-2 text-[12px] font-semibold text-cinza-600">
                    <Icon className="w-4 h-4 text-cinza-500" />
                    {LABEL_TIPO_INSIGHT[t]}
                  </p>
                  <p className="text-[24px] font-bold text-cinza-700 tabular-nums mt-1">{formatBRL(impactoDe(t))}</p>
                  <p className="text-[11px] text-cinza-500">{n} oportunidade{n === 1 ? "" : "s"}</p>
                </button>
              );
            })}
          </section>

          {isLoading ? (
            <p className="text-[13px] text-cinza-500">Carregando…</p>
          ) : (
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5" aria-label="Insights">
              {visiveis.map((i) => <CartaoInsight key={i.id} insight={i} />)}
            </section>
          )}

          <p className="text-[11px] text-cinza-500">
            Projeções de 12 meses no ritmo das cirurgias agendadas (próximas 6 semanas). Premissas: pacote com {Math.round(DESCONTO_PACOTE * 100)}% de desconto sobre a tabela e
            glosa residual de 20%; acordo de volume com {Math.round(DESCONTO_VOLUME * 100)}% de desconto. Protótipo com dados fictícios.
          </p>
        </main>
      </div>
    </div>
  );
};

export default Insights;
