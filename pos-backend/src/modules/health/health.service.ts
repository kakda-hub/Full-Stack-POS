import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  private readonly startTime: number;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.startTime = Date.now();
  }

  async check() {
    const details: Record<string, any> = {};
    let overallStatus: 'ok' | 'degraded' | 'error' = 'ok';

    // ── Database check ──────────────────────────────────────────────────────
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1 AS ping');
      const latency = Date.now() - start;

      details.database = {
        status: 'connected',
        latency: `${latency}ms`,
        isConnected: this.dataSource.isInitialized,
      };
    } catch (err: any) {
      details.database = {
        status: 'disconnected',
        error: err.message,
        isConnected: false,
      };
      overallStatus = 'error';
    }

    // ── Uptime ──────────────────────────────────────────────────────────────
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    details.uptime = {
      seconds: uptimeSeconds,
      human: this.formatUptime(uptimeSeconds),
    };

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      ...details,
    };
  }

  private formatUptime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  }
}
