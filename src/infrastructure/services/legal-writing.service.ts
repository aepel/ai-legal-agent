import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { LegalWritingRequest, LegalWritingResponse, DocumentSection, LegalDocumentReference } from '@/domain/entities/legal-writing.entity';
import { LegalDocument } from '@/domain/entities/legal-document.entity';
import { ILegalWritingService } from '@/domain/services/legal-writing.service.interface';
import { AIService } from './ai.service';

@Injectable()
export class LegalWritingService implements ILegalWritingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AIService,
  ) {}

  async generateDocument(request: LegalWritingRequest): Promise<LegalWritingResponse> {
    try {
      // Search for relevant precedents
      const relevantPrecedents = await this.searchRelevantPrecedents(request.prompt);
      
      // Generate legal content
      const generatedContent = await this.generateLegalContent(request.prompt, relevantPrecedents);
      
      // Create document references
      const sources: LegalDocumentReference[] = relevantPrecedents.map(doc => ({
        documentId: doc.id,
        title: doc.title,
        relevantSections: this.extractRelevantSections(doc.content, request.prompt),
        relevanceScore: this.calculateRelevanceScore(doc.content, request.prompt),
      }));

      const response: LegalWritingResponse = {
        id: uuidv4(),
        writingId: uuidv4(),
        content: generatedContent.content,
        title: request.title,
        sections: generatedContent.sections,
        sources,
        confidence: generatedContent.confidence,
        createdAt: new Date(),
      };

      return response;
    } catch (error) {
      throw new Error(`Failed to generate legal document: ${error.message}`);
    }
  }

  async searchRelevantPrecedents(prompt: string): Promise<LegalDocument[]> {
    // This would typically use vector similarity search
    // For now, return mock data
    return [];
  }

  async generateLegalContent(prompt: string, context: LegalDocument[]): Promise<{
    content: string;
    sections: Array<{ title: string; content: string; order: number }>;
    confidence: number;
  }> {
    try {
      const contextText = context.map(doc => `${doc.title}: ${doc.content.substring(0, 1000)}`).join('\n\n');
      
      const documentPrompt = this.getDocumentPrompt(prompt, contextText);
      
      const content = await this.aiService.generateContent(documentPrompt);
      
      // Parse sections from the generated content
      const sections = this.parseSections(content);
      
      return {
        content,
        sections,
        confidence: this.calculateConfidence(context, prompt),
      };
    } catch (error) {
      throw new Error(`Failed to generate legal content: ${error.message}`);
    }
  }

  async validateLegalDocument(content: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      const prompt = `
        Analyze the following legal document for potential issues and provide suggestions for improvement:
        
        ${content}
        
        Please identify:
        1. Legal inconsistencies or errors
        2. Missing required elements
        3. Suggestions for improvement
        4. Overall validity assessment
      `;

      const analysis = await this.aiService.generateContent(prompt);
      
      // Simple parsing of the analysis
      const issues = this.extractIssues(analysis);
      const suggestions = this.extractSuggestions(analysis);
      const isValid = !analysis.toLowerCase().includes('invalid') && issues.length === 0;
      
      return {
        isValid,
        issues,
        suggestions,
      };
    } catch (error) {
      return {
        isValid: false,
        issues: ['Unable to validate document due to processing error'],
        suggestions: ['Please review the document manually'],
      };
    }
  }

  private getDocumentPrompt(prompt: string, context: string): string {
    return `
      You are an expert Argentine lawyer. Generate a professional legal document based on the following request.
      
      Request: ${prompt}
      
      Context from relevant legal sources:
      ${context}
      
      Please generate a complete, professional legal document in Spanish that includes:
      1. Proper legal formatting and structure
      2. Relevant legal citations and references
      3. Clear sections with appropriate headings
      4. Professional legal language
      5. Compliance with Argentine legal standards
      
      Format the document with clear sections and subsections.
    `;
  }

  private parseSections(content: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent = '';
    let order = 1;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if line is a section header (starts with number or is all caps)
      if (trimmedLine.match(/^\d+\./) || (trimmedLine.length > 3 && trimmedLine === trimmedLine.toUpperCase())) {
        // Save previous section
        if (currentSection && currentContent) {
          sections.push({
            title: currentSection,
            content: currentContent.trim(),
            order: order++,
          });
        }
        
        currentSection = trimmedLine;
        currentContent = '';
      } else {
        currentContent += line + '\n';
      }
    }
    
    // Add the last section
    if (currentSection && currentContent) {
      sections.push({
        title: currentSection,
        content: currentContent.trim(),
        order: order,
      });
    }
    
    return sections;
  }

  private extractRelevantSections(content: string, prompt: string): string[] {
    const sections: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    const promptWords = prompt.toLowerCase().split(' ');
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const matchCount = promptWords.filter(word => sentenceLower.includes(word)).length;
      
      if (matchCount > 0) {
        sections.push(sentence.trim());
      }
    }
    
    return sections.slice(0, 5);
  }

  private calculateRelevanceScore(content: string, prompt: string): number {
    const promptWords = prompt.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();
    
    let matchCount = 0;
    for (const word of promptWords) {
      if (contentLower.includes(word)) {
        matchCount++;
      }
    }
    
    return Math.min(matchCount / promptWords.length, 1.0);
  }

  private calculateConfidence(documents: LegalDocument[], prompt: string): number {
    if (documents.length === 0) {
      return 0.3;
    }
    
    const avgRelevance = documents.reduce((sum, doc) => {
      return sum + this.calculateRelevanceScore(doc.content, prompt);
    }, 0) / documents.length;
    
    return Math.min(avgRelevance * 0.7 + 0.3, 1.0);
  }

  private extractIssues(analysis: string): string[] {
    const issues: string[] = [];
    const lines = analysis.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('issue') || line.toLowerCase().includes('problem') || line.toLowerCase().includes('error')) {
        issues.push(line.trim());
      }
    }
    
    return issues.slice(0, 5);
  }

  private extractSuggestions(analysis: string): string[] {
    const suggestions: string[] = [];
    const lines = analysis.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('suggest') || line.toLowerCase().includes('recommend') || line.toLowerCase().includes('improve')) {
        suggestions.push(line.trim());
      }
    }
    
    return suggestions.slice(0, 5);
  }

  async generateDocumentWithContext(request: LegalWritingRequest & { contextDocuments?: LegalDocument[]; additionalContext?: string; }): Promise<LegalWritingResponse> {
    // For now, just call generateDocument and ignore extra context
    return this.generateDocument(request);
  }

  async suggestImprovements(documentId: string, userId: string): Promise<string[]> {
    // Mock implementation: return a dummy suggestion
    return [
      `Consider adding more legal references to document ${documentId}.`,
      `Ensure compliance with Argentine legal standards.`
    ];
  }

  async reviewDocument(documentId: string, feedback: string, userId: string): Promise<LegalWritingResponse> {
    // Mock implementation: return a dummy response
    return {
      id: uuidv4(),
      writingId: documentId,
      content: `Reviewed document ${documentId} with feedback: ${feedback}`,
      title: 'Reviewed Document',
      sections: [],
      sources: [],
      confidence: 1,
      createdAt: new Date(),
    };
  }
} 