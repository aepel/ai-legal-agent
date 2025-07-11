import { Module } from '@nestjs/common';
import { LegalQueryController } from './legal-query.controller';
import { ProcessLegalQueryUseCase } from '@/application/use-cases/legal-query.use-case';
import { LegalQueryRepository } from '@/infrastructure/repositories/legal-query.repository';
import { LegalQueryService } from '@/infrastructure/services/legal-query.service';
import { LEGAL_QUERY_REPOSITORY } from '@/domain/repositories/legal-query.repository.interface';
import { LEGAL_QUERY_SERVICE } from '@/domain/services/legal-query.service.interface';
import { AIService } from '@/infrastructure/services/ai.service';

@Module({
  controllers: [LegalQueryController],
  providers: [
    ProcessLegalQueryUseCase,
    AIService,
    {
      provide: LEGAL_QUERY_REPOSITORY,
      useClass: LegalQueryRepository,
    },
    {
      provide: LEGAL_QUERY_SERVICE,
      useClass: LegalQueryService,
    },
  ],
  exports: [LEGAL_QUERY_REPOSITORY, LEGAL_QUERY_SERVICE],
})
export class LegalQueryModule {} 