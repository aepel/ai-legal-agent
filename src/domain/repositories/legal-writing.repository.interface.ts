import { LegalWriting, WritingDocumentType, LegalWritingResponse } from '../entities/legal-writing.entity';

export interface ILegalWritingRepository {
  save(writing: LegalWriting): Promise<LegalWriting>;
  findById(id: string): Promise<LegalWriting | null>;
  findByType(documentType: WritingDocumentType): Promise<LegalWriting[]>;
  findAll(): Promise<LegalWriting[]>;
  delete(id: string): Promise<boolean>;
  saveResponse(response: LegalWritingResponse): Promise<LegalWritingResponse>;
  findResponseById(id: string): Promise<LegalWritingResponse | null>;
  findResponsesByWritingId(writingId: string): Promise<LegalWritingResponse[]>;
}

export const LEGAL_WRITING_REPOSITORY = 'LEGAL_WRITING_REPOSITORY'; 