import { Module } from '@nestjs/common';
import { ConsoleService } from './console.service';
import { ConsoleController } from './console.controller';
import { DocumentModule } from '@/interface/document/document.module';
import { LegalQueryModule } from '@/interface/legal-query/legal-query.module';
import { LegalWritingModule } from '@/interface/legal-writing/legal-writing.module';
import { IndexDocumentUseCase } from '@/application/use-cases/document-indexing.use-case';
import { ProcessLegalQueryUseCase } from '@/application/use-cases/legal-query.use-case';
import { GenerateLegalDocumentUseCase } from '@/application/use-cases/legal-writing.use-case';

@Module({
  imports: [DocumentModule, LegalQueryModule, LegalWritingModule],
  providers: [
    ConsoleService, 
    ConsoleController,
    IndexDocumentUseCase,
    ProcessLegalQueryUseCase,
    GenerateLegalDocumentUseCase,
  ],
  exports: [ConsoleService, ConsoleController],
})
export class ConsoleModule {} 