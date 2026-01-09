import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleDestroy {
  private registry: Registry;

  // HTTP Request Metrics
  private httpRequestsTotal: Counter<string>;
  private httpRequestDuration: Histogram<string>;
  private httpRequestInProgress: Gauge<string>;

  // Business Logic Metrics
  private articlesServedTotal: Counter<string>;
  private readingSessionsCreated: Counter<string>;
  private readingSessionsCompleted: Counter<string>;
  private userOutputsSubmitted: Counter<string>;
  private aiFeedbacksGenerated: Counter<string>;
  private memoryItemsCreated: Counter<string>;
  private llmApiCalls: Counter<string>;
  private llmApiErrors: Counter<string>;

  // User Metrics
  private activeUsers: Gauge<string>;
  private userRegistrations: Counter<string>;

  // Database Metrics
  private databaseQueryDuration: Histogram<string>;
  private databaseConnections: Gauge<string>;

  constructor() {
    this.registry = new Registry();

    this.initializeHttpMetrics();
    this.initializeBusinessMetrics();
    this.initializeUserMetrics();
    this.initializeDatabaseMetrics();
  }

  private initializeHttpMetrics() {
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestInProgress = new Gauge({
      name: 'http_requests_in_progress',
      help: 'Number of HTTP requests in progress',
      labelNames: ['method', 'route'],
      registers: [this.registry],
    });
  }

  private initializeBusinessMetrics() {
    this.articlesServedTotal = new Counter({
      name: 'articles_served_total',
      help: 'Total number of articles served to users',
      labelNames: ['domain', 'difficulty'],
      registers: [this.registry],
    });

    this.readingSessionsCreated = new Counter({
      name: 'reading_sessions_created_total',
      help: 'Total number of reading sessions created',
      registers: [this.registry],
    });

    this.readingSessionsCompleted = new Counter({
      name: 'reading_sessions_completed_total',
      help: 'Total number of reading sessions completed',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.userOutputsSubmitted = new Counter({
      name: 'user_outputs_submitted_total',
      help: 'Total number of user outputs submitted',
      registers: [this.registry],
    });

    this.aiFeedbacksGenerated = new Counter({
      name: 'ai_feedbacks_generated_total',
      help: 'Total number of AI feedbacks generated',
      registers: [this.registry],
    });

    this.memoryItemsCreated = new Counter({
      name: 'memory_items_created_total',
      help: 'Total number of memory items created',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.llmApiCalls = new Counter({
      name: 'llm_api_calls_total',
      help: 'Total number of LLM API calls',
      labelNames: ['provider', 'agent_type'],
      registers: [this.registry],
    });

    this.llmApiErrors = new Counter({
      name: 'llm_api_errors_total',
      help: 'Total number of LLM API errors',
      labelNames: ['provider', 'agent_type', 'error_type'],
      registers: [this.registry],
    });
  }

  private initializeUserMetrics() {
    this.activeUsers = new Gauge({
      name: 'active_users_total',
      help: 'Number of currently active users',
      registers: [this.registry],
    });

    this.userRegistrations = new Counter({
      name: 'user_registrations_total',
      help: 'Total number of user registrations',
      registers: [this.registry],
    });
  }

  private initializeDatabaseMetrics() {
    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'collection'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
      registers: [this.registry],
    });

    this.databaseConnections = new Gauge({
      name: 'database_connections_total',
      help: 'Number of active database connections',
      registers: [this.registry],
    });
  }

  // HTTP Metrics Methods
  incrementHttpRequests(method: string, route: string, statusCode: string) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
  }

  observeHttpRequestDuration(method: string, route: string, statusCode: string, duration: number) {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  }

  incrementHttpRequestsInProgress(method: string, route: string) {
    this.httpRequestInProgress.inc({ method, route });
  }

  decrementHttpRequestsInProgress(method: string, route: string) {
    this.httpRequestInProgress.dec({ method, route });
  }

  // Business Metrics Methods
  incrementArticlesServed(domain: string, difficulty: string) {
    this.articlesServedTotal.inc({ domain, difficulty });
  }

  incrementReadingSessionsCreated() {
    this.readingSessionsCreated.inc();
  }

  incrementReadingSessionsCompleted(status: string) {
    this.readingSessionsCompleted.inc({ status });
  }

  incrementUserOutputsSubmitted() {
    this.userOutputsSubmitted.inc();
  }

  incrementAiFeedbacksGenerated() {
    this.aiFeedbacksGenerated.inc();
  }

  incrementMemoryItemsCreated(type: string) {
    this.memoryItemsCreated.inc({ type });
  }

  incrementLlmApiCalls(provider: string, agentType: string) {
    this.llmApiCalls.inc({ provider, agent_type: agentType });
  }

  incrementLlmApiErrors(provider: string, agentType: string, errorType: string) {
    this.llmApiErrors.inc({ provider, agent_type: agentType, error_type: errorType });
  }

  // User Metrics Methods
  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  incrementUserRegistrations() {
    this.userRegistrations.inc();
  }

  // Database Metrics Methods
  observeDatabaseQueryDuration(operation: string, collection: string, duration: number) {
    this.databaseQueryDuration.observe({ operation, collection }, duration);
  }

  setDatabaseConnections(count: number) {
    this.databaseConnections.set(count);
  }

  // Get Registry
  getRegistry(): Registry {
    return this.registry;
  }

  // Get Metrics as String
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Get ContentType for Prometheus
  getContentType(): string {
    return this.registry.contentType;
  }

  onModuleDestroy() {
    this.registry.clear();
  }
}
