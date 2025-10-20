/**
 * Tracing - OpenTelemetry integration
 * Provides distributed tracing capabilities
 */

import { trace } from "@opentelemetry/api";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";

let provider;
let tracer;

export function initializeTracing() {
  const otlpEndpoint =
    import.meta?.env?.VITE_OTLP_HTTP_URL || "http://localhost:4318/v1/traces";

  // Create exporter for OTLP/HTTP
  const exporter = new OTLPTraceExporter({ url: otlpEndpoint });

  // In OTel JS v2, prefer passing spanProcessors in the ctor
  provider = new WebTracerProvider({
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  // Register the provider
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // Get a tracer
  tracer = trace.getTracer("todo-app", "1.0.0");

  console.info("[TRACING] OpenTelemetry tracing initialized (OTLP HTTP)");
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
