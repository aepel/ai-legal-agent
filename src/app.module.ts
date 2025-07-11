import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './interface/document/document.module';
import { LegalQueryModule } from './interface/legal-query/legal-query.module';
import { LegalWritingModule } from './interface/legal-writing/legal-writing.module';
import { ConsoleModule } from './console/console.module';
import { AIService } from './infrastructure/services/ai.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DocumentModule,
    LegalQueryModule,
    LegalWritingModule,
    ConsoleModule,
  ],
  providers: [AIService],
})
export class AppModule {} 