export type UserRole = 'admin' | 'gestor_opme' | 'auditoria' | 'medico' | 'user';

export interface UserPermissions {
  canViewBI: boolean;
  canEditItems: boolean;
  canViewAllPatients: boolean;
  canExportData: boolean;
}

export const getRolePermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'admin':
      return {
        canViewBI: true,
        canEditItems: true,
        canViewAllPatients: true,
        canExportData: true,
      };
    case 'gestor_opme':
      return {
        canViewBI: true,
        canEditItems: true,
        canViewAllPatients: true,
        canExportData: true,
      };
    case 'auditoria':
      return {
        canViewBI: true,
        canEditItems: false,
        canViewAllPatients: true,
        canExportData: true,
      };
    case 'medico':
      return {
        canViewBI: false,
        canEditItems: true,
        canViewAllPatients: false,
        canExportData: false,
      };
    case 'user':
    default:
      return {
        canViewBI: false,
        canEditItems: false,
        canViewAllPatients: false,
        canExportData: false,
      };
  }
};

/**
 * Hook simulado para obter role do usuário
 * TODO: Integrar com Supabase auth e user_roles table
 */
export const useUserRole = (): UserRole => {
  // Simulação temporária - retorna 'admin' para desenvolvimento
  // Em produção, deve buscar da tabela user_roles via auth.uid()
  return 'admin';
};
