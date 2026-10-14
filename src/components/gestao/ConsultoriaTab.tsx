import { useMemo, useState } from "react";
import { Clock, HeartHandshake, Lightbulb, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDominio } from "@/dominio/store";
import type { LinhaCuidado } from "@/dominio/tipos";
import { brl } from "@/components/pedido/formato";
import { porLinha, porMedico, recomendacoes, temposPorProcedimento } from "@/gestao/analise";
import OpmeEmbutido from "@opme/embutido";
import Insights from "@opme/pages/Insights";
import BIGeral from "@opme/pages/BIGeral";
import { useRegistros } from "./useGestao";

const um = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

const VisaoConsultor = () => {
  const { dominio } = useDominio();
  const todos = useRegistros();
  const [linha, setLinha] = useState<LinhaCuidado | null>(null);
  const linhas = useMemo(() => porLinha(todos, dominio).filter((l) => l.cirurgias > 0), [todos, dominio]);
  const regs = useMemo(() => {
    if (!linha) return todos;
    const procs = dominio.procedimentos.filter((p) => p.linha === linha).map((p) => p.id);
    return todos.filter((r) => procs.includes(r.pedido.procedimentoId));
  }, [todos, linha, dominio]);
  const recs = useMemo(() => recomendacoes(regs, dominio), [regs, dominio]);
  const medicos = useMemo(() => porMedico(regs, dominio), [regs, dominio]);
  const tempos = useMemo(() => temposPorProcedimento(regs, dominio), [regs, dominio]);

  return (
    <div className="space-y-5">
      <section aria-label="Linhas de cuidado" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {linhas.map((l) => (
          <button
            key={l.linha}
            onClick={() => setLinha(linha === l.linha ? null : l.linha)}
            aria-pressed={linha === l.linha}
            className={`text-left rounded-lg border-2 bg-card p-3 transition-colors ${linha === l.linha ? "border-primary" : "border-border hover:border-primary/40"}`}
          >
            <p className="text-sm font-semibold">{l.nome}</p>
            <p className="text-xs text-muted-foreground">{l.cirurgias} cirurgias</p>
            <p className="text-xs mt-1">{Math.round(l.dentroPadraoPct)}% no padrão · glosa {um(l.glosaMediaPct)}%</p>
            <p className={`text-xs ${l.margemMedia < 0 ? "text-red-700" : ""}`}>Margem média {brl(l.margemMedia)}</p>
          </button>
        ))}
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4" aria-hidden /> Recomendações do consultor</CardTitle>
          <CardDescription>
            {linha ? `Só ${linhas.find((l) => l.linha === linha)?.nome}.` : "Todas as linhas de cuidado."} Ordenadas pelo ganho por mês.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recs.map((r, i) => (
            <article key={r.id} className={`rounded-lg border p-4 ${i === 0 ? "border-primary/50 bg-primary/5" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  {i === 0 && <Star className="w-4 h-4 text-primary" aria-label="Destaque" />} {r.titulo}
                </h3>
                <div className="flex gap-2 text-xs">
                  {r.hospitalMes > 0 && <Badge variant="outline" style={{ borderColor: "var(--serie-hospital)", color: "var(--serie-hospital)" }}>Hospital + {brl(r.hospitalMes)}/mês</Badge>}
                  {r.medicosMes > 0 && <Badge variant="outline" style={{ borderColor: "var(--serie-medico)", color: "var(--serie-medico)" }}>Médicos + {brl(r.medicosMes)}/mês</Badge>}
                </div>
              </div>
              <p className="text-sm mt-2"><span className="font-medium">O que vimos:</span> {r.vimos}</p>
              <p className="text-sm mt-1"><span className="font-medium">O que fazer:</span> {r.fazer}</p>
            </article>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><HeartHandshake className="w-4 h-4" aria-hidden /> Médicos como parceiros</CardTitle>
          <CardDescription>Quem segue o padrão recebe o complemento, libera mais rápido e tem menos glosa.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table aria-label="Médicos parceiros">
            <TableHeader>
              <TableRow>
                <TableHead>Médico</TableHead>
                <TableHead className="text-right">Cirurgias</TableHead>
                <TableHead className="text-right">No padrão</TableHead>
                <TableHead className="text-right">Glosa</TableHead>
                <TableHead className="text-right">Liberação</TableHead>
                <TableHead className="text-right">Complemento recebido</TableHead>
                <TableHead className="text-right">Tempo médio de cirurgia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicos.map((m) => (
                <TableRow key={m.medicoId}>
                  <TableCell>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {m.nome} {m.dentroPadraoPct >= 75 && <Badge className="bg-emerald-600 hover:bg-emerald-600">Parceiro</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.especialidade}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{m.volume}</TableCell>
                  <TableCell className="text-right tabular-nums">{Math.round(m.dentroPadraoPct)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{um(m.glosaMediaPct)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{um(m.liberacaoMediaDias)} d</TableCell>
                  <TableCell className="text-right tabular-nums" style={{ color: "var(--serie-medico)" }}>{brl(m.complementoRecebido)}</TableCell>
                  <TableCell className="text-right tabular-nums">{Math.round(m.tempoMedioMin)} min</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" aria-hidden /> Tempo de cirurgia por procedimento</CardTitle>
          <CardDescription>Abr–mai (antes do padrão) contra jul–set. Marcas diferentes mudam o tempo de sala.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table aria-label="Tempo de cirurgia por procedimento">
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento</TableHead>
                <TableHead className="text-right">Antes</TableHead>
                <TableHead className="text-right">Depois</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tempos.filter((t) => t.antes > 0 && t.depois > 0).map((t) => {
                const dif = t.depois - t.antes;
                return (
                  <TableRow key={t.procedimentoId}>
                    <TableCell className="text-sm">{t.nome}</TableCell>
                    <TableCell className="text-right tabular-nums">{Math.round(t.antes)} min</TableCell>
                    <TableCell className="text-right tabular-nums">{Math.round(t.depois)} min</TableCell>
                    <TableCell className={`text-right tabular-nums ${dif < 0 ? "text-emerald-700" : dif > 0 ? "text-red-700" : ""}`}>
                      {dif > 0 ? "+" : ""}{Math.round(dif)} min
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ConsultoriaTab = () => (
  <Tabs defaultValue="consultor">
    <TabsList className="mb-4 flex-wrap h-auto">
      <TabsTrigger value="consultor">Visão do consultor</TabsTrigger>
      <TabsTrigger value="insights">Insights de compras (OPME.AI)</TabsTrigger>
      <TabsTrigger value="resultados">Resultados (OPME.AI)</TabsTrigger>
    </TabsList>
    <TabsContent value="consultor"><VisaoConsultor /></TabsContent>
    <TabsContent value="insights">
      <OpmeEmbutido><Insights /></OpmeEmbutido>
    </TabsContent>
    <TabsContent value="resultados">
      <OpmeEmbutido><BIGeral /></OpmeEmbutido>
    </TabsContent>
  </Tabs>
);

export default ConsultoriaTab;
