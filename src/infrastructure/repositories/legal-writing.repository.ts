import { Injectable } from '@nestjs/common';
import { LegalWriting, WritingDocumentType, LegalWritingResponse } from '@/domain/entities/legal-writing.entity';
import { ILegalWritingRepository } from '@/domain/repositories/legal-writing.repository.interface';

@Injectable()
export class LegalWritingRepository implements ILegalWritingRepository {
  private writings: Map<string, LegalWriting> = new Map();
  private responses: Map<string, LegalWritingResponse> = new Map();

  async save(writing: LegalWriting): Promise<LegalWriting> {
    this.writings.set(writing.id, writing);
    return writing;
  }

  async findById(id: string): Promise<LegalWriting | null> {
    return this.writings.get(id) || null;
  }

  async findByType(documentType: WritingDocumentType): Promise<LegalWriting[]> {
    return Array.from(this.writings.values()).filter(w => w.documentType === documentType);
  }

  async findAll(): Promise<LegalWriting[]> {
    return Array.from(this.writings.values());
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.writings.has(id);
    this.writings.delete(id);
    return existed;
  }

  async saveResponse(response: LegalWritingResponse): Promise<LegalWritingResponse> {
    this.responses.set(response.id, response);
    return response;
  }

  async findResponseById(id: string): Promise<LegalWritingResponse | null> {
    return this.responses.get(id) || null;
  }

  async findResponsesByWritingId(writingId: string): Promise<LegalWritingResponse[]> {
    return Array.from(this.responses.values()).filter(r => r.writingId === writingId);
  }
} 