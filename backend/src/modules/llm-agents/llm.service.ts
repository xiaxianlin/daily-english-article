import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMChatParams {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly provider: string;
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKeys: {
    zhipu?: string;
    qwen?: string;
    openai?: string;
  };
  private readonly models: {
    zhipu?: string;
    qwen?: string;
    openai?: string;
  };

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get<string>('llm.provider') || 'zhipu';

    // Get API keys
    this.apiKeys = {
      zhipu: this.configService.get<string>('llm.zhipu.apiKey'),
      qwen: this.configService.get<string>('llm.qwen.apiKey'),
      openai: this.configService.get<string>('llm.openai.apiKey'),
    };

    // Get models
    this.models = {
      zhipu: this.configService.get<string>('llm.zhipu.model') || 'glm-4',
      qwen: this.configService.get<string>('llm.qwen.model') || 'qwen-max',
      openai: this.configService.get<string>('llm.openai.model') || 'gpt-4',
    };

    this.axiosInstance = axios.create({
      timeout: 60000, // 60 seconds timeout for LLM calls
    });
  }

  async chat(params: LLMChatParams, provider?: string): Promise<LLMResponse> {
    const selectedProvider = provider || this.provider;

    try {
      switch (selectedProvider) {
        case 'zhipu':
          return await this.chatWithZhipu(params);
        case 'qwen':
          return await this.chatWithQwen(params);
        case 'openai':
          return await this.chatWithOpenAI(params);
        default:
          throw new Error(`Unsupported LLM provider: ${selectedProvider}`);
      }
    } catch (error) {
      this.logger.error(`LLM API call failed: ${error.message}`);
      throw error;
    }
  }

  private async chatWithZhipu(params: LLMChatParams): Promise<LLMResponse> {
    const apiKey = this.apiKeys.zhipu;
    if (!apiKey) {
      throw new Error('Zhipu API key is not configured');
    }

    const model = this.models.zhipu;

    // Zhipu GLM-4 API endpoint
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const response = await this.axiosInstance.post(
      url,
      {
        model,
        messages: params.messages,
        temperature: params.temperature ?? 0.3,
        max_tokens: params.maxTokens ?? 2000,
        stream: params.stream ?? false,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const choice = response.data.choices[0];
    return {
      content: choice.message.content,
      usage: {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0,
      },
      model: response.data.model,
    };
  }

  private async chatWithQwen(params: LLMChatParams): Promise<LLMResponse> {
    const apiKey = this.apiKeys.qwen;
    if (!apiKey) {
      throw new Error('Qwen API key is not configured');
    }

    const model = this.models.qwen;

    // Qwen DashScope API endpoint
    const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

    const response = await this.axiosInstance.post(
      url,
      {
        model,
        input: {
          messages: params.messages,
        },
        parameters: {
          temperature: params.temperature ?? 0.3,
          max_tokens: params.maxTokens ?? 2000,
          result_format: 'message',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const choice = response.data.output.choices[0];
    return {
      content: choice.message.content,
      usage: {
        promptTokens: response.data.usage?.input_tokens || 0,
        completionTokens: response.data.usage?.output_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0,
      },
      model: response.data.model,
    };
  }

  private async chatWithOpenAI(params: LLMChatParams): Promise<LLMResponse> {
    const apiKey = this.apiKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const model = this.models.openai;

    const url = 'https://api.openai.com/v1/chat/completions';

    const response = await this.axiosInstance.post(
      url,
      {
        model,
        messages: params.messages,
        temperature: params.temperature ?? 0.3,
        max_tokens: params.maxTokens ?? 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const choice = response.data.choices[0];
    return {
      content: choice.message.content,
      usage: {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0,
      },
      model: response.data.model,
    };
  }

  async chatWithRetry(
    params: LLMChatParams,
    maxRetries: number = 3,
  ): Promise<LLMResponse> {
    let lastError: Error = new Error('Max retries exceeded');

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.chat(params);
      } catch (error) {
        lastError = error;
        this.logger.warn(`LLM call failed (attempt ${i + 1}/${maxRetries}): ${error.message}`);

        // Wait before retry (exponential backoff)
        if (i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
