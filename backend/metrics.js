/**
 * Prometheus Metrics
 * Exposed on /metrics endpoint for Prometheus scraping
 */

import promClient from 'prom-client';

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'tp2devops_backend_',
});

// Custom business metrics
export const metrics = {
  // HTTP request counter
  httpRequestsTotal: new promClient.Counter({
    name: 'tp2devops_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  }),

  // HTTP request duration histogram
  httpRequestDuration: new promClient.Histogram({
    name: 'tp2devops_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register],
  }),

  // Todo operations counter
  todoOperations: new promClient.Counter({
    name: 'tp2devops_todo_operations_total',
    help: 'Total number of todo operations',
    labelNames: ['operation'], // create, update, delete, list
    registers: [register],
  }),

  // Active todos gauge
  activeTodos: new promClient.Gauge({
    name: 'tp2devops_todos_active',
    help: 'Number of active todos',
    registers: [register],
  }),

  // Completed todos gauge
  completedTodos: new promClient.Gauge({
    name: 'tp2devops_todos_completed',
    help: 'Number of completed todos',
    registers: [register],
  }),
};

// Middleware to track HTTP metrics
export function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route?.path || req.path || 'unknown';

    metrics.httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode,
    });

    metrics.httpRequestDuration.observe(
      {
        method: req.method,
        route: route,
        status_code: res.statusCode,
      },
      duration
    );
  });

  next();
}

export { register };

