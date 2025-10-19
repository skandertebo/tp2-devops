/**
 * Metrics - Custom metrics collection
 * Tracks counters, gauges, and histograms
 */

class MetricsCollector {
  constructor() {
    this.counters = {};
    this.gauges = {};
    this.histograms = {};
  }

  incrementCounter(name, value = 1, labels = {}) {
    const key = this.generateKey(name, labels);
    if (!this.counters[key]) {
      this.counters[key] = { name, labels, value: 0 };
    }
    this.counters[key].value += value;
    console.info(`[METRIC] Counter ${name} incremented to ${this.counters[key].value}`, labels);
  }

  setGauge(name, value, labels = {}) {
    const key = this.generateKey(name, labels);
    this.gauges[key] = { name, labels, value };
    console.info(`[METRIC] Gauge ${name} set to ${value}`, labels);
  }

  recordHistogram(name, value, labels = {}) {
    const key = this.generateKey(name, labels);
    if (!this.histograms[key]) {
      this.histograms[key] = { name, labels, values: [] };
    }
    this.histograms[key].values.push(value);
    console.info(`[METRIC] Histogram ${name} recorded ${value}`, labels);
  }

  generateKey(name, labels) {
    return `${name}_${JSON.stringify(labels)}`;
  }

  getMetrics() {
    return {
      counters: this.counters,
      gauges: this.gauges,
      histograms: this.histograms
    };
  }

  exportMetrics() {
    const metrics = this.getMetrics();
    console.info('[METRICS EXPORT]', JSON.stringify(metrics, null, 2));
    return metrics;
  }
}

export const metrics = new MetricsCollector();

