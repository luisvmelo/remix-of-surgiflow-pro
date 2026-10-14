import { useState } from "react";
import { Minus, Plus, Trash2, Zap, ChevronDown, ChevronUp, AlertTriangle, Paperclip, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { mockPatients } from "@/lib/mockData";
import { leque } from "@/dominio/motor";
import type { Avaliacao, Dominio, ItemPedido, Marca, NivelPlano, Pedido } from "@/dominio/tipos";
import { TagForaPadrao, TagForaProtocolo, TagNaoHomologado, TagPreferencial } from "./Etiquetas";

export type Rascunho = Omit<Pedido, "id" | "status" | "ajustes" | "criadoEm"> & { id?: string };

interface PassoProps {
  r: Rascunho;
  setR: (f: (r: Rascunho) => Rascunho) => void;
  dominio: Dominio;
  avaliacao: Avaliacao;
  abrirProtocolo: () => void;
}

const NIVEIS: NivelPlano[] = ["Básico", "Especial", "Executivo"];

// ---------------- 1. Paciente e cirurgia ----------------
export const PassoPaciente = ({ r, setR, dominio }: PassoProps) => {
  const contrato = dominio.contratosMedico.find((c) => c.medicoId === r.medicoId);
  const procedimentos = dominio.procedimentos.filter((p) => !contrato || contrato.procedimentos.includes(p.id));
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pac-nome">Paciente</Label>
          <Input id="pac-nome" list="pacientes" value={r.paciente.nome} placeholder="Nome do paciente"
            onChange={(e) => {
              const nome = e.target.value;
              const conhecido = mockPatients.find((p) => p.name === nome);
              setR((x) => ({
                ...x,
                paciente: { nome, cpf: conhecido?.cpf ?? x.paciente.cpf },
                ...(conhecido ? { operadoraId: conhecido.operadoraId, plano: conhecido.planoNivel } : {}),
              }));
            }} />
          <datalist id="pacientes">{mockPatients.map((p) => <option key={p.id} value={p.name} />)}</datalist>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pac-cpf">CPF</Label>
          <Input id="pac-cpf" value={r.paciente.cpf} placeholder="000.000.000-00"
            onChange={(e) => setR((x) => ({ ...x, paciente: { ...x.paciente, cpf: e.target.value } }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Operadora</Label>
          <Select value={r.operadoraId} onValueChange={(v) => setR((x) => ({ ...x, operadoraId: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{dominio.operadoras.map((o) => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Nível do plano</Label>
          <Select value={r.plano} onValueChange={(v) => setR((x) => ({ ...x, plano: v as NivelPlano }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{NIVEIS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Procedimento principal</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {procedimentos.map((p) => {
            const status = dominio.padroes[p.id]?.status;
            return (
              <button key={p.id} type="button"
                onClick={() => setR((x) => (x.procedimentoId === p.id ? x : { ...x, procedimentoId: p.id, itens: [], codigos: [], documentos: [] }))}
                className={cn("rounded-lg border-2 p-3 text-left text-sm transition-colors",
                  r.procedimentoId === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                <div className="font-semibold leading-tight">{p.nome}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {p.codigo} · {status === "vigente" ? "padrão do hospital" : "sugestão da IA"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="data-cir">Data prevista da cirurgia</Label>
          <Input id="data-cir" type="date" value={r.dataCirurgia} onChange={(e) => setR((x) => ({ ...x, dataCirurgia: e.target.value }))} />
        </div>
        <label className="flex items-center gap-3 pt-6 text-sm">
          <Switch checked={r.urgencia} onCheckedChange={(v) => setR((x) => ({ ...x, urgencia: v }))} />
          Cirurgia de urgência
        </label>
      </div>
    </div>
  );
};

// ---------------- 2. Codificação ----------------
export const PassoCodificacao = ({ r, setR, dominio }: PassoProps) => {
  const padrao = dominio.padroes[r.procedimentoId];
  const [outro, setOutro] = useState("");
  if (!padrao) return <p className="text-sm text-muted-foreground">Escolha o procedimento no passo 1.</p>;
  const alternar = (codigo: string) =>
    setR((x) => ({ ...x, codigos: x.codigos.includes(codigo) ? x.codigos.filter((c) => c !== codigo) : [...x.codigos, codigo] }));
  const recomendados = new Set(padrao.codigosRecomendados.map((c) => c.codigo));
  const extras = r.codigos.filter((c) => !recomendados.has(c) && !padrao.codigosAlerta.some((a) => a.codigo === c));
  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 text-sm font-semibold">Códigos recomendados</h3>
        <p className="mb-3 text-xs text-muted-foreground">O histórico desta operadora mostra que estes códigos liberam e pagam corretamente.</p>
        <div className="space-y-2">
          {padrao.codigosRecomendados.map((c) => (
            <label key={c.codigo} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
              <input type="checkbox" checked={r.codigos.includes(c.codigo)} onChange={() => alternar(c.codigo)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
              <span className="font-mono text-xs">{c.codigo}</span>
              <span>{c.descricao}</span>
            </label>
          ))}
        </div>
      </section>
      {padrao.codigosAlerta.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold">Outras formas de codificar</h3>
          <div className="space-y-2">
            {padrao.codigosAlerta.map((c) => (
              <label key={c.codigo} className="flex cursor-pointer items-center gap-3 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm">
                <input type="checkbox" checked={r.codigos.includes(c.codigo)} onChange={() => alternar(c.codigo)} className="h-4 w-4" />
                <span className="font-mono text-xs">{c.codigo}</span>
                <span className="flex-1">{c.descricao}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-warning"><AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {c.glosaPct}% de glosa</span>
              </label>
            ))}
          </div>
        </section>
      )}
      <section className="flex flex-wrap items-end gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="cod-extra">Outro código TUSS</Label>
          <Input id="cod-extra" value={outro} onChange={(e) => setOutro(e.target.value)} placeholder="Ex.: 30715044" className="w-48" />
        </div>
        <Button type="button" variant="outline" disabled={!outro.trim()} onClick={() => { alternar(outro.trim()); setOutro(""); }}>Adicionar</Button>
        {extras.map((c) => (
          <button key={c} type="button" onClick={() => alternar(c)} className="rounded-full border px-2 py-1 font-mono text-xs hover:bg-muted">{c} ✕</button>
        ))}
      </section>
    </div>
  );
};

// ---------------- 3. Itens ----------------
const BotaoMarca = ({ marca, selecionada, preferencial, foraPadrao, naoHomologada, onClick }: {
  marca: Marca; selecionada: boolean; preferencial?: boolean; foraPadrao?: boolean; naoHomologada?: boolean; onClick: () => void;
}) => (
  <button type="button" onClick={onClick} aria-pressed={selecionada}
    className={cn("rounded-lg border-2 p-2.5 text-left text-xs transition-colors",
      selecionada ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
    <div className="text-sm font-semibold leading-tight">{marca.fabricante}</div>
    <div className="mt-0.5 text-muted-foreground">Libera em ~{marca.liberacaoDias} dias · glosa {marca.glosaPct}%</div>
    <div className="mt-1.5 flex flex-wrap gap-1">
      {preferencial && <TagPreferencial />}
      {foraPadrao && <TagForaPadrao />}
      {naoHomologada && <TagNaoHomologado />}
    </div>
  </button>
);

const Quantidade = ({ qtd, onChange }: { qtd: number; onChange: (q: number) => void }) => (
  <div className="flex items-center gap-1.5">
    <Button type="button" variant="outline" size="icon" className="h-7 w-7" aria-label="Diminuir quantidade" onClick={() => onChange(Math.max(1, qtd - 1))}><Minus className="h-3 w-3" /></Button>
    <span className="w-6 text-center text-sm font-bold tabular-nums">{qtd}</span>
    <Button type="button" variant="outline" size="icon" className="h-7 w-7" aria-label="Aumentar quantidade" onClick={() => onChange(qtd + 1)}><Plus className="h-3 w-3" /></Button>
  </div>
);

export const PassoItens = ({ r, setR, dominio, avaliacao, abrirProtocolo, onCompraRapida }: PassoProps & { onCompraRapida: () => void }) => {
  const padrao = dominio.padroes[r.procedimentoId];
  const [outrasAbertas, setOutrasAbertas] = useState<string | null>(null);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  if (!padrao) return <p className="text-sm text-muted-foreground">Escolha o procedimento no passo 1.</p>;

  const lequeOp = leque(padrao, r.operadoraId, dominio);
  const doPedido = (itemId: string) => r.itens.find((i) => i.itemId === itemId);
  const escolher = (itemId: string, marcaId: string, qtdTipica: number) =>
    setR((x) => {
      const atual = x.itens.find((i) => i.itemId === itemId);
      const resto = x.itens.filter((i) => i.itemId !== itemId);
      return { ...x, itens: [...resto, { itemId, marcaId, qtd: atual?.qtd ?? qtdTipica }] };
    });
  const mudarQtd = (itemId: string, qtd: number) => setR((x) => ({ ...x, itens: x.itens.map((i) => (i.itemId === itemId ? { ...i, qtd } : i)) }));
  const remover = (itemId: string) => setR((x) => ({ ...x, itens: x.itens.filter((i) => i.itemId !== itemId) }));
  const previstos = new Set(padrao.itens.map((i) => i.itemId));
  const foraDoProtocolo: ItemPedido[] = r.itens.filter((i) => !previstos.has(i.itemId));
  const catalogoFora = dominio.itens.filter((i) => !previstos.has(i.id) && !r.itens.some((x) => x.itemId === i.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Mostrando só o que o protocolo e o padrão do hospital permitem. Você pode pedir menos itens.</p>
        <Button type="button" variant="outline" size="sm" onClick={onCompraRapida}><Zap className="mr-1.5 h-4 w-4" aria-hidden /> Sugestão de compra rápida</Button>
      </div>

      {lequeOp.map((l) => {
        const item = dominio.itens.find((x) => x.id === l.itemId)!;
        const escolhido = doPedido(l.itemId);
        const outras = dominio.marcas.filter((m) => m.itemId === l.itemId && !l.aceitas.some((a) => a.id === m.id));
        return (
          <div key={l.itemId} className="glass-card rounded-xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{item.nome}</div>
                <div className="text-xs text-muted-foreground">{item.caracteristica} · quantidade típica {l.qtdTipica}</div>
              </div>
              {escolhido ? (
                <div className="flex items-center gap-2">
                  <Quantidade qtd={escolhido.qtd} onChange={(q) => mudarQtd(l.itemId, q)} />
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Não usar ${item.nome}`} onClick={() => remover(l.itemId)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Não incluído</span>
              )}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {l.aceitas.map((m) => (
                <BotaoMarca key={m.id} marca={m} selecionada={escolhido?.marcaId === m.id} preferencial={l.preferenciais.some((p) => p.id === m.id)}
                  onClick={() => escolher(l.itemId, m.id, l.qtdTipica)} />
              ))}
            </div>
            {outras.length > 0 && (
              <div className="mt-2">
                <button type="button" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setOutrasAbertas(outrasAbertas === l.itemId ? null : l.itemId)}>
                  {outrasAbertas === l.itemId ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} Outras marcas (fora do padrão)
                </button>
                {outrasAbertas === l.itemId && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {outras.map((m) => (
                      <BotaoMarca key={m.id} marca={m} selecionada={escolhido?.marcaId === m.id} foraPadrao
                        naoHomologada={!m.homologadaEm.includes(r.operadoraId)} onClick={() => escolher(l.itemId, m.id, l.qtdTipica)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {foraDoProtocolo.map((it) => {
        const item = dominio.itens.find((x) => x.id === it.itemId)!;
        const marcas = dominio.marcas.filter((m) => m.itemId === it.itemId);
        return (
          <div key={it.itemId} className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 font-semibold">{item.nome} <TagForaProtocolo onClick={abrirProtocolo} /></div>
                <div className="text-xs text-muted-foreground">{item.caracteristica} · o protocolo desta cirurgia não prevê este material</div>
              </div>
              <div className="flex items-center gap-2">
                <Quantidade qtd={it.qtd} onChange={(q) => mudarQtd(it.itemId, q)} />
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Remover ${item.nome}`} onClick={() => remover(it.itemId)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {marcas.map((m) => (
                <BotaoMarca key={m.id} marca={m} selecionada={it.marcaId === m.id} naoHomologada={!m.homologadaEm.includes(r.operadoraId)}
                  onClick={() => escolher(it.itemId, m.id, 1)} />
              ))}
            </div>
          </div>
        );
      })}

      <div>
        <Button type="button" variant="ghost" size="sm" onClick={() => setMostrarCatalogo((v) => !v)}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden /> Adicionar item fora do protocolo
        </Button>
        {mostrarCatalogo && (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {catalogoFora.map((i) => {
              const primeira = dominio.marcas.find((m) => m.itemId === i.id);
              return (
                <button key={i.id} type="button" disabled={!primeira}
                  onClick={() => { if (primeira) { escolher(i.id, primeira.id, 1); setMostrarCatalogo(false); } }}
                  className="rounded-lg border p-2.5 text-left text-sm hover:bg-muted">
                  {i.nome} <span className="text-xs text-muted-foreground">· {i.caracteristica}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {avaliacao.naoHomologados.length > 0 && (
        <p className="text-xs font-medium text-destructive">Há itens não homologados nesta operadora: a operadora não libera e o item vira glosa.</p>
      )}
    </div>
  );
};

// ---------------- 4. Documentos ----------------
export const PassoDocumentos = ({ r, setR, dominio }: PassoProps) => {
  const padrao = dominio.padroes[r.procedimentoId];
  if (!padrao) return <p className="text-sm text-muted-foreground">Escolha o procedimento no passo 1.</p>;
  const docs = padrao.protocolo.documentos;
  const alternar = (doc: string) =>
    setR((x) => ({ ...x, documentos: x.documentos.includes(doc) ? x.documentos.filter((d) => d !== doc) : [...x.documentos, doc] }));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Documentos obrigatórios pelo protocolo desta cirurgia.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setR((x) => ({ ...x, documentos: [...docs] }))}>
          <Paperclip className="mr-1.5 h-4 w-4" aria-hidden /> Anexar todos
        </Button>
      </div>
      {docs.map((d) => {
        const anexado = r.documentos.includes(d);
        return (
          <button key={d} type="button" onClick={() => alternar(d)}
            className={cn("flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm", anexado ? "border-success/40 bg-success/5" : "border-border")}>
            <span>{d}</span>
            {anexado ? <span className="flex items-center gap-1 text-xs font-semibold text-success"><CheckCircle2 className="h-4 w-4" aria-hidden /> Anexado</span>
              : <span className="text-xs text-muted-foreground">Anexar</span>}
          </button>
        );
      })}
    </div>
  );
};
