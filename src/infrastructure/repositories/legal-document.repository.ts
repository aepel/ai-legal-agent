import { Injectable } from '@nestjs/common';
import { LegalDocument, DocumentType, LegalDocumentSearchResult } from '@/domain/entities/legal-document.entity';
import { ILegalDocumentRepository } from '@/domain/repositories/legal-document.repository.interface';

@Injectable()
export class LegalDocumentRepository implements ILegalDocumentRepository {
  private documents: Map<string, LegalDocument> = new Map();

  async save(document: LegalDocument): Promise<LegalDocument> {
    this.documents.set(document.id, document);
    return document;
  }

  async findById(id: string): Promise<LegalDocument | null> {
    return this.documents.get(id) || null;
  }

  async findByType(documentType: DocumentType): Promise<LegalDocument[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.documentType === documentType,
    );
  }

  async findAll(): Promise<LegalDocument[]> {
    return Array.from(this.documents.values());
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.documents.has(id);
    this.documents.delete(id);
    return existed;
  }

  async search(query: string, documentType?: DocumentType, limit: number = 10): Promise<LegalDocumentSearchResult[]> {
    let results = Array.from(this.documents.values())
      .filter(doc => 
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.content.toLowerCase().includes(query.toLowerCase())
      );
    
    // Filter by document type if provided
    if (documentType) {
      results = results.filter(doc => doc.documentType === documentType);
    }
    
    // Apply limit and convert to search results
    return results.slice(0, limit).map(doc => ({
      document: doc,
      relevanceScore: 0.8, // Mock relevance score
      matchedSections: ['full document'], // Mock matched sections
    }));
  }

  async findByTags(tags: string[]): Promise<LegalDocument[]> {
    return Array.from(this.documents.values()).filter(doc =>
      tags.some(tag => doc.metadata.tags.includes(tag))
    );
  }

  async update(id: string, document: Partial<LegalDocument>): Promise<LegalDocument> {
    const existing = this.documents.get(id);
    if (!existing) {
      throw new Error(`Document with id ${id} not found`);
    }
    
    const updated = { ...existing, ...document, updatedAt: new Date() };
    this.documents.set(id, updated);
    return updated;
  }
} 