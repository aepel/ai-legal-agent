import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConsoleService } from '../console.service';
import { IndexDocumentUseCase } from '@/application/use-cases/document-indexing.use-case';
import { GenerateLegalDocumentUseCase } from '@/application/use-cases/legal-writing.use-case';
import { ProcessLegalQueryUseCase } from '@/application/use-cases/legal-query.use-case';
import { DocumentType } from '@/domain/entities/legal-document.entity';
import { WritingDocumentType } from '@/domain/entities/legal-writing.entity';

describe('ConsoleService', () => {
  let service: ConsoleService;
  let mockIndexUseCase: jest.Mocked<IndexDocumentUseCase>;
  let mockWritingUseCase: jest.Mocked<GenerateLegalDocumentUseCase>;
  let mockProcessLegalQueryUseCase: jest.Mocked<ProcessLegalQueryUseCase>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockIndex = { execute: jest.fn() };
    const mockWriting = { execute: jest.fn() };
    const mockProcessLegalQuery = { execute: jest.fn() };
    const mockConfig = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsoleService,
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
        {
          provide: IndexDocumentUseCase,
          useValue: mockIndex,
        },
        {
          provide: ProcessLegalQueryUseCase,
          useValue: mockProcessLegalQuery,
        },
        {
          provide: GenerateLegalDocumentUseCase,
          useValue: mockWriting,
        },
      ],
    }).compile();

    service = module.get<ConsoleService>(ConsoleService);
    mockIndexUseCase = module.get(IndexDocumentUseCase);
    mockWritingUseCase = module.get(GenerateLegalDocumentUseCase);
    mockProcessLegalQueryUseCase = module.get(ProcessLegalQueryUseCase);
    mockConfigService = module.get(ConfigService);
  });

  describe('indexDocument', () => {
    it('should successfully index a document', async () => {
      // Arrange
      const args = ['test.pdf', 'CIVIL_CODE'];
      mockIndexUseCase.execute.mockResolvedValue({
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
      });

      // Act
      await service.indexDocument(args);

      // Assert
      expect(mockIndexUseCase.execute).toHaveBeenCalledWith({
        filePath: 'test.pdf',
        documentType: DocumentType.CIVIL_CODE,
      });
    });

    it('should handle indexing errors', async () => {
      // Arrange
      const args = ['test.pdf', 'CIVIL_CODE'];
      mockIndexUseCase.execute.mockResolvedValue({
        success: false,
        document: null,
        message: 'Failed to parse PDF',
      });

      // Act
      await service.indexDocument(args);

      // Assert
      expect(mockIndexUseCase.execute).toHaveBeenCalledWith({
        filePath: 'test.pdf',
        documentType: DocumentType.CIVIL_CODE,
      });
    });

    it('should handle invalid arguments', async () => {
      // Arrange
      const args = ['test.pdf']; // Missing document type

      // Act
      await service.indexDocument(args);

      // Assert
      expect(mockIndexUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('generateDocument', () => {
    it('should successfully generate a document', async () => {
      // Arrange
      const args = ['Demanda por Alimentos', 'Redactar demanda', 'COMPLAINT'];
      mockWritingUseCase.execute.mockResolvedValue({
        success: true,
        response: {
          id: 'response-123',
          writingId: 'writing-123',
          content: 'DEMANDA POR ALIMENTOS\n\nVISTO: El presente escrito...',
          title: 'Demanda por Alimentos',
          sections: [],
          sources: [],
          confidence: 0.9,
          createdAt: new Date(),
        },
        message: 'Document generated successfully',
      });

      // Act
      await service.generateDocument(args);

      // Assert
      expect(mockWritingUseCase.execute).toHaveBeenCalledWith({
        title: 'Demanda por Alimentos',
        prompt: 'Redactar demanda',
        documentType: WritingDocumentType.COMPLAINT,
      });
    });

    it('should handle generation errors', async () => {
      // Arrange
      const args = ['Test Document', 'Test prompt', 'OTHER'];
      mockWritingUseCase.execute.mockResolvedValue({
        success: false,
        response: null,
        message: 'Failed to generate document',
      });

      // Act
      await service.generateDocument(args);

      // Assert
      expect(mockWritingUseCase.execute).toHaveBeenCalledWith({
        title: 'Test Document',
        prompt: 'Test prompt',
        documentType: WritingDocumentType.OTHER,
      });
    });

    it('should handle invalid arguments', async () => {
      // Arrange
      const args = ['Test Document']; // Missing prompt and document type

      // Act
      await service.generateDocument(args);

      // Assert
      expect(mockWritingUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('processQuery', () => {
    it('should successfully process a query', async () => {
      // Arrange
      const args = ['¿Qué dice el Código Civil sobre la responsabilidad parental?'];
      mockProcessLegalQueryUseCase.execute.mockResolvedValue({
        success: true,
        response: {
          id: 'response-123',
          queryId: 'query-123',
          answer: 'La responsabilidad parental se regula en el Código Civil...',
          sources: [],
          confidence: 0.9,
          reasoning: 'Basado en el análisis del Código Civil...',
          createdAt: new Date(),
        },
        message: 'Query processed successfully',
      });

      // Act
      await service.processQuery(args);

      // Assert
      expect(mockProcessLegalQueryUseCase.execute).toHaveBeenCalledWith({
        question: '¿Qué dice el Código Civil sobre la responsabilidad parental?',
        queryType: 'LEGAL_QUESTION',
      });
    });

    it('should handle query errors', async () => {
      // Arrange
      const args = ['Test question'];
      mockProcessLegalQueryUseCase.execute.mockResolvedValue({
        success: false,
        response: null,
        message: 'Failed to process query',
      });

      // Act
      await service.processQuery(args);

      // Assert
      expect(mockProcessLegalQueryUseCase.execute).toHaveBeenCalledWith({
        question: 'Test question',
        queryType: 'LEGAL_QUESTION',
      });
    });

    it('should handle empty arguments', async () => {
      // Arrange
      const args: string[] = [];

      // Act
      await service.processQuery(args);

      // Assert
      expect(mockProcessLegalQueryUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('getSystemInfo', () => {
    it('should return system information', async () => {
      // Act
      const result = await service.getSystemInfo();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('features');
    });

    it('should include all required features', async () => {
      // Act
      const result = await service.getSystemInfo();

      // Assert
      expect(result.features).toContain('Document Indexing');
      expect(result.features).toContain('Legal Querying');
      expect(result.features).toContain('Document Generation');
      expect(result.features).toContain('Semantic Search');
    });
  });

  describe('error handling', () => {
    it('should handle use case exceptions', async () => {
      // Arrange
      const args = ['test.pdf', 'CIVIL_CODE'];
      mockIndexUseCase.execute.mockRejectedValue(new Error('Unexpected error'));

      // Act & Assert
      await expect(service.indexDocument(args)).resolves.not.toThrow();
    });
  });
}); 