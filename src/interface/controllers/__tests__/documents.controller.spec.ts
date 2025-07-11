import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from '../../document/document.controller';
import { IndexDocumentUseCase } from '@/application/use-cases/document-indexing.use-case';
import { ILegalDocumentRepository } from '@/domain/repositories/legal-document.repository.interface';
import { LEGAL_DOCUMENT_REPOSITORY } from '@/domain/repositories/legal-document.repository.interface';
import { DocumentType } from '@/domain/entities/legal-document.entity';

describe('DocumentController', () => {
  let controller: DocumentController;
  let mockIndexUseCase: jest.Mocked<IndexDocumentUseCase>;
  let mockDocumentRepository: jest.Mocked<ILegalDocumentRepository>;

  const validRequest = {
    filePath: 'test.pdf',
    documentType: DocumentType.CIVIL_CODE,
    title: 'Test Document',
    tags: ['test', 'civil'],
  };

  beforeEach(async () => {
    const mockIndex = {
      execute: jest.fn(),
      executeBatch: jest.fn(),
    };

    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByTags: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: IndexDocumentUseCase,
          useValue: mockIndex,
        },
        {
          provide: LEGAL_DOCUMENT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    mockIndexUseCase = module.get(IndexDocumentUseCase);
    mockDocumentRepository = module.get(LEGAL_DOCUMENT_REPOSITORY);
  });

  describe('indexDocument', () => {
    it('should successfully index a document', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        document: {
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
            tags: ['test', 'civil'],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        message: 'Document indexed successfully',
      };

      mockIndexUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.indexDocument(validRequest);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockIndexUseCase.execute).toHaveBeenCalledWith(validRequest);
    });

    it('should handle indexing errors', async () => {
      // Arrange
      const mockResponse = {
        success: false,
        document: null,
        message: 'Failed to parse PDF',
      };

      mockIndexUseCase.execute.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(controller.indexDocument(validRequest)).rejects.toThrow('Failed to parse PDF');
    });
  });

  describe('getAllDocuments', () => {
    it('should return all documents', async () => {
      // Arrange
      const mockDocuments = [
        {
          id: 'doc-1',
          title: 'Document 1',
          content: 'Content 1',
          source: 'source1.pdf',
          documentType: DocumentType.CIVIL_CODE,
          metadata: { 
            fileName: 'source1.pdf',
            fileSize: 1024,
            language: 'es',
            jurisdiction: 'Argentina',
            tags: ['civil', 'law']
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'doc-2',
          title: 'Document 2',
          content: 'Content 2',
          source: 'source2.pdf',
          documentType: DocumentType.PENAL_CODE,
          metadata: { 
            fileName: 'source2.pdf',
            fileSize: 2048,
            language: 'es',
            jurisdiction: 'Argentina',
            tags: ['penal', 'law']
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDocumentRepository.findAll.mockResolvedValue(mockDocuments);

      // Act
      const result = await controller.getAllDocuments();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'doc-1');
      expect(result[1]).toHaveProperty('id', 'doc-2');
      expect(mockDocumentRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getDocumentById', () => {
    it('should return document by id', async () => {
      // Arrange
      const mockDocument = {
        id: 'doc-1',
        title: 'Document 1',
        content: 'Content 1',
        source: 'source1.pdf',
        documentType: DocumentType.CIVIL_CODE,
        metadata: { 
          fileName: 'source1.pdf',
          fileSize: 1024,
          language: 'es',
          jurisdiction: 'Argentina',
          tags: ['civil', 'law']
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocumentRepository.findById.mockResolvedValue(mockDocument);

      // Act
      const result = await controller.getDocumentById('doc-1');

      // Assert
      expect(result).toBe(mockDocument);
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith('doc-1');
    });

    it('should throw 404 for non-existent document', async () => {
      // Arrange
      mockDocumentRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getDocumentById('non-existent')).rejects.toThrow('Document not found');
    });
  });
}); 