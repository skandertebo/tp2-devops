/**
 * OpenTelemetry Configuration
 * Sends traces, metrics, and logs to OpenTelemetry Collector
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const OTEL_COLLECTOR_URL = process.env.OTEL_COLLECTOR_URL || 'http://localhost:4318';

// Configure resource with service information
const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: 'tp2devops-backend',
  [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
  'service.namespace': 'tp2devops',
  'deployment.environment': process.env.NODE_ENV || 'development',
});

// Configure trace exporter
const traceExporter = new OTLPTraceExporter({
  url: `${OTEL_COLLECTOR_URL}/v1/traces`,
  headers: {},
});

// Configure metrics exporter
const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: `${OTEL_COLLECTOR_URL}/v1/metrics`,
    headers: {},
  }),
  exportIntervalMillis: 10000, // Export every 10 seconds
});

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: resource,
  traceExporter: traceExporter,
  metricReader: metricReader,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable fs instrumentation (too noisy)
      },
    }),
  ],
});

export async function initializeTracing() {
  try {
    await sdk.start();
    console.log('✅ OpenTelemetry initialized successfully');
    console.log(`📊 Sending telemetry to: ${OTEL_COLLECTOR_URL}`);
  } catch (error) {
    console.error('❌ Error initializing OpenTelemetry:', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    .catch((error) => console.log('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});

export { sdk };

