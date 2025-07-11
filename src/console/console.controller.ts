import { Injectable } from '@nestjs/common';
import { ConsoleService } from './console.service';

@Injectable()
export class ConsoleController {
  constructor(private readonly consoleService: ConsoleService) {}

  async startConsole(): Promise<void> {
    await this.consoleService.start();
  }
} 