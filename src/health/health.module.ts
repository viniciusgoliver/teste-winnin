import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../infra/db/prisma.service';

@Module({
  controllers: [HealthController],
  providers: [PrismaService],
})
export class HealthModule {}