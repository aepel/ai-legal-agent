import { Injectable, Inject } from '@nestjs/common';
import { LegalDocument, DocumentType } from '@/domain/entities/legal-document.entity';
import { LEGAL_DOCUMENT_REPOSITORY, ILegalDocumentRepository } from '@/domain/repositories/legal-document.repository.interface';
import { DOCUMENT_INDEXING_SERVICE, IDocumentIndexingService } from '@/domain/services/document-indexing.service.interface';

export interface IndexDocumentRequest {
  filePath: string;
  documentType: DocumentType;
  title?: string;
  tags?: string[];
}

export interface IndexDocumentResponse {
  document: LegalDocument;
  success: boolean;
  message: string;
}

@Injectable()
export class IndexDocumentUseCase {
  constructor(
    @Inject(LEGAL_DOCUMENT_REPOSITORY)
    private readonly documentRepository: ILegalDocumentRepository,
    @Inject(DOCUMENT_INDEXING_SERVICE)
    private readonly indexingService: IDocumentIndexingService,
  ) {}

  async execute(request: IndexDocumentRequest): Promise<IndexDocumentResponse> {
    try {
      // Index the document using the domain service
      const indexedDocument = await this.indexingService.indexDocument(
        request.filePath,
        request.documentType,
      );

      // Save to repository
      const savedDocument = await this.documentRepository.save(indexedDocument);

      return {
        document: savedDocument,
        success: true,
        message: `Document "${savedDocument.title}" indexed successfully`,
      };
    } catch (error) {
      return {
        document: null,
        success: false,
        message: `Failed to index document: ${error.message}`,
      };
    }
  }

  async executeBatch(requests: IndexDocumentRequest[]): Promise<IndexDocumentResponse[]> {
    const results: IndexDocumentResponse[] = [];

    for (const request of requests) {
      const result = await this.execute(request);
      results.push(result);
    }

    return results;
  }
} 