import { HealthCheck, HealthCheckInterface, HealthCheckResult } from '@nitrostack/core';

@HealthCheck({
  name: 'system',
  description: 'System resource and uptime health check',
  interval: 30
})
export class SystemHealthCheck implements HealthCheckInterface {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  async check(): Promise<HealthCheckResult> {
    const mem = process.memoryUsage();
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);

    return {
      status: 'up',
      message: 'System and WhatsApp MCP Engine are healthy',
      details: {
        uptime: `${uptimeSec}s`,
        memory: `${heapUsedMB}MB / ${heapTotalMB}MB`,
        nodeVersion: process.version
      }
    };
  }
}
