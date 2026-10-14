import { CalendarClock, Clock, Sparkles, ShieldAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Avaliacao } from "@/dominio/tipos";
import { CondicoesComplemento } from "./Etiquetas";
import { brl, dataBR } from "./formato";

interface Props {
  avaliacao: Avaliacao;
  sugerido: Avaliacao | null;
  onUsarSugerido: () => void;
}

/** Sempre visível na montagem: o pedido sugerido pelo hospital e o que o médico recebe com o pedido atual. */
const PainelSugerido = ({ avaliacao: a, sugerido, onUsarSugerido }: Props) => (
  <aside className="space-y-3">
    {sugerido && (
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" aria-hidden /> Pedido sugerido pelo hospital
        </div>
        <p className="mt-1 text-sm">
          Seguindo o sugerido: honorário <strong className="tabular-nums">{brl(sugerido.honorario.valor)}</strong>
          {sugerido.complemento.total > 0 && (
            <> + complemento <strong className="tabular-nums">{brl(sugerido.complemento.total)}</strong></>
          )}
        </p>
        <Button size="sm" className="mt-3 w-full" onClick={onUsarSugerido}>
          Usar pedido sugerido
        </Button>
      </div>
    )}

    <div className="glass-card space-y-3 rounded-xl p-4">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" aria-hidden /> Seu recebimento
        </div>
        <div className="mt-1 text-2xl font-extrabold tabular-nums">{brl(a.recebimento.valor)}</div>
        <p className={cn("text-xs font-semibold", a.honorario.garantido ? "text-success" : "text-destructive")}>
          {a.honorario.garantido ? "Honorário garantido" : "Honorário em risco"} · {brl(a.honorario.valor)}
        </p>
      </div>

      {(a.complemento.total > 0 || a.complemento.motivo) && (
        <div className="border-t pt-3">
          {a.complemento.motivo ? (
            <p className="text-xs text-muted-foreground">{a.complemento.motivo}</p>
          ) : (
            <>
              <p className="text-xs font-semibold text-success">Complemento garantido: {brl(a.complemento.garantido)}</p>
              {a.complemento.perdido > 0 && (
                <p className="text-xs font-semibold text-destructive">Complemento perdido: {brl(a.complemento.perdido)}</p>
              )}
              <div className="mt-2">
                <CondicoesComplemento condicoes={a.complemento.condicoes} visao="medico" />
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 border-t pt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <span>Recebe em <strong>{a.recebimento.dias} dias</strong>{a.recebimento.data && <> ({dataBR(a.recebimento.data)})</>}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <span>Liberação em <strong>~{a.liberacaoDias} dias</strong></span>
        </div>
        <div className={cn("col-span-2 flex items-center gap-1.5", a.riscoGlosa > 15 && "text-destructive")}>
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
          <span>Risco de glosa <strong>{a.riscoGlosa}%</strong></span>
        </div>
      </div>
    </div>
  </aside>
);

export default PainelSugerido;
