import { useMemo } from "react";
import { AlertOctagon, AlertTriangle, BookOpen, Info, Wand2 } from "lucide-react";
import { usePatients } from "@opme/hooks/usePatients";
import { useEscolhas } from "@opme/contexts/EscolhasContext";
import { useOtimizador } from "@opme/contexts/OtimizadorContext";
import { useHospital } from "@opme/contexts/HospitalContext";
import { entregaATempo, formatBRL, formatPct } from "@opme/lib/produto";
import { AnaliseItem, SituacaoItem, analisarCirurgia } from "@opme/lib/otimizador";
import { prazoEntrega } from "@opme/mock/catalogo";
import { cn } from "@opme/lib/utils";

const ORDEM_SITUACAO: SituacaoItem[] = ["aceito", "definido", "sugerido", "otimizavel", "melhor_margem", "nao_otimizavel", "removido"];

const ROTULO: Record<SituacaoItem, string> = {
  aceito: "Aceitos",
  definido: "Definidos manualmente",
  sugerido: "Sugestão pendente",
  otimizavel: "Com ganho, sem sugestão",
  melhor_margem: "Na maior margem",
  nao_otimizavel: "Não otimizáveis",
  removido: "Removidos",
};

const COR: Record<SituacaoItem, string> = {
  aceito: "#1E8C4E",
  definido: "#5FB98A",
  sugerido: "#325AA4",
  otimizavel: "#7FA8E0",
  melhor_margem: "#B8C2D1",
  nao_otimizavel: "#E5484D",
  removido: "#8A94A6",
};

type Severidade = "critico" | "atencao" | "contexto";

const ESTILO_SEVERIDADE: Record<Severidade, { borda: string; selo: string; texto: string; icon: typeof Info }> = {
  critico: { borda: "border-l-red-600", selo: "bg-red-50 text-red-700 border-red-200", texto: "Crítico", icon: AlertOctagon },
  atencao: { borda: "border-l-amber-500", selo: "bg-amber-50 text-amber-800 border-amber-200", texto: "Atenção", icon: AlertTriangle },
  contexto: { borda: "border-l-[#325AA4]", selo: "bg-[#EEF2FA] text-[#325AA4] border-[#D5DEF0]", texto: "Contexto", icon: Info },
};

interface Gargalo {
  severidade: Severidade;
  titulo: string;
  evidencia: string;
  acao: string;
}

const DICIONARIO: Array<[string, string]> = [
  ["Itens no pedido", "Todos os itens de OPME das cirurgias agendadas, lidos do pedido cirúrgico."],
  ["Com ganho possível", "Itens em que um dos 3 fornecedores indicados pelo médico, que entrega antes da cirurgia, tem margem maior do que a do pedido hoje."],
  ["Otimizados", "Itens com sugestão do otimizador, aceitos ou ainda aguardando aceite."],
  ["Na maior margem", "Itens que já estão no fornecedor de maior margem entre os indicados: o otimizador não mexe."],
  ["Não otimizáveis", "Cirurgia em menos de 2 dias, nenhum fornecedor indicado entrega a tempo, ou 3 recusas."],
  ["Recusas", "Cada recusa de sugestão conta uma tentativa. Com 3, o item passa a ser definido manualmente por Compras."],
  ["Ganho capturado", "Margem a mais das escolhas de Compras sobre o fornecedor preferido do médico."],
  ["Ganho pendente", "Margem a mais disponível nos itens com ganho que ainda não foram aceitos."],
];

/**
 * Visão executiva da otimização da lista de compras: funil, status dos itens,
 * performance por operadora e gargalos com evidência e ação.
 */
export const PainelOtimizacao = () => {
  const { data: patients = [] } = usePatients();
  const { escolhas } = useEscolhas();
  const { estado } = useOtimizador();
  const { nomeAtual } = useHospital();

  const dados = useMemo(() => {
    const futuras = patients.filter((p) => (p.diasAteCirurgia ?? -1) >= 0);
    const analises = futuras.map((p) => ({ p, a: analisarCirurgia(p, escolhas, estado) }));
    const itens: Array<{ p: (typeof futuras)[number]; a: AnaliseItem }> = analises.flatMap(({ p, a }) => a.itens.map((i) => ({ p, a: i })));
    const conta = (s: SituacaoItem) => itens.filter((x) => x.a.situacao === s).length;
    const porSituacao = Object.fromEntries(ORDEM_SITUACAO.map((s) => [s, conta(s)])) as Record<SituacaoItem, number>;
    const recusas = Object.values(estado.recusas).reduce((s, r) => s + r.length, 0);
    const ganhoPendente = itens.reduce((s, x) => s + x.a.ganho, 0);
    const capturado = itens.reduce((s, x) => s + Math.max(0, x.a.capturado), 0);

    // Performance por operadora
    const porOp = new Map<string, { cirurgias: number; itens: number; aceitos: number; manual: number; pendentes: number; naoOtim: number; removidos: number; recusas: number; capturado: number; pendente: number }>();
    analises.forEach(({ p, a }) => {
      const o = porOp.get(p.convenio) ?? { cirurgias: 0, itens: 0, aceitos: 0, manual: 0, pendentes: 0, naoOtim: 0, removidos: 0, recusas: 0, capturado: 0, pendente: 0 };
      o.cirurgias += 1;
      a.itens.forEach((i) => {
        o.itens += 1;
        if (i.situacao === "aceito") o.aceitos += 1;
        if (i.situacao === "definido") o.manual += 1;
        if (i.situacao === "sugerido") o.pendentes += 1;
        if (i.situacao === "nao_otimizavel") o.naoOtim += 1;
        if (i.situacao === "removido") o.removidos += 1;
        o.recusas += i.tentativas;
        o.capturado += Math.max(0, i.capturado);
        o.pendente += i.ganho;
      });
      porOp.set(p.convenio, o);
    });
    const operadoras = Array.from(porOp.entries()).map(([nome, v]) => ({ nome, ...v })).sort((a, b) => b.capturado + b.pendente - (a.capturado + a.pendente));

    // Gargalos
    const gargalos: Gargalo[] = [];
    const travados = new Map<string, { itens: number; perdido: number; prazo: number }>();
    itens.forEach(({ p, a }) => {
      if (a.escolhida || a.situacao === "removido" || !a.atual) return;
      const maior = a.item.opcoes.filter((o) => o.origem === "medico").sort((x, y) => y.margem - x.margem)[0];
      if (maior && !entregaATempo(maior, p.diasAteCirurgia) && maior.margem > (a.melhor?.margem ?? a.atual.margem)) {
        const t = travados.get(maior.fornecedor) ?? { itens: 0, perdido: 0, prazo: prazoEntrega(maior.fornecedor) };
        t.itens += 1;
        t.perdido += maior.margem - (a.melhor?.margem ?? a.atual.margem);
        travados.set(maior.fornecedor, t);
      }
    });
    const travadoTop = Array.from(travados.entries()).sort((x, y) => y[1].perdido - x[1].perdido)[0];
    const totalTravado = Array.from(travados.values()).reduce((s, t) => s + t.perdido, 0);
    if (travadoTop) {
      gargalos.push({
        severidade: totalTravado > 20000 ? "critico" : "atencao",
        titulo: `O prazo de entrega trava ${formatBRL(totalTravado)} de margem`,
        evidencia: `Em ${Array.from(travados.values()).reduce((s, t) => s + t.itens, 0)} itens, o fornecedor de maior margem indicado pelo médico não entrega antes da cirurgia. O maior caso é a ${travadoTop[0]} (entrega em ${travadoTop[1].prazo} dias): ${travadoTop[1].itens} itens e ${formatBRL(travadoTop[1].perdido)}.`,
        acao: `Negociar com a ${travadoTop[0]} prazo de entrega menor ou estoque consignado.`,
      });
    }
    const semTempo = analises.filter(({ a }) => a.itens.some((i) => i.motivo?.startsWith("Cirurgia em menos")));
    if (semTempo.length > 0) {
      gargalos.push({
        severidade: "atencao",
        titulo: `${semTempo.length} cirurgias chegaram sem tempo de otimizar`,
        evidencia: `Com menos de 2 dias até a cirurgia, o pedido segue como o médico pediu. São ${formatPct((semTempo.length / Math.max(1, futuras.length)) * 100)} das cirurgias da lista.`,
        acao: "Ler o pedido cirúrgico assim que o aviso é criado, para entrar na otimização com antecedência.",
      });
    }
    if (porSituacao.sugerido > 0) {
      const ganhoSugerido = itens.filter((x) => x.a.situacao === "sugerido").reduce((s, x) => s + x.a.ganho, 0);
      gargalos.push({
        severidade: "atencao",
        titulo: `${porSituacao.sugerido} sugestões aguardando aceite`,
        evidencia: `${formatBRL(ganhoSugerido)} de margem já sugeridos pelo otimizador ainda não viraram pedido de compra.`,
        acao: "Usar \"Aceitar todas\" na lista de compras ou revisar as cirurgias com cirurgia mais próxima.",
      });
    }
    if (recusas > 0) {
      const motivos = new Map<string, number>();
      Object.values(estado.recusas).flat().forEach((r) => motivos.set(r.motivo, (motivos.get(r.motivo) ?? 0) + 1));
      const [motivo, qtd] = Array.from(motivos.entries()).sort((a, b) => b[1] - a[1])[0];
      gargalos.push({
        severidade: qtd >= 5 ? "atencao" : "contexto",
        titulo: `${recusas} recusa${recusas === 1 ? "" : "s"} de sugestão`,
        evidencia: `Motivo mais comum: "${motivo}" (${qtd}).`,
        acao: motivo === "Médico não aceita a troca" ? "Levar o ranking de margem ao corpo clínico, médico a médico." : "Atualizar cadastro de estoque e prazos dos fornecedores.",
      });
    }
    const ganhos = analises.map(({ a }) => a.ganho).sort((a, b) => b - a);
    const top10 = ganhos.slice(0, 10).reduce((s, g) => s + g, 0);
    if (ganhoPendente > 0) {
      gargalos.push({
        severidade: "contexto",
        titulo: `10 cirurgias concentram ${formatPct((top10 / ganhoPendente) * 100)} do ganho pendente`,
        evidencia: `${formatBRL(top10)} de ${formatBRL(ganhoPendente)}. Começar por elas captura a maior parte do ganho com pouco esforço.`,
        acao: "Filtrar a lista por \"Com ganho\" (ela já vem ordenada pelo maior ganho).",
      });
    }

    return { futuras, itens, porSituacao, recusas, ganhoPendente, capturado, operadoras, gargalos };
  }, [patients, escolhas, estado]);

  const total = Math.max(1, dados.itens.length);
  const otimizados = dados.porSituacao.aceito + dados.porSituacao.sugerido;
  const comGanho = otimizados + dados.porSituacao.otimizavel;
  const pct = (n: number, base = total) => formatPct((n / Math.max(1, base)) * 100);

  const kpis = [
    { label: "Itens no pedido", valor: dados.itens.length.toLocaleString("pt-BR"), detalhe: `${dados.futuras.length} cirurgias agendadas` },
    { label: "Otimizados", valor: otimizados.toLocaleString("pt-BR"), detalhe: `${pct(otimizados)} dos itens` },
    { label: "Aceitos", valor: dados.porSituacao.aceito.toLocaleString("pt-BR"), detalhe: `${pct(dados.porSituacao.aceito, otimizados)} dos otimizados` },
    { label: "Na maior margem", valor: dados.porSituacao.melhor_margem.toLocaleString("pt-BR"), detalhe: `${pct(dados.porSituacao.melhor_margem)} · não mexe` },
    { label: "Não otimizáveis", valor: dados.porSituacao.nao_otimizavel.toLocaleString("pt-BR"), detalhe: `${pct(dados.porSituacao.nao_otimizavel)} dos itens` },
    { label: "Recusas · removidos", valor: `${dados.recusas} · ${dados.porSituacao.removido}`, detalhe: `${dados.porSituacao.definido} definidos manualmente` },
    { label: "Ganho capturado", valor: `+${formatBRL(dados.capturado)}`, detalhe: "escolhas sobre o preferido do médico", tom: "text-status-success-text" },
    { label: "Ganho pendente", valor: `+${formatBRL(dados.ganhoPendente)}`, detalhe: "ainda disponível na lista", tom: "text-[#325AA4]" },
  ];

  const funil = [
    { label: "Itens no pedido", n: dados.itens.length },
    { label: "Com ganho possível", n: comGanho + dados.porSituacao.definido },
    { label: "Sugeridos pelo otimizador", n: otimizados },
    { label: "Aceitos", n: dados.porSituacao.aceito },
  ];

  return (
    <section className="space-y-6" aria-labelledby="otimizacao-title">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 id="otimizacao-title" className="section-title flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[#325AA4]" />
            Otimização da lista de compras
          </h2>
          <p className="text-[12px] text-cinza-500 mt-1">{nomeAtual} · visão executiva</p>
        </div>
        <p className="flex items-center gap-1.5 text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5">
          <Info className="w-3.5 h-3.5" />
          Período: cirurgias agendadas das próximas 6 semanas. Novas cirurgias entram todos os dias.
        </p>
      </div>

      {/* Visão executiva */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border-2 border-cinza-200 bg-white p-4">
            <p className="text-[12px] font-semibold text-cinza-600 uppercase tracking-wide">{k.label}</p>
            <p className={cn("text-[24px] font-bold mt-1 tabular-nums", k.tom ?? "text-cinza-700")}>{k.valor}</p>
            <p className="text-[11px] text-cinza-500">{k.detalhe}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil operacional */}
        <div className="rounded-xl border-2 border-cinza-200 bg-white p-5">
          <h3 className="text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">Funil da otimização</h3>
          <p className="text-[12px] text-cinza-500 mb-4">Dos itens do pedido até o aceite de Compras</p>
          <div className="space-y-3">
            {funil.map((f, i) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-[13px] mb-1">
                  <span className="text-cinza-700 font-medium">{f.label}</span>
                  <span className="font-semibold tabular-nums text-cinza-700">
                    {f.n.toLocaleString("pt-BR")} <span className="text-[11px] font-normal text-cinza-500">· {pct(f.n)}</span>
                  </span>
                </div>
                <div className="h-6 rounded bg-cinza-100 overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${(f.n / total) * 100}%`, background: ["#325AA4", "#4F78C2", "#32A693", "#1E8C4E"][i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição de status */}
        <div className="rounded-xl border-2 border-cinza-200 bg-white p-5">
          <h3 className="text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">Status dos itens</h3>
          <p className="text-[12px] text-cinza-500 mb-4">Onde está cada item da lista de compras agora</p>
          <div className="flex h-7 rounded overflow-hidden" role="img" aria-label="Distribuição dos itens por status">
            {ORDEM_SITUACAO.filter((s) => dados.porSituacao[s] > 0).map((s) => (
              <div key={s} title={`${ROTULO[s]}: ${dados.porSituacao[s]}`} style={{ width: `${(dados.porSituacao[s] / total) * 100}%`, background: COR[s] }} />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
            {ORDEM_SITUACAO.map((s) => (
              <li key={s} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-cinza-700">
                  <i className="w-3 h-3 rounded-sm inline-block" style={{ background: COR[s] }} />
                  {ROTULO[s]}
                </span>
                <span className="tabular-nums font-semibold text-cinza-700">
                  {dados.porSituacao[s]} <span className="text-[11px] font-normal text-cinza-500">{pct(dados.porSituacao[s])}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Gargalos */}
      {dados.gargalos.length > 0 && (
        <div>
          <h3 className="text-[13px] font-semibold text-cinza-700 uppercase tracking-wide mb-3">
            Gargalos <span className="ml-1 px-1.5 py-px rounded bg-red-600 text-white text-[11px]">{dados.gargalos.filter((g) => g.severidade !== "contexto").length}</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dados.gargalos.map((g) => {
              const e = ESTILO_SEVERIDADE[g.severidade];
              return (
                <article key={g.titulo} className={cn("rounded-xl border-2 border-cinza-200 border-l-[6px] bg-white p-4 space-y-2", e.borda)}>
                  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wide", e.selo)}>
                    <e.icon className="w-3.5 h-3.5" />
                    {e.texto}
                  </span>
                  <h4 className="text-[15px] font-bold text-cinza-700">{g.titulo}</h4>
                  <p className="text-[13px] text-cinza-600">{g.evidencia}</p>
                  <p className="text-[13px] font-semibold text-[#325AA4]">Ação: {g.acao}</p>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance por operadora */}
      <div className="rounded-xl border-2 border-cinza-200 bg-white p-5">
        <h3 className="text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">Performance por operadora</h3>
        <p className="text-[12px] text-cinza-500 mb-4">Itens da lista de compras e o ganho de margem, por operadora</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-[13px]">
            <thead>
              <tr className="border-b border-cinza-200 text-[11px] uppercase tracking-wide text-cinza-500">
                <th className="text-left py-2.5 pr-3 font-semibold">Operadora</th>
                <th className="text-right py-2.5 px-3 font-semibold">Cirurgias</th>
                <th className="text-right py-2.5 px-3 font-semibold">Itens</th>
                <th className="text-right py-2.5 px-3 font-semibold">Aceitos</th>
                <th className="text-right py-2.5 px-3 font-semibold">Pendentes</th>
                <th className="text-right py-2.5 px-3 font-semibold">Manual</th>
                <th className="text-right py-2.5 px-3 font-semibold">Recusas</th>
                <th className="text-right py-2.5 px-3 font-semibold">Removidos</th>
                <th className="text-right py-2.5 px-3 font-semibold">Não otimiz.</th>
                <th className="text-right py-2.5 px-3 font-semibold">Capturado</th>
                <th className="text-right py-2.5 pl-3 font-semibold">Pendente</th>
              </tr>
            </thead>
            <tbody>
              {dados.operadoras.map((o) => (
                <tr key={o.nome} className="border-b border-cinza-100 last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-cinza-700">{o.nome}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{o.cirurgias}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{o.itens}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{o.aceitos}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{o.pendentes}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{o.manual}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{o.recusas}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{o.removidos}</td>
                  <td className={cn("py-2.5 px-3 text-right tabular-nums", o.naoOtim > 0 && "text-status-error-text font-semibold")}>{o.naoOtim}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-status-success-text">+{formatBRL(o.capturado)}</td>
                  <td className="py-2.5 pl-3 text-right tabular-nums font-semibold text-[#325AA4]">+{formatBRL(o.pendente)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dicionário de indicadores */}
      <details className="rounded-xl border-2 border-cinza-200 bg-white p-5">
        <summary className="flex items-center gap-2 text-[13px] font-semibold text-cinza-700 uppercase tracking-wide cursor-pointer">
          <BookOpen className="w-4 h-4 text-[#325AA4]" />
          Dicionário de indicadores
        </summary>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
          {DICIONARIO.map(([t, d]) => (
            <div key={t}>
              <dt className="text-[13px] font-semibold text-cinza-700">{t}</dt>
              <dd className="text-[12px] text-cinza-600">{d}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
};
