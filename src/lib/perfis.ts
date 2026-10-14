export type Perfil = "gestao" | "consultor" | "medico" | "secretaria" | "compras" | "gerente_compras";

export const PERFIS: { id: Perfil; label: string; descricao: string }[] = [
  { id: "gestao", label: "Gestão", descricao: "Diretoria e consultoria do hospital" },
  { id: "consultor", label: "Consultor", descricao: "Carteira de hospitais e benchmark" },
  { id: "medico", label: "Médico", descricao: "Monta e valida pedidos" },
  { id: "secretaria", label: "Secretária", descricao: "Monta pedidos para o médico" },
  { id: "compras", label: "Compras", descricao: "Revisa pedidos e otimiza a compra" },
  { id: "gerente_compras", label: "Gerente de compras", descricao: "Acompanha a equipe de compras" },
];

const ROTA_INICIAL: Record<Perfil, string> = {
  gestao: "/hospital",
  consultor: "/consultor",
  medico: "/medico",
  secretaria: "/home",
  compras: "/revisao",
  gerente_compras: "/acompanhamento",
};

export const rotaInicial = (perfil: Perfil): string => ROTA_INICIAL[perfil];
