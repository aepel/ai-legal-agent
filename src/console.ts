import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleController } from './console/console.controller';

async function bootstrapConsole() {
  console.log('🚀 Starting Lawer.AI Console Interface...');
  
  try {
    // Create a minimal NestJS application for console
    const app = await NestFactory.createApplicationContext(
      AppModule,
      { logger: ['error', 'warn'] }
    );

    // Get the console controller and start the interface
    const consoleController = app.get(ConsoleController);
    await consoleController.startConsole();
  } catch (error) {
    console.error('❌ Failed to start console interface:', error.message);
    process.exit(1);
  }
}

// Run the console if this file is executed directly
if (require.main === module) {
  bootstrapConsole();
}

export { bootstrapConsole }; 