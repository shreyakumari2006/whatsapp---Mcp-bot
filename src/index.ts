#!/usr/bin/env node
import 'dotenv/config';

// Dual-mode Transport Configuration:
// 1. Cloud (Railway/Render): STDIO mode for MCP, public PORT for Express web dashboard
// 2. Local/NitroStudio: Streamable HTTP on port 3002 for NitroStudio, port 3000 for Express dashboard
if (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER) {
  process.env.MCP_TRANSPORT_TYPE = 'stdio';
} else {
  // Local environment for NitroStudio
  process.env.MCP_TRANSPORT_TYPE = 'http';
  if (!process.env.PORT) {
    process.env.PORT = '3002';
  }
}

// Process Resilience: Catch transient Puppeteer/Chromium navigation resets
process.on('uncaughtException', (err: any) => {
  const msg = err?.message || String(err);
  if (
    msg.includes('Execution context was destroyed') ||
    msg.includes('Protocol error') ||
    msg.includes('Target closed') ||
    msg.includes('Session closed')
  ) {
    console.error('⚠️ Transient Puppeteer/Chromium warning (recovered):', msg);
    return;
  }
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason: any) => {
  const msg = reason?.message || String(reason);
  if (
    msg.includes('Execution context was destroyed') ||
    msg.includes('Protocol error') ||
    msg.includes('Target closed') ||
    msg.includes('Session closed')
  ) {
    console.error('⚠️ Transient Puppeteer/Chromium rejection (recovered):', msg);
    return;
  }
  console.error('❌ Unhandled Rejection:', reason);
});

import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';

/**
 * Bootstrap WhatsApp MCP Application for NitroStack & NitroStudio
 */
async function bootstrap() {
  const server = await McpApplicationFactory.create(AppModule);
  await server.start();
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start WhatsApp MCP server:', error);
  process.exit(1);
});
