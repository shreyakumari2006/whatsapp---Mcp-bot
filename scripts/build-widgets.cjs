const fs = require('fs');
const path = require('path');

const widgets = [
  {
    route: 'send-message',
    title: 'Message Dispatcher & Approval',
    renderScript: `
      const data = window.__NITRO_DATA__ || { status: "sent", id: "msg_out_12345", message: "Message dispatched." };
      const isPending = data.status === "pending_approval";
      const isSent = data.status === "sent";
      
      document.getElementById("root").innerHTML = \`
        <div class="card">
          <div class="header">
            <div class="icon \${isPending ? "icon-pending" : "icon-sent"}">
              \${isPending ? "⏳" : isSent ? "✅" : "💬"}
            </div>
            <div>
              <div class="title">\${isPending ? "Staged in Approval Queue" : isSent ? "Message Dispatched Successfully" : "Message Processed"}</div>
              <div class="subtitle">\${data.message || "WhatsApp message operation completed."}</div>
            </div>
          </div>
          <div class="meta-box">
            <div class="row">
              <span class="label">Tracking ID:</span>
              <span class="code">\${data.id || "N/A"}</span>
            </div>
            <div class="row">
              <span class="label">Status:</span>
              <span class="badge \${isPending ? "badge-pending" : "badge-sent"}">\${data.status || "PROCESSED"}</span>
            </div>
            \${data.recipient ? \`<div class="row"><span class="label">Recipient:</span><span class="code">\${data.recipient}</span></div>\` : ""}
          </div>
          \${isPending ? \`
            <div class="notice">
              <span style="font-size:16px;">⚠️</span>
              <span>This message is staged for safety. You can approve or reject it anytime in the <a href="http://localhost:3000" target="_blank">Web Dashboard</a>.</span>
            </div>
          \` : ""}
        </div>
      \`;
    `
  },
  {
    route: 'urgent-messages',
    title: 'Urgency Triage Radar',
    renderScript: `
      const data = window.__NITRO_DATA__ || { totalCount: 0, messages: [] };
      const list = data.messages || [];
      
      document.getElementById("root").innerHTML = \`
        <div class="card">
          <div class="header">
            <div class="icon" style="background:#fee2e2;color:#dc2626;">🚨</div>
            <div>
              <div class="title">Urgency Triage Radar</div>
              <div class="subtitle">\${list.length} high-priority communications detected</div>
            </div>
          </div>
          <div class="list">
            \${list.length === 0 ? \`<div class="empty">✨ Inbox is calm. No high-priority alerts in the time window.</div>\` : list.map(m => \`
              <div class="alert-item \${m.priority === "CRITICAL" ? "crit-border" : "urg-border"}">
                <div class="alert-top">
                  <span class="sender-name">👤 \${m.senderName || m.from}</span>
                  <span class="badge \${m.priority === "CRITICAL" ? "badge-crit" : "badge-urg"}">\${m.priority} (Score: \${m.urgencyScore || 0})</span>
                </div>
                <div class="alert-body">\${m.body}</div>
                \${m.matchedKeywords && m.matchedKeywords.length ? \`
                  <div class="tag-row">
                    \${m.matchedKeywords.map(k => \`<span class="tag">#\${k}</span>\`).join("")}
                  </div>
                \` : ""}
              </div>
            \`).join("")}
          </div>
        </div>
      \`;
    `
  },
  {
    route: 'recent-chats',
    title: 'WhatsApp Inbox Feed',
    renderScript: `
      const data = window.__NITRO_DATA__ || { totalChats: 0, chats: [] };
      const chats = data.chats || [];
      
      document.getElementById("root").innerHTML = \`
        <div class="card">
          <div class="header">
            <div class="icon" style="background:#e0e7ff;color:#4f46e5;">💬</div>
            <div>
              <div class="title">WhatsApp Inbox Feed</div>
              <div class="subtitle">\${chats.length} active conversations</div>
            </div>
          </div>
          <div class="list">
            \${chats.map(c => \`
              <div class="chat-row">
                <div class="chat-left">
                  <div class="avatar \${c.isVIP ? "vip-avatar" : ""}">\${c.isVIP ? "👑" : c.isGroup ? "👥" : "👤"}</div>
                  <div>
                    <div class="chat-name">\${c.name || c.id} \${c.isVIP ? \`<span class="vip-pill">\${c.vipTier || "VIP"}</span>\` : ""}</div>
                    <div class="chat-snippet">\${c.lastMessage || "No messages"}</div>
                  </div>
                </div>
                <span class="badge badge-normal">\${c.priority || "NORMAL"}</span>
              </div>
            \`).join("")}
          </div>
        </div>
      \`;
    `
  },
  {
    route: 'chat-history',
    title: 'Conversation Timeline',
    renderScript: `
      const data = window.__NITRO_DATA__ || { count: 0, history: [] };
      const msgs = data.history || [];
      
      document.getElementById("root").innerHTML = \`
        <div class="card">
          <div class="header">
            <div class="icon" style="background:#e0f2fe;color:#0284c7;">📜</div>
            <div>
              <div class="title">Conversation Timeline</div>
              <div class="subtitle">Chat ID: \${data.chatId || "Selected Contact"}</div>
            </div>
          </div>
          <div class="msg-box">
            \${msgs.length === 0 ? \`<div class="empty">No historical messages found for this chat.</div>\` : msgs.map(m => {
              const isMe = m.from === "me";
              return \`
                <div class="bubble-wrap \${isMe ? "bubble-right" : "bubble-left"}">
                  <div class="bubble \${isMe ? "bubble-me" : "bubble-them"}">
                    \${!isMe ? \`<div class="bubble-author">\${m.senderName || m.from}</div>\` : ""}
                    <div class="bubble-text">\${m.body}</div>
                  </div>
                </div>
              \`;
            }).join("")}
          </div>
        </div>
      \`;
    `
  },
  {
    route: 'search-contacts',
    title: 'Contact & VIP Directory',
    renderScript: `
      const data = window.__NITRO_DATA__ || { count: 0, contacts: [] };
      const list = data.contacts || [];
      
      document.getElementById("root").innerHTML = \`
        <div class="card">
          <div class="header">
            <div class="icon" style="background:#dcfce7;color:#16a34a;">🔍</div>
            <div>
              <div class="title">Contact & VIP Directory</div>
              <div class="subtitle">\${list.length} matching results found</div>
            </div>
          </div>
          <div class="list">
            \${list.length === 0 ? \`<div class="empty">No contacts matched your search query.</div>\` : list.map(c => \`
              <div class="contact-row">
                <div class="chat-left">
                  <div class="avatar \${c.isVIP ? "vip-avatar" : ""}">\${c.isVIP ? "👑" : "👤"}</div>
                  <div>
                    <div class="chat-name">\${c.name} \${c.isVIP ? \`<span class="vip-pill">\${c.vipTier || "VIP"}</span>\` : ""}</div>
                    <div class="chat-snippet">📞 \${c.phone || c.id}</div>
                  </div>
                </div>
                \${c.isVIP ? \`<span class="badge badge-sent">Protected</span>\` : ""}
              </div>
            \`).join("")}
          </div>
        </div>
      \`;
    `
  },
  {
    route: 'schedule-message',
    title: 'Scheduled Dispatch Manager',
    renderScript: `
      const data = window.__NITRO_DATA__ || {};
      
      document.getElementById("root").innerHTML = \`
        <div class="card">
          <div class="header">
            <div class="icon" style="background:#e0e7ff;color:#4f46e5;">⏰</div>
            <div>
              <div class="title">Message Scheduled</div>
              <div class="subtitle">Queued for automated dispatch by WhatsApp Engine</div>
            </div>
          </div>
          <div class="meta-box">
            <div class="row"><span class="label">Recipient:</span><span class="code">\${data.recipientName || data.recipient}</span></div>
            <div class="row"><span class="label">Scheduled At:</span><span style="font-weight:600;color:#2563eb;">\${data.sendAt ? new Date(data.sendAt).toLocaleString() : "Pending"}</span></div>
            <div class="row"><span class="label">Tracking ID:</span><span class="code">\${data.id || "N/A"}</span></div>
            <div class="row"><span class="label">Message:</span><span style="font-style:italic;">"\${data.message || ""}"</span></div>
          </div>
        </div>
      \`;
    `
  },
  {
    route: 'configure-auto-reply',
    title: 'Auto-Reply Rule Builder',
    renderScript: `
      const data = window.__NITRO_DATA__ || {};
      const r = data.rule || {};
      
      document.getElementById("root").innerHTML = \`
        <div class="card">
          <div class="header">
            <div class="icon" style="background:#dcfce7;color:#16a34a;">⚡</div>
            <div>
              <div class="title">Auto-Reply Rule Configured</div>
              <div class="subtitle">Rule active in automation rules engine</div>
            </div>
          </div>
          <div class="meta-box">
            <div class="row"><span class="label">Rule Name:</span><span style="font-weight:700;">\${r.name || r.id}</span></div>
            <div class="row"><span class="label">Trigger Mode:</span><span class="code">\${r.triggerType}(\\"\${r.triggerPattern}\\")</span></div>
            <div class="row"><span class="label">Cooldown:</span><span style="font-weight:600;">\${r.cooldownMinutes || 60} minutes per sender</span></div>
            <div class="row"><span class="label">Status:</span><span class="badge \${r.enabled !== false ? "badge-sent" : "badge-crit"}">\${r.enabled !== false ? "ACTIVE" : "PAUSED"}</span></div>
            <div style="margin-top:4px;padding:10px;background:#f1f5f9;border-radius:8px;font-size:13px;">
              <span style="color:#64748b;font-weight:600;display:block;margin-bottom:2px;">Auto-Reply Text:</span>
              <span style="font-style:italic;color:#0f172a;">"\${r.replyMessage || ""}"</span>
            </div>
          </div>
        </div>
      \`;
    `
  },
  {
    route: 'active-auto-replies',
    title: 'Automation Rules Console',
    renderScript: `
      const data = window.__NITRO_DATA__ || { count: 0, rules: [] };
      const rules = data.rules || [];
      
      document.getElementById("root").innerHTML = \`
        <div class="card">
          <div class="header">
            <div class="icon" style="background:#dcfce7;color:#16a34a;">🤖</div>
            <div>
              <div class="title">Active Auto-Reply Rules</div>
              <div class="subtitle">\${rules.length} configured rules in memory</div>
            </div>
          </div>
          <div class="list">
            \${rules.map(r => \`
              <div class="chat-row">
                <div>
                  <div class="chat-name">\${r.name}</div>
                  <div class="chat-snippet">Trigger: <code>\${r.triggerType}(\\"\${r.triggerPattern}\\")</code> • Cooldown: \${r.cooldownMinutes || 60}m • Matches: \${r.matchCount || 0}</div>
                  <div style="font-size:12px;font-style:italic;margin-top:4px;color:#334155;">"\${r.replyMessage}"</div>
                </div>
                <span class="badge \${r.enabled ? "badge-sent" : "badge-crit"}">\${r.enabled ? "ACTIVE" : "PAUSED"}</span>
              </div>
            \`).join("")}
          </div>
        </div>
      \`;
    `
  },
  {
    route: 'toggle-responder',
    title: 'Rule State Switcher',
    renderScript: `
      const data = window.__NITRO_DATA__ || {};
      const isEnabled = data.enabled === true;
      
      document.getElementById("root").innerHTML = \`
        <div class="card">
          <div class="header">
            <div class="icon \${isEnabled ? "icon-sent" : "icon-crit"}">\${isEnabled ? "▶️" : "⏸️"}</div>
            <div>
              <div class="title">Rule \${isEnabled ? "Activated" : "Paused"}</div>
              <div class="subtitle">Rule ID: \${data.ruleId || "N/A"}</div>
            </div>
          </div>
          <div class="meta-box">
            <div class="row">
              <span class="label">New Status:</span>
              <span class="badge \${isEnabled ? "badge-sent" : "badge-crit"}">\${isEnabled ? "ACTIVE / RUNNING" : "PAUSED / DISABLED"}</span>
            </div>
          </div>
        </div>
      \`;
    `
  }
];

// Pure Light-Mode Design System
const lightCss = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff !important;
    color: #0f172a !important;
    padding: 16px;
  }
  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  }
  .header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .icon-pending { background: #fef3c7; color: #d97706; }
  .icon-sent { background: #dcfce7; color: #16a34a; }
  .icon-crit { background: #fee2e2; color: #dc2626; }
  .title { font-size: 17px; font-weight: 700; color: #0f172a; }
  .subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
  .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #1e293b; }
  .row { display: flex; justify-content: space-between; align-items: center; }
  .label { color: #64748b; font-weight: 500; }
  .code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-weight: 600; color: #0f172a; }
  .badge { padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge-pending { background: #fef3c7; color: #92400e; }
  .badge-sent { background: #dcfce7; color: #15803d; }
  .badge-crit { background: #fee2e2; color: #991b1b; }
  .badge-urg { background: #fef3c7; color: #92400e; }
  .badge-normal { background: #f1f5f9; color: #334155; }
  .notice { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding: 12px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; font-size: 13px; color: #92400e; line-height: 1.4; }
  .notice a { color: #2563eb; font-weight: 600; text-decoration: underline; }
  .list { display: flex; flex-direction: column; gap: 10px; }
  .chat-row, .contact-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
  .chat-left { display: flex; align-items: center; gap: 12px; }
  .avatar { width: 38px; height: 38px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .vip-avatar { background: #fef3c7; }
  .chat-name { font-size: 14px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px; }
  .chat-snippet { font-size: 12px; color: #64748b; margin-top: 2px; }
  .vip-pill { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #fef3c7; color: #92400e; font-weight: 800; }
  .alert-item { padding: 14px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
  .crit-border { border-left: 4px solid #ef4444; }
  .urg-border { border-left: 4px solid #f59e0b; }
  .alert-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .sender-name { font-weight: 700; font-size: 14px; color: #0f172a; }
  .alert-body { font-size: 13px; line-height: 1.45; color: #334155; margin: 4px 0 8px; }
  .tag-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .tag { font-size: 11px; padding: 2px 8px; border-radius: 6px; background: #e2e8f0; color: #334155; font-weight: 600; }
  .msg-box { display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto; padding: 4px; }
  .bubble-wrap { display: flex; width: 100%; }
  .bubble-left { justify-content: flex-start; }
  .bubble-right { justify-content: flex-end; }
  .bubble { max-width: 80%; padding: 10px 14px; border-radius: 16px; font-size: 13px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .bubble-them { background: #f1f5f9; border: 1px solid #e2e8f0; color: #0f172a; border-bottom-left-radius: 4px; }
  .bubble-me { background: #2563eb; color: #ffffff; border-bottom-right-radius: 4px; }
  .bubble-author { font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 2px; }
  .empty { padding: 32px; text-align: center; color: #64748b; font-size: 13px; font-style: italic; }
`;

for (const w of widgets) {
  const dir = path.join(process.cwd(), 'src/widgets/out', w.route);
  fs.mkdirSync(dir, { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${w.title}</title>
  <style>${lightCss}</style>
</head>
<body class="light">
  <div id="root"></div>
  <script>
    function parseData() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');
        if (dataParam) {
          window.__NITRO_DATA__ = JSON.parse(decodeURIComponent(dataParam));
        }
      } catch (e) {}

      // Check OpenAI/MCP embedded output
      if (window.openai && window.openai.toolOutput) {
        window.__NITRO_DATA__ = window.openai.toolOutput;
      }
    }

    window.addEventListener("message", (event) => {
      if (event.data) {
        if (event.data.type === "NITRO_DATA" || event.data.payload) {
          window.__NITRO_DATA__ = event.data.payload || event.data;
          render();
        } else if (typeof event.data === "object" && !event.data.type) {
          window.__NITRO_DATA__ = event.data;
          render();
        }
      }
    });

    parseData();

    function render() {
      ${w.renderScript}
    }

    render();
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(process.cwd(), 'src/widgets/out', `${w.route}.html`), html, 'utf8');
  console.log('Generated Light-Mode widget HTML:', w.route);
}
