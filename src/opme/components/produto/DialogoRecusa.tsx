import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@opme/components/ui/dialog";
import { Button } from "@opme/components/ui/button";
import { JUSTIFICATIVAS_REMOCAO, MAX_TENTATIVAS, MOTIVOS_RECUSA } from "@opme/lib/otimizador";
import { cn } from "@opme/lib/utils";

interface DialogoRecusaProps {
  aberto: boolean;
  item: string;
  fornecedor: string;
  tentativas: number;
  onFechar: () => void;
  onRecusar: (motivo: string) => void;
  onRemover: (justificativa: string) => void;
}

/** Recusar a sugestão (conta uma tentativa) ou remover o item do fluxo do otimizador */
const DialogoRecusa = ({ aberto, item, fornecedor, tentativas, onFechar, onRecusar, onRemover }: DialogoRecusaProps) => {
  const [acao, setAcao] = useState<"recusar" | "remover">("recusar");
  const [motivo, setMotivo] = useState("");

  const opcoes = acao === "recusar" ? MOTIVOS_RECUSA : JUSTIFICATIVAS_REMOCAO;
  const confirmar = () => {
    if (!motivo) return;
    if (acao === "recusar") onRecusar(motivo);
    else onRemover(motivo);
    setMotivo("");
    setAcao("recusar");
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Recusar a sugestão ou remover o item?</DialogTitle>
          <DialogDescription>
            {item} · sugerido: {fornecedor}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Ação">
            {(["recusar", "remover"] as const).map((a) => (
              <button
                key={a}
                role="radio"
                aria-checked={acao === a}
                onClick={() => { setAcao(a); setMotivo(""); }}
                className={cn(
                  "rounded-lg border-2 p-3 text-left",
                  acao === a ? "border-[#325AA4] bg-[#F4F7FC]" : "border-cinza-200 hover:border-cinza-300"
                )}
              >
                <p className="text-[14px] font-semibold text-cinza-700">{a === "recusar" ? "Recusar sugestão" : "Remover item"}</p>
                <p className="text-[12px] text-cinza-500 mt-0.5">
                  {a === "recusar"
                    ? `A próxima otimização tira este fornecedor. Tentativa ${tentativas + 1} de ${MAX_TENTATIVAS}.`
                    : "O item sai do otimizador e é comprado por fora."}
                </p>
              </button>
            ))}
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-cinza-500 mb-2">
              {acao === "recusar" ? "Motivo da recusa" : "Justificativa (obrigatória)"}
            </p>
            <div className="flex flex-wrap gap-2">
              {opcoes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMotivo(m)}
                  aria-pressed={motivo === m}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-[13px]",
                    motivo === m ? "border-[#325AA4] bg-[#325AA4] text-white" : "border-cinza-300 text-cinza-700 hover:bg-cinza-50"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {acao === "recusar" && tentativas + 1 >= MAX_TENTATIVAS && (
            <p className="text-[12px] text-status-error-text">
              É a {MAX_TENTATIVAS}ª recusa deste item: ele sai do otimizador e passa a ser definido manualmente por Compras.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>Cancelar</Button>
          <Button onClick={confirmar} disabled={!motivo} className="bg-[#325AA4] hover:bg-[#2A4C8C]">
            {acao === "recusar" ? "Recusar" : "Remover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogoRecusa;
