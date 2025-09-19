#!/usr/bin/env node

/**
 * Gitea MCP Server v2.0 - Entry Point
 * 
 * Este arquivo é o ponto de entrada principal do servidor MCP Gitea.
 * Ele inicializa o servidor e gerencia o ciclo de vida da aplicação.
 * 
 * USO:
 * - Execute via: node dist/index.js
 * - Ou via NPX: npx @andrebuzeli/gitea-mcp-v2
 * 
 * CONFIGURAÇÃO:
 * - Configure as variáveis de ambiente necessárias
 * - GITEA_URL, GITEA_TOKEN são obrigatórias
 * - Ou use DEMO_MODE=true para testes
 * 
 * RECOMENDAÇÕES:
 * - Use DEBUG=true para desenvolvimento
 * - Configure timeout adequado para sua rede
 * - Mantenha o token de acesso seguro
 */

// Carregar variáveis de ambiente do arquivo .env
import * as dotenv from 'dotenv';
// Redirecionar output do dotenv para evitar interferência com MCP
const originalConsoleLog = console.log;
console.log = () => {};
dotenv.config();
console.log = originalConsoleLog;

import { GiteaMCPServer } from './server';

/**
 * Função principal que inicializa o servidor MCP
 * 
 * FLUXO:
 * 1. Cria instância do servidor
 * 2. Inicializa conexões
 * 3. Gerencia erros de inicialização
 * 
 * TRATAMENTO DE ERROS:
 * - Erros de configuração: exit(1)
 * - Erros de conexão: exit(1)
 * - Erros fatais: exit(1)
 */
async function main() {
  try {
    const server = new GiteaMCPServer();
    await server.run();
  } catch (error) {
    // console.error('Failed to start Gitea MCP Server:', error);
    process.exit(1);
  }
}

// Inicializa o servidor e gerencia erros fatais
// Esta é a última linha de defesa para erros não tratados
main().catch((error) => {
  // console.error('Fatal error:', error);
  process.exit(1);
});
