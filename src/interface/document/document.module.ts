import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { IndexDocumentUseCase } from '@/application/use-cases/document-indexing.use-case';
import { LegalDocumentRepository } from '@/infrastructure/repositories/legal-document.repository';
import { DocumentIndexingService } from '@/infrastructure/services/document-indexing.service';
import { LEGAL_DOCUMENT_REPOSITORY } from '@/domain/repositories/legal-document.repository.interface';
import { DOCUMENT_INDEXING_SERVICE } from '@/domain/services/document-indexing.service.interface';

@Module({
  controllers: [DocumentController],
  providers: [
    IndexDocumentUseCase,
    {
      provide: LEGAL_DOCUMENT_REPOSITORY,
      useClass: LegalDocumentRepository,
    },
    {
      provide: DOCUMENT_INDEXING_SERVICE,
      useClass: DocumentIndexingService,
    },
  ],
  exports: [LEGAL_DOCUMENT_REPOSITORY, DOCUMENT_INDEXING_SERVICE],
})
export class DocumentModule {} 