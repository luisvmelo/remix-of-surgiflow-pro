import { useQuery } from "@tanstack/react-query";
import { biGeralProvider } from "@opme/services/biGeralProvider";
import { BIGeralData } from "@opme/types/biGeral";
import { useAuth } from "@opme/contexts/AuthContext";

export const BI_GERAL_QUERY_KEY = ["bi-geral"];

/**
 * Hook para buscar dados do BI Geral com atualização automática
 * Usa getBIGeralFresh() que NÃO interfere no cache compartilhado
 * Atualiza a cada 10 minutos automaticamente (igual aos cards de pacientes)
 */
export function useBIGeral() {
  const { isAuthenticated } = useAuth();

  return useQuery<BIGeralData>({
    queryKey: BI_GERAL_QUERY_KEY,
    queryFn: () => biGeralProvider.getBIGeralFresh(),
    staleTime: 0, // Sempre considera os dados como stale
    gcTime: 0, // Não mantém cache do React Query (antigo cacheTime)
    refetchOnMount: true, // Sempre refaz a busca ao montar
    refetchOnWindowFocus: true, // Refaz ao focar na janela
    refetchInterval: 600000, // Refetch a cada 10 minutos (600.000ms)
    enabled: isAuthenticated, // Só executa se o usuário estiver autenticado
  });
}
