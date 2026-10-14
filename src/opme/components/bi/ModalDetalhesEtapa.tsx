import { useState } from "react";
import { X, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { Button } from "@opme/components/ui/button";
import { biGeralProvider } from "@opme/services/biGeralProvider";

interface OperadoraDetalhes {
  nome: string;
  quantidade: number;
  valorTotal: number;
}

interface Procedimento {
  id: string;
  paciente: string;
  medico: string;
  especialidade: string;
  procedimento: string;
  valorEsperado: number;
  tempoNaEtapa: number | null;
}

interface ModalDetalhesEtapaProps {
  isOpen: boolean;
  onClose: () => void;
  etapaNome: string;
  operadoras: OperadoraDetalhes[];
  totalProcedimentos: number;
  totalValor: number;
}

export const ModalDetalhesEtapa = ({
  isOpen,
  onClose,
  etapaNome,
  operadoras,
  totalProcedimentos,
  totalValor,
}: ModalDetalhesEtapaProps) => {
  const [operadoraExpandida, setOperadoraExpandida] = useState<string | null>(null);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [carregandoProcedimentos, setCarregandoProcedimentos] = useState(false);

  if (!isOpen) return null;

  const handleToggleOperadora = async (nomeOperadora: string) => {
    if (operadoraExpandida === nomeOperadora) {
      // Fecha se já estava aberto
      setOperadoraExpandida(null);
      setProcedimentos([]);
    } else {
      // Abre e busca procedimentos
      setOperadoraExpandida(nomeOperadora);
      setCarregandoProcedimentos(true);

      const procs = await biGeralProvider.getProcedimentosPorEtapaEOperadora(
        etapaNome,
        nomeOperadora
      );
      setProcedimentos(procs);
      setCarregandoProcedimentos(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cinza-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-cinza-900">{etapaNome}</h2>
            <p className="text-sm text-cinza-500 mt-1">
              {totalProcedimentos} {totalProcedimentos === 1 ? 'procedimento' : 'procedimentos'} • R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          <h3 className="text-sm font-semibold text-cinza-700 uppercase tracking-wide mb-4">
            Distribuição por Operadora
          </h3>

          {operadoras.length > 0 ? (
            <div className="space-y-3">
              {operadoras.map((operadora, idx) => (
                <div key={idx} className="bg-surface rounded-lg border border-cinza-200">
                  {/* Header da Operadora - Clicável */}
                  <button
                    onClick={() => handleToggleOperadora(operadora.nome)}
                    className="w-full p-4 hover:bg-cinza-50 transition-colors rounded-lg text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {operadoraExpandida === operadora.nome ? (
                          <ChevronDown className="w-5 h-5 text-brand-azul" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-cinza-500" />
                        )}
                        <h4 className="text-base font-semibold text-cinza-900">
                          {operadora.nome}
                        </h4>
                      </div>
                      <span className="text-sm font-bold text-brand-azul">
                        {operadora.quantidade} {operadora.quantidade === 1 ? 'procedimento' : 'procedimentos'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between ml-7">
                      <span className="text-sm text-cinza-500">Valor Total</span>
                      <span className="text-sm font-semibold text-cinza-700">
                        R$ {operadora.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-3 ml-7">
                      <div className="w-full h-2 bg-cinza-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-azul rounded-full transition-all"
                          style={{
                            width: `${Math.round((operadora.quantidade / totalProcedimentos) * 100)}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-cinza-500 mt-1 text-right">
                        {Math.round((operadora.quantidade / totalProcedimentos) * 100)}% do total
                      </p>
                    </div>
                  </button>

                  {/* Lista de Procedimentos - Expansível */}
                  {operadoraExpandida === operadora.nome && (
                    <div className="border-t border-cinza-200 p-4 bg-cinza-50">
                      {carregandoProcedimentos ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-cinza-500">Carregando procedimentos...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {procedimentos.map((proc) => (
                            <div
                              key={proc.id}
                              className="w-full bg-white rounded-lg p-3 border border-cinza-200"
                            >
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <p className="text-cinza-500 mb-1">Paciente</p>
                                  <p className="font-semibold text-cinza-900">{proc.paciente}</p>
                                </div>
                                <div>
                                  <p className="text-cinza-500 mb-1">Médico</p>
                                  <p className="font-semibold text-cinza-900">{proc.medico}</p>
                                </div>
                                <div>
                                  <p className="text-cinza-500 mb-1">Especialidade</p>
                                  <p className="font-semibold text-cinza-900">{proc.especialidade}</p>
                                </div>
                                <div>
                                  <p className="text-cinza-500 mb-1">Procedimento</p>
                                  <p className="font-semibold text-cinza-900">{proc.procedimento}</p>
                                </div>
                                <div>
                                  <p className="text-cinza-500 mb-1">Valor Esperado</p>
                                  <p className="font-semibold text-brand-azul">
                                    R$ {proc.valorEsperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-cinza-500 mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Tempo na Etapa
                                  </p>
                                  <p className="font-semibold text-cinza-900">
                                    {proc.tempoNaEtapa !== null ? `${proc.tempoNaEtapa} dias` : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-cinza-500 text-sm">
                Nenhuma operadora encontrada para esta etapa
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cinza-200 bg-cinza-50">
          <Button
            onClick={onClose}
            className="w-full"
            variant="outline"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
