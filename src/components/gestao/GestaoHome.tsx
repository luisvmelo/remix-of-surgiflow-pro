import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ClipboardList, Database, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDominio } from "@/dominio/store";
import { brl, dataBR } from "@/components/pedido/formato";
import {
  ANTES, balanceamento, foraDoPadrao, ganhoDesdeImplantacao, indicadores, margemBase, recorte, serieMensal,
  type Dimensao, type LinhaRecorte,
} from "@/gestao/analise";
import { useRegistros } from "./useGestao";

const DIMENSOES: { id: Dimensao; label: string }[] = [
  { id: "cirurgia", label: "Cirurgia" },
  { id: "operadora", label: "Operadora" },
  { id: "fornecedor", label: "Fornecedor" },
];

const um = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

interface Props {
  onAbrirPadrao?: (procedimentoId: string) => void;
  onIrPara?: (aba: string) => void;
}

/** Frases de comparação entre 2 ou 3 linhas do recorte. */
function frasesComparacao(linhas: LinhaRecorte[]) {
  const frases: string[] = [];
  const por = <K extends keyof LinhaRecorte>(k: K, maiorMelhor: boolean) =>
    [...linhas].sort((a, b) => ((b[k] as number) - (a[k] as number)) * (maiorMelhor ? 1 : -1));
  const m = por("margemMedia", true);
  frases.push(`${m[0].nome} tem a maior margem média por cirurgia (${brl(m[0].margemMedia)}), ${brl(m[0].margemMedia - m.at(-1)!.margemMedia)} acima de ${m.at(-1)!.nome}.`);
  const g = por("glosaMedia", false);
  frases.push(`${g[0].nome} glosa menos: ${um(g[0].glosaMedia)}% contra ${um(g.at(-1)!.glosaMedia)}% de ${g.at(-1)!.nome}.`);
  const l = por("liberacaoMedia", false);
  frases.push(`${l[0].nome} libera mais rápido: ${um(l[0].liberacaoMedia)} dias em média, ${um(l.at(-1)!.liberacaoMedia - l[0].liberacaoMedia)} dias a menos que ${l.at(-1)!.nome}.`);
  const p = por("dentroPadraoPct", true);
  frases.push(`Adesão ao padrão: ${p.map((x) => `${x.nome} ${Math.round(x.dentroPadraoPct)}%`).join(" · ")}.`);
  return frases;
}

const Kpi = ({ titulo, antes, agora, unidade, menorMelhor, formato }: { titulo: string; antes: number; agora: number; unidade: string; menorMelhor?: boolean; formato?: (v: number) => string }) => {
  const f = formato ?? ((v: number) => `${um(v)}${unidade}`);
  const melhorou = menorMelhor ? agora < antes : agora > antes;
  const Seta = agora < antes ? ArrowDownRight : ArrowUpRight;
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
        <p className="text-2xl font-bold tabular-nums mt-1">{f(agora)}</p>
        <p className={`text-xs mt-1 flex items-center gap-1 ${melhorou ? "text-emerald-700" : "text-red-700"}`}>
          <Seta className="w-3.5 h-3.5" aria-hidden />
          {formato ? "abr–mai" : "antes da implantação"}: {f(antes)}
        </p>
      </CardContent>
    </Card>
  );
};

const GestaoHome = ({ onAbrirPadrao, onIrPara }: Props) => {
  const { dominio, pedidos } = useDominio();
  const regs = useRegistros();
  const [dim, setDim] = useState<Dimensao>("cirurgia");
  const [comparar, setComparar] = useState<string[]>([]);

  // Meses com poucas cirurgias (os pedidos do protótipo marcados para depois de set/2026) distorcem a média
  const serie = useMemo(() => serieMensal(regs).filter((m) => m.cirurgias >= 10), [regs]);
  const ganho = useMemo(() => ganhoDesdeImplantacao(serie), [serie]);
  const linhas = useMemo(() => recorte(regs, dominio, dim), [regs, dominio, dim]);
  const fora = useMemo(() => foraDoPadrao(regs, dominio).slice(0, 8), [regs, dominio]);
  const pontos = useMemo(() => balanceamento(regs, dominio), [regs, dominio]);
  const ultimo = serie.at(-1);
  const hospital = dominio.hospitais[0];
  const geral = indicadores(regs, dominio);

  const semPadrao = dominio.procedimentos
    .filter((p) => dominio.padroes[p.id]?.status !== "vigente")
    .sort((a, b) => b.volumeMes - a.volumeMes);
  const sugestoes = Object.values(dominio.padroes).flatMap((p) => p.sugestoes.map((s) => ({ ...s, procedimentoId: p.procedimentoId })));
  const emRevisao = pedidos.filter((p) => p.status === "esperando_confirmacao").length;

  const trocarDim = (d: Dimensao) => {
    setDim(d);
    setComparar([]);
  };
  const alternar = (id: string) =>
    setComparar((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : atual.length >= 3 ? atual : [...atual, id]));
  const selecionadas = linhas.filter((l) => comparar.includes(l.id));
  const nomeDim = DIMENSOES.find((d) => d.id === dim)!.label.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Ganho gerado + fontes */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-primary/30 bg-primary/5">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" aria-hidden /> Ganho gerado desde a implantação ({dataBR(hospital.implantacao)})
              </p>
              <p className="text-3xl font-bold text-foreground tabular-nums mt-1">{brl(ganho)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Quanto a margem por cirurgia subiu em relação a abr–mai, somado nas cirurgias de jun em diante.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Complemento pago aos médicos no período</p>
              <p className="text-xl font-semibold tabular-nums" style={{ color: "var(--serie-medico)" }}>{brl(geral.complementoTotal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <Collapsible>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Database className="w-4 h-4" aria-hidden /> Fontes de dados</CardTitle>
              <CardDescription>{hospital.nome} · {hospital.erp}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {hospital.fontes.length} tabelas, {hospital.fontes.reduce((a, f) => a + f.registros, 0).toLocaleString("pt-BR")} registros lidos.
              </p>
              <CollapsibleTrigger asChild>
                <Button variant="link" size="sm" className="px-0 h-auto mt-1">Ver de onde vêm os números</Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-2 space-y-1 text-xs">
                  {hospital.fontes.map((f) => (
                    <li key={f.tabela} className="flex justify-between gap-2">
                      <span>{f.tabela}</span>
                      <span className="text-muted-foreground">{f.periodo} · {f.registros.toLocaleString("pt-BR")}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </CardContent>
          </Collapsible>
        </Card>
      </div>

      {/* Pendências */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4" aria-hidden /> Pendências</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold">{semPadrao.length} procedimentos sem padrão vigente</p>
            <ul className="mt-2 space-y-1">
              {semPadrao.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{p.nome}</span>
                  <Button variant="outline" size="sm" className="h-7 shrink-0" onClick={() => onAbrirPadrao?.(p.id)}>Abrir</Button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">{sugestoes.length} sugestões de alteração para a comissão</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {sugestoes.slice(0, 3).map((s) => <li key={s.id} className="truncate">{s.titulo}</li>)}
            </ul>
            {sugestoes.length > 0 && <Button variant="link" size="sm" className="px-0" onClick={() => onIrPara?.("comissao")}>Ver na Comissão</Button>}
          </div>
          <div>
            <p className="text-sm font-semibold">{emRevisao} pedidos esperando confirmação de Compras</p>
            <p className="text-sm text-muted-foreground mt-2">A revisão pedido a pedido é feita em Compras (OPME.AI). Aqui aparece só o volume.</p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs antes e depois */}
      {ultimo && (
        <section aria-label="Indicadores" className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Kpi titulo="Pedidos dentro do padrão (último mês)" antes={ANTES.dentroPadraoPct} agora={ultimo.dentroPadraoPct} unidade="%" />
          <Kpi titulo="Glosa média" antes={ANTES.glosaMediaPct} agora={ultimo.glosaMediaPct} unidade="%" menorMelhor />
          <Kpi titulo="Dias até a liberação" antes={ANTES.liberacaoMediaDias} agora={ultimo.liberacaoMediaDias} unidade=" dias" menorMelhor />
          <Kpi titulo="Margem média por cirurgia" antes={margemBase(serie)} agora={ultimo.margemMedia} unidade="" formato={brl} />
        </section>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" aria-hidden /> Adesão ao padrão por mês</CardTitle>
          <CardDescription>Percentual de pedidos confirmados sem nada fora do padrão, do protocolo ou da homologação.</CardDescription>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serie} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="rotulo" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis domain={[0, 100]} unit="%" tickLine={false} axisLine={false} fontSize={12} width={44} />
              <Tooltip formatter={(v: number) => [`${Math.round(v)}%`, "Dentro do padrão"]} />
              <Line type="monotone" dataKey="dentroPadraoPct" stroke="var(--serie-hospital)" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recortes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Recortes</CardTitle>
              <CardDescription>Marque 2 ou 3 linhas para comparar.</CardDescription>
            </div>
            <div className="flex gap-1 rounded-md bg-muted p-1">
              {DIMENSOES.map((d) => (
                <Button key={d.id} size="sm" variant={dim === d.id ? "default" : "ghost"} aria-pressed={dim === d.id} onClick={() => trocarDim(d.id)}>
                  {d.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table aria-label={`Recorte por ${nomeDim}`}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><span className="sr-only">Comparar</span></TableHead>
                  <TableHead>{DIMENSOES.find((d) => d.id === dim)!.label}</TableHead>
                  <TableHead className="text-right">Cirurgias</TableHead>
                  <TableHead className="text-right">Margem média</TableHead>
                  <TableHead className="text-right">Glosa</TableHead>
                  <TableHead className="text-right">Liberação</TableHead>
                  <TableHead className="text-right">No padrão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.map((l) => (
                  <TableRow key={l.id} data-state={comparar.includes(l.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        aria-label={`Comparar ${l.nome}`}
                        checked={comparar.includes(l.id)}
                        disabled={!comparar.includes(l.id) && comparar.length >= 3}
                        onCheckedChange={() => alternar(l.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{l.nome}</TableCell>
                    <TableCell className="text-right tabular-nums">{l.pedidos}</TableCell>
                    <TableCell className={`text-right tabular-nums ${l.margemMedia < 0 ? "text-red-700" : ""}`}>{brl(l.margemMedia)}</TableCell>
                    <TableCell className="text-right tabular-nums">{um(l.glosaMedia)}%</TableCell>
                    <TableCell className="text-right tabular-nums">{um(l.liberacaoMedia)} d</TableCell>
                    <TableCell className="text-right tabular-nums">{Math.round(l.dentroPadraoPct)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {selecionadas.length >= 2 && (
            <section aria-label="Comparação" className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <h3 className="text-sm font-semibold">Comparação</h3>
              <ul className="space-y-1 text-sm">
                {frasesComparacao(selecionadas).map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <div className={`grid gap-3 ${selecionadas.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                {selecionadas.map((l) => (
                  <div key={l.id} className="rounded-md border bg-card p-3">
                    <p className="font-semibold text-sm">{l.nome}</p>
                    <p className="text-xs font-medium text-emerald-700 mt-2">Prós</p>
                    <ul className="text-xs space-y-0.5">
                      {(l.positivos.length ? l.positivos : ["Na média do hospital"]).map((p) => <li key={p}>+ {p}</li>)}
                    </ul>
                    <p className="text-xs font-medium text-red-700 mt-2">Contras</p>
                    <ul className="text-xs space-y-0.5">
                      {(l.negativos.length ? l.negativos : ["Nenhum ponto abaixo da média"]).map((p) => <li key={p}>− {p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* BI de fornecedores fora do padrão */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4" aria-hidden /> Mais pedidos fora do padrão</CardTitle>
            <CardDescription>Marcas pedidas fora do leque, sem homologação ou em itens fora do protocolo.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table aria-label="Marcas mais pedidas fora do padrão">
              <TableHeader>
                <TableRow>
                  <TableHead>Marca · item</TableHead>
                  <TableHead className="text-right">Vezes</TableHead>
                  <TableHead className="text-right">Glosa</TableHead>
                  <TableHead className="text-right">Liberação</TableHead>
                  <TableHead className="text-right">Custo vs. preferencial</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fora.map((f) => (
                  <TableRow key={f.marcaId}>
                    <TableCell>
                      <p className="font-medium text-sm">{f.fabricante}</p>
                      <p className="text-xs text-muted-foreground">{f.item} · {f.medicos.length} médico(s)</p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{f.vezes}</TableCell>
                    <TableCell className="text-right tabular-nums">{f.glosaPct}%</TableCell>
                    <TableCell className="text-right tabular-nums">{f.liberacaoDias} d</TableCell>
                    <TableCell className={`text-right tabular-nums ${f.custoAMais > 0 ? "text-red-700" : "text-emerald-700"}`}>{f.custoAMais > 0 ? "+" : ""}{brl(f.custoAMais)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Balanceamento */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Balanceamento das cirurgias</CardTitle>
            <CardDescription>Cada ponto é uma cirurgia: quanto mais à esquerda, mais rápido libera; quanto mais alto, mais margem. O tamanho é o volume.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="liberacaoMedia" name="Liberação" unit=" d" fontSize={12} tickLine={false}
                  label={{ value: "Dias até liberar", position: "insideBottom", offset: -8, fontSize: 11 }} />
                <YAxis type="number" dataKey="margemMedia" name="Margem" fontSize={12} tickLine={false} width={64}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)} mil`} />
                <ZAxis type="number" dataKey="volume" range={[60, 400]} name="Cirurgias" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    const p = payload?.[0]?.payload as (typeof pontos)[number] | undefined;
                    if (!p) return null;
                    return (
                      <div className="rounded-md border bg-card px-3 py-2 text-xs shadow">
                        <p className="font-semibold">{p.nome}</p>
                        <p>Margem média {brl(p.margemMedia)} · {p.liberacaoMedia} dias · glosa {p.glosaMedia}%</p>
                        <p>{p.volume} cirurgias</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={pontos} fill="var(--serie-hospital)" fillOpacity={0.7} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground">
        <Badge variant="outline" className="mr-2">Exemplo</Badge>
        {regs.length} cirurgias confirmadas de abr a set/2026 no {hospital.nome}, avaliadas pelo mesmo motor que o médico e Compras usam.
      </div>
    </div>
  );
};

export default GestaoHome;
