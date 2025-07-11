import { LegalWriting, LegalWritingRequest, LegalWritingResponse } from '../entities/legal-writing.entity';
import { LegalDocument } from '../entities/legal-document.entity';

export interface ILegalWritingService {
  generateDocument(request: LegalWritingRequest): Promise<LegalWritingResponse>;
  generateDocumentWithContext(request: LegalWritingRequest & {
    contextDocuments?: LegalDocument[];
    additionalContext?: string;
  }): Promise<LegalWritingResponse>;
  reviewDocument(documentId: string, feedback: string, userId: string): Promise<LegalWritingResponse>;
  suggestImprovements(documentId: string, userId: string): Promise<string[]>;
  searchRelevantPrecedents(prompt: string): Promise<LegalDocument[]>;
  generateLegalContent(prompt: string, context: LegalDocument[]): Promise<{
    content: string;
    sections: Array<{ title: string; content: string; order: number }>;
    confidence: number;
  }>;
  validateLegalDocument(content: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }>;
}

export const LEGAL_WRITING_SERVICE = 'LEGAL_WRITING_SERVICE'; 