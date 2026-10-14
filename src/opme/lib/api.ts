/**
 * Wrapper centralizado para requisições HTTP ao backend.
 * Adiciona automaticamente o token de autenticação, o hospital selecionado
 * e trata erros 401/403. Em modo mock, responde com a API fictícia local.
 */

import { HOSPITAL_STORAGE_KEY, IS_MOCK } from "@opme/config/produto";

/**
 * Função para buscar o token do localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem("access_token");
}

/**
 * Hospital selecionado (multi-hospital). "rede" = visão consolidada.
 */
function getHospitalId(): string | null {
  return localStorage.getItem(HOSPITAL_STORAGE_KEY);
}

/**
 * Função para deslogar o usuário em caso de erro de autenticação
 */
function handleAuthError() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("username");

  // Recarrega a página para que o React leia o estado de autenticação
  // e renderize a tela de login automaticamente via ProtectedRoute
  window.location.href = IS_MOCK ? "#/" : "/";
}

/**
 * Wrapper do fetch que adiciona automaticamente o header Authorization
 * e trata erros de autenticação (401/403)
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = getAuthToken();
  const hospitalId = getHospitalId();

  // Adiciona o header Authorization se o token existir
  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (hospitalId) {
    headers.set("X-Hospital-Id", hospitalId);
  }

  // Faz a requisição (API fictícia em modo mock)
  const response = IS_MOCK
    ? await (await import("@opme/mock/api")).mockFetch(input, { ...init, headers })
    : await fetch(input, { ...init, headers });

  // Se receber 401 ou 403, desloga o usuário
  if (response.status === 401 || response.status === 403) {
    handleAuthError();
    throw new Error("Sessão expirada. Redirecionando para login...");
  }

  return response;
}
