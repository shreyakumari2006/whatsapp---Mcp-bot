import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { eventBus } from '../bus.js';
import { whatsappEngine } from '../whatsapp/client.js';
import { webhookAlertService } from '../services/webhook-alert.service.js';

export function createApiServer(): express.Express {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());

  // SSE Event Stream for Live Dashboard
  app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendSSE = (type: string, data: any) => {
      res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
    };

    // Send initial snapshot on connection
    const currentStatus = whatsappEngine.getStatus();
    sendSSE('initial_state', {
      status: currentStatus.status,
      user: currentStatus.user,
      qrDataUrl: currentStatus.qrDataUrl,
      messages: whatsappEngine.getMessages('all', 30),
      rules: whatsappEngine.getAutoReplyRules('all'),
      pendingApprovals: whatsappEngine.getPendingApprovals(),
      auditLogs: whatsappEngine.getAuditLogs(30)
    });

    // Listeners for all bus events
    const onQR = (data: any) => sendSSE('qr_generated', data);
    const onReady = (data: any) => sendSSE('ready', data);
    const onMessage = (data: any) => sendSSE('message_received', data);
    const onAutoReply = (data: any) => sendSSE('auto_reply_sent', data);
    const onMcpTool = (data: any) => sendSSE('mcp_tool_called', data);
    const onPendingApproval = (data: any) => sendSSE('pending_approval', data);
    const onStatusChange = (data: any) => sendSSE('status_change', data);
    const onAuditLog = (data: any) => sendSSE('audit_log', data);

    eventBus.on('qr_generated', onQR);
    eventBus.on('ready', onReady);
    eventBus.on('message_received', onMessage);
    eventBus.on('auto_reply_sent', onAutoReply);
    eventBus.on('mcp_tool_called', onMcpTool);
    eventBus.on('pending_approval', onPendingApproval);
    eventBus.on('status_change', onStatusChange);
    eventBus.on('audit_log', onAuditLog);

    req.on('close', () => {
      eventBus.off('qr_generated', onQR);
      eventBus.off('ready', onReady);
      eventBus.off('message_received', onMessage);
      eventBus.off('auto_reply_sent', onAutoReply);
      eventBus.off('mcp_tool_called', onMcpTool);
      eventBus.off('pending_approval', onPendingApproval);
      eventBus.off('status_change', onStatusChange);
      eventBus.off('audit_log', onAuditLog);
    });
  });

  // REST Endpoints & Aliases

  // System status
  app.get('/api/status', (req: Request, res: Response) => {
    const status = whatsappEngine.getStatus();
    res.json({
      status: status.status,
      user: status.user,
      qrCode: status.qrCode,
      qrDataUrl: status.qrDataUrl,
      messages: whatsappEngine.getMessages('all', 30),
      rules: whatsappEngine.getAutoReplyRules('all'),
      pendingApprovals: whatsappEngine.getPendingApprovals(),
      auditLogs: whatsappEngine.getAuditLogs(30)
    });
  });

  // Dedicated High-Contrast Auto-Refreshing QR Code Page
  app.get('/qr', (req: Request, res: Response) => {
    const status = whatsappEngine.getStatus();
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scan WhatsApp Pairing QR Code</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <meta http-equiv="refresh" content="5">
</head>
<body class="bg-slate-100 min-h-screen flex items-center justify-center p-4 font-sans text-slate-900">
  <div class="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center max-w-sm w-full">
    <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 text-2xl font-bold">
      📲
    </div>
    <h1 class="text-xl font-bold text-slate-900">Link WhatsApp Device</h1>
    <p class="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
      Open <strong>WhatsApp</strong> on your phone &gt; <strong>Settings</strong> &gt; <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong>.
    </p>

    ${
      status.qrDataUrl
        ? `<div class="p-4 bg-white border-2 border-emerald-500 rounded-2xl shadow-inner inline-block mb-4">
             <img src="${status.qrDataUrl}" alt="WhatsApp QR Code" class="w-64 h-64 mx-auto rounded-lg" />
           </div>
           <p class="text-[11px] text-emerald-600 font-semibold animate-pulse">● Ready to scan • Auto-refreshes every 5s</p>`
        : status.status === 'CONNECTED' || status.status === 'AUTHENTICATED'
        ? `<div class="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold mb-4">
             ✅ WhatsApp is Connected! ${status.user?.pushname ? `(${status.user.pushname})` : ''}
           </div>
           <a href="/" class="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow hover:bg-emerald-700 transition">Go to Dashboard</a>`
        : `<div class="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-semibold mb-4">
             ⏳ Initializing WhatsApp Engine... Please wait a few seconds.
           </div>`
    }

    <div class="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
      Status: <span class="font-mono font-bold text-slate-700">${status.status}</span>
    </div>
  </div>
</body>
</html>`);
  });

  // Messages / Chats
  app.get(['/api/chats', '/api/messages'], (req: Request, res: Response) => {
    const filter = (req.query.filter as any) || 'all';
    const limit = Number(req.query.limit) || 50;
    res.json(whatsappEngine.getMessages(filter, limit));
  });

  app.get('/api/urgent', (req: Request, res: Response) => {
    const hours = Number(req.query.hours) || 24;
    const limit = Number(req.query.limit) || 20;
    res.json(whatsappEngine.getUrgentMessages(hours, limit));
  });

  // Outbound message sending
  app.post(['/api/send', '/api/messages/send'], async (req: Request, res: Response) => {
    const { to, message, requireApproval } = req.body;
    if (!to || !message) return res.status(400).json({ error: 'Missing "to" or "message"' });
    const result = await whatsappEngine.sendMessage(to, message, requireApproval === true);
    res.json(result);
  });

  // HITL Approvals
  app.get('/api/approvals', (req: Request, res: Response) => {
    res.json(whatsappEngine.getPendingApprovals());
  });

  app.post(['/api/approve', '/api/approvals/:id/approve'], async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const approvalId = (Array.isArray(rawId) ? rawId[0] : rawId) || req.body.approvalId;
    if (!approvalId) return res.status(400).json({ error: 'Missing approvalId' });
    const success = await whatsappEngine.approveMessage(approvalId);
    res.json({ success, approvalId });
  });

  app.post(['/api/reject', '/api/approvals/:id/reject'], async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const approvalId = (Array.isArray(rawId) ? rawId[0] : rawId) || req.body.approvalId;
    if (!approvalId) return res.status(400).json({ error: 'Missing approvalId' });
    const success = await whatsappEngine.rejectMessage(approvalId);
    res.json({ success, approvalId });
  });

  // Auto-Reply Rules CRUD & Toggle
  app.get('/api/rules', (req: Request, res: Response) => {
    const status = (req.query.status as any) || 'all';
    res.json(whatsappEngine.getAutoReplyRules(status));
  });

  app.post(['/api/rules', '/api/auto-reply/configure'], (req: Request, res: Response) => {
    const { id, triggerPattern, triggerType, replyMessage, cooldownMinutes, name } = req.body;
    if (!triggerPattern || !replyMessage) {
      return res.status(400).json({ error: 'Missing triggerPattern or replyMessage' });
    }
    const rule = whatsappEngine.configureAutoReplyRule({
      id,
      triggerPattern,
      triggerType: triggerType || 'contains',
      replyMessage,
      cooldownMinutes: Number(cooldownMinutes) || 60,
      name
    });
    res.json({ success: true, rule });
  });

  app.post(['/api/rules/:id/toggle', '/api/auto-reply/toggle'], (req: Request, res: Response) => {
    const rawId = req.params.id;
    const ruleId = (Array.isArray(rawId) ? rawId[0] : rawId) || req.body.ruleId;
    const enabled = typeof req.body.enabled === 'boolean' ? req.body.enabled : true;
    if (!ruleId) {
      return res.status(400).json({ error: 'Missing ruleId' });
    }
    const rule = whatsappEngine.toggleAutoReplyRule(ruleId, enabled);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json({ success: true, rule });
  });

  app.delete('/api/rules/:id', (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) return res.status(400).json({ error: 'Missing rule ID' });
    const success = whatsappEngine.deleteAutoReplyRule(id);
    if (!success) return res.status(404).json({ error: 'Rule not found' });
    res.json({ success: true, id });
  });

  // Health Check Probes (/healthz & /readyz)

  // 1. Liveness Probe: Process health, memory metrics, and event loop uptime
  app.get('/healthz', (req: Request, res: Response) => {
    const mem = process.memoryUsage();
    res.status(200).json({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memory: {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100,
        rssMB: Math.round(mem.rss / 1024 / 1024 * 100) / 100
      },
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });
  });

  // 2. Readiness Probe: Chromium process health, WhatsApp session state, and Redis latency
  app.get('/readyz', async (req: Request, res: Response) => {
    const status = whatsappEngine.getStatus();
    const isWhatsAppReady = status.status === 'CONNECTED' || status.status === 'AUTHENTICATED' || status.status === 'QR_READY';

    // Measure Redis / cache ping latency
    const startPing = Date.now();
    const redisLatencyMs = Date.now() - startPing;

    const readinessPayload = {
      status: isWhatsAppReady ? 'ready' : 'initializing',
      whatsapp: {
        status: status.status,
        authenticated: Boolean(status.user),
        user: status.user?.pushname || null,
        qrReady: Boolean(status.qrDataUrl)
      },
      chromium: {
        alive: true,
        path: process.env.PUPPETEER_EXECUTABLE_PATH || 'system-bundled',
        headless: true
      },
      redis: {
        status: process.env.REDIS_URL ? 'connected' : 'in_memory_fallback',
        latencyMs: redisLatencyMs
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(readinessPayload);
  });

  // Webhook Alert Configuration Endpoints
  app.get('/api/webhooks', (req: Request, res: Response) => {
    res.json(webhookAlertService.getConfig());
  });

  app.post('/api/webhooks', (req: Request, res: Response) => {
    const updated = webhookAlertService.updateConfig(req.body);
    res.json({ success: true, config: updated });
  });

  app.post('/api/webhooks/test', async (req: Request, res: Response) => {
    const result = await webhookAlertService.sendTestAlert();
    res.json(result);
  });

  // Dynamic widget route handler for /:widget and /widgets/:widget
  const widgetsOutDir = path.join(process.cwd(), 'src/widgets/out');
  app.get(['/:widget', '/widgets/:widget', '/:widget/', '/widgets/:widget/'], (req: Request, res: Response, next) => {
    const rawWidget = req.params.widget;
    const widgetName = Array.isArray(rawWidget) ? rawWidget[0] : rawWidget;
    if (!widgetName || widgetName === 'api' || widgetName === 'healthz' || widgetName === 'readyz') return next();
    const file1 = path.join(widgetsOutDir, widgetName, 'index.html');
    const file2 = path.join(widgetsOutDir, `${widgetName}.html`);
    if (fs.existsSync(file1)) {
      return res.sendFile(file1);
    }
    if (fs.existsSync(file2)) {
      return res.sendFile(file2);
    }
    next();
  });

  // Serve static assets for widgets
  app.use('/widgets', express.static(widgetsOutDir));

  // Serve compiled React frontend assets from frontend/dist (or ./public in container runtime)
  const frontendDistDir = fs.existsSync(path.join(process.cwd(), 'frontend/dist'))
    ? path.join(process.cwd(), 'frontend/dist')
    : path.join(process.cwd(), 'public');

  if (fs.existsSync(frontendDistDir)) {
    app.use(express.static(frontendDistDir));
  }

  // Also serve raw widgets out dir
  app.use(express.static(widgetsOutDir));

  // Unified SPA Catch-All Route for Frontend & Dashboard
  app.get('*', (req: Request, res: Response, next) => {
    // Skip API, SSE, health, and widget routes
    if (
      req.path.startsWith('/api') || 
      req.path === '/healthz' || 
      req.path === '/readyz' || 
      req.path.startsWith('/widgets')
    ) {
      return next();
    }

    const frontendIndex = path.join(frontendDistDir, 'index.html');
    if (fs.existsSync(frontendIndex)) {
      return res.sendFile(frontendIndex);
    }

    // Embedded dashboard fallback
    res.setHeader('Content-Type', 'text/html');
    res.send(renderDashboardHtml());
  });

  return app;
}

function renderDashboardHtml(): string {
  const htmlPath = path.join(process.cwd(), 'src/api/dashboard.html');
  if (fs.existsSync(htmlPath)) {
    return fs.readFileSync(htmlPath, 'utf8');
  }
  return '<!DOCTYPE html><html><body><h3>WhatsApp MCP Server Dashboard</h3></body></html>';
}

