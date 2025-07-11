import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

@Injectable()
export class AIService {
  private provider: 'google' | 'openai';
  private gemini: GoogleGenerativeAI | null = null;
  private geminiModel: any;
  private openai: OpenAI | null = null;
  private openaiModel: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('AI_PROVIDER', 'google') as 'google' | 'openai';

    if (this.provider === 'google') {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      this.gemini = new GoogleGenerativeAI(apiKey);
      this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    } else if (this.provider === 'openai') {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      this.openai = new OpenAI({ apiKey });
      this.openaiModel = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o');
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (this.provider === 'google' && this.geminiModel) {
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } else if (this.provider === 'openai' && this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: this.openaiModel,
        messages: [{ role: 'user', content: prompt }],
      });
      return completion.choices[0].message.content;
    }
    throw new Error('No AI provider configured');
  }
} 