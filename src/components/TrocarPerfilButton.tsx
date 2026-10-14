import { useLocation, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useSurgical } from "@/contexts/SurgicalContext";

/** Botão fixo no canto inferior esquerdo: sai do perfil atual e volta para a escolha de perfis. */
const TrocarPerfilButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setPerfil, setLoggedIn } = useSurgical();

  if (pathname === "/") return null;

  // As telas de pedido do médico têm uma barra de ações fixa no rodapé: o botão fica acima dela
  const acimaDaBarra = pathname.startsWith("/medico/pedido");

  const sair = () => {
    setPerfil(null);
    setLoggedIn(false);
    navigate("/");
  };

  return (
    <button
      type="button"
      onClick={sair}
      aria-label="Trocar perfil"
      title="Trocar perfil"
      className={`fixed ${acimaDaBarra ? "bottom-32" : "bottom-3"} left-3 z-[60] flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-md backdrop-blur transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      <Users className="h-4 w-4" />
    </button>
  );
};

export default TrocarPerfilButton;
