import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSurgical } from "@/contexts/SurgicalContext";

/** Sai do wizard de volta à tela inicial, oferecendo salvar o que já foi preenchido. */
const WizardExitButton = () => {
  const { state, saveRequest, resetWizard } = useSurgical();
  const navigate = useNavigate();
  const home = state.isDoctorFlow ? "/medico" : "/home";
  const hasData = !!state.patient;

  const exit = (saveDraft: boolean) => {
    if (saveDraft) saveRequest("draft");
    resetWizard();
    navigate(home);
  };

  if (!hasData) {
    return (
      <Button variant="ghost" size="sm" onClick={() => exit(false)} className="gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Voltar ao início
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sair desta solicitação?</AlertDialogTitle>
          <AlertDialogDescription>
            Você pode guardar o que já foi preenchido como rascunho e continuar depois.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuar editando</AlertDialogCancel>
          <Button variant="outline" onClick={() => exit(false)}>Sair sem salvar</Button>
          <AlertDialogAction onClick={() => exit(true)}>Salvar rascunho e sair</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WizardExitButton;
