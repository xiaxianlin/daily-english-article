export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-english-article',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  llm: {
    provider: process.env.LLM_PROVIDER || 'zhipu',
    apiKey: process.env.LLM_API_KEY || '',

    zhipu: {
      apiKey: process.env.ZHIPU_API_KEY || '',
      model: process.env.ZHIPU_MODEL || 'glm-4',
    },

    qwen: {
      apiKey: process.env.QWEN_API_KEY || '',
      model: process.env.QWEN_MODEL || 'qwen-max',
    },

    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
    },
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  },
});
