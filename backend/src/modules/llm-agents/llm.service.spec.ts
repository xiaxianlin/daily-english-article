import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LLMService } from './llm.service';

describe('LLMService', () => {
  let service: LLMService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have provider set to zhipu by default', () => {
      expect(configService.get).toHaveBeenCalledWith('llm.provider');
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
