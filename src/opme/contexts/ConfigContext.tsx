import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CONFIG_PADRAO, chaveConfig, lerConfig } from "@opme/config/produto";
import { ConfigProduto } from "@opme/types/produto";
import { biGeralProvider } from "@opme/services/biGeralProvider";
import { useHospital } from "@opme/contexts/HospitalContext";

interface ConfigContextType {
  config: ConfigProduto;
  atualizarConfig: (parcial: Partial<ConfigProduto>) => void;
  restaurarPadrao: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { hospitalId } = useHospital();
  const [config, setConfig] = useState<ConfigProduto>(lerConfig);

  // Ao trocar de hospital, carrega a configuração dele
  useEffect(() => {
    setConfig(lerConfig());
  }, [hospitalId]);

  const salvar = (nova: ConfigProduto) => {
    try {
      localStorage.setItem(chaveConfig(), JSON.stringify(nova));
    } catch {
      // segue só em memória
    }
    // Convênios excluídos e equivalência técnica mudam os dados carregados
    const mudouDados =
      nova.conveniosExcluidos.join("|") !== config.conveniosExcluidos.join("|") ||
      nova.equivalenciaTecnica !== config.equivalenciaTecnica;
    setConfig(nova);
    if (mudouDados) {
      biGeralProvider.clearCache();
      queryClient.invalidateQueries();
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        atualizarConfig: (parcial) => salvar({ ...config, ...parcial }),
        restaurarPadrao: () => salvar(CONFIG_PADRAO),
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
