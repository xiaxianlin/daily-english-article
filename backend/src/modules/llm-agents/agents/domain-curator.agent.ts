import { Injectable, Logger } from '@nestjs/common';
import { LLMService, LLMMessage } from '../llm.service';
import { DOMAIN_CURATOR_ANALYZE_TEMPLATE, DOMAIN_CURATOR_VALIDATE_TEMPLATE } from '../prompt-templates/domain-curator.template';

export interface DomainAnalysisResult {
  domain: string;
  difficulty: string;
  wordCount: number;
  coreTopics: string[];
  recommendedDeepDiveRatio: number;
  keyReasoning: boolean;
}

export interface ContentValidationResult {
  isApproved: boolean;
  reasons: string[];
  suggestions?: string;
  recommendedDifficulty: string;
}

@Injectable()
export class DomainCuratorAgent {
  private readonly logger = new Logger(DomainCuratorAgent.name);

  constructor(private llmService: LLMService) {}

  async analyzeArticle(article: string): Promise<DomainAnalysisResult> {
    try {
      const prompt = this.replacePlaceholder(DOMAIN_CURATOR_ANALYZE_TEMPLATE, 'article', article);

      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are a domain curator expert for professional English content.' },
        { role: 'user', content: prompt },
      ];

      const response = await this.llmService.chatWithRetry({
        messages,
        temperature: 0.2, // Lower temperature for consistent analysis
        maxTokens: 1000,
      });

      // Parse JSON response
      const result = this.parseJSONResponse(response.content);
      this.logger.log(`Article analyzed: domain=${result.domain}, difficulty=${result.difficulty}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to analyze article: ${error.message}`);
      throw error;
    }
  }

  async validateContent(article: string): Promise<ContentValidationResult> {
    try {
      const prompt = this.replacePlaceholder(DOMAIN_CURATOR_VALIDATE_TEMPLATE, 'article', article);

      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are a content quality expert.' },
        { role: 'user', content: prompt },
      ];

      const response = await this.llmService.chatWithRetry({
        messages,
        temperature: 0.2,
        maxTokens: 800,
      });

      const result = this.parseJSONResponse(response.content);
      this.logger.log(`Content validation: approved=${result.isApproved}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to validate content: ${error.message}`);
      throw error;
    }
  }

  private replacePlaceholder(template: string, key: string, value: string): string {
    return template.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  private parseJSONResponse(content: string): any {
    // Extract JSON from markdown code blocks if present
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
