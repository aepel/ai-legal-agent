import { LegalQuery, LegalQueryRequest, LegalQueryResponse } from '../entities/legal-query.entity';
import { LegalDocument } from '../entities/legal-document.entity';

export interface ILegalQueryService {
  processQuery(request: LegalQueryRequest): Promise<LegalQueryResponse>;
  searchRelevantDocuments(query: string): Promise<LegalDocument[]>;
  generateAnswer(query: string, context: LegalDocument[]): Promise<string>;
  analyzeLegalQuestion(question: string): Promise<{
    answer: string;
    reasoning: string;
    confidence: number;
    sources: LegalDocument[];
  }>;
}

export const LEGAL_QUERY_SERVICE = 'LEGAL_QUERY_SERVICE'; 