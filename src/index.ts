#!/usr/bin/env node
import 'dotenv/config';
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
