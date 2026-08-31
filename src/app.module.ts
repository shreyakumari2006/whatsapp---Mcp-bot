import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module.js';
import { SystemHealthCheck } from './health/system.health.js';
import { DashboardService } from './services/dashboard.service.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'whatsapp-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Production WhatsApp MCP Server with Urgency Triage & Auto-Responder Automation',
  imports: [
    ConfigModule.forRoot(),
    WhatsAppModule
  ],
  providers: [
    SystemHealthCheck,
    DashboardService
  ]
})
export class AppModule {}
