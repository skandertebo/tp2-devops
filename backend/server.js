/**
 * Todo API Server with Full Observability
 * - Traces: OpenTelemetry → Tempo
 * - Metrics: Prometheus
 * - Logs: Pino → Promtail → Loki
 */

import './tracing.js'; // Must be first!
import { initializeTracing } from './tracing.js';
import express from 'express';
import cors from 'cors';
import logger from './logger.js';
import { metrics, metricsMiddleware, register } from './metrics.js';
import { trace, context } from '@opentelemetry/api';

// Initialize OpenTelemetry
await initializeTracing();

const app = express();
const PORT = process.env.PORT || 3000;

// Get tracer
const tracer = trace.getTracer('tp2devops-backend', '1.0.0');

// Middleware
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  const traceId = trace.getSpan(context.active())?.spanContext().traceId || 'no-trace';
  logger.info({
    msg: 'Incoming request',
    method: req.method,
    url: req.url,
    traceId: traceId,
  });
  next();
});

// In-memory todo storage (for demo)
let todos = [
  { id: 1, text: 'Example Todo', completed: false, createdAt: new Date().toISOString() },
];

// Update metrics on startup
function updateTodoMetrics() {
  const active = todos.filter((t) => !t.completed).length;
  const completed = todos.filter((t) => t.completed).length;
  metrics.activeTodos.set(active);
  metrics.completedTodos.set(completed);
}

updateTodoMetrics();

// Routes

// Health check
app.get('/health', (req, res) => {
  const span = tracer.startSpan('health_check');
  logger.info('Health check called');
  span.end();
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Get all todos
app.get('/api/todos', (req, res) => {
  const span = tracer.startSpan('get_todos', {
    attributes: {
      'http.method': 'GET',
      'http.route': '/api/todos',
    },
  });

  logger.info({ msg: 'Fetching all todos', count: todos.length });
  metrics.todoOperations.inc({ operation: 'list' });

  span.setAttribute('todos.count', todos.length);
  span.end();

  res.json(todos);
});

// Create todo
app.post('/api/todos', (req, res) => {
  const span = tracer.startSpan('create_todo', {
    attributes: {
      'http.method': 'POST',
      'http.route': '/api/todos',
    },
  });

  const { text } = req.body;

  if (!text || text.trim() === '') {
    logger.warn({ msg: 'Attempted to create empty todo' });
    span.setAttribute('error', true);
    span.setAttribute('error.message', 'Todo text is required');
    span.end();
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  updateTodoMetrics();
  metrics.todoOperations.inc({ operation: 'create' });

  logger.info({
    msg: 'Todo created',
    todoId: newTodo.id,
    text: newTodo.text,
  });

  span.setAttribute('todo.id', newTodo.id);
  span.setAttribute('todo.text', text);
  span.end();

  res.status(201).json(newTodo);
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
  const span = tracer.startSpan('update_todo', {
    attributes: {
      'http.method': 'PUT',
      'http.route': '/api/todos/:id',
    },
  });

  const id = parseInt(req.params.id);
  const { text, completed } = req.body;

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    logger.warn({ msg: 'Todo not found', todoId: id });
    span.setAttribute('error', true);
    span.setAttribute('error.message', 'Todo not found');
    span.end();
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (text !== undefined) todo.text = text;
  if (completed !== undefined) todo.completed = completed;

  updateTodoMetrics();
  metrics.todoOperations.inc({ operation: 'update' });

  logger.info({
    msg: 'Todo updated',
    todoId: id,
    completed: todo.completed,
  });

  span.setAttribute('todo.id', id);
  span.setAttribute('todo.completed', todo.completed);
  span.end();

  res.json(todo);
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const span = tracer.startSpan('delete_todo', {
    attributes: {
      'http.method': 'DELETE',
      'http.route': '/api/todos/:id',
    },
  });

  const id = parseInt(req.params.id);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    logger.warn({ msg: 'Todo not found for deletion', todoId: id });
    span.setAttribute('error', true);
    span.setAttribute('error.message', 'Todo not found');
    span.end();
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(index, 1);
  updateTodoMetrics();
  metrics.todoOperations.inc({ operation: 'delete' });

  logger.info({ msg: 'Todo deleted', todoId: id });

  span.setAttribute('todo.id', id);
  span.end();

  res.status(204).send();
});

// Error handling
app.use((err, req, res, next) => {
  const span = trace.getSpan(context.active());
  if (span) {
    span.recordException(err);
    span.setAttribute('error', true);
  }

  logger.error({
    msg: 'Unhandled error',
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info({
    msg: 'Server started',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`💚 Health check at http://localhost:${PORT}/health\n`);
});

