#!/usr/bin/env node
"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Carregar variáveis de ambiente do arquivo .env
const dotenv = __importStar(require("dotenv"));
// Redirecionar output do dotenv para evitar interferência com MCP
const originalConsoleLog = console.log;
console.log = () => { };
dotenv.config();
console.log = originalConsoleLog;
const server_1 = require("./server");
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
        const server = new server_1.GiteaMCPServer();
        await server.run();
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map