import { useQuery } from "@tanstack/react-query";
import { biProcedimentoProvider } from "@opme/services/biProcedimentoProvider";

export const BI_PROCEDIMENTO_QUERY_KEY = (pacienteId: string) => [
  "bi-procedimento",
  pacienteId,
];

/**
 * Hook para buscar dados de BI do Procedimento
 * Com cache de 5 minutos
 */
export function useBIProcedimento(pacienteId: string) {
  return useQuery({
    queryKey: BI_PROCEDIMENTO_QUERY_KEY(pacienteId),
    queryFn: () => biProcedimentoProvider.getBIProcedimento(pacienteId),
    enabled: !!pacienteId,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos antes de garbage collection
  });
}
