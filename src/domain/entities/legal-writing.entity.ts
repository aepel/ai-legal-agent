export interface LegalWriting {
  id: string;
  title: string;
  prompt: string;
  documentType: WritingDocumentType;
  context?: string;
  userId?: string;
  createdAt: Date;
}

export enum WritingDocumentType {
  COMPLAINT = 'COMPLAINT',
  MOTION = 'MOTION',
  BRIEF = 'BRIEF',
  CONTRACT = 'CONTRACT',
  LEGAL_OPINION = 'LEGAL_OPINION',
  DEMAND_LETTER = 'DEMAND_LETTER',
  OTHER = 'OTHER',
}

export interface LegalWritingResponse {
  id: string;
  writingId: string;
  content: string;
  title: string;
  sections: DocumentSection[];
  sources: LegalDocumentReference[];
  confidence: number;
  createdAt: Date;
}

export interface DocumentSection {
  title: string;
  content: string;
  order: number;
}

export interface LegalDocumentReference {
  documentId: string;
  title: string;
  relevantSections: string[];
  relevanceScore: number;
}

export interface LegalWritingRequest {
  title: string;
  prompt: string;
  documentType: WritingDocumentType;
  context?: string;
  userId?: string;
} 