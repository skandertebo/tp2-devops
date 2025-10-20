/**
 * Tracing - OpenTelemetry integration
 * Provides distributed tracing capabilities
 */

import { trace } from "@opentelemetry/api";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";

let provider;
let tracer;

export function initializeTracing() {
  // Create a provider with the span processor configured in the ctor
  provider = new WebTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  });

  // Register the provider
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // Get a tracer
  tracer = trace.getTracer("todo-app", "1.0.0");

  console.info("[TRACING] OpenTelemetry tracing initialized");
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
