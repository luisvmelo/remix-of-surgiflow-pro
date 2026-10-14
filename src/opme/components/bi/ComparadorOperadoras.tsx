import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, Plus, Scale, X } from "lucide-react";
import { biGeralProvider, ComparadorOperadoras as DadosComparador } from "@opme/services/biGeralProvider";
import { formatBRL } from "@opme/lib/produto";
import { cn } from "@opme/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@opme/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@opme/components/ui/popover";

type Visao = "geral" | "itens" | "cirurgias";
type Melhor = "maior" | "menor" | null;

interface Metrica<T> {
  label: string;
  valor: (linha: T) => number;
  formato: (v: number) => string;
  melhor: Melhor;
}

const pct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
const dias = (v: number) => `${v} dias`;
const num = (v: number) => v.toLocaleString("pt-BR");
const brl = (v: number) => formatBRL(v);
const brl2 = (v: number) => formatBRL(v, 2);

type Geral = DadosComparador["geral"][number];
type LinhaItem = DadosComparador["itens"][number]["porOperadora"][number];
type LinhaCirurgia = DadosComparador["cirurgias"][number]["porOperadora"][number];

const METRICAS_GERAL: Metrica<Geral>[] = [
  { label: "Cirurgias agendadas", valor: (l) => l.cirurgiasAgendadas, formato: num, melhor: null },
  { label: "Receita OPME prevista", valor: (l) => l.receitaOpmePrevista, formato: brl, melhor: "maior" },
  { label: "Custo OPME previsto", valor: (l) => l.custoOpmePrevisto, formato: brl, melhor: null },
  { label: "Margem OPME prevista", valor: (l) => l.margemOpmePrevista, formato: brl, melhor: "maior" },
  { label: "Margem sobre a receita", valor: (l) => l.margemPercentual, formato: pct, melhor: "maior" },
  { label: "Valor exposto a glosa", valor: (l) => l.valorExposto, formato: brl, melhor: "menor" },
  { label: "Risco médio das cirurgias", valor: (l) => l.riscoMedio, formato: pct, melhor: "menor" },
  { label: "Taxa de glosa OPME (12 meses)", valor: (l) => l.taxaGlosa12m, formato: pct, melhor: "menor" },
  { label: "Valor glosado (12 meses)", valor: (l) => l.valorGlosado12m, formato: brl, melhor: "menor" },
  { label: "Tempo médio de autorização", valor: (l) => l.prazoAutorizacao, formato: dias, melhor: "menor" },
  { label: "Pagamento em relação à tabela", valor: (l) => l.fatorPagamento, formato: pct, melhor: "maior" },
];

const METRICAS_ITEM: Metrica<LinhaItem>[] = [
  { label: "Volume (12 meses)", valor: (l) => l.volume, formato: num, melhor: null },
  { label: "Valor pago por unidade", valor: (l) => l.valorPago, formato: brl2, melhor: "maior" },
  { label: "Custo por unidade", valor: (l) => l.custo, formato: brl2, melhor: null },
  { label: "Taxa de glosa", valor: (l) => l.taxaGlosa, formato: pct, melhor: "menor" },
  { label: "Margem por unidade", valor: (l) => l.margemUnidade, formato: brl2, melhor: "maior" },
];

const METRICAS_CIRURGIA: Metrica<LinhaCirurgia>[] = [
  { label: "Cirurgias realizadas (24 meses)", valor: (l) => l.volume, formato: num, melhor: null },
  { label: "Ticket médio", valor: (l) => l.ticketMedio, formato: brl, melhor: "maior" },
  { label: "Custo OPME médio", valor: (l) => l.custoOpme, formato: brl, melhor: null },
  { label: "Taxa de glosa", valor: (l) => l.taxaGlosa, formato: pct, melhor: "menor" },
  { label: "Valor glosado médio", valor: (l) => l.valorGlosadoMedio, formato: brl, melhor: "menor" },
  { label: "Margem OPME por cirurgia", valor: (l) => l.margemOpme, formato: brl, melhor: "maior" },
  { label: "Tempo médio de autorização", valor: (l) => l.prazoAutorizacao, formato: dias, melhor: "menor" },
];

/** Seletor com busca para escolher vários itens ou cirurgias */
const SeletorBusca = ({
  label, opcoes, selecionados, onChange,
}: {
  label: string;
  opcoes: Array<{ nome: string; especialidade: string }>;
  selecionados: string[];
  onChange: (v: string[]) => void;
}) => {
  const [aberto, setAberto] = useState(false);
  const especialidades = Array.from(new Set(opcoes.map((o) => o.especialidade))).sort();
  const alternar = (nome: string) =>
    onChange(selecionados.includes(nome) ? selecionados.filter((s) => s !== nome) : [...selecionados, nome]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selecionados.map((s) => (
        <span key={s} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-md bg-[#EEF7FD] border border-[#B8DDF3] text-[12px] font-semibold text-[#325AA4]">
          {s}
          <button onClick={() => alternar(s)} className="p-0.5 rounded hover:bg-white" aria-label={`Remover ${s}`}>
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-dashed border-cinza-300 text-[12px] font-semibold text-cinza-600 hover:bg-cinza-50">
            <Plus className="w-3.5 h-3.5" />
            {label}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar..." />
            <CommandList className="max-h-72">
              <CommandEmpty>Nada encontrado.</CommandEmpty>
              {especialidades.map((esp) => (
                <CommandGroup key={esp} heading={esp}>
                  {opcoes.filter((o) => o.especialidade === esp).map((o) => (
                    <CommandItem key={o.nome} value={`${o.nome} ${esp}`} onSelect={() => alternar(o.nome)}>
                      <Check className={cn("mr-2 h-4 w-4", selecionados.includes(o.nome) ? "opacity-100" : "opacity-0")} />
                      {o.nome}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

/** Linhas de uma métrica, com o melhor valor destacado e barra proporcional ao maior */
function LinhasMetricas<T>({ metricas, linhas, operadoras }: { metricas: Metrica<T>[]; linhas: T[]; operadoras: string[] }) {
  return (
    <>
      {metricas.map((m) => {
        const valores = linhas.map((l) => m.valor(l));
        const max = Math.max(...valores.map((v) => Math.abs(v)), 1);
        const alvo = m.melhor === "maior" ? Math.max(...valores) : m.melhor === "menor" ? Math.min(...valores) : null;
        const destacar = alvo !== null && operadoras.length >= 2 && valores.some((v) => v !== alvo);
        return (
          <tr key={m.label} className="border-b border-cinza-100 last:border-0">
            <th scope="row" className="py-2.5 pl-4 pr-3 text-left text-[12px] font-medium text-cinza-600 whitespace-nowrap">{m.label}</th>
            {valores.map((v, i) => {
              const melhor = destacar && v === alvo;
              return (
                <td key={operadoras[i]} className={cn("py-2.5 px-3 text-right align-top", melhor && "bg-status-success-bg")}>
                  <p className={cn("text-[13px] tabular-nums", melhor ? "font-bold text-status-success-text" : "font-semibold text-cinza-700", v < 0 && "text-status-error-text")}>
                    {m.formato(v)}
                  </p>
                  <div className="h-1 mt-1 rounded-full bg-cinza-100 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full ml-auto", v < 0 ? "bg-status-error-text" : melhor ? "bg-status-success-text" : "bg-[#008DDF]")}
                      style={{ width: `${(Math.abs(v) / max) * 100}%` }}
                    />
                  </div>
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

/** Comparador de operadoras: situação atual, itens OPME e cirurgias lado a lado */
export const ComparadorOperadoras = () => {
  const [visao, setVisao] = useState<Visao>("geral");
  const [operadoras, setOperadoras] = useState<string[]>([]);
  const [itens, setItens] = useState<string[]>(["Cage intersomático PEEK", "Stent coronário farmacológico"]);
  const [cirurgias, setCirurgias] = useState<string[]>(["Artroplastia total de joelho", "Artrodese de coluna lombar (2 níveis)"]);

  const { data: opcoes } = useQuery({
    queryKey: ["opcoes-comparador"],
    queryFn: () => biGeralProvider.getOpcoesComparador(),
  });

  useEffect(() => {
    if (opcoes && operadoras.length === 0) setOperadoras(opcoes.operadoras.slice(0, 3));
  }, [opcoes, operadoras.length]);

  const { data, isFetching } = useQuery({
    queryKey: ["comparador-operadoras", operadoras, itens, cirurgias],
    queryFn: () => biGeralProvider.getComparadorOperadoras(operadoras, itens, cirurgias),
    enabled: operadoras.length > 0,
    placeholderData: keepPreviousData,
  });

  // Mantém a ordem de colunas igual à ordem de seleção
  const colunas = useMemo(() => operadoras.filter((o) => data?.geral.some((g) => g.operadora === o)), [operadoras, data]);

  const alternarOperadora = (nome: string) =>
    setOperadoras((atual) => (atual.includes(nome) ? atual.filter((o) => o !== nome) : [...atual, nome]));

  const visoes: Array<{ id: Visao; label: string }> = [
    { id: "geral", label: "Situação atual" },
    { id: "itens", label: "Itens OPME" },
    { id: "cirurgias", label: "Cirurgias" },
  ];

  return (
    <div className="rounded-xl border-2 border-cinza-200 bg-white">
      <div className="p-5 border-b border-cinza-200 space-y-4">
        <div>
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">
            <Scale className="w-4 h-4 text-[#325AA4]" />
            Comparar operadoras
          </h3>
          <p className="text-[12px] text-cinza-500">Escolha duas ou mais operadoras e compare custo, valor pago, glosa e margem lado a lado.</p>
        </div>

        {/* Operadoras */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Operadoras">
          {(opcoes?.operadoras ?? []).map((nome) => {
            const ativa = operadoras.includes(nome);
            return (
              <button
                key={nome}
                onClick={() => alternarOperadora(nome)}
                aria-pressed={ativa}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12px] font-semibold transition-colors",
                  ativa ? "bg-[#325AA4] border-[#325AA4] text-white" : "bg-white border-cinza-200 text-cinza-600 hover:bg-cinza-50"
                )}
              >
                {ativa && <Check className="w-3.5 h-3.5" />}
                {nome}
              </button>
            );
          })}
        </div>

        {/* Visão */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-lg bg-cinza-100 border border-cinza-200" role="tablist" aria-label="O que comparar">
            {visoes.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={visao === v.id}
                onClick={() => setVisao(v.id)}
                className={cn(
                  "h-8 px-4 rounded-md text-[13px] font-semibold transition-colors",
                  visao === v.id ? "bg-white text-[#325AA4] shadow-sm" : "text-cinza-500 hover:text-cinza-700"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
          {isFetching && <span className="text-[12px] text-cinza-500">Atualizando…</span>}
        </div>

        {visao === "itens" && opcoes && (
          <SeletorBusca label="Adicionar item" opcoes={opcoes.itens} selecionados={itens} onChange={setItens} />
        )}
        {visao === "cirurgias" && opcoes && (
          <SeletorBusca label="Adicionar cirurgia" opcoes={opcoes.cirurgias} selecionados={cirurgias} onChange={setCirurgias} />
        )}
      </div>

      {colunas.length < 2 ? (
        <p className="p-6 text-[13px] text-cinza-500">Selecione pelo menos duas operadoras para comparar.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: 260 + colunas.length * 150 }}>
            <thead>
              <tr className="bg-cinza-50 border-b border-cinza-200">
                <th className="py-2.5 pl-4 pr-3 w-[240px]" />
                {colunas.map((op) => (
                  <th key={op} scope="col" className="py-2.5 px-3 text-right text-[12px] font-bold text-cinza-700">{op}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visao === "geral" && data && (
                <LinhasMetricas metricas={METRICAS_GERAL} operadoras={colunas} linhas={colunas.map((c) => data.geral.find((g) => g.operadora === c)!)} />
              )}

              {visao === "itens" && data?.itens.map((item) => (
                <GrupoLinhas key={item.nome} titulo={item.nome} subtitulo={item.procedimento} colunas={colunas.length}>
                  <LinhasMetricas metricas={METRICAS_ITEM} operadoras={colunas} linhas={colunas.map((c) => item.porOperadora.find((l) => l.operadora === c)!)} />
                </GrupoLinhas>
              ))}

              {visao === "cirurgias" && data?.cirurgias.map((cir) => (
                <GrupoLinhas key={cir.nome} titulo={cir.nome} subtitulo={cir.especialidade} colunas={colunas.length}>
                  <LinhasMetricas metricas={METRICAS_CIRURGIA} operadoras={colunas} linhas={colunas.map((c) => cir.porOperadora.find((l) => l.operadora === c)!)} />
                </GrupoLinhas>
              ))}

              {((visao === "itens" && itens.length === 0) || (visao === "cirurgias" && cirurgias.length === 0)) && (
                <tr>
                  <td colSpan={colunas.length + 1} className="p-6 text-[13px] text-cinza-500">
                    Adicione {visao === "itens" ? "itens" : "cirurgias"} para comparar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="px-4 py-3 text-[11px] text-cinza-500 border-t border-cinza-100">
            Em verde, o melhor valor da linha. Margem = valor pago − perda esperada com glosa − custo.
          </p>
        </div>
      )}
    </div>
  );
};

const GrupoLinhas = ({ titulo, subtitulo, colunas, children }: { titulo: string; subtitulo: string; colunas: number; children: React.ReactNode }) => (
  <>
    <tr className="bg-[#F7F9FC] border-y border-cinza-200">
      <th colSpan={colunas + 1} scope="rowgroup" className="py-2 pl-4 text-left">
        <span className="text-[13px] font-bold text-cinza-700">{titulo}</span>
        {subtitulo && <span className="ml-2 text-[11px] font-normal text-cinza-500">{subtitulo}</span>}
      </th>
    </tr>
    {children}
  </>
);
