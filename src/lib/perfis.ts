export type Perfil = "gestao" | "medico" | "secretaria" | "compras" | "gerente_compras";

export const PERFIS: { id: Perfil; label: string; descricao: string }[] = [
  { id: "gestao", label: "Gestão", descricao: "Diretoria e consultoria do hospital" },
  { id: "medico", label: "Médico", descricao: "Monta e valida pedidos" },
  { id: "secretaria", label: "Secretária", descricao: "Monta pedidos para o médico" },
  { id: "compras", label: "Compras", descricao: "Revisa pedidos e otimiza a compra" },
  { id: "gerente_compras", label: "Gerente de compras", descricao: "Acompanha a equipe de compras" },
];

const ROTA_INICIAL: Record<Perfil, string> = {
  gestao: "/hospital",
  medico: "/medico",
  secretaria: "/home",
  compras: "/dashboard",
  gerente_compras: "/acompanhamento",
};

export const rotaInicial = (perfil: Perfil): string => ROTA_INICIAL[perfil];
