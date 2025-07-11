import { Controller, Post, Get, Body, Param, UseInterceptors, UploadedFile, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { IndexDocumentUseCase, IndexDocumentRequest, IndexDocumentResponse } from '@/application/use-cases/document-indexing.use-case';
import { LegalDocument, DocumentType } from '@/domain/entities/legal-document.entity';
import { ILegalDocumentRepository } from '@/domain/repositories/legal-document.repository.interface';
import { LEGAL_DOCUMENT_REPOSITORY } from '@/domain/repositories/legal-document.repository.interface';

export class IndexDocumentDto {
  filePath: string;
  documentType: DocumentType;
  title?: string;
  tags?: string[];
}

export class DocumentResponseDto {
  id: string;
  title: string;
  documentType: DocumentType;
  metadata: any;
  createdAt: Date;
}

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(
    private readonly indexDocumentUseCase: IndexDocumentUseCase,
    @Inject(LEGAL_DOCUMENT_REPOSITORY)
    private readonly documentRepository: ILegalDocumentRepository,
  ) {}

  @Post('index')
  @ApiOperation({ summary: 'Index a legal document from file path' })
  @ApiResponse({ status: 201, description: 'Document indexed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async indexDocument(@Body() request: IndexDocumentDto): Promise<IndexDocumentResponse> {
    try {
      const result = await this.indexDocumentUseCase.execute({
        filePath: request.filePath,
        documentType: request.documentType,
        title: request.title,
        tags: request.tags,
      });

      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }

      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to index document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/batch')
  @ApiOperation({ summary: 'Index multiple legal documents' })
  @ApiResponse({ status: 201, description: 'Documents indexed successfully' })
  async indexMultipleDocuments(@Body() requests: IndexDocumentDto[]): Promise<IndexDocumentResponse[]> {
    try {
      const results = await this.indexDocumentUseCase.executeBatch(requests);
      return results;
    } catch (error) {
      throw new HttpException(
        `Failed to index documents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all indexed documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully', type: [DocumentResponseDto] })
  async getAllDocuments(): Promise<DocumentResponseDto[]> {
    try {
      const documents = await this.documentRepository.findAll();
      return documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        documentType: doc.documentType,
        metadata: doc.metadata,
        createdAt: doc.createdAt,
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve documents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentById(@Param('id') id: string): Promise<LegalDocument> {
    try {
      const document = await this.documentRepository.findById(id);
      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }
      return document;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('type/:documentType')
  @ApiOperation({ summary: 'Get documents by type' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully', type: [DocumentResponseDto] })
  async getDocumentsByType(@Param('documentType') documentType: DocumentType): Promise<DocumentResponseDto[]> {
    try {
      const documents = await this.documentRepository.findByType(documentType);
      return documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        documentType: doc.documentType,
        metadata: doc.metadata,
        createdAt: doc.createdAt,
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve documents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/:query')
  @ApiOperation({ summary: 'Search documents by query' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully', type: [DocumentResponseDto] })
  async searchDocuments(@Param('query') query: string): Promise<DocumentResponseDto[]> {
    try {
      const searchResults = await this.documentRepository.search(query);
      return searchResults.map(result => ({
        id: result.document.id,
        title: result.document.title,
        documentType: result.document.documentType,
        metadata: result.document.metadata,
        createdAt: result.document.createdAt,
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to search documents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 