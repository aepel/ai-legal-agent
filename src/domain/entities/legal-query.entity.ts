export interface LegalQuery {
  id: string;
  question: string;
  context?: string;
  queryType: QueryType;
  createdAt: Date;
  userId?: string;
}

export enum QueryType {
  LEGAL_QUESTION = 'LEGAL_QUESTION',
  DOCUMENT_SEARCH = 'DOCUMENT_SEARCH',
  CASE_ANALYSIS = 'CASE_ANALYSIS',
  STATUTE_INTERPRETATION = 'STATUTE_INTERPRETATION',
}

export interface LegalQueryResponse {
  id: string;
  queryId: string;
  answer: string;
  sources: LegalDocumentReference[];
  confidence: number;
  reasoning: string;
  createdAt: Date;
}

export interface LegalDocumentReference {
  documentId: string;
  title: string;
  relevantSections: string[];
  relevanceScore: number;
}

export interface LegalQueryRequest {
  question: string;
  context?: string;
  queryType?: QueryType;
  userId?: string;
} 