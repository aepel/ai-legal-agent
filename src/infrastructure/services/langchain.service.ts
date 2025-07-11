import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { LegalDocument } from '@/domain/entities/legal-document.entity';

@Injectable()
export class LangChainService {
  private llm: ChatGoogleGenerativeAI | ChatOpenAI;
  private embeddings: GoogleGenerativeAIEmbeddings | OpenAIEmbeddings;
  private documents: Document[] = [];
  private provider: 'google' | 'openai';

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('AI_PROVIDER', 'google') as 'google' | 'openai';
    this.initializeLLM();
    this.initializeEmbeddings();
  }

  private initializeLLM(): void {
    if (this.provider === 'google') {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      this.llm = new ChatGoogleGenerativeAI({
        modelName: 'gemini-1.5-pro',
        apiKey,
        temperature: 0.1,
      });
    } else {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      const model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o');
      this.llm = new ChatOpenAI({
        modelName: model,
        openAIApiKey: apiKey,
        temperature: 0.1,
      });
    }
  }

  private initializeEmbeddings(): void {
    if (this.provider === 'google') {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      this.embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey,
        modelName: 'embedding-001',
      });
    } else {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: apiKey,
        modelName: 'text-embedding-3-small',
      });
    }
  }

  async addDocuments(documents: LegalDocument[]): Promise<void> {
    const docs = documents.map((doc) =>
      new Document({
        pageContent: doc.content,
        metadata: {
          id: doc.id,
          title: doc.title,
          documentType: doc.documentType,
          source: doc.source,
          ...doc.metadata,
        },
      }),
    );

    this.documents.push(...docs);
  }

  async searchSimilarDocuments(query: string, k: number = 5): Promise<Document[]> {
    if (this.documents.length === 0) {
      return [];
    }

    // Simple keyword-based search for now
    const queryLower = query.toLowerCase();
    const relevantDocs = this.documents
      .filter((doc) => {
        const content = doc.pageContent.toLowerCase();
        const title = doc.metadata.title?.toLowerCase() || '';
        return content.includes(queryLower) || title.includes(queryLower);
      })
      .slice(0, k);

    return relevantDocs;
  }

  async generateLegalAnswer(question: string, context: string): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert legal assistant specializing in legal analysis and document generation.
      
      Context from relevant legal documents:
      {context}
      
      Legal Question: {question}
      
      Please provide a comprehensive legal answer that:
      1. Directly addresses the question
      2. Cites relevant legal principles from the provided context
      3. Provides clear, actionable legal guidance
      4. Maintains professional legal language
      5. Includes relevant citations when possible
      
      Answer:
    `);

    const formattedPrompt = await prompt.format({
      context,
      question,
    });

    const response = await this.llm.invoke(formattedPrompt);
    return response.content as string;
  }

  async generateLegalDocument(
    title: string,
    prompt: string,
    context: string,
    documentType: string,
  ): Promise<{ content: string; sections: Array<{ title: string; content: string; order: number }> }> {
    const documentPrompt = PromptTemplate.fromTemplate(`
      You are an expert legal document writer. Generate a professional legal document based on the following requirements.
      
      Document Type: {documentType}
      Title: {title}
      Request: {prompt}
      
      Context from relevant legal sources:
      {context}
      
      Please generate a complete, professional legal document that includes:
      1. Proper legal formatting and structure
      2. Clear sections with appropriate headings
      3. Relevant legal citations and references from the context
      4. Professional legal language appropriate for {documentType}
      5. Compliance with legal standards
      
      Format the document with numbered sections and clear headings.
      Return only the document content without any additional explanations.
    `);

    const formattedPrompt = await documentPrompt.format({
      documentType,
      title,
      prompt,
      context,
    });

    const response = await this.llm.invoke(formattedPrompt);
    const content = response.content as string;
    const sections = this.parseSections(content);

    return { content, sections };
  }

  async validateLegalDocument(content: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
    analysis: string;
  }> {
    const validationPrompt = PromptTemplate.fromTemplate(`
      Analyze the following legal document for potential issues and provide a comprehensive validation report.
      
      Document Content:
      {content}
      
      Please provide a detailed analysis including:
      1. Legal validity assessment
      2. Potential legal issues or inconsistencies
      3. Missing required elements
      4. Specific suggestions for improvement
      5. Overall quality assessment
      
      Format your response as:
      VALIDITY: [Valid/Invalid/Needs Review]
      ISSUES: [List of specific legal issues]
      SUGGESTIONS: [List of improvement suggestions]
      ANALYSIS: [Detailed analysis]
    `);

    const formattedPrompt = await validationPrompt.format({ content });
    const response = await this.llm.invoke(formattedPrompt);
    const analysis = response.content as string;

    // Parse the structured response
    const validityMatch = analysis.match(/VALIDITY:\s*(.+)/i);
    const issuesMatch = analysis.match(/ISSUES:\s*([\s\S]*?)(?=SUGGESTIONS:|$)/i);
    const suggestionsMatch = analysis.match(/SUGGESTIONS:\s*([\s\S]*?)(?=ANALYSIS:|$)/i);
    const analysisMatch = analysis.match(/ANALYSIS:\s*([\s\S]*)/i);

    const isValid = validityMatch?.[1]?.toLowerCase().includes('valid') || false;
    const issues = issuesMatch?.[1]?.split('\n').filter((line) => line.trim()) || [];
    const suggestions = suggestionsMatch?.[1]?.split('\n').filter((line) => line.trim()) || [];

    return {
      isValid,
      issues,
      suggestions,
      analysis: analysisMatch?.[1] || analysis,
    };
  }

  async splitDocumentIntoChunks(
    content: string,
    chunkSize: number = 1000,
    chunkOverlap: number = 200,
  ): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n', '\n', ' ', ''],
    });

    const docs = await splitter.createDocuments([content]);
    return docs.map((doc) => doc.pageContent);
  }

  async generateLegalReasoning(question: string, context: string): Promise<string> {
    const reasoningPrompt = PromptTemplate.fromTemplate(`
      Provide detailed legal reasoning for the following question based on the provided legal context.
      
      Question: {question}
      
      Legal Context:
      {context}
      
      Please explain:
      1. The legal principles involved
      2. How the context applies to the question
      3. The reasoning process
      4. Potential legal implications
      5. Relevant precedents or citations
      
      Provide a clear, logical legal analysis.
    `);

    const formattedPrompt = await reasoningPrompt.format({
      question,
      context,
    });

    const response = await this.llm.invoke(formattedPrompt);
    return response.content as string;
  }

  private parseSections(content: string): Array<{ title: string; content: string; order: number }> {
    const sections: Array<{ title: string; content: string; order: number }> = [];
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent = '';
    let order = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if line is a section header (starts with number or is all caps)
      if (
        trimmedLine.match(/^\d+\./) ||
        (trimmedLine.length > 3 && trimmedLine === trimmedLine.toUpperCase())
      ) {
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

  async getVectorStoreStats(): Promise<{ documentCount: number; provider: string }> {
    return {
      documentCount: this.documents.length,
      provider: this.provider,
    };
  }
} 