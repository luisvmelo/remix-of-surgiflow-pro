import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataProvider } from "@opme/services/dataProvider";
import { Patient } from "@opme/types/patient";
import { useAuth } from "@opme/contexts/AuthContext";

export const PATIENTS_QUERY_KEY = ["patients"];

export function usePatients() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: PATIENTS_QUERY_KEY,
    queryFn: () => dataProvider.getPacientes(),
    staleTime: 0, // Sempre considera os dados como stale para forçar refetch
    gcTime: 0, // Não mantém cache (no React Query v5, "cacheTime" virou "gcTime")
    refetchOnMount: true, // Sempre refaz a busca ao montar
    refetchOnWindowFocus: true, // Refaz ao focar na janela
    refetchInterval: 600000, // Refetch a cada 10 minutos
    enabled: isAuthenticated, // Só executa se o usuário estiver autenticado
  });
}

export function usePatient(id: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => dataProvider.getPacienteById(id),
    enabled: !!id && isAuthenticated, // Só executa se tiver ID e estiver autenticado
  });
}

// Hook for subscribing to real-time updates (ready for Supabase)
export function usePatientsSubscription() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["patients-subscription"],
    queryFn: async () => {
      const unsubscribe = dataProvider.subscribeToPacientes((patients) => {
        queryClient.setQueryData(PATIENTS_QUERY_KEY, patients);
      });
      return unsubscribe;
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: isAuthenticated, // Só executa se estiver autenticado
  });
}
