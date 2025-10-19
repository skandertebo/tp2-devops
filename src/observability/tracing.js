/**
 * Tracing - OpenTelemetry integration
 * Provides distributed tracing capabilities
 */

import { trace } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';

let provider;
let tracer;

export function initializeTracing() {
  // Create a provider
  provider = new WebTracerProvider();

  // Add a span processor with console exporter (in production, use OTLP exporter)
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

  // Register the provider
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // Get a tracer
  tracer = trace.getTracer('todo-app', '1.0.0');
  
  console.info('[TRACING] OpenTelemetry tracing initialized');
}

export function getTracer() {
  if (!tracer) {
    initializeTracing();
  }
  return tracer;
}

export function createSpan(name, attributes = {}, fn) {
  const tracer = getTracer();
  const span = tracer.startSpan(name, { attributes });
  
  try {
    const result = fn(span);
    span.end();
    return result;
  } catch (error) {
    span.recordException(error);
    span.end();
    throw error;
  }
}

export async function createAsyncSpan(name, attributes = {}, fn) {
  const tracer = getTracer();
  const span = tracer.startSpan(name, { attributes });
  
  try {
    const result = await fn(span);
    span.end();
    return result;
  } catch (error) {
    span.recordException(error);
    span.end();
    throw error;
  }
}

