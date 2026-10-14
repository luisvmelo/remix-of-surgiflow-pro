import { useState } from "react";
import { FileSignature, Handshake, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDominio } from "@/dominio/store";
import type { ContratoOperadora, NivelPlano } from "@/dominio/tipos";
import { brl, dataBR } from "@/components/pedido/formato";
import { previsibilidade } from "@/gestao/analise";

const PLANOS: NivelPlano[] = ["Básico", "Especial", "Executivo"];

/** Campo numérico que só grava ao sair do campo (evita salvar a cada tecla). */
const CampoNumero = ({ valor, onSalvar, rotulo, className }: { valor: number; onSalvar: (v: number) => void; rotulo: string; className?: string }) => (
  <Input
    type="number"
    aria-label={rotulo}
    defaultValue={valor}
    key={valor}
    className={className ?? "w-24 h-8 text-right"}
    onBlur={(e) => {
      const v = Number(e.target.value);
      if (Number.isFinite(v) && v >= 0 && v !== valor) onSalvar(v);
    }}
  />
);

const ContratosTab = () => {
  const { dominio, salvarContratoMedico, salvarContratoOperadora } = useDominio();
  const [operadoraId, setOperadoraId] = useState(dominio.operadoras[0].id);
  const [prevOp, setPrevOp] = useState("4");
  const [prevPlano, setPrevPlano] = useState<NivelPlano>("Especial");
  const tabela = previsibilidade(dominio, prevOp, prevPlano);
  const nomeProc = (id: string) => dominio.procedimentos.find((p) => p.id === id)?.nome ?? id;
  const contratosOp = dominio.contratosOperadora.filter((c) => c.operadoraId === operadoraId);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Handshake className="w-4 h-4" aria-hidden /> Contratos com os médicos</CardTitle>
          <CardDescription>O que está aqui alimenta o wizard, a previsão de recebimento do médico e o complemento.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table aria-label="Contratos com os médicos">
            <TableHeader>
              <TableRow>
                <TableHead>Médico</TableHead>
                <TableHead>Procedimentos</TableHead>
                <TableHead>Complemento</TableHead>
                <TableHead className="text-right">Repasse eletiva</TableHead>
                <TableHead className="text-right">Repasse urgência</TableHead>
                <TableHead>Vigência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dominio.contratosMedico.map((c) => {
                const medico = dominio.medicos.find((m) => m.id === c.medicoId)!;
                return (
                  <TableRow key={c.medicoId}>
                    <TableCell>
                      <p className="font-medium text-sm">{medico.nome}</p>
                      <p className="text-xs text-muted-foreground">{medico.especialidade} · {medico.crm}</p>
                    </TableCell>
                    <TableCell className="max-w-[18rem]">
                      <div className="flex flex-wrap gap-1">
                        {c.procedimentos.map((p) => <Badge key={p} variant="outline" className="font-normal">{nomeProc(p)}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          aria-label={`Participa do complemento: ${medico.nome}`}
                          checked={c.participaComplemento}
                          onCheckedChange={(v) => salvarContratoMedico({ ...c, participaComplemento: v })}
                        />
                        <span className="text-xs text-muted-foreground">{c.participaComplemento ? "Participa" : "Não participa"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <CampoNumero rotulo={`Repasse eletiva (dias): ${medico.nome}`} valor={c.repasseEletivaDias} className="w-20 h-8 text-right ml-auto"
                        onSalvar={(v) => salvarContratoMedico({ ...c, repasseEletivaDias: v })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <CampoNumero rotulo={`Repasse urgência (dias): ${medico.nome}`} valor={c.repasseUrgenciaDias} className="w-20 h-8 text-right ml-auto"
                        onSalvar={(v) => salvarContratoMedico({ ...c, repasseUrgenciaDias: v })} />
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">até {dataBR(c.vigencia)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><FileSignature className="w-4 h-4" aria-hidden /> Contratos com as operadoras</CardTitle>
              <CardDescription>Pacote (com teto) ou conta aberta, e o honorário por plano.</CardDescription>
            </div>
            <Select value={operadoraId} onValueChange={setOperadoraId}>
              <SelectTrigger className="w-56" aria-label="Operadora do contrato"><SelectValue /></SelectTrigger>
              <SelectContent>{dominio.operadoras.map((o) => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <p className="text-xs text-muted-foreground mb-2">
            Paga em {dominio.operadoras.find((o) => o.id === operadoraId)!.prazoPagamentoDias} dias.
          </p>
          <Table aria-label="Contratos da operadora">
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Teto do pacote</TableHead>
                {PLANOS.map((p) => <TableHead key={p} className="text-right">Honorário {p}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosOp.map((c) => (
                <TableRow key={c.procedimentoId}>
                  <TableCell className="text-sm font-medium">{nomeProc(c.procedimentoId)}</TableCell>
                  <TableCell><Badge variant={c.tipo === "pacote" ? "secondary" : "outline"}>{c.tipo === "pacote" ? "Pacote" : "Conta aberta"}</Badge></TableCell>
                  <TableCell className="text-right">
                    {c.tipo === "pacote" ? (
                      <CampoNumero rotulo={`Teto: ${nomeProc(c.procedimentoId)}`} valor={c.teto} className="w-28 h-8 text-right ml-auto"
                        onSalvar={(v) => salvarContratoOperadora({ ...c, teto: v })} />
                    ) : (
                      <span className="text-xs text-muted-foreground">tabela por item</span>
                    )}
                  </TableCell>
                  {PLANOS.map((p) => (
                    <TableCell key={p} className="text-right">
                      <CampoNumero rotulo={`Honorário ${p}: ${nomeProc(c.procedimentoId)}`} valor={c.honorario[p]} className="w-24 h-8 text-right ml-auto"
                        onSalvar={(v) => salvarContratoOperadora({ ...c, honorario: { ...c.honorario, [p]: v } } as ContratoOperadora)} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Table2 className="w-4 h-4" aria-hidden /> Tabela de previsibilidade</CardTitle>
              <CardDescription>O que o médico recebe seguindo o padrão: é o argumento para atrair médicos ao hospital.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={prevOp} onValueChange={setPrevOp}>
                <SelectTrigger className="w-48" aria-label="Operadora da previsibilidade"><SelectValue /></SelectTrigger>
                <SelectContent>{dominio.operadoras.map((o) => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={prevPlano} onValueChange={(v) => setPrevPlano(v as NivelPlano)}>
                <SelectTrigger className="w-32" aria-label="Plano da previsibilidade"><SelectValue /></SelectTrigger>
                <SelectContent>{PLANOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table aria-label="Tabela de previsibilidade">
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento</TableHead>
                <TableHead className="text-right">Honorário</TableHead>
                <TableHead className="text-right">Complemento possível</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Liberação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabela.map((l) => (
                <TableRow key={l.procedimentoId}>
                  <TableCell className="text-sm font-medium">{l.nome}</TableCell>
                  {l.semContrato ? (
                    <TableCell colSpan={4} className="text-right text-sm text-muted-foreground">Sem contrato com esta operadora</TableCell>
                  ) : (
                    <>
                      <TableCell className="text-right tabular-nums">{brl(l.honorario)}</TableCell>
                      <TableCell className="text-right tabular-nums" style={{ color: "var(--serie-medico)" }}>+ {brl(l.complemento)}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{brl(l.honorario + l.complemento)}</TableCell>
                      <TableCell className="text-right tabular-nums">{l.liberacaoDias} dias</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContratosTab;
