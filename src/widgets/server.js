import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const outDir = path.join(__dirname, 'out');

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// Dynamic route handler for /:widget and /widgets/:widget
app.get(['/:widget', '/widgets/:widget', '/:widget/', '/widgets/:widget/'], (req, res, next) => {
  const rawWidget = req.params.widget;
  const widgetName = Array.isArray(rawWidget) ? rawWidget[0] : rawWidget;
  if (!widgetName) return next();

  const file1 = path.join(outDir, widgetName, 'index.html');
  const file2 = path.join(outDir, `${widgetName}.html`);

  if (fs.existsSync(file1)) {
    res.setHeader('Content-Type', 'text/html');
    return res.sendFile(file1);
  }
  if (fs.existsSync(file2)) {
    res.setHeader('Content-Type', 'text/html');
    return res.sendFile(file2);
  }
  next();
});

// Serve static assets
app.use('/widgets', express.static(outDir));
app.use(express.static(outDir));

// Fallback for root
app.get('/', (req, res) => {
  res.send('<h3>WhatsApp NitroStack Widgets Dev Server (Port 3001)</h3>');
});

const server = app.listen(PORT, () => {
  console.log(`✨ Widget Dev Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`ℹ️ Port ${PORT} is already in use; reusing existing widget server.`);
  } else {
    console.error('Widget dev server error:', err.message);
  }
});

