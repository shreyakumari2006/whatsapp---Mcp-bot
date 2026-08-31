import axios from 'axios';
import { eventBus, MessageReceivedEvent, StatusChangeEvent } from '../bus.js';

export interface WebhookConfig {
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
  genericWebhookUrl?: string;
  enabled: boolean;
  alertOnDisconnect: boolean;
  alertOnCriticalMessage: boolean;
}

export class WebhookAlertService {
  private config: WebhookConfig = {
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
    genericWebhookUrl: process.env.ALERT_WEBHOOK_URL || '',
    enabled: true,
    alertOnDisconnect: true,
    alertOnCriticalMessage: true
  };

  private lastDisconnectAlertTime = 0;
  private alertCooldownMs = 60000; // 1 minute debounce between repeated disconnect alerts

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    // 1. WhatsApp Disconnect / Session Drop Alert
    eventBus.on('status_change', async (event: StatusChangeEvent) => {
      if (!this.config.enabled || !this.config.alertOnDisconnect) return;
      if (event.status === 'DISCONNECTED') {
        const now = Date.now();
        if (now - this.lastDisconnectAlertTime < this.alertCooldownMs) return;
        this.lastDisconnectAlertTime = now;

        await this.dispatchAlert({
          title: '🚨 WhatsApp Session Disconnected',
          description: `The WhatsApp client connection has dropped. Message: "${event.message || 'Session unlinked or network disconnected'}". Action required: Scan QR code at dashboard to re-authenticate.`,
          severity: 'critical',
          fields: [
            { name: 'Status', value: event.status, inline: true },
            { name: 'Timestamp', value: new Date(event.timestamp).toISOString(), inline: true },
            { name: 'Action', value: 'Open http://localhost:3000 to scan QR code', inline: false }
          ]
        });
      }
    });

    // 2. CRITICAL Message Arrival Alert
    eventBus.on('message_received', async (event: MessageReceivedEvent) => {
      if (!this.config.enabled || !this.config.alertOnCriticalMessage) return;
      if (event.priority === 'CRITICAL') {
        await this.dispatchAlert({
          title: '🔥 CRITICAL WhatsApp Alert Received',
          description: `A message triaged as **CRITICAL** has arrived from **${event.senderName}** (${event.from}).`,
          severity: 'critical',
          fields: [
            { name: 'Sender', value: `${event.senderName} (${event.from})`, inline: true },
            { name: 'Urgency Score', value: `${event.urgencyScore || 10}/10`, inline: true },
            { name: 'Matched Flags', value: event.matchedKeywords?.join(', ') || 'OTP/Infrastructure Outage', inline: true },
            { name: 'Message Content', value: event.body.length > 200 ? event.body.substring(0, 197) + '...' : event.body, inline: false },
            { name: 'Dashboard', value: 'http://localhost:3000', inline: true }
          ]
        });
      }
    });
  }

  public getConfig(): WebhookConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<WebhookConfig>): WebhookConfig {
    this.config = { ...this.config, ...newConfig };
    return this.getConfig();
  }

  public async dispatchAlert(payload: {
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }): Promise<{ success: boolean; dispatchedTo: string[]; errors: string[] }> {
    const dispatchedTo: string[] = [];
    const errors: string[] = [];

    // Slack Notification
    if (this.config.slackWebhookUrl) {
      try {
        await axios.post(this.config.slackWebhookUrl, {
          text: `${payload.title}\n${payload.description}`,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: payload.title }
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: payload.description }
            },
            ...(payload.fields && payload.fields.length > 0 ? [{
              type: 'section',
              fields: payload.fields.map(f => ({
                type: 'mrkdwn',
                text: `*${f.name}:*\n${f.value}`
              }))
            }] : [])
          ]
        }, { timeout: 5000 });
        dispatchedTo.push('Slack');
      } catch (err: any) {
        errors.push(`Slack Webhook Error: ${err.message}`);
      }
    }

    // Discord Notification
    if (this.config.discordWebhookUrl) {
      try {
        await axios.post(this.config.discordWebhookUrl, {
          embeds: [
            {
              title: payload.title,
              description: payload.description,
              color: payload.severity === 'critical' ? 0xe11d48 : payload.severity === 'warning' ? 0xf59e0b : 0x10b981,
              fields: payload.fields?.map(f => ({
                name: f.name,
                value: f.value,
                inline: f.inline ?? true
              })),
              timestamp: new Date().toISOString()
            }
          ]
        }, { timeout: 5000 });
        dispatchedTo.push('Discord');
      } catch (err: any) {
        errors.push(`Discord Webhook Error: ${err.message}`);
      }
    }

    // Generic Webhook
    if (this.config.genericWebhookUrl) {
      try {
        await axios.post(this.config.genericWebhookUrl, {
          event: 'whatsapp_alert',
          timestamp: Date.now(),
          payload
        }, { timeout: 5000 });
        dispatchedTo.push('GenericWebhook');
      } catch (err: any) {
        errors.push(`Generic Webhook Error: ${err.message}`);
      }
    }

    return {
      success: dispatchedTo.length > 0,
      dispatchedTo,
      errors
    };
  }

  public async sendTestAlert(): Promise<{ success: boolean; dispatchedTo: string[]; errors: string[] }> {
    return await this.dispatchAlert({
      title: '🧪 WhatsApp Monitoring Test Alert',
      description: 'This is a test notification confirming your webhook integration with WhatsApp MCP Server is working correctly.',
      severity: 'info',
      fields: [
        { name: 'Status', value: 'Active', inline: true },
        { name: 'Environment', value: process.env.NODE_ENV || 'development', inline: true },
        { name: 'Endpoint', value: 'http://localhost:3000/healthz', inline: true }
      ]
    });
  }
}

export const webhookAlertService = new WebhookAlertService();
