export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  documentType: DocumentType;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  PENAL_CODE = 'PENAL_CODE',
  CIVIL_CODE = 'CIVIL_CODE',
  COMMERCIAL_CODE = 'COMMERCIAL_CODE',
  CASE_LAW = 'CASE_LAW',
  LEGAL_OPINION = 'LEGAL_OPINION',
  OTHER = 'OTHER',
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  pageCount?: number;
  language: string;
  jurisdiction: string;
  tags: string[];
  summary?: string;
}

export interface LegalDocumentSearchResult {
  document: LegalDocument;
  relevanceScore: number;
  matchedSections: string[];
} 