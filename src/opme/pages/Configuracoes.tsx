import { useState } from "react";
import { Building2, Plus, RotateCcw, X } from "lucide-react";
import Sidebar from "@opme/components/Sidebar";
import Topbar from "@opme/components/Topbar";
import { Button } from "@opme/components/ui/button";
import { Input } from "@opme/components/ui/input";
import { Switch } from "@opme/components/ui/switch";
import { useConfig } from "@opme/contexts/ConfigContext";
import { useHospital } from "@opme/contexts/HospitalContext";
import { ConfigProduto } from "@opme/types/produto";

const OPCOES: Array<{ chave: keyof Pick<ConfigProduto, "equivalenciaTecnica" | "rankingFornecedorMedico" | "estatisticasMedico">; titulo: string; descricao: string }> = [
  {
    chave: "equivalenciaTecnica",
    titulo: "Mostrar itens por equivalência técnica",
    descricao: "Inclui nas alternativas fora da indicação do médico os itens equivalentes com registro ANVISA, além de outros fornecedores do mesmo item.",
  },
  {
    chave: "rankingFornecedorMedico",
    titulo: "Ranking de fornecedores por médico",
    descricao: "Mostra, na análise da cirurgia, os fornecedores mais usados pelo médico e a cobertura de cada um.",
  },
  {
    chave: "estatisticasMedico",
    titulo: "Estatísticas por médico",
    descricao: "Mostra a ocorrência de glosa e o custo médio histórico do médico responsável.",
  },
];

const Configuracoes = () => {
  const { config, atualizarConfig, restaurarPadrao } = useConfig();
  const { nomeAtual, isRede, hospital } = useHospital();
  const [novoConvenio, setNovoConvenio] = useState("");

  const adicionarConvenio = () => {
    const valor = novoConvenio.trim();
    if (!valor || config.conveniosExcluidos.some((c) => c.toUpperCase() === valor.toUpperCase())) return;
    atualizarConfig({ conveniosExcluidos: [...config.conveniosExcluidos, valor] });
    setNovoConvenio("");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col w-full">
        <Topbar />

        <main className="flex-1 p-6">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-[28px] leading-9 font-bold text-cinza-700">Configurações</h1>
              <p className="text-[14px] text-cinza-500 mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {isRede ? `Visão consolidada da ${nomeAtual}` : `Valem só para o ${hospital?.nome} · integração ${hospital?.erp}`}
              </p>
            </div>

            <section className="bg-surface rounded-lg shadow-elevation-1 divide-y divide-cinza-200">
              <div className="p-5">
                <h2 className="section-title">Análise e sugestões</h2>
                <p className="text-[13px] text-cinza-500 mt-1">Cada hospital liga ou desliga o que aparece para a sua equipe.</p>
              </div>
              {OPCOES.map((opcao) => (
                <div key={opcao.chave} className="p-5 flex items-start justify-between gap-6">
                  <div>
                    <label htmlFor={opcao.chave} className="text-[15px] font-semibold text-cinza-700 cursor-pointer">
                      {opcao.titulo}
                    </label>
                    <p className="text-[13px] text-cinza-500 mt-1 max-w-xl">{opcao.descricao}</p>
                  </div>
                  <Switch
                    id={opcao.chave}
                    checked={config[opcao.chave]}
                    onCheckedChange={(checked) => atualizarConfig({ [opcao.chave]: checked })}
                  />
                </div>
              ))}
            </section>

            <section className="bg-surface rounded-lg shadow-elevation-1 p-5 space-y-4">
              <div>
                <h2 className="section-title">Convênios fora da análise</h2>
                <p className="text-[13px] text-cinza-500 mt-1">
                  Cirurgias destes convênios não aparecem nas listas nem nos BIs. Os dados continuam na base.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.conveniosExcluidos.length === 0 && (
                  <p className="text-[13px] text-cinza-500 italic">Nenhum convênio excluído.</p>
                )}
                {config.conveniosExcluidos.map((convenio) => (
                  <span key={convenio} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-md bg-cinza-100 border border-cinza-200 text-[13px] font-semibold text-cinza-700">
                    {convenio}
                    <button
                      onClick={() => atualizarConfig({ conveniosExcluidos: config.conveniosExcluidos.filter((c) => c !== convenio) })}
                      className="p-0.5 rounded hover:bg-cinza-200"
                      aria-label={`Remover ${convenio}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <Input
                  id="novo-convenio"
                  placeholder="Nome ou parte do nome do convênio"
                  value={novoConvenio}
                  onChange={(e) => setNovoConvenio(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && adicionarConvenio()}
                />
                <Button variant="outline" onClick={adicionarConvenio}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </section>

            <Button variant="ghost" onClick={restaurarPadrao} className="text-cinza-500">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar padrão
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Configuracoes;
