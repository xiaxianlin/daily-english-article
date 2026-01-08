import { Injectable, Logger } from '@nestjs/common';
import { LLMService, LLMMessage } from '../llm.service';
import { LANGUAGE_REASONING_EXTRACT_TEMPLATE, LANGUAGE_REASONING_CONTEXTUALIZE_TEMPLATE } from '../prompt-templates/language-reasoning.template';
import { KeyParagraph } from './argument-mapper.agent';

export interface LanguageBreakdown {
  expression: string;
  explanation: string;
  transferable: boolean;
  category: 'claim' | 'evidence' | 'causality' | 'contrast' | 'uncertainty' | 'transition';
  examples?: string[];
}

export interface ExplainedExpression {
  expression: string;
  simpleExplanation: string;
  whenToUse: string;
  commonMistakes: string[];
  collocation: string[];
}

@Injectable()
export class LanguageReasoningAgent {
  private readonly logger = new Logger(LanguageReasoningAgent.name);

  constructor(private llmService: LLMService) {}

  async extractLanguageBreakdown(
    article: string,
    keyParagraphs: KeyParagraph[],
  ): Promise<LanguageBreakdown[]> {
    try {
      const prompt = LANGUAGE_REASONING_EXTRACT_TEMPLATE
        .replace('{{keyParagraphs}}', JSON.stringify(keyParagraphs, null, 2))
        .replace('{{article}}', article);

      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: 'You are an expert in teaching professional English for reasoning and argumentation.',
        },
        { role: 'user', content: prompt },
      ];

      const response = await this.llmService.chatWithRetry({
        messages,
        temperature: 0.3,
        maxTokens: 1500,
      });

      const result = this.parseJSONResponse(response.content);
      this.logger.log(`Extracted ${result.languageBreakdown?.length || 0} language breakdowns`);

      return result.languageBreakdown || [];
    } catch (error) {
      this.logger.error(`Failed to extract language breakdown: ${error.message}`);
      throw error;
    }
  }

  async explainExpressions(expressions: LanguageBreakdown[]): Promise<ExplainedExpression[]> {
    try {
      const expressionsText = expressions.map(e => `- ${e.expression}: ${e.explanation}`).join('\n');

      const prompt = LANGUAGE_REASONING_CONTEXTUALIZE_TEMPLATE.replace(
        '{{expressions}}',
        expressionsText,
      );

      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: 'You are helping English learners understand professional reasoning language.',
        },
        { role: 'user', content: prompt },
      ];

      const response = await this.llmService.chatWithRetry({
        messages,
        temperature: 0.3,
        maxTokens: 1500,
      });

      const result = this.parseJSONResponse(response.content);
      this.logger.log('Expressions explained successfully');

      return result.explainedExpressions || [];
    } catch (error) {
      this.logger.error(`Failed to explain expressions: ${error.message}`);
      throw error;
    }
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
