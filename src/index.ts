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
  if (!process.env.HOST) {
    process.env.HOST = '0.0.0.0';
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

import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';

/**
 * Bootstrap WhatsApp MCP Application for NitroStack & NitroStudio
 */
async function bootstrap() {
  const server = await McpApplicationFactory.create(AppModule);
  await server.start();

  // Attach widget routes to NitroStack HTTP transport (port 3002) for NitroStudio preview
  try {
    const httpApp = (server as any)._httpTransport?.app || (server as any)._httpTransport?.getApp?.();
    if (httpApp) {
      const widgetOutDir = path.join(process.cwd(), 'src/widgets/out');
      httpApp.use((req: any, res: any, next: any) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        next();
      });

      httpApp.get(['/:widget', '/widgets/:widget', '/:widget/', '/widgets/:widget/'], (req: any, res: any, next: any) => {
        const raw = req.params.widget;
        const w = Array.isArray(raw) ? raw[0] : raw;
        if (!w) return next();
        const f1 = path.join(widgetOutDir, w, 'index.html');
        const f2 = path.join(widgetOutDir, `${w}.html`);
        if (fs.existsSync(f1)) {
          res.setHeader('Content-Type', 'text/html');
          return res.sendFile(f1);
        }
        if (fs.existsSync(f2)) {
          res.setHeader('Content-Type', 'text/html');
          return res.sendFile(f2);
        }
        next();
      });

      httpApp.use('/widgets', express.static(widgetOutDir));
      httpApp.use(express.static(widgetOutDir));
      console.error('✔ Attached NitroStudio Widget routes to port 3002');
    }
  } catch (e: any) {
    console.error('Note attaching widget routes:', e.message);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start WhatsApp MCP server:', error);
  process.exit(1);
});
