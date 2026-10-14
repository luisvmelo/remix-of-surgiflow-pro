import { Patient, Especialidade } from "@opme/types/patient";

// ============================================================
// DADOS MOCK REMOVIDOS - Sistema usa dados reais do backend
// ============================================================

/**
 * @deprecated Array vazio - dados agora vêm do backend via API
 */
export const mockPatients: Patient[] = [];

// ============================================================
// FUNÇÕES UTILITÁRIAS (mantidas para compatibilidade)
// ============================================================

/**
 * @deprecated Função não utilizada - dados vêm do backend
 */
export const getPatientsBySpecialty = (specialty: Especialidade): Patient[] => {
  return mockPatients.filter((p) => p.especialidade === specialty);
};

/**
 * @deprecated Função não utilizada - use getUniqueSpecialties() com dados dinâmicos
 */
export const getAllSpecialties = (): Especialidade[] => {
  return [];
};

/**
 * Extrai especialidades únicas de um array de pacientes
 * Retorna array ordenado alfabeticamente
 */
export const getUniqueSpecialties = (patients: Patient[]): Especialidade[] => {
  const specialties = new Set<string>();

  patients.forEach((patient) => {
    if (patient.especialidade && patient.especialidade.trim() !== "") {
      specialties.add(patient.especialidade.trim());
    }
  });

  return Array.from(specialties).sort();
};
