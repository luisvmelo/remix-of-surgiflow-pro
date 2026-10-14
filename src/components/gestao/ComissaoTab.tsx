import { useEffect, useMemo, useState } from "react";
import { ChevronRight, MessageSquarePlus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDominio } from "@/dominio/store";
import { LABEL_LINHA } from "@/gestao/analise";
import { ganhoPossivel, statusRevisao } from "@/gestao/comissao";
import { brl } from "@/components/pedido/formato";
import { useRegistros } from "./useGestao";
import type { LinhaCuidado } from "@/dominio/tipos";
import MontagemPadrao from "./MontagemPadrao";
import { RevisaoBadge, StatusPadraoBadge } from "./StatusPadraoBadge";

interface Props {
  /** Procedimento para abrir direto (vindo das pendências da Home) */
  abrir?: string | null;
}

const ComissaoTab = ({ abrir }: Props) => {
  const { dominio, aceitarSugestao, recusarSugestao } = useDominio();
  const [aberto, setAberto] = useState<string | null>(abrir ?? null);
  const regs = useRegistros();
  const ganhos = useMemo(() => Object.fromEntries(dominio.procedimentos.map((p) => [p.id, ganhoPossivel(regs, dominio, p.id)])), [regs, dominio]);

  useEffect(() => {
    if (abrir) setAberto(abrir);
  }, [abrir]);

  if (aberto) return <MontagemPadrao key={aberto} procedimentoId={aberto} onVoltar={() => setAberto(null)} />;

  const padroes = Object.values(dominio.padroes);
  const contagem = (s: string) => padroes.filter((p) => p.status === s).length;
  const linhas = [...new Set(dominio.procedimentos.map((p) => p.linha))] as LinhaCuidado[];
  const sugestoes = padroes.flatMap((p) => p.sugestoes.map((s) => ({ ...s, procedimentoId: p.procedimentoId })));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          { s: "vigente", t: "Padrões vigentes" },
          { s: "em_ajuste", t: "Em ajuste" },
          { s: "pre_modelo", t: "Sugestões da IA para revisar" },
        ].map(({ s, t }) => (
          <Card key={s}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t}</p>
              <p className="text-2xl font-bold tabular-nums">{contagem(s)}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Revisões vencendo ou vencidas</p>
            <p className="text-2xl font-bold tabular-nums">{padroes.filter((p) => ["vencendo", "vencida"].includes(statusRevisao(p))).length}</p>
          </CardContent>
        </Card>
      </div>

      {sugestoes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><MessageSquarePlus className="w-4 h-4" aria-hidden /> Sugestões de alteração</CardTitle>
            <CardDescription>Aceitar cria uma nova versão do padrão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sugestoes.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{s.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {dominio.procedimentos.find((p) => p.id === s.procedimentoId)?.nome} · {s.antes} → {s.depois} · {s.motivo}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => aceitarSugestao(s.procedimentoId, s.id)}>Aceitar</Button>
                  <Button size="sm" variant="outline" onClick={() => recusarSugestao(s.procedimentoId, s.id)}>Recusar</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {linhas.map((linha) => (
        <Card key={linha}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{LABEL_LINHA[linha]}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {dominio.procedimentos.filter((p) => p.linha === linha).map((p) => {
              const padrao = dominio.padroes[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => setAberto(p.id)}
                  className="w-full flex flex-wrap items-center justify-between gap-2 px-6 py-3 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{p.nome}</span>
                    <span className="block text-xs text-muted-foreground">
                      {p.volumeMes} cirurgias/mês · {padrao.itens.length} itens
                      {ganhos[p.id] > 0 && <> · <span className="text-emerald-700 font-medium">Ganho possível {brl(ganhos[p.id])}/mês</span></>}
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center justify-end gap-2">
                    {padrao.sugestoes.length > 0 && (
                      <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 gap-1">
                        <Sparkles className="w-3 h-3" aria-hidden />Nova sugestão de alteração
                      </Badge>
                    )}
                    <RevisaoBadge padrao={padrao} />
                    <StatusPadraoBadge padrao={padrao} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden />
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ComissaoTab;
