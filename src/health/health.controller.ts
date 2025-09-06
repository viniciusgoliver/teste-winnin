import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../infra/db/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'up' };
    } catch (e) {
      return { status: 'degraded', db: 'down', error: (e as Error).message };
    }
  }
}