import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Opens the DB connection when Nest finishes wiring up this module.
  async onModuleInit() {
    await this.$connect();
  }

  // Closes the DB connection cleanly when the app shuts down.
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
