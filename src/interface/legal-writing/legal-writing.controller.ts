import { Controller, Post, Get, Body, Param, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GenerateLegalDocumentUseCase, GenerateLegalDocumentRequest, GenerateLegalDocumentResponse } from '@/application/use-cases/legal-writing.use-case';
import { LegalWritingResponse } from '@/domain/entities/legal-writing.entity';
import { ILegalWritingRepository } from '@/domain/repositories/legal-writing.repository.interface';
import { ILegalWritingService } from '@/domain/services/legal-writing.service.interface';
import { LEGAL_WRITING_REPOSITORY } from '@/domain/repositories/legal-writing.repository.interface';
import { LEGAL_WRITING_SERVICE } from '@/domain/services/legal-writing.service.interface';

export class GenerateDocumentDto {
  title: string;
  prompt: string;
  documentType: string;
  context?: string;
  userId?: string;
}

export class ValidateDocumentDto {
  content: string;
}

export class LegalWritingResponseDto {
  id: string;
  writingId: string;
  content: string;
  title: string;
  sections: any[];
  sources: any[];
  confidence: number;
  createdAt: Date;
}

@ApiTags('legal-writing')
@Controller('legal-writing')
export class LegalWritingController {
  constructor(
    private readonly generateLegalDocumentUseCase: GenerateLegalDocumentUseCase,
    @Inject(LEGAL_WRITING_REPOSITORY)
    private readonly writingRepository: ILegalWritingRepository,
    @Inject(LEGAL_WRITING_SERVICE)
    private readonly writingService: ILegalWritingService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a legal document' })
  @ApiResponse({ status: 201, description: 'Document generated successfully', type: LegalWritingResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async generateDocument(@Body() request: GenerateDocumentDto): Promise<GenerateLegalDocumentResponse> {
    try {
      const result = await this.generateLegalDocumentUseCase.execute({
        title: request.title,
        prompt: request.prompt,
        documentType: request.documentType,
        context: request.context,
        userId: request.userId,
      });

      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }

      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to generate legal document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a legal document' })
  @ApiResponse({ status: 200, description: 'Document validation completed' })
  async validateDocument(@Body() request: ValidateDocumentDto): Promise<any> {
    try {
      const validation = await this.writingService.validateLegalDocument(request.content);
      return validation;
    } catch (error) {
      throw new HttpException(
        `Failed to validate document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all legal writings' })
  @ApiResponse({ status: 200, description: 'Writings retrieved successfully' })
  async getAllWritings(): Promise<any[]> {
    try {
      const writings = await this.writingRepository.findAll();
      return writings;
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve writings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get writing by ID' })
  @ApiResponse({ status: 200, description: 'Writing retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Writing not found' })
  async getWritingById(@Param('id') id: string): Promise<any> {
    try {
      const writing = await this.writingRepository.findById(id);
      if (!writing) {
        throw new HttpException('Writing not found', HttpStatus.NOT_FOUND);
      }
      return writing;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve writing: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/response')
  @ApiOperation({ summary: 'Get writing response by writing ID' })
  @ApiResponse({ status: 200, description: 'Response retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Response not found' })
  async getWritingResponse(@Param('id') writingId: string): Promise<LegalWritingResponse[]> {
    try {
      const responses = await this.writingRepository.findResponsesByWritingId(writingId);
      if (!responses || responses.length === 0) {
        throw new HttpException('Response not found', HttpStatus.NOT_FOUND);
      }
      return responses;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve response: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get writings by user ID' })
  @ApiResponse({ status: 200, description: 'User writings retrieved successfully' })
  async getWritingsByUserId(@Param('userId') userId: string): Promise<any[]> {
    try {
      const writings = await this.writingRepository.findAll();
      return writings.filter(w => w.userId === userId);
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve user writings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 