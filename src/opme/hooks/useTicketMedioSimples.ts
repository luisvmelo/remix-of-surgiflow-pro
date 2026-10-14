import { useState, useEffect } from 'react';
import { apiFetch } from '@opme/lib/api';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8082';

interface TicketMedioResponse {
  ticket_medio_geral: number;
  ticket_medio_operadora: number;
}

interface UseTicketMedioSimplesParams {
  cdCirurgia: number | undefined;
  cdConvenio: number | undefined;
  meses: number | null;
  enabled?: boolean;
}

export function useTicketMedioSimples({
  cdCirurgia,
  cdConvenio,
  meses,
  enabled = true,
}: UseTicketMedioSimplesParams) {
  const [data, setData] = useState<TicketMedioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !cdCirurgia) {
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          CD_CIRURGIA: cdCirurgia.toString(),
        });

        if (cdConvenio) {
          params.set('CD_CONVENIO', cdConvenio.toString());
        }

        if (meses) {
          params.set('meses', meses.toString());
        }

        const response = await apiFetch(
          `${baseUrl}/get_ticket_medio_simples?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar ticket médio: HTTP ${response.status}`);
        }

        const result: TicketMedioResponse = await response.json();
        setData(result);
      } catch (err) {
        console.error('Erro ao buscar ticket médio:', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cdCirurgia, cdConvenio, meses, enabled]);

  return { data, isLoading, error };
}
