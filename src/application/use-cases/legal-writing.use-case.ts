import { Injectable, Inject } from '@nestjs/common';
import { LegalWritingRequest, LegalWritingResponse } from '@/domain/entities/legal-writing.entity';
import { ILegalWritingRepository } from '@/domain/repositories/legal-writing.repository.interface';
import { ILegalWritingService } from '@/domain/services/legal-writing.service.interface';
import { v4 as uuidv4 } from 'uuid';
import { LEGAL_WRITING_REPOSITORY } from '@/domain/repositories/legal-writing.repository.interface';
import { LEGAL_WRITING_SERVICE } from '@/domain/services/legal-writing.service.interface';

export interface GenerateLegalDocumentRequest {
  title: string;
  prompt: string;
  documentType: string;
  context?: string;
  userId?: string;
}

export interface GenerateLegalDocumentResponse {
  response: LegalWritingResponse;
  success: boolean;
  message: string;
}

@Injectable()
export class GenerateLegalDocumentUseCase {
  constructor(
    @Inject(LEGAL_WRITING_REPOSITORY)
    private readonly writingRepository: ILegalWritingRepository,
    @Inject(LEGAL_WRITING_SERVICE)
    private readonly writingService: ILegalWritingService,
  ) {}

  async execute(request: GenerateLegalDocumentRequest): Promise<GenerateLegalDocumentResponse> {
    try {
      // Create writing request
      const writingRequest: LegalWritingRequest = {
        title: request.title,
        prompt: request.prompt,
        documentType: request.documentType as any,
        context: request.context,
        userId: request.userId,
      };

      // Generate document using domain service
      const writingResponse = await this.writingService.generateDocument(writingRequest);

      // Create LegalWriting entity
      const legalWriting = {
        id: uuidv4(),
        title: request.title,
        prompt: request.prompt,
        documentType: writingRequest.documentType,
        context: request.context,
        userId: request.userId,
        createdAt: new Date(),
      };

      // Save writing request and response to repository
      await this.writingRepository.save(legalWriting);
      await this.writingRepository.saveResponse(writingResponse);

      return {
        response: writingResponse,
        success: true,
        message: 'Legal document generated successfully',
      };
    } catch (error) {
      return {
        response: null,
        success: false,
        message: `Failed to generate legal document: ${error.message}`,
      };
    }
  }
} 