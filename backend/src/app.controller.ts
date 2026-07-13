import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Health-check route: GET /api returns a plain string to confirm the API is up.
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
