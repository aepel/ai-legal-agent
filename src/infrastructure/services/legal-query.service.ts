import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { LegalQueryRequest, LegalQueryResponse, LegalDocumentReference } from '@/domain/entities/legal-query.entity';
import { LegalDocument } from '@/domain/entities/legal-document.entity';
import { ILegalQueryService } from '@/domain/services/legal-query.service.interface';
import { AIService } from './ai.service';

@Injectable()
export class LegalQueryService implements ILegalQueryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AIService,
  ) {}

  async processQuery(request: LegalQueryRequest): Promise<LegalQueryResponse> {
    try {
      // Search for relevant documents
      const relevantDocuments = await this.searchRelevantDocuments(request.question);
      
      // Generate answer using AIService
      const answer = await this.generateAnswer(request.question, relevantDocuments);
      
      // Create document references
      const sources: LegalDocumentReference[] = relevantDocuments.map(doc => ({
        documentId: doc.id,
        title: doc.title,
        relevantSections: this.extractRelevantSections(doc.content, request.question),
        relevanceScore: this.calculateRelevanceScore(doc.content, request.question),
      }));

      const response: LegalQueryResponse = {
        id: uuidv4(),
        queryId: uuidv4(),
        answer,
        sources,
        confidence: this.calculateConfidence(relevantDocuments, request.question),
        reasoning: await this.generateReasoning(request.question, relevantDocuments),
        createdAt: new Date(),
      };

      return response;
    } catch (error) {
      throw new Error(`Failed to process legal query: ${error.message}`);
    }
  }

  async searchRelevantDocuments(query: string): Promise<LegalDocument[]> {
    // This would typically use vector similarity search
    // For now, return mock data
    return [];
  }

  async generateAnswer(query: string, context: LegalDocument[]): Promise<string> {
    try {
      const contextText = context.map(doc => `${doc.title}: ${doc.content.substring(0, 1000)}`).join('\n\n');
      
      const prompt = `
        You are a legal expert specializing in Argentine law. Answer the following legal question based on the provided context.
        
        Context:
        ${contextText}
        
        Question: ${query}
        
        Please provide a comprehensive legal answer in Spanish, citing relevant laws and precedents when possible.
      `;

      return await this.aiService.generateContent(prompt);
    } catch (error) {
      return `I apologize, but I encountered an error while processing your legal question: ${error.message}. Please try rephrasing your question or contact support.`;
    }
  }

  async analyzeLegalQuestion(question: string): Promise<{
    answer: string;
    reasoning: string;
    confidence: number;
    sources: LegalDocument[];
  }> {
    try {
      const relevantDocuments = await this.searchRelevantDocuments(question);
      const answer = await this.generateAnswer(question, relevantDocuments);
      const reasoning = await this.generateReasoning(question, relevantDocuments);
      const confidence = this.calculateConfidence(relevantDocuments, question);

      return {
        answer,
        reasoning,
        confidence,
        sources: relevantDocuments,
      };
    } catch (error) {
      throw new Error(`Failed to analyze legal question: ${error.message}`);
    }
  }

  private async generateReasoning(question: string, documents: LegalDocument[]): Promise<string> {
    try {
      const contextText = documents.map(doc => `${doc.title}: ${doc.content.substring(0, 500)}`).join('\n\n');
      
      const prompt = `
        Explain the legal reasoning behind answering this question: "${question}"
        
        Based on the following legal context:
        ${contextText}
        
        Provide a clear explanation of the legal principles and reasoning used.
      `;

      return await this.aiService.generateContent(prompt);
    } catch (error) {
      return 'Unable to generate reasoning at this time.';
    }
  }

  private extractRelevantSections(content: string, query: string): string[] {
    // Simple keyword-based section extraction
    const sections: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    const queryWords = query.toLowerCase().split(' ');
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const matchCount = queryWords.filter(word => sentenceLower.includes(word)).length;
      
      if (matchCount > 0) {
        sections.push(sentence.trim());
      }
    }
    
    return sections.slice(0, 5); // Return top 5 relevant sections
  }

  private calculateRelevanceScore(content: string, query: string): number {
    const queryWords = query.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();
    
    let matchCount = 0;
    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        matchCount++;
      }
    }
    
    return Math.min(matchCount / queryWords.length, 1.0);
  }

  private calculateConfidence(documents: LegalDocument[], query: string): number {
    if (documents.length === 0) {
      return 0.3;
    }
    
    const avgRelevance = documents.reduce((sum, doc) => {
      return sum + this.calculateRelevanceScore(doc.content, query);
    }, 0) / documents.length;
    
    return Math.min(avgRelevance * 0.7 + 0.3, 1.0);
  }
} 