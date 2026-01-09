import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LLMService } from './llm.service';

describe('LLMService', () => {
  let service: LLMService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'llm.provider': 'zhipu',
        'llm.zhipu.apiKey': 'test-zhipu-key',
        'llm.zhipu.model': 'glm-4',
        'llm.qwen.apiKey': 'test-qwen-key',
        'llm.qwen.model': 'qwen-max',
        'llm.openai.apiKey': 'test-openai-key',
        'llm.openai.model': 'gpt-4',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LLMService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LLMService>(LLMService);
    configService = module.get<ConfigService>(ConfigService);

    jest.spyOn(service as any, 'callZhipuAPI').mockResolvedValue({
      content: 'Test response from Zhipu',
      usage: { totalTokens: 100 },
    });

    jest.spyOn(service as any, 'callQwenAPI').mockResolvedValue({
      content: 'Test response from Qwen',
      usage: { totalTokens: 100 },
    });

    jest.spyOn(service as any, 'callOpenAIAPI').mockResolvedValue({
      content: 'Test response from OpenAI',
      usage: { totalTokens: 100 },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('should call Zhipu API when provider is zhipu', async () => {
      const params = {
        messages: [{ role: 'user' as const, content: 'Hello' }],
        temperature: 0.7,
      };

      const result = await service.chat(params);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('usage');
    });

    it('should handle retry logic on failure', async () => {
      const params = {
        messages: [{ role: 'user' as const, content: 'Hello' }],
        temperature: 0.7,
      };

      jest.spyOn(service as any, 'callZhipuAPI')
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          content: 'Test response',
          usage: { totalTokens: 100 },
        });

      const result = await service.chatWithRetry(params, 3);

      expect(result).toHaveProperty('content', 'Test response');
    });

    it('should throw error after max retries', async () => {
      const params = {
        messages: [{ role: 'user' as const, content: 'Hello' }],
        temperature: 0.7,
      };

      jest.spyOn(service as any, 'callZhipuAPI').mockRejectedValue(new Error('API Error'));

      await expect(service.chatWithRetry(params, 3)).rejects.toThrow('API Error');
    });
  });

  describe('parseJSONResponse', () => {
    it('should parse valid JSON from response', () => {
      const response = '```json\n{"key": "value"}\n```';

      const result = (service as any).parseJSONResponse(response);

      expect(result).toEqual({ key: 'value' });
    });

    it('should handle response without markdown blocks', () => {
      const response = '{"key": "value"}';

      const result = (service as any).parseJSONResponse(response);

      expect(result).toEqual({ key: 'value' });
    });

    it('should throw error for invalid JSON', () => {
      const response = 'Not a JSON response';

      expect(() => (service as any).parseJSONResponse(response)).toThrow();
    });
  });
});
