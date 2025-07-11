import { Controller, Post, Get, Body, Param, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProcessLegalQueryUseCase, ProcessLegalQueryRequest, ProcessLegalQueryResponse } from '@/application/use-cases/legal-query.use-case';
import { LegalQueryResponse } from '@/domain/entities/legal-query.entity';
import { ILegalQueryRepository } from '@/domain/repositories/legal-query.repository.interface';
import { LEGAL_QUERY_REPOSITORY } from '@/domain/repositories/legal-query.repository.interface';

export class LegalQueryDto {
  question: string;
  context?: string;
  queryType?: string;
  userId?: string;
}

export class LegalQueryResponseDto {
  id: string;
  queryId: string;
  answer: string;
  sources: any[];
  confidence: number;
  reasoning: string;
  createdAt: Date;
}

@ApiTags('legal-queries')
@Controller('legal-queries')
export class LegalQueryController {
  constructor(
    private readonly processLegalQueryUseCase: ProcessLegalQueryUseCase,
    @Inject(LEGAL_QUERY_REPOSITORY)
    private readonly queryRepository: ILegalQueryRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Process a legal query' })
  @ApiResponse({ status: 201, description: 'Query processed successfully', type: LegalQueryResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async processQuery(@Body() request: LegalQueryDto): Promise<ProcessLegalQueryResponse> {
    try {
      const result = await this.processLegalQueryUseCase.execute({
        question: request.question,
        context: request.context,
        queryType: request.queryType,
        userId: request.userId,
      });

      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }

      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to process legal query: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all legal queries' })
  @ApiResponse({ status: 200, description: 'Queries retrieved successfully' })
  async getAllQueries(): Promise<any[]> {
    try {
      const queries = await this.queryRepository.findAll();
      return queries;
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve queries: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get query by ID' })
  @ApiResponse({ status: 200, description: 'Query retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Query not found' })
  async getQueryById(@Param('id') id: string): Promise<any> {
    try {
      const query = await this.queryRepository.findById(id);
      if (!query) {
        throw new HttpException('Query not found', HttpStatus.NOT_FOUND);
      }
      return query;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve query: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/response')
  @ApiOperation({ summary: 'Get query response by query ID' })
  @ApiResponse({ status: 200, description: 'Response retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Response not found' })
  async getQueryResponse(@Param('id') queryId: string): Promise<LegalQueryResponse[]> {
    try {
      const responses = await this.queryRepository.findResponsesByQueryId(queryId);
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
  @ApiOperation({ summary: 'Get queries by user ID' })
  @ApiResponse({ status: 200, description: 'User queries retrieved successfully' })
  async getQueriesByUserId(@Param('userId') userId: string): Promise<any[]> {
    try {
      const queries = await this.queryRepository.findAll();
      return queries.filter(q => q.userId === userId);
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve user queries: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 