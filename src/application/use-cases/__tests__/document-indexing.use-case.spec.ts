import { Test, TestingModule } from '@nestjs/testing';
import {
  IndexDocumentUseCase,
  IndexDocumentRequest,
  IndexDocumentResponse,
} from '../document-indexing.use-case';
import {
  LEGAL_DOCUMENT_REPOSITORY,
  ILegalDocumentRepository,
} from '@/domain/repositories/legal-document.repository.interface';
import {
  DOCUMENT_INDEXING_SERVICE,
  IDocumentIndexingService,
} from '@/domain/services/document-indexing.service.interface';
import {
  LegalDocument,
  DocumentType,
} from '@/domain/entities/legal-document.entity';

describe('IndexDocumentUseCase', () => {
  let useCase: IndexDocumentUseCase;
  let mockDocumentRepository: jest.Mocked<ILegalDocumentRepository>;
  let mockIndexingService: jest.Mocked<IDocumentIndexingService>;

  const mockDocument: LegalDocument = {
    id: 'test-id',
    title: 'Test Document',
    content: 'Test content',
    source: 'test.pdf',
    documentType: DocumentType.CIVIL_CODE,
    metadata: {
      fileName: 'test.pdf',
      fileSize: 1024,
      language: 'es',
      jurisdiction: 'Argentina',
      tags: ['test'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      findByTags: jest.fn(),
      update: jest.fn(),
    };

    const mockService = {
      indexDocument: jest.fn(),
      indexMultipleDocuments: jest.fn(),
      reindexDocument: jest.fn(),
      generateEmbeddings: jest.fn(),
      searchSimilarDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndexDocumentUseCase,
        {
          provide: LEGAL_DOCUMENT_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: DOCUMENT_INDEXING_SERVICE,
          useValue: mockService,
        },
      ],
    }).compile();

    useCase = module.get<IndexDocumentUseCase>(IndexDocumentUseCase);
    mockDocumentRepository = module.get(LEGAL_DOCUMENT_REPOSITORY);
    mockIndexingService = module.get(DOCUMENT_INDEXING_SERVICE);
  });

  describe('execute', () => {
    const validRequest: IndexDocumentRequest = {
      filePath: 'test.pdf',
      documentType: DocumentType.CIVIL_CODE,
      title: 'Test Document',
      tags: ['test', 'civil'],
    };

    it('should successfully index a document', async () => {
      // Arrange
      mockIndexingService.indexDocument.mockResolvedValue(mockDocument);
      mockDocumentRepository.save.mockResolvedValue(mockDocument);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.document).toBe(mockDocument);
      expect(result.message).toContain('indexed successfully');
      expect(mockIndexingService.indexDocument).toHaveBeenCalledWith(
        validRequest.filePath,
        validRequest.documentType,
      );
      expect(mockDocumentRepository.save).toHaveBeenCalledWith(mockDocument);
    });

    it('should handle indexing service errors', async () => {
      // Arrange
      const errorMessage = 'Failed to parse PDF';
      mockIndexingService.indexDocument.mockRejectedValue(new Error(errorMessage));

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.document).toBeNull();
      expect(result.message).toContain(errorMessage);
      expect(mockDocumentRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save errors', async () => {
      // Arrange
      mockIndexingService.indexDocument.mockResolvedValue(mockDocument);
      mockDocumentRepository.save.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.document).toBeNull();
      expect(result.message).toContain('Failed to index document');
      expect(mockIndexingService.indexDocument).toHaveBeenCalled();
    });

    it('should work without optional parameters', async () => {
      // Arrange
      const requestWithoutOptional: IndexDocumentRequest = {
        filePath: 'test.pdf',
        documentType: DocumentType.PENAL_CODE,
      };

      mockIndexingService.indexDocument.mockResolvedValue(mockDocument);
      mockDocumentRepository.save.mockResolvedValue(mockDocument);

      // Act
      const result = await useCase.execute(requestWithoutOptional);

      // Assert
      expect(result.success).toBe(true);
      expect(mockIndexingService.indexDocument).toHaveBeenCalledWith(
        requestWithoutOptional.filePath,
        requestWithoutOptional.documentType,
      );
    });
  });

  describe('executeBatch', () => {
    const batchRequests: IndexDocumentRequest[] = [
      {
        filePath: 'doc1.pdf',
        documentType: DocumentType.CIVIL_CODE,
        title: 'Document 1',
      },
      {
        filePath: 'doc2.pdf',
        documentType: DocumentType.PENAL_CODE,
        title: 'Document 2',
      },
    ];

    it('should successfully process batch requests', async () => {
      // Arrange
      mockIndexingService.indexDocument
        .mockResolvedValueOnce({ ...mockDocument, id: 'doc1' })
        .mockResolvedValueOnce({ ...mockDocument, id: 'doc2' });
      mockDocumentRepository.save
        .mockResolvedValueOnce({ ...mockDocument, id: 'doc1' })
        .mockResolvedValueOnce({ ...mockDocument, id: 'doc2' });

      // Act
      const results = await useCase.executeBatch(batchRequests);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(mockIndexingService.indexDocument).toHaveBeenCalledTimes(2);
      expect(mockDocumentRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in batch processing', async () => {
      // Arrange
      mockIndexingService.indexDocument
        .mockResolvedValueOnce({ ...mockDocument, id: 'doc1' })
        .mockRejectedValueOnce(new Error('Failed to process doc2'));
      mockDocumentRepository.save
        .mockResolvedValueOnce({ ...mockDocument, id: 'doc1' });

      // Act
      const results = await useCase.executeBatch(batchRequests);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].message).toContain('Failed to index document');
    });

    it('should handle empty batch requests', async () => {
      // Act
      const results = await useCase.executeBatch([]);

      // Assert
      expect(results).toHaveLength(0);
      expect(mockIndexingService.indexDocument).not.toHaveBeenCalled();
      expect(mockDocumentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle invalid document types', async () => {
      // Arrange
      const invalidRequest: IndexDocumentRequest = {
        filePath: 'test.pdf',
        documentType: 'INVALID_TYPE' as DocumentType,
      };

      mockIndexingService.indexDocument.mockRejectedValue(new Error('Invalid document type'));

      // Act
      const result = await useCase.execute(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid document type');
    });

    it('should handle file not found errors', async () => {
      // Arrange
      const requestWithMissingFile: IndexDocumentRequest = {
        filePath: 'missing.pdf',
        documentType: DocumentType.CIVIL_CODE,
      };

      mockIndexingService.indexDocument.mockRejectedValue(new Error('File not found'));

      // Act
      const result = await useCase.execute(requestWithMissingFile);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('File not found');
    });
  });

  describe('validation', () => {
    it('should validate required fields', async () => {
      // Arrange
      const invalidRequest = {
        filePath: '',
        documentType: DocumentType.CIVIL_CODE,
      } as IndexDocumentRequest;

      mockIndexingService.indexDocument.mockRejectedValue(new Error('Invalid file path'));

      // Act
      const result = await useCase.execute(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid file path');
    });

    it('should handle null or undefined requests', async () => {
      // Act & Assert
      const nullResult = await useCase.execute(null as any);
      expect(nullResult.success).toBe(false);
      expect(nullResult.message).toContain('Failed to index document');

      const undefinedResult = await useCase.execute(undefined as any);
      expect(undefinedResult.success).toBe(false);
      expect(undefinedResult.message).toContain('Failed to index document');
    });
  });
}); 