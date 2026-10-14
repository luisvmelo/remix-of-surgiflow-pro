import { useEffect, useState } from "react";
import { apiFetch } from "@opme/lib/api";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8082";

interface TempoMedioAutorizacaoProps {
  cdCirurgia: number;
  cdConvenio: number;
}

const TempoMedioAutorizacao = ({ cdCirurgia, cdConvenio }: TempoMedioAutorizacaoProps) => {
  const [tempoMedio, setTempoMedio] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTempoMedio = async () => {
      setIsLoading(true);
      try {
        const response = await apiFetch(
          `${baseUrl}/get_glosa?CD_CIRURGIA=${cdCirurgia}&CD_CONVENIO=${cdConvenio}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const tempo = data.tempo_medio_previsto_de_aprovacao;
          if (tempo && tempo > 0) {
            setTempoMedio(tempo);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar tempo médio de autorização:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (cdCirurgia && cdConvenio) {
      fetchTempoMedio();
    }
  }, [cdCirurgia, cdConvenio]);

  if (isLoading) {
    return <p className="text-paragraph font-normal text-neutral-600">Carregando...</p>;
  }

  if (tempoMedio === null) {
    return <p className="text-paragraph font-normal text-neutral-600">N/A</p>;
  }

  // Converter dias corridos para dias úteis (aproximação: 5 dias úteis em 7 dias corridos)
  const diasUteis = (tempoMedio * 5) / 7;

  return (
    <p className="text-paragraph font-normal text-neutral-600">
      {diasUteis.toFixed(1)} dias úteis
    </p>
  );
};

export default TempoMedioAutorizacao;
