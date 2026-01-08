import { Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { DomainCuratorAgent } from './agents/domain-curator.agent';
import { ArgumentMapperAgent } from './agents/argument-mapper.agent';
import { LanguageReasoningAgent } from './agents/language-reasoning.agent';
import { ProfessionalFeedbackAgent } from './agents/professional-feedback.agent';

@Module({
  providers: [
    LLMService,
    DomainCuratorAgent,
    ArgumentMapperAgent,
    LanguageReasoningAgent,
    ProfessionalFeedbackAgent,
  ],
  exports: [
    LLMService,
    DomainCuratorAgent,
    ArgumentMapperAgent,
    LanguageReasoningAgent,
    ProfessionalFeedbackAgent,
  ],
})
export class LLMAgentsModule {}
