import { Injectable, Logger } from '@nestjs/common';
import { LLMService, LLMMessage } from '../llm.service';
import { ARGUMENT_MAPPER_EXTRACT_TEMPLATE, ARGUMENT_MAPPER_KEY_PARAGRAPHS_TEMPLATE } from '../prompt-templates/argument-mapper.template';

export interface ReadingMap {
  coreQuestion: string;
  mainConclusion: string;
  argumentStructure: string[];
}

export interface KeyParagraph {
  paragraphIndex: number;
  text: string;
  role: 'definition' | 'argument' | 'refutation';
  keySentences: string[];
  reasoning?: string;
}

@Injectable()
export class ArgumentMapperAgent {
  private readonly logger = new Logger(ArgumentMapperAgent.name);

  constructor(private llmService: LLMService) {}

  async extractReadingMap(article: string): Promise<ReadingMap> {
    try {
      const prompt = this.replacePlaceholder(ARGUMENT_MAPPER_EXTRACT_TEMPLATE, 'article', article);

      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are an expert in analyzing argument structure.' },
        { role: 'user', content: prompt },
      ];

      const response = await this.llmService.chatWithRetry({
        messages,
        temperature: 0.3,
        maxTokens: 1000,
      });

      const result = this.parseJSONResponse(response.content);
      this.logger.log('Reading map extracted successfully');

      return result;
    } catch (error) {
      this.logger.error(`Failed to extract reading map: ${error.message}`);
      throw error;
    }
  }

  async identifyKeyParagraphs(article: string, readingMap: ReadingMap): Promise<KeyParagraph[]> {
    try {
      const prompt = ARGUMENT_MAPPER_KEY_PARAGRAPHS_TEMPLATE
        .replace('{{article}}', article)
        .replace('{{readingMap}}', JSON.stringify(readingMap));

      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are an expert at identifying critical content.' },
        { role: 'user', content: prompt },
      ];

      const response = await this.llmService.chatWithRetry({
        messages,
        temperature: 0.3,
        maxTokens: 2000,
      });

      const result = this.parseJSONResponse(response.content);
      this.logger.log(`Identified ${result.keyParagraphs?.length || 0} key paragraphs`);

      return result.keyParagraphs || [];
    } catch (error) {
      this.logger.error(`Failed to identify key paragraphs: ${error.message}`);
      throw error;
    }
  }

  async generateFullArticleAnalysis(article: string): Promise<{
    readingMap: ReadingMap;
    keyParagraphs: KeyParagraph[];
  }> {
    // Extract reading map first
    const readingMap = await this.extractReadingMap(article);

    // Then identify key paragraphs using the reading map
    const keyParagraphs = await this.identifyKeyParagraphs(article, readingMap);

    return {
      readingMap,
      keyParagraphs,
    };
  }

  private replacePlaceholder(template: string, key: string, value: string): string {
    return template.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  private parseJSONResponse(content: string): any {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                      content.match(/```\n([\s\S]*?)\n```/) ||
                      content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const jsonString = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonString);
  }
}
