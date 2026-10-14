import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Briefcase, Building2, Check, Receipt, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDominio } from "@/dominio/store";
import { brl, dataBR } from "@/components/pedido/formato";
import { useRegistros } from "@/components/gestao/useGestao";
import { benchmark, carteira, comercial, PROCEDIMENTOS_BENCHMARK, sugestaoBenchmark, type Fase } from "./carteira";

const um = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

const COR_FASE: Record<Fase, string> = {
  Implantação: "bg-amber-500 hover:bg-amber-500 text-white",
  Acompanhamento: "bg-sky-600 hover:bg-sky-600",
  Maturidade: "bg-emerald-600 hover:bg-emerald-600",
};

export const Carteira = () => {
  const { dominio } = useDominio();
  const regs = useRegistros();
  const hospitais = useMemo(() => carteira(dominio, regs), [dominio, regs]);
  const total = hospitais.reduce((a, h) => a + h.ganhoGerado, 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {hospitais.length} hospitais na carteira · ganho gerado somado: <span className="font-semibold text-foreground">{brl(total)}</span>
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        {hospitais.map((h) => (
          <article key={h.id} className="rounded-lg border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{h.nome}</h3>
                <p className="text-xs text-muted-foreground">{h.cidade} · {h.erp} · desde {dataBR(h.implantacao)}</p>
              </div>
              <Badge className={COR_FASE[h.fase]}>{h.fase}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ganho gerado</p>
              <p className="text-2xl font-bold tabular-nums">{brl(h.ganhoGerado)}</p>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-xs text-muted-foreground">Cirurgias/mês</dt><dd className="font-medium tabular-nums">{h.cirurgiasMes}</dd></div>
              <div><dt className="text-xs text-muted-foreground">No padrão</dt><dd className="font-medium tabular-nums">{Math.round(h.dentroPadraoPct)}%</dd></div>
              <div><dt className="text-xs text-muted-foreground">Glosa</dt><dd className="font-medium tabular-nums">{um(h.glosaPct)}%</dd></div>
              <div><dt className="text-xs text-muted-foreground">Liberação</dt><dd className="font-medium tabular-nums">{um(h.liberacaoDias)} dias</dd></div>
              <div className="col-span-2"><dt className="text-xs text-muted-foreground">Padrões vigentes</dt><dd className="font-medium tabular-nums">{h.padroesVigentes} de {h.procedimentos}</dd></div>
            </dl>
            {h.alertas.length > 0 && (
              <ul className="space-y-1 border-t pt-3">
                {h.alertas.slice(0, 4).map((a) => (
                  <li key={a} className="text-xs flex items-start gap-1.5 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden /> {a}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export const Benchmark = () => {
  const { dominio, salvarPadrao } = useDominio();
  const regs = useRegistros();
  const [procId, setProcId] = useState(PROCEDIMENTOS_BENCHMARK[0]);
  const linhas = useMemo(() => benchmark(dominio, regs, procId), [dominio, regs, procId]);
  const padrao = dominio.padroes[procId];
  const rhp = linhas[0];
  const marca = (id?: string) => dominio.marcas.find((m) => m.id === id);
  const nomeItem = (id: string) => dominio.itens.find((i) => i.id === id)?.nome ?? id;

  const enviar = (origemId: string, itemId: string, marcaId: string) => {
    const sug = sugestaoBenchmark(dominio, origemId, procId, itemId, marcaId);
    const atual = dominio.padroes[procId];
    if (atual.sugestoes.some((s) => s.id === sug.id)) return;
    salvarPadrao({ ...atual, sugestoes: [...atual.sugestoes, sug] });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="proc-bench" className="text-sm text-muted-foreground">Procedimento</label>
        <select id="proc-bench" value={procId} onChange={(e) => setProcId(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm">
          {PROCEDIMENTOS_BENCHMARK.map((id) => (
            <option key={id} value={id}>{dominio.procedimentos.find((p) => p.id === id)?.nome}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Resultados do procedimento por hospital</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table aria-label="Resultados por hospital">
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead className="text-right">No padrão</TableHead>
                <TableHead className="text-right">Glosa</TableHead>
                <TableHead className="text-right">Liberação</TableHead>
                <TableHead className="text-right">Margem média</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l) => {
                const melhor = (k: "glosaPct" | "liberacaoDias") => l[k] === Math.min(...linhas.map((x) => x[k]));
                return (
                  <TableRow key={l.hospitalId}>
                    <TableCell className="font-medium text-sm">{l.nome}</TableCell>
                    <TableCell className="text-right tabular-nums">{Math.round(l.dentroPadraoPct)}%</TableCell>
                    <TableCell className={`text-right tabular-nums ${melhor("glosaPct") ? "text-emerald-700 font-semibold" : ""}`}>{um(l.glosaPct)}%</TableCell>
                    <TableCell className={`text-right tabular-nums ${melhor("liberacaoDias") ? "text-emerald-700 font-semibold" : ""}`}>{um(l.liberacaoDias)} d</TableCell>
                    <TableCell className={`text-right tabular-nums ${l.margemMedia < 0 ? "text-red-700" : ""}`}>{brl(l.margemMedia)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Marca preferencial de cada item</CardTitle>
          <CardDescription>Quando outro hospital usa uma marca melhor, leve como sugestão de alteração para a comissão do {rhp.nome}.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table aria-label="Preferenciais por hospital">
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                {linhas.map((l) => <TableHead key={l.hospitalId}>{l.nome}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {padrao.itens.map((ip) => (
                <TableRow key={ip.itemId}>
                  <TableCell className="text-sm font-medium">{nomeItem(ip.itemId)}</TableCell>
                  {linhas.map((l, idx) => {
                    const m = marca(l.preferenciais[ip.itemId]);
                    if (!m) return <TableCell key={l.hospitalId} className="text-xs text-muted-foreground">—</TableCell>;
                    const diferente = idx > 0 && m.id !== rhp.preferenciais[ip.itemId];
                    const sugId = sugestaoBenchmark(dominio, l.hospitalId, procId, ip.itemId, m.id).id;
                    const enviada = padrao.sugestoes.some((s) => s.id === sugId);
                    return (
                      <TableCell key={l.hospitalId} className="align-top">
                        <p className="text-sm">{m.fabricante}</p>
                        <p className="text-xs text-muted-foreground">{brl(m.custo)} · {m.liberacaoDias} d · glosa {m.glosaPct}%</p>
                        {diferente && (
                          <Button
                            size="sm" variant="outline" className="mt-1 h-7"
                            aria-label={`Sugerir ao RHP: ${m.fabricante} em ${nomeItem(ip.itemId)}`}
                            disabled={enviada}
                            onClick={() => enviar(l.hospitalId, ip.itemId, m.id)}
                          >
                            {enviada ? <><Check className="w-3.5 h-3.5 mr-1" aria-hidden /> Enviada</> : <><Send className="w-3.5 h-3.5 mr-1" aria-hidden /> Sugerir</>}
                          </Button>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export const Comercial = () => {
  const { dominio } = useDominio();
  const regs = useRegistros();
  const linhas = useMemo(() => comercial(dominio, regs), [dominio, regs]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {linhas.map((l) => (
          <Card key={l.hospitalId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{l.nome}</CardTitle>
              <CardDescription>{l.modelo}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-xs text-muted-foreground">Faturado no período</p>
              <p className="text-2xl font-bold tabular-nums">{brl(l.total)}</p>
              <p className="text-xs text-muted-foreground">{l.procedimentosCobrados} procedimentos com padrão vigente (cobráveis)</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Valores por mês</CardTitle>
          <CardDescription>No taxímetro, só entram as cirurgias que seguiram o padrão.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table aria-label="Valores por mês">
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Cirurgias cobradas</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.flatMap((l) =>
                l.meses.map((m) => (
                  <TableRow key={`${l.hospitalId}-${m.mes}`}>
                    <TableCell className="text-sm">{l.nome}</TableCell>
                    <TableCell className="text-sm">{m.mes}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.cirurgias}</TableCell>
                    <TableCell className="text-right tabular-nums">{brl(m.valor)}</TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ConsultorHome = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b bg-card px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <Briefcase className="w-6 h-6 text-primary" aria-hidden />
        <span className="font-bold text-lg">SolicitaCirurg</span>
        <span className="text-sm text-muted-foreground">· Consultor</span>
      </div>
    </header>
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-24">
      <Tabs defaultValue="carteira">
        <TabsList className="mb-5 flex-wrap h-auto">
          <TabsTrigger value="carteira" className="gap-1.5"><Building2 className="w-4 h-4" aria-hidden /> Carteira</TabsTrigger>
          <TabsTrigger value="benchmark" className="gap-1.5"><BarChart3 className="w-4 h-4" aria-hidden /> Benchmark</TabsTrigger>
          <TabsTrigger value="comercial" className="gap-1.5"><Receipt className="w-4 h-4" aria-hidden /> Comercial</TabsTrigger>
        </TabsList>
        <TabsContent value="carteira"><Carteira /></TabsContent>
        <TabsContent value="benchmark"><Benchmark /></TabsContent>
        <TabsContent value="comercial"><Comercial /></TabsContent>
      </Tabs>
    </div>
  </div>
);

export default ConsultorHome;
