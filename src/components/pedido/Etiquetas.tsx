import { AlertTriangle, BadgeCheck, CircleCheck, CircleX, FileWarning, ShieldAlert, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Avaliacao, CondicaoAvaliada } from "@/dominio/tipos";
import { brl } from "./formato";

const base = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap";

export const TagForaProtocolo = ({ onClick }: { onClick?: () => void }) => (
  <button type="button" onClick={onClick} aria-label="Fora do protocolo" className={cn(base, "badge-danger hover:opacity-80")}>
    <FileWarning className="h-3 w-3" aria-hidden /> Fora do protocolo
  </button>
);

export const TagForaPadrao = () => (
  <span className={cn(base, "badge-warning")}>
    <AlertTriangle className="h-3 w-3" aria-hidden /> Fora do padrão
  </span>
);

export const TagNaoHomologado = () => (
  <span className={cn(base, "badge-danger")}>
    <ShieldAlert className="h-3 w-3" aria-hidden /> Não homologado
  </span>
);

export const TagPreferencial = () => (
  <span className={cn(base, "badge-success")}>
    <BadgeCheck className="h-3 w-3" aria-hidden /> Preferencial
  </span>
);

export const TagAjuste = ({ texto }: { texto?: string }) => (
  <span className={cn(base, "badge-warning")} title={texto}>
    <Wrench className="h-3 w-3" aria-hidden /> Ajuste pedido
  </span>
);

export const Checklist = ({ itens }: { itens: Avaliacao["checklist"] }) => (
  <ul className="space-y-1.5">
    {itens.map((c) => (
      <li key={c.id} className="flex items-start gap-2 text-sm">
        {c.ok ? (
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
        ) : (
          <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
        )}
        <span>
          <span className={cn(!c.ok && "font-medium")}>{c.label}</span>
          {c.detalhe && <span className="block text-xs text-muted-foreground">{c.detalhe}</span>}
        </span>
      </li>
    ))}
  </ul>
);

/** Condições do complemento. Para médico e secretária, a condição de margem aparece sem números. */
export const CondicoesComplemento = ({ condicoes, visao }: { condicoes: CondicaoAvaliada[]; visao: "medico" | "hospital" }) => (
  <ul className="space-y-1">
    {condicoes.map((c) => (
      <li key={c.tipo + c.label} className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5">
          {c.cumprida ? <CircleCheck className="h-3.5 w-3.5 text-success" aria-hidden /> : <CircleX className="h-3.5 w-3.5 text-destructive" aria-hidden />}
          {visao === "medico" && c.tipo === "margem_minima" ? "Condição do hospital" : c.label}
          {visao === "hospital" && c.avisoJuridico && (
            <span className="badge-warning rounded-full border px-1.5 text-[10px]">requer validação do jurídico</span>
          )}
        </span>
        <span className={cn("tabular-nums", c.cumprida ? "text-foreground" : "text-muted-foreground line-through")}>{brl(c.valor)}</span>
      </li>
    ))}
  </ul>
);
