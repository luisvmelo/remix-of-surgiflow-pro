import { useEffect, useState } from "react";
import { ChevronRight, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDominio } from "@/dominio/store";
import { LABEL_LINHA } from "@/gestao/analise";
import type { LinhaCuidado } from "@/dominio/tipos";
import MontagemPadrao from "./MontagemPadrao";
import { StatusPadraoBadge } from "./StatusPadraoBadge";

interface Props {
  /** Procedimento para abrir direto (vindo das pendências da Home) */
  abrir?: string | null;
}

const ComissaoTab = ({ abrir }: Props) => {
  const { dominio, aceitarSugestao, recusarSugestao } = useDominio();
  const [aberto, setAberto] = useState<string | null>(abrir ?? null);

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
      <div className="grid gap-3 grid-cols-3">
        {[
          { s: "vigente", t: "Padrões vigentes" },
          { s: "em_ajuste", t: "Em ajuste" },
          { s: "pre_modelo", t: "Pré-modelos da IA para revisar" },
        ].map(({ s, t }) => (
          <Card key={s}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t}</p>
              <p className="text-2xl font-bold tabular-nums">{contagem(s)}</p>
            </CardContent>
          </Card>
        ))}
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
                      {padrao.sugestoes.length > 0 && ` · ${padrao.sugestoes.length} sugestão(ões)`}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
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
