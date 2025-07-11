import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { LegalDocument, DocumentType, DocumentMetadata } from '@/domain/entities/legal-document.entity';
import { IDocumentIndexingService } from '@/domain/services/document-indexing.service.interface';

@Injectable()
export class DocumentIndexingService implements IDocumentIndexingService {
  private readonly assetsPath: string;

  constructor(private readonly configService: ConfigService) {
    this.assetsPath = this.configService.get<string>('ASSETS_PATH', './assets');
  }

  async indexDocument(filePath: string, documentType: string): Promise<LegalDocument> {
    try {
      const fullPath = path.join(this.assetsPath, filePath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }

      const fileBuffer = fs.readFileSync(fullPath);
      const pdfData = await pdf(fileBuffer);
      
      const fileName = path.basename(filePath);
      const fileStats = fs.statSync(fullPath);

      const metadata: DocumentMetadata = {
        fileName,
        fileSize: fileStats.size,
        pageCount: pdfData.numpages,
        language: 'es', // Spanish for Argentine legal documents
        jurisdiction: 'Argentina',
        tags: [documentType.toLowerCase()],
        summary: this.generateSummary(pdfData.text),
      };

      const document: LegalDocument = {
        id: uuidv4(),
        title: this.extractTitle(fileName, pdfData.text),
        content: pdfData.text,
        source: filePath,
        documentType: documentType as DocumentType,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return document;
    } catch (error) {
      throw new Error(`Failed to index document: ${error.message}`);
    }
  }

  async indexMultipleDocuments(filePaths: string[], documentType: string): Promise<LegalDocument[]> {
    const documents: LegalDocument[] = [];
    
    for (const filePath of filePaths) {
      try {
        const document = await this.indexDocument(filePath, documentType);
        documents.push(document);
      } catch (error) {
        console.error(`Failed to index ${filePath}:`, error.message);
      }
    }
    
    return documents;
  }

  async reindexDocument(documentId: string): Promise<LegalDocument> {
    // This would typically fetch the document from repository and reindex
    throw new Error('Reindexing not implemented yet');
  }

  async generateEmbeddings(content: string): Promise<number[]> {
    // This would integrate with a vector database or embedding service
    // For now, return a simple hash-based embedding
    const hash = this.simpleHash(content);
    return [hash, hash * 0.5, hash * 0.25];
  }

  async searchSimilarDocuments(query: string, limit: number = 10): Promise<LegalDocument[]> {
    // This would use vector similarity search
    // For now, return empty array
    return [];
  }

  private extractTitle(fileName: string, content: string): string {
    // Try to extract title from first few lines of content
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0 && lines[0].length < 100) {
      return lines[0].trim();
    }
    
    // Fallback to filename without extension
    return path.basename(fileName, path.extname(fileName));
  }

  private generateSummary(content: string): string {
    // Simple summary generation - first 200 characters
    const cleanContent = content.replace(/\s+/g, ' ').trim();
    return cleanContent.length > 200 
      ? cleanContent.substring(0, 200) + '...'
      : cleanContent;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
} 