import { Injectable, Logger } from '@nestjs/common';
import { LLMService, LLMMessage } from '../llm.service';
import {
  PROFESSIONAL_FEEDBACK_EVALUATE_TEMPLATE,
  PROFESSIONAL_FEEDBACK_GENERATE_QUESTIONS_TEMPLATE,
} from '../prompt-templates/professional-feedback.template';
import { ReadingMap } from './argument-mapper.agent';

export interface FeedbackScores {
  logicScore: number;
  toneScore: number;
  clarityScore: number;
}

export interface ProfessionalFeedback {
  feedback: {
    logicScore: number;
    toneScore: number;
    clarityScore: number;
    strengths: string[];
    logicFeedback: string;
    toneFeedback: string;
    suggestions: {
      original: string;
      improvement: string;
      reason: string;
    }[];
    overallAssessment: string;
  };
}

export interface UnderstandingQuestion {
  question: string;
  purpose: string;
  sampleAnswer: string;
}

@Injectable()
export class ProfessionalFeedbackAgent {
  private readonly logger = new Logger(ProfessionalFeedbackAgent.name);

  constructor(private llmService: LLMService) {}

  async evaluateOutput(
    article: string,
    readingMap: ReadingMap,
    prompt: string,
    userOutput: string,
  ): Promise<ProfessionalFeedback> {
    try {
      const promptText = PROFESSIONAL_FEEDBACK_EVALUATE_TEMPLATE
        .replace('{{article}}', article)
        .replace('{{readingMap}}', JSON.stringify(readingMap))
        .replace('{{prompt}}', prompt)
        .replace('{{userOutput}}', userOutput);

      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: 'You are an expert in professional communication providing constructive feedback.',
        },
        { role: 'user', content: promptText },
      ];

      const response = await this.llmService.chatWithRetry({
        messages,
        temperature: 0.4, // Slightly higher for more varied feedback
        maxTokens: 1500,
      });

      const result = this.parseJSONResponse(response.content);
      this.logger.log(
        `User output evaluated: logic=${result.feedback?.logicScore}, tone=${result.feedback?.toneScore}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to evaluate output: ${error.message}`);
      throw error;
    }
  }

  async generateUnderstandingQuestions(
    article: string,
    readingMap: ReadingMap,
  ): Promise<UnderstandingQuestion[]> {
    try {
      const prompt = PROFESSIONAL_FEEDBACK_GENERATE_QUESTIONS_TEMPLATE
        .replace('{{article}}', article)
        .replace('{{readingMap}}', JSON.stringify(readingMap));

      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: 'You are an expert in creating comprehension questions for professional articles.',
        },
        { role: 'user', content: prompt },
      ];

      const response = await this.llmService.chatWithRetry({
        messages,
        temperature: 0.4,
        maxTokens: 1000,
      });

      const result = this.parseJSONResponse(response.content);
      this.logger.log(`Generated ${result.questions?.length || 0} understanding questions`);

      return result.questions || [];
    } catch (error) {
      this.logger.error(`Failed to generate questions: ${error.message}`);
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
