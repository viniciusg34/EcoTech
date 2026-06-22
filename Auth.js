"use strict";
 
/* ════════════════════════════════════════════════════════════
   AUTH.JS — Sistema de Cadastro e Login com localStorage
   EcoTech
 
   Chaves usadas no localStorage:
   - "usuariosEcoTech"   -> array de contas de PESSOA FÍSICA
   - "empresasEcoTech"   -> array de contas de EMPRESA
   - "sessaoEcoTech"      -> dados da sessão logada (sessionStorage)
════════════════════════════════════════════════════════════ */
 
const DB_USUARIOS = "usuariosEcoTech";
const DB_EMPRESAS = "empresasEcoTech";
const SESSION_KEY = "ecotech_session"; // sincronizado com eco-session.js
 
/* ── Hash simples (não é criptografia forte, mas evita senha
   100% em texto puro no localStorage. Suficiente para o
   propósito deste site). ── */
function hashSenha(senha) {
  let hash = 0;
  const texto = "ecoTechSalt_" + senha;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return "h" + Math.abs(hash).toString(36) + texto.length;
}
 
/* ── Garante que as 2 contas de segurança (pessoa física e
   empresa) sempre existam, mesmo que o localStorage tenha sido
   limpo ou esteja indisponível. Roda automaticamente ao carregar
   este arquivo em qualquer página. ── */
function seedContasPadrao() {
  try {
    let usuarios = JSON.parse(localStorage.getItem(DB_USUARIOS) || "[]");
    const emailPadrao = "teste@ecotech.com";
    if (!usuarios.some((u) => u.email === emailPadrao)) {
      usuarios.push({
        nome: "Usuário Teste",
        email: emailPadrao,
        cpf: "000.000.000-00",
        nomeMae: "Maria Teste",
        nascimento: "2000-01-01",
        senha: hashSenha("Teste123"),
        criadoEm: new Date().toISOString(),
        conta: "padrao",
      });
      localStorage.setItem(DB_USUARIOS, JSON.stringify(usuarios));
    }
 
    let empresas = JSON.parse(localStorage.getItem(DB_EMPRESAS) || "[]");
    const emailEmpresaPadrao = "empresa@ecotech.com";
    if (!empresas.some((e) => e.email === emailEmpresaPadrao)) {
      empresas.push({
        cnpj: "00.000.000/0001-00",
        nomeEmpresa: "Empresa Teste",
        endereco: "Rua Exemplo, 123, Centro, Rio de Janeiro, RJ",
        razaoSocial: "Empresa Teste LTDA",
        email: emailEmpresaPadrao,
        senha: hashSenha("Empresa123"),
        criadoEm: new Date().toISOString(),
        conta: "padrao",
      });
      localStorage.setItem(DB_EMPRESAS, JSON.stringify(empresas));
    }
  } catch (e) {
    console.error("Não foi possível preparar as contas padrão:", e);
  }
}
 
seedContasPadrao();
 
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
 