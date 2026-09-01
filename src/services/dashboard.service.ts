import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nitrostack/core';
import { createApiServer } from '../api/server.js';
import { whatsappEngine } from '../whatsapp/client.js';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';

@Injectable()
export class DashboardService implements OnApplicationBootstrap, OnApplicationShutdown {
  private server: http.Server | null = null;
  private widgetServer: http.Server | null = null;

  async onApplicationBootstrap() {
    const defaultPort = process.env.RAILWAY_ENVIRONMENT
      ? (Number(process.env.PORT) || 8080)
      : (Number(process.env.DASHBOARD_PORT) || 3000);
    const expressApp = createApiServer();

    const tryListen = (port: number, attemptsLeft: number) => {
      if (attemptsLeft <= 0) {
        console.error('⚠️ Could not bind Express dashboard port; running in headless MCP mode.');
        return;
      }

      const srv = http.createServer(expressApp);

      srv.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          const nextPort = (port >= 3000 && port <= 3002) ? 3010 : port + 1;
          tryListen(nextPort, attemptsLeft - 1);
        } else {
          console.error('Express server error:', err.message);
        }
      });

      srv.once('listening', () => {
        this.server = srv;
        const addr = srv.address();
        const actualPort = typeof addr === 'object' && addr ? addr.port : port;
        console.error('\n┌────────────────────────────────────────────────────────────┐');
        console.error('│  🚀 WHATSAPP MCP SERVER IS RUNNING & ACTIVE                │');
        console.error('├────────────────────────────────────────────────────────────┤');
        console.error(`│  🌐 Command Center Dashboard : http://localhost:${actualPort.toString().padEnd(19)}│`);
        console.error(`│  📲 Scan WhatsApp QR Code    : http://localhost:${actualPort}/qr${' '.repeat(Math.max(0, 16 - actualPort.toString().length))}│`);
        console.error(`│  📡 Real-Time SSE Stream     : http://localhost:${actualPort}/api/stream${' '.repeat(Math.max(0, 8 - actualPort.toString().length))}│`);
        console.error(`│  📊 Health Check Telemetry   : http://localhost:${actualPort}/healthz${' '.repeat(Math.max(0, 11 - actualPort.toString().length))}│`);
        console.error('├────────────────────────────────────────────────────────────┤');
        console.error('│  💡 Server is running actively in the background.          │');
        console.error('│     Open the dashboard link in your browser to interact.   │');
        console.error('│     Press (Ctrl + C) anytime to stop the server.           │');
        console.error('└────────────────────────────────────────────────────────────┘\n');
      });

      srv.listen(port);
    };

    tryListen(defaultPort, 15);

    // Ensure Widget Server is running on port 3001 for NitroStudio
    try {
      const widgetOutDir = path.join(process.cwd(), 'src/widgets/out');
      const widgetApp = express();

      widgetApp.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        next();
      });

      widgetApp.get(['/:widget', '/widgets/:widget', '/:widget/', '/widgets/:widget/'], (req, res, next) => {
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

      widgetApp.use('/widgets', express.static(widgetOutDir));
      widgetApp.use(express.static(widgetOutDir));

      const wSrv = http.createServer(widgetApp);
      wSrv.once('error', () => {
        // Port 3001 already in use by NitroStudio, which is fine
      });
      wSrv.once('listening', () => {
        this.widgetServer = wSrv;
        console.error('✨ NitroStudio Widget Server active on http://localhost:3001');
      });
      wSrv.listen(3001);
    } catch (e: any) {
      console.error('Note: widget server setup:', e.message);
    }

    // Initialize WhatsApp Engine in background
    if (process.env.DISABLE_WA_INIT !== 'true') {
      whatsappEngine.initializeClient(true).catch((err) => {
        console.error('WhatsApp Engine background note:', err.message);
      });
    }
  }

  async onApplicationShutdown() {
    if (this.server) {
      this.server.close();
    }
    if (this.widgetServer) {
      this.widgetServer.close();
    }
  }
}
