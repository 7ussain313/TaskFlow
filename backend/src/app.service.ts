import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Returns the fixed greeting used by the health-check endpoint.
  getHello(): string {
    return 'Hello World!';
  }
}
