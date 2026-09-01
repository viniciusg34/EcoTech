"use strict";
 
/* ════════════════════════════════════════════════════════════
   AUTH.JS — compatibilidade para páginas antigas.
   Os usuários e empresas agora são gerenciados pelo backend
   MySQL, então este módulo não cria contas locais nem sementes
   automáticas em localStorage.
════════════════════════════════════════════════════════════ */
 
const DB_USUARIOS = "usuariosEcoTech";
const DB_EMPRESAS = "empresasEcoTech";
const SESSION_KEY = "ecotech_session";
 
function hashSenha(senha) {
  let hash = 0;
  const texto = "ecoTechSalt_" + senha;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return "h" + Math.abs(hash).toString(36) + texto.length;
}
 
function seedContasPadrao() {
  // compatibilidade: não cria dados locais em ambiente de produção.
}
 
/* ── Funções de PESSOA FÍSICA ── */
function getUsuarios() {
  try {
    return JSON.parse(localStorage.getItem(DB_USUARIOS) || "[]");
  } catch (e) {
    return [];
  }
}
 
function salvarUsuarios(lista) {
  localStorage.setItem(DB_USUARIOS, JSON.stringify(lista));
}
 
function emailUsuarioExiste(email) {
  return getUsuarios().some((u) => u.email === email.toLowerCase());
}
 
function cadastrarUsuario(dados) {
  const usuarios = getUsuarios();
  usuarios.push({
    ...dados,
    senha: hashSenha(dados.senha),
    criadoEm: new Date().toISOString(),
  });
  salvarUsuarios(usuarios);
}
 
function autenticarUsuario(email, senha) {
  const usuarios = getUsuarios();
  const encontrado = usuarios.find(
    (u) => u.email === email.toLowerCase() && u.senha === hashSenha(senha),
  );
  return encontrado || null;
}
 
/* ── Funções de EMPRESA ── */
function getEmpresas() {
  try {
    return JSON.parse(localStorage.getItem(DB_EMPRESAS) || "[]");
  } catch (e) {
    return [];
  }
}
 
function salvarEmpresas(lista) {
  localStorage.setItem(DB_EMPRESAS, JSON.stringify(lista));
}
 
function emailEmpresaExiste(email) {
  return getEmpresas().some((e) => e.email === email.toLowerCase());
}
 
function cadastrarEmpresa(dados) {
  const empresas = getEmpresas();
  empresas.push({
    ...dados,
    senha: hashSenha(dados.senha),
    criadoEm: new Date().toISOString(),
  });
  salvarEmpresas(empresas);
}
 
function autenticarEmpresa(email, senha) {
  const empresas = getEmpresas();
  const encontrada = empresas.find(
    (e) => e.email === email.toLowerCase() && e.senha === hashSenha(senha),
  );
  return encontrada || null;
}
 
/* ── Sessão ── */
function criarSessao(tipo, dadosPublicos) {
  // Garante que o campo "nome" existe (eco-session.js usa sessao.nome)
  const payload = { tipo, ...dadosPublicos, logadoEm: new Date().toISOString() };
  if (!payload.nome && payload.nomeEmpresa) payload.nome = payload.nomeEmpresa;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}
 
function getSessao() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch (e) {
    return null;
  }
}
 
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
