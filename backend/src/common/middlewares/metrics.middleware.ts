import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl: route } = req;

    // Increment in-progress requests
    this.metricsService.incrementHttpRequestsInProgress(method, route);

    // Listen for response finish
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      const statusCode = res.statusCode.toString();

      // Decrement in-progress requests
      this.metricsService.decrementHttpRequestsInProgress(method, route);

      // Record metrics
      this.metricsService.incrementHttpRequests(method, route, statusCode);
      this.metricsService.observeHttpRequestDuration(method, route, statusCode, duration);
    });

    next();
  }
}
