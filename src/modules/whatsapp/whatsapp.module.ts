import { Module } from '@nitrostack/core';
import { WhatsAppTools } from './whatsapp.tools.js';
import { WhatsAppResources } from './whatsapp.resources.js';
import { WhatsAppPrompts } from './whatsapp.prompts.js';

@Module({
  name: 'whatsapp',
  description: 'Production WhatsApp MCP Server with Urgency Triage and Auto-Responder Rules Engine',
  controllers: [WhatsAppTools, WhatsAppResources, WhatsAppPrompts],
  providers: []
})
export class WhatsAppModule {}
