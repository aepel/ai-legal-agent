import { Test, TestingModule } from '@nestjs/testing';
import { GenerateLegalDocumentUseCase, GenerateLegalDocumentRequest, GenerateLegalDocumentResponse } from '../legal-writing.use-case';
import { ILegalWritingRepository } from '@/domain/repositories/legal-writing.repository.interface';
import { ILegalWritingService } from '@/domain/services/legal-writing.service.interface';
import { LEGAL_WRITING_REPOSITORY } from '@/domain/repositories/legal-writing.repository.interface';
import { LEGAL_WRITING_SERVICE } from '@/domain/services/legal-writing.service.interface';
import { WritingDocumentType } from '@/domain/entities/legal-writing.entity';

describe('GenerateLegalDocumentUseCase', () => {
  let useCase: GenerateLegalDocumentUseCase;
  let mockWritingRepository: jest.Mocked<ILegalWritingRepository>;
  let mockWritingService: jest.Mocked<ILegalWritingService>;

  const validRequest: GenerateLegalDocumentRequest = {
    title: 'Demanda por Alimentos',
    prompt: 'Redactar una demanda por alimentos para un menor',
    documentType: WritingDocumentType.COMPLAINT,
    context: 'Padre no cumple con obligación alimentaria',
    userId: 'user-123',
  };

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
      findAll: jest.fn(),
      saveResponse: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockService = {
      generateDocument: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateLegalDocumentUseCase,
        {
          provide: LEGAL_WRITING_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: LEGAL_WRITING_SERVICE,
          useValue: mockService,
        },
      ],
    }).compile();

    useCase = module.get<GenerateLegalDocumentUseCase>(GenerateLegalDocumentUseCase);
    mockWritingRepository = module.get(LEGAL_WRITING_REPOSITORY);
    mockWritingService = module.get(LEGAL_WRITING_SERVICE);
  });

  describe('execute', () => {
    it('should successfully generate a legal document', async () => {
      // Arrange
      const mockWritingResponse = {
        id: 'response-123',
        writingId: 'writing-123',
        content: 'DEMANDA POR ALIMENTOS\n\nVISTO: El presente escrito...',
        title: 'Demanda por Alimentos',
        sections: [],
        sources: [],
        confidence: 0.9,
        createdAt: new Date(),
      };

      mockWritingService.generateDocument.mockResolvedValue(mockWritingResponse);
      mockWritingRepository.save.mockResolvedValue({} as any);
      mockWritingRepository.saveResponse.mockResolvedValue(mockWritingResponse);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.response).toBe(mockWritingResponse);
      expect(result.message).toContain('generated successfully');
      expect(mockWritingService.generateDocument).toHaveBeenCalledWith({
        title: validRequest.title,
        prompt: validRequest.prompt,
        documentType: validRequest.documentType,
        context: validRequest.context,
        userId: validRequest.userId,
      });
    });

    it('should handle generation errors', async () => {
      // Arrange
      mockWritingService.generateDocument.mockRejectedValue(new Error('Service error'));

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.response).toBeNull();
      expect(result.message).toContain('Failed to generate legal document');
    });

    it('should work without optional parameters', async () => {
      // Arrange
      const requestWithoutOptional: GenerateLegalDocumentRequest = {
        title: 'Simple Document',
        prompt: 'Simple prompt',
        documentType: WritingDocumentType.OTHER,
      };

      const mockWritingResponse = {
        id: 'response-123',
        writingId: 'writing-123',
        content: 'Simple document content',
        title: 'Simple Document',
        sections: [],
        sources: [],
        confidence: 0.8,
        createdAt: new Date(),
      };

      mockWritingService.generateDocument.mockResolvedValue(mockWritingResponse);
      mockWritingRepository.save.mockResolvedValue({} as any);
      mockWritingRepository.saveResponse.mockResolvedValue(mockWritingResponse);

      // Act
      const result = await useCase.execute(requestWithoutOptional);

      // Assert
      expect(result.success).toBe(true);
      expect(result.response).toBe(mockWritingResponse);
      expect(mockWritingService.generateDocument).toHaveBeenCalledWith({
        title: requestWithoutOptional.title,
        prompt: requestWithoutOptional.prompt,
        documentType: requestWithoutOptional.documentType,
        context: undefined,
        userId: undefined,
      });
    });
  });

  describe('error handling', () => {
    it('should handle repository save errors', async () => {
      // Arrange
      const mockWritingResponse = {
        id: 'response-123',
        writingId: 'writing-123',
        content: 'Test content',
        title: 'Test Document',
        sections: [],
        sources: [],
        confidence: 0.9,
        createdAt: new Date(),
      };

      mockWritingService.generateDocument.mockResolvedValue(mockWritingResponse);
      mockWritingRepository.save.mockRejectedValue(new Error('Repository error'));

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to generate legal document');
    });

    it('should handle service errors', async () => {
      // Arrange
      mockWritingService.generateDocument.mockRejectedValue(new Error('Service unavailable'));

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.response).toBeNull();
      expect(result.message).toContain('Service unavailable');
    });
  });

  describe('validation', () => {
    it('should validate required fields', async () => {
      // Arrange
      const invalidRequest = {
        title: '',
        prompt: '',
        documentType: 'INVALID_TYPE',
      } as GenerateLegalDocumentRequest;

      mockWritingService.generateDocument.mockRejectedValue(new Error('Invalid request'));

      // Act
      const result = await useCase.execute(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid request');
    });

    it('should handle null or undefined requests', async () => {
      // Act & Assert - Use case returns error response instead of throwing
      const nullResult = await useCase.execute(null as any);
      expect(nullResult.success).toBe(false);
      expect(nullResult.message).toContain('Failed to generate legal document');

      const undefinedResult = await useCase.execute(undefined as any);
      expect(undefinedResult.success).toBe(false);
      expect(undefinedResult.message).toContain('Failed to generate legal document');
    });
  });

  describe('response format', () => {
    it('should return consistent response format', async () => {
      // Arrange
      const mockWritingResponse = {
        id: 'response-123',
        writingId: 'writing-123',
        content: 'Test content',
        title: 'Test Document',
        sections: [],
        sources: [],
        confidence: 0.9,
        createdAt: new Date(),
      };

      mockWritingService.generateDocument.mockResolvedValue(mockWritingResponse);
      mockWritingRepository.save.mockResolvedValue({} as any);
      mockWritingRepository.saveResponse.mockResolvedValue(mockWritingResponse);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
    });

    it('should validate confidence score', async () => {
      // Arrange
      const mockWritingResponse = {
        id: 'response-123',
        writingId: 'writing-123',
        content: 'Test content',
        title: 'Test Document',
        sections: [],
        sources: [],
        confidence: 0.9,
        createdAt: new Date(),
      };

      mockWritingService.generateDocument.mockResolvedValue(mockWritingResponse);
      mockWritingRepository.save.mockResolvedValue({} as any);
      mockWritingRepository.saveResponse.mockResolvedValue(mockWritingResponse);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.response.confidence).toBeGreaterThanOrEqual(0);
      expect(result.response.confidence).toBeLessThanOrEqual(1);
    });
  });
}); 