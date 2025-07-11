import { LegalDocument, DocumentType, LegalDocumentSearchResult } from '../entities/legal-document.entity';

export interface ILegalDocumentRepository {
  save(document: LegalDocument): Promise<LegalDocument>;
  findById(id: string): Promise<LegalDocument | null>;
  findByType(documentType: DocumentType): Promise<LegalDocument[]>;
  findAll(): Promise<LegalDocument[]>;
  delete(id: string): Promise<boolean>;
  search(query: string, documentType?: DocumentType, limit?: number): Promise<LegalDocumentSearchResult[]>;
  findByTags(tags: string[]): Promise<LegalDocument[]>;
  update(id: string, updates: Partial<LegalDocument>): Promise<LegalDocument | null>;
}

export const LEGAL_DOCUMENT_REPOSITORY = 'LEGAL_DOCUMENT_REPOSITORY'; 