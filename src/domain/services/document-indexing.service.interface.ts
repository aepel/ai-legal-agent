import { LegalDocument, DocumentType } from '../entities/legal-document.entity';

export interface IDocumentIndexingService {
  indexDocument(filePath: string, documentType: DocumentType): Promise<LegalDocument>;
  indexMultipleDocuments(filePaths: string[], documentType: DocumentType): Promise<LegalDocument[]>;
  reindexDocument(documentId: string): Promise<LegalDocument>;
  generateEmbeddings(text: string): Promise<number[]>;
  searchSimilarDocuments(query: string, limit?: number): Promise<LegalDocument[]>;
}

export const DOCUMENT_INDEXING_SERVICE = 'DOCUMENT_INDEXING_SERVICE'; 