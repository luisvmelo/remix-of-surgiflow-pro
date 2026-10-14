import { ShieldX } from "lucide-react";
import { cn } from "@opme/lib/utils";

interface ChipHomologacaoProps {
  operadora?: string;
  /** Quantidade de itens, quando o chip resume um pedido inteiro */
  quantidade?: number;
  className?: string;
}

/** Indica fornecedor não homologado pela operadora (o item não é liberado e vira glosa certa) */
const ChipHomologacao = ({ operadora, quantidade, className }: ChipHomologacaoProps) => (
  <span
    title={`Fornecedor não homologado${operadora ? ` pela ${operadora}` : " pela operadora"}: o item não é liberado e vira glosa certa`}
    className={cn(
      "inline-flex items-center gap-1 px-1.5 py-px rounded border border-red-200 bg-red-50 text-[10px] font-bold text-red-700 whitespace-nowrap",
      className
    )}
  >
    <ShieldX className="w-3 h-3" />
    {quantidade && quantidade > 1 ? `${quantidade} não homologados` : "Não homologado"}
  </span>
);

export default ChipHomologacao;
