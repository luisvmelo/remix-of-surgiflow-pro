import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, Gauge, Plus, Scale, Trash2, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDominio } from "@/dominio/store";
import { avaliarPedido, CONDICOES_COM_AVISO_JURIDICO, contratoDaOperadora, LABEL_CONDICAO, pedidoSugerido } from "@/dominio/motor";
import type { CondicaoComplemento, CondicaoTipo, Padrao, RegraComplemento, SugestaoAlteracao } from "@/dominio/tipos";
import { brl, dataBR } from "@/components/pedido/formato";
import { equilibrio, type ModoEquilibrio } from "@/gestao/analise";
import { StatusPadraoBadge } from "./StatusPadraoBadge";

const hoje = () => new Date().toISOString().slice(0, 10);

const TODAS_CONDICOES: CondicaoTipo[] = [
  "homologados", "dentro_padrao", "codigo_recomendado", "documentos", "prazo_liberacao", "margem_minima", "fornecedor_preferencial",
];
const PARAMETRO: Partial<Record<CondicaoTipo, { label: string; padrao: number }>> = {
  prazo_liberacao: { label: "até quantos dias", padrao: 5 },
  margem_minima: { label: "margem mínima (%)", padrao: 10 },
};

interface Props {
  procedimentoId: string;
  onVoltar: () => void;
}

const MontagemPadrao = ({ procedimentoId, onVoltar }: Props) => {
  const { dominio, salvarPadrao, aceitarSugestao, recusarSugestao } = useDominio();
  const salvo = dominio.padroes[procedimentoId];
  const proc = dominio.procedimentos.find((p) => p.id === procedimentoId)!;
  const [rascunho, setRascunho] = useState<Padrao>(salvo);
  const [operadoraId, setOperadoraId] = useState(dominio.operadoras[0].id);
  const [novaSug, setNovaSug] = useState<{ itemId: string; para: string; motivo: string } | null>(null);
  const alterado = JSON.stringify(rascunho) !== JSON.stringify(salvo);
  const considerarMargem = dominio.config.considerarMargem;

  const contrato = contratoDaOperadora(dominio, operadoraId, procedimentoId);
  const marcaPorId = (id: string) => dominio.marcas.find((m) => m.id === id);
  const itemPorId = (id: string) => dominio.itens.find((i) => i.id === id);

  // Simulação do pedido sugerido nesta operadora, com o rascunho da comissão
  const simulacao = useMemo(() => {
    const d = { ...dominio, padroes: { ...dominio.padroes, [procedimentoId]: rascunho } };
    const s = pedidoSugerido(procedimentoId, operadoraId, d);
    return avaliarPedido({
      id: "simulacao", medicoId: "__novo__", paciente: { nome: "", cpf: "" }, operadoraId, plano: "Especial", procedimentoId,
      codigos: s.codigos, itens: s.itens, documentos: [...rascunho.protocolo.documentos], status: "rascunho", ajustes: [],
      urgencia: false, criadoEm: "", dataCirurgia: "",
    }, d);
  }, [dominio, rascunho, procedimentoId, operadoraId]);

  const mudarItem = (itemId: string, f: (i: Padrao["itens"][number]) => Padrao["itens"][number]) =>
    setRascunho((r) => ({ ...r, itens: r.itens.map((i) => (i.itemId === itemId ? f(i) : i)) }));

  const alternarAceita = (itemId: string, marcaId: string, marcar: boolean) =>
    mudarItem(itemId, (i) => ({
      ...i,
      aceitas: marcar ? [...new Set([...i.aceitas, marcaId])] : i.aceitas.filter((x) => x !== marcaId),
      preferenciais: marcar ? i.preferenciais : i.preferenciais.filter((x) => x !== marcaId),
    }));

  // A preferencial precisa estar no leque: marcar como preferencial também aceita
  const alternarPreferencial = (itemId: string, marcaId: string, marcar: boolean) =>
    mudarItem(itemId, (i) => ({
      ...i,
      preferenciais: marcar ? [...new Set([...i.preferenciais, marcaId])] : i.preferenciais.filter((x) => x !== marcaId),
      aceitas: marcar ? [...new Set([...i.aceitas, marcaId])] : i.aceitas,
    }));

  const aplicarAtalho = (modo: ModoEquilibrio) =>
    setRascunho((r) => ({ ...r, itens: equilibrio(r, operadoraId, dominio, dominio.config, modo) }));

  const incluirItem = (itemId: string) =>
    setRascunho((r) => {
      if (r.itens.some((i) => i.itemId === itemId)) return r;
      const marcas = dominio.marcas.filter((m) => m.itemId === itemId).sort((a, b) => a.liberacaoDias - b.liberacaoDias);
      return {
        ...r,
        itens: [...r.itens, { itemId, qtdTipica: 1, aceitas: marcas.slice(0, 3).map((m) => m.id), preferenciais: marcas.slice(0, 1).map((m) => m.id) }],
        pedidosPorFora: r.pedidosPorFora.filter((p) => p.itemId !== itemId),
      };
    });

  const setComplemento = (c: RegraComplemento) => setRascunho((r) => ({ ...r, complemento: c }));
  const condicoes = rascunho.complemento.modo === "condicoes" ? rascunho.complemento.condicoes : [];
  const mudarCondicao = (tipo: CondicaoTipo, parcial: Partial<CondicaoComplemento> | null) => {
    const atuais = condicoes.filter((c) => c.tipo !== tipo);
    const atual = condicoes.find((c) => c.tipo === tipo) ?? { tipo, valor: 500, parametro: PARAMETRO[tipo]?.padrao };
    const nova = parcial === null ? atuais : [...atuais, { ...atual, ...parcial }];
    nova.sort((a, b) => TODAS_CONDICOES.indexOf(a.tipo) - TODAS_CONDICOES.indexOf(b.tipo));
    setComplemento({ modo: "condicoes", condicoes: nova });
  };

  const salvarAjustes = () => {
    const versao = salvo.versao + 1;
    const novo: Padrao = salvo.status === "vigente"
      ? { ...rascunho, versao, aprovadoEm: hoje(), historico: [...rascunho.historico, { versao, data: hoje(), mudanca: "Ajuste da comissão" }] }
      : { ...rascunho, status: "em_ajuste" };
    salvarPadrao(novo);
    // O rascunho passa a ser o que foi salvo: evita salvar de novo por cima e perder a versão
    setRascunho(novo);
  };

  const aprovar = () => {
    const versao = salvo.versao + 1;
    const mudanca = salvo.versao === 0 ? "Padrão inicial aprovado pela comissão (a partir do pré-modelo da IA)" : "Padrão aprovado pela comissão";
    const novo: Padrao = { ...rascunho, versao, status: "vigente", aprovadoEm: hoje(), historico: [...rascunho.historico, { versao, data: hoje(), mudanca }] };
    salvarPadrao(novo);
    setRascunho(novo);
  };

  const enviarSugestao = () => {
    if (!novaSug?.para || !novaSug.motivo.trim()) return;
    const ip = salvo.itens.find((i) => i.itemId === novaSug.itemId);
    const para = marcaPorId(novaSug.para)!;
    const de = ip?.preferenciais[0];
    const sug: SugestaoAlteracao = {
      id: `s-${Date.now().toString(36)}`,
      titulo: `${ip ? "Trocar" : "Incluir"} ${itemPorId(novaSug.itemId)?.nome.toLowerCase()}: ${para.fabricante}`,
      motivo: novaSug.motivo.trim(),
      tipo: ip ? "trocar_marca" : "incluir_item",
      itemId: novaSug.itemId,
      de,
      para: para.id,
      antes: de ? marcaPorId(de)?.fabricante ?? "—" : "Fora do protocolo",
      depois: para.fabricante,
    };
    salvarPadrao({ ...salvo, sugestoes: [...salvo.sugestoes, sug] });
    setRascunho((r) => ({ ...r, sugestoes: [...r.sugestoes, sug] }));
    setNovaSug(null);
  };

  const margemUn = (custo: number, itemId: string) =>
    contrato?.tipo === "aberta" ? (contrato.tabelaItem[itemId] ?? 0) - custo : null;
  const foraDoCatalogo = dominio.itens.filter((i) => !rascunho.itens.some((x) => x.itemId === i.id));
  const h = simulacao.hospital;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-1" onClick={onVoltar}>
            <ArrowLeft className="w-4 h-4 mr-1" aria-hidden /> Catálogo
          </Button>
          <h2 className="text-lg font-bold flex flex-wrap items-center gap-2">
            {proc.nome} <StatusPadraoBadge padrao={salvo} />
          </h2>
          <p className="text-sm text-muted-foreground">
            TUSS {proc.codigo} · {proc.volumeMes} cirurgias/mês · tempo médio {proc.tempoCirurgiaMin} min
            {salvo.aprovadoEm && ` · aprovado em ${dataBR(salvo.aprovadoEm)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!alterado} onClick={salvarAjustes}>Salvar ajustes</Button>
          {(salvo.status !== "vigente" || alterado) && (
            <Button onClick={aprovar}><Check className="w-4 h-4 mr-1" aria-hidden /> Aprovar padrão</Button>
          )}
        </div>
      </div>

      {salvo.status === "pre_modelo" && (
        <Alert>
          <AlertDescription>
            Pré-modelo montado pela IA com o histórico do hospital: por item, as marcas com glosa abaixo de 15%, ordenadas pela liberação. A comissão ajusta e aprova.
          </AlertDescription>
        </Alert>
      )}

      {/* Operadora: o padrão é um só, ajustado pela homologação e pelo contrato de cada operadora */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como fica em cada operadora</CardTitle>
          <CardDescription>O padrão é um só; cada operadora mostra só as marcas que ela homologa e o contrato dela.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={operadoraId} onValueChange={setOperadoraId}>
            <TabsList className="flex-wrap h-auto">
              {dominio.operadoras.map((o) => <TabsTrigger key={o.id} value={o.id}>{o.nome}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Contrato</p>
              <p className="font-semibold">{contrato ? (contrato.tipo === "pacote" ? "Pacote" : "Conta aberta") : "Sem contrato"}</p>
            </div>
            {h.tipo === "pacote" && h.teto ? (
              <div className="rounded-md border p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Consumo do teto do pacote ({brl(h.teto)})</p>
                <Progress value={Math.min(100, ((h.consumoTeto ?? 0) / h.teto) * 100)} className="mt-2" aria-label="Consumo do teto do pacote" />
                <p className="text-xs mt-1 tabular-nums">{brl(h.consumoTeto ?? 0)} usados · sobra {brl(h.teto - (h.consumoTeto ?? 0))}</p>
              </div>
            ) : (
              <div className="rounded-md border p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Margem estimada do pedido sugerido</p>
                <p className={`font-semibold tabular-nums ${h.margem < 0 ? "text-red-700" : ""}`}>
                  {considerarMargem ? `${brl(h.margem)} (${Math.round(h.margemPct)}%)` : "Margem desligada na Configuração"}
                </p>
              </div>
            )}
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Liberação · risco de glosa</p>
              <p className="font-semibold tabular-nums">{simulacao.liberacaoDias} dias · {Math.round(simulacao.riscoGlosa)}%</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">Atalhos para montar o leque nesta operadora:</span>
            <Button size="sm" variant="outline" onClick={() => aplicarAtalho("rapido")}><Zap className="w-4 h-4 mr-1" aria-hidden /> Mais rápido</Button>
            {considerarMargem && (
              <Button size="sm" variant="outline" onClick={() => aplicarAtalho("rentavel")}><Gauge className="w-4 h-4 mr-1" aria-hidden /> Mais rentável</Button>
            )}
            <Button size="sm" variant="outline" onClick={() => aplicarAtalho("equilibrio")}><Scale className="w-4 h-4 mr-1" aria-hidden /> Equilíbrio</Button>
          </div>
        </CardContent>
      </Card>

      {/* Itens e marcas */}
      {rascunho.itens.map((ip) => {
        const item = itemPorId(ip.itemId)!;
        const marcas = dominio.marcas.filter((m) => m.itemId === ip.itemId);
        const aceitasAqui = ip.aceitas.filter((id) => marcaPorId(id)?.homologadaEm.includes(operadoraId)).length;
        return (
          <Card key={ip.itemId}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm">{item.nome} <Badge variant="outline" className="ml-1">{item.classe}</Badge></CardTitle>
                  <CardDescription>Característica: {item.caracteristica}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`qtd-${ip.itemId}`} className="text-xs">Qtd. típica</Label>
                  <Input id={`qtd-${ip.itemId}`} type="number" min={1} className="w-16 h-8" value={ip.qtdTipica}
                    onChange={(e) => mudarItem(ip.itemId, (i) => ({ ...i, qtdTipica: Math.max(1, Number(e.target.value) || 1) }))} />
                  <Button variant="ghost" size="icon" aria-label={`Tirar ${item.nome} do padrão`}
                    onClick={() => setRascunho((r) => ({ ...r, itens: r.itens.filter((i) => i.itemId !== ip.itemId) }))}>
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </Button>
                </div>
              </div>
              {aceitasAqui < 3 && (
                <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
                  Só {aceitasAqui} marca(s) aceita(s) homologada(s) nesta operadora. O recomendado são pelo menos 3 (CFM 2.318/2022).
                </p>
              )}
            </CardHeader>
            <CardContent className="overflow-x-auto pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Aceita</TableHead>
                    <TableHead className="w-24">Preferencial</TableHead>
                    <TableHead>Marca · fornecedor</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    {considerarMargem && contrato?.tipo === "aberta" && <TableHead className="text-right">Margem/un.</TableHead>}
                    <TableHead className="text-right">Liberação</TableHead>
                    <TableHead className="text-right">Glosa</TableHead>
                    <TableHead className="text-right">Tempo de cirurgia</TableHead>
                    <TableHead>Homologada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marcas.map((m) => {
                    const aceita = ip.aceitas.includes(m.id);
                    const pref = ip.preferenciais.includes(m.id);
                    const homologada = m.homologadaEm.includes(operadoraId);
                    const mu = margemUn(m.custo, ip.itemId);
                    return (
                      <TableRow key={m.id} className={aceita ? "" : "opacity-70"}>
                        <TableCell>
                          <Checkbox aria-label={`Aceita: ${m.fabricante} (${ip.itemId})`} checked={aceita}
                            onCheckedChange={(v) => alternarAceita(ip.itemId, m.id, v === true)} />
                        </TableCell>
                        <TableCell>
                          <Checkbox aria-label={`Preferencial: ${m.fabricante} (${ip.itemId})`} checked={pref}
                            onCheckedChange={(v) => alternarPreferencial(ip.itemId, m.id, v === true)} />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{m.fabricante}</p>
                          <p className="text-xs text-muted-foreground">{m.fornecedor} · paga em {m.prazoPagamentoDias} d</p>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{brl(m.custo)}</TableCell>
                        {considerarMargem && contrato?.tipo === "aberta" && (
                          <TableCell className={`text-right tabular-nums ${mu !== null && mu < 0 ? "text-red-700" : ""}`}>{mu !== null ? brl(mu) : "—"}</TableCell>
                        )}
                        <TableCell className="text-right tabular-nums">{m.liberacaoDias} d</TableCell>
                        <TableCell className={`text-right tabular-nums ${m.glosaPct >= 15 ? "text-red-700" : ""}`}>{m.glosaPct}%</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {m.tempoCirurgiaDeltaMin === 0 ? "na média" : `${m.tempoCirurgiaDeltaMin > 0 ? "+" : ""}${m.tempoCirurgiaDeltaMin} min`}
                        </TableCell>
                        <TableCell>
                          {homologada ? <Badge variant="secondary">Sim</Badge> : <Badge variant="outline" className="text-amber-700 border-amber-300">Não</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Itens pedidos por fora</CardTitle>
            <CardDescription>Itens que os médicos pedem e o padrão não prevê.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rascunho.pedidosPorFora.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item pedido por fora com frequência.</p>}
            {rascunho.pedidosPorFora.map((p) => (
              <div key={p.itemId} className="flex items-center justify-between gap-2 text-sm">
                <span>{itemPorId(p.itemId)?.nome} <span className="text-muted-foreground">· em {p.freqPct}% dos pedidos</span></span>
                <Button size="sm" variant="outline" onClick={() => incluirItem(p.itemId)}><Plus className="w-4 h-4 mr-1" aria-hidden /> Incluir</Button>
              </div>
            ))}
            <div className="pt-2">
              <Select onValueChange={incluirItem}>
                <SelectTrigger aria-label="Adicionar item ao padrão"><SelectValue placeholder="Adicionar outro item do catálogo" /></SelectTrigger>
                <SelectContent>
                  {foraDoCatalogo.map((i) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Complemento do médico</CardTitle>
            <CardDescription>Valor fixo pago pelo hospital quando o médico segue o padrão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <RadioGroup
              value={rascunho.complemento.modo}
              onValueChange={(v) =>
                setComplemento(v === "predefinido"
                  ? { modo: "predefinido", valor: condicoes.reduce((a, c) => a + c.valor, 0) || 1000 }
                  : { modo: "condicoes", condicoes: [{ tipo: "homologados", valor: 1000 }, { tipo: "dentro_padrao", valor: 1000 }] })}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2"><RadioGroupItem value="predefinido" id="c-pre" /><Label htmlFor="c-pre">Predefinido</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="condicoes" id="c-cond" /><Label htmlFor="c-cond">Por condições</Label></div>
            </RadioGroup>
            {rascunho.complemento.modo === "predefinido" ? (
              <div className="flex items-center gap-2">
                <Label htmlFor="c-valor" className="text-sm">Valor único se seguir todo o padrão (R$)</Label>
                <Input id="c-valor" type="number" min={0} step={100} className="w-28 h-8" value={rascunho.complemento.valor}
                  onChange={(e) => setComplemento({ modo: "predefinido", valor: Math.max(0, Number(e.target.value) || 0) })} />
              </div>
            ) : (
              <ul className="space-y-2">
                {TODAS_CONDICOES.map((tipo) => {
                  const c = condicoes.find((x) => x.tipo === tipo);
                  return (
                    <li key={tipo} className="rounded-md border p-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Switch aria-label={`Condição: ${LABEL_CONDICAO[tipo]}`} checked={!!c} onCheckedChange={(v) => mudarCondicao(tipo, v ? {} : null)} />
                        <span className="text-sm flex-1 min-w-[10rem]">{LABEL_CONDICAO[tipo]}</span>
                        {c && (
                          <>
                            {PARAMETRO[tipo] && (
                              <Input type="number" aria-label={PARAMETRO[tipo]!.label} title={PARAMETRO[tipo]!.label} className="w-16 h-8" value={c.parametro ?? PARAMETRO[tipo]!.padrao}
                                onChange={(e) => mudarCondicao(tipo, { parametro: Number(e.target.value) || 0 })} />
                            )}
                            <Input type="number" aria-label={`Valor de ${LABEL_CONDICAO[tipo]}`} step={100} className="w-24 h-8" value={c.valor}
                              onChange={(e) => mudarCondicao(tipo, { valor: Math.max(0, Number(e.target.value) || 0) })} />
                          </>
                        )}
                      </div>
                      {c && CONDICOES_COM_AVISO_JURIDICO.includes(tipo) && (
                        <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden /> Requer validação do jurídico. O médico vê só "Condição do hospital".
                        </p>
                      )}
                    </li>
                  );
                })}
                <li className="text-sm font-medium text-right">Total possível: {brl(condicoes.reduce((a, c) => a + c.valor, 0))}</li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Codificação e protocolo</CardTitle>
            <CardDescription>{rascunho.protocolo.fonte}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Códigos recomendados</p>
              <ul>{rascunho.codigosRecomendados.map((c) => <li key={c.codigo}>{c.codigo} · {c.descricao}</li>)}</ul>
            </div>
            {rascunho.codigosAlerta.length > 0 && (
              <div>
                <p className="font-medium text-amber-700">Codificação que costuma glosar</p>
                <ul>{rascunho.codigosAlerta.map((c) => <li key={c.codigo}>{c.codigo} · {c.descricao} · glosa {c.glosaPct}%</li>)}</ul>
              </div>
            )}
            <div>
              <p className="font-medium">Critérios de indicação</p>
              <ul className="list-disc pl-5">{rascunho.protocolo.criterios.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div>
              <p className="font-medium">Documentos</p>
              <p>{rascunho.protocolo.documentos.join(" · ")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sugestões de alteração e versões</CardTitle>
            <CardDescription>Tudo é alimentável: médicos, Compras e o consultor sugerem; a comissão decide.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {salvo.sugestoes.map((s) => (
              <div key={s.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{s.titulo}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{s.motivo}</p>
                <p className="text-xs mt-1">{s.antes} → {s.depois}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => { aceitarSugestao(procedimentoId, s.id); onVoltar(); }}>Aceitar (nova versão)</Button>
                  <Button size="sm" variant="outline" onClick={() => { recusarSugestao(procedimentoId, s.id); setRascunho((r) => ({ ...r, sugestoes: r.sugestoes.filter((x) => x.id !== s.id) })); }}>Recusar</Button>
                </div>
              </div>
            ))}
            {novaSug ? (
              <div className="rounded-md border p-3 space-y-2">
                <Select value={novaSug.itemId} onValueChange={(v) => setNovaSug({ ...novaSug, itemId: v, para: "" })}>
                  <SelectTrigger aria-label="Item da sugestão"><SelectValue placeholder="Item" /></SelectTrigger>
                  <SelectContent>{dominio.itens.map((i) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={novaSug.para} onValueChange={(v) => setNovaSug({ ...novaSug, para: v })}>
                  <SelectTrigger aria-label="Marca sugerida"><SelectValue placeholder="Marca sugerida" /></SelectTrigger>
                  <SelectContent>
                    {dominio.marcas.filter((m) => m.itemId === novaSug.itemId).map((m) => <SelectItem key={m.id} value={m.id}>{m.fabricante}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea aria-label="Motivo da sugestão" placeholder="Motivo (ex.: glosa alta, falta de estoque, evidência clínica)" value={novaSug.motivo}
                  onChange={(e) => setNovaSug({ ...novaSug, motivo: e.target.value })} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={enviarSugestao} disabled={!novaSug.para || !novaSug.motivo.trim()}>Registrar sugestão</Button>
                  <Button size="sm" variant="ghost" onClick={() => setNovaSug(null)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setNovaSug({ itemId: rascunho.itens[0]?.itemId ?? dominio.itens[0].id, para: "", motivo: "" })}>
                <Plus className="w-4 h-4 mr-1" aria-hidden /> Nova sugestão de alteração
              </Button>
            )}
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-1">Histórico</p>
              {salvo.historico.length === 0 ? (
                <p className="text-xs text-muted-foreground">Ainda sem versão aprovada.</p>
              ) : (
                <ol className="space-y-1 text-xs">
                  {[...salvo.historico].reverse().map((h) => (
                    <li key={`${h.versao}-${h.data}`}><span className="font-semibold">v{h.versao}</span> · {dataBR(h.data)} · {h.mudanca}</li>
                  ))}
                </ol>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MontagemPadrao;
