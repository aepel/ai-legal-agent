import { Module } from '@nestjs/common';
import { LegalWritingController } from './legal-writing.controller';
import { GenerateLegalDocumentUseCase } from '@/application/use-cases/legal-writing.use-case';
import { LegalWritingRepository } from '@/infrastructure/repositories/legal-writing.repository';
import { LegalWritingService } from '@/infrastructure/services/legal-writing.service';
import { LEGAL_WRITING_REPOSITORY } from '@/domain/repositories/legal-writing.repository.interface';
import { LEGAL_WRITING_SERVICE } from '@/domain/services/legal-writing.service.interface';
import { AIService } from '@/infrastructure/services/ai.service';

@Module({
  controllers: [LegalWritingController],
  providers: [
    GenerateLegalDocumentUseCase,
    AIService,
    {
      provide: LEGAL_WRITING_REPOSITORY,
      useClass: LegalWritingRepository,
    },
    {
      provide: LEGAL_WRITING_SERVICE,
      useClass: LegalWritingService,
    },
  ],
  exports: [LEGAL_WRITING_REPOSITORY, LEGAL_WRITING_SERVICE],
})
export class LegalWritingModule {} 