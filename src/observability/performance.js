/**
 * Performance monitoring using Web Vitals
 */

import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

export function initPerformanceMonitoring() {
  // Cumulative Layout Shift
  onCLS((metric) => {
    console.info('[WEB VITAL] CLS:', metric);
  });

  // Interaction to Next Paint (replaces FID in v4)
  onINP((metric) => {
    console.info('[WEB VITAL] INP:', metric);
  });

  // Largest Contentful Paint
  onLCP((metric) => {
    console.info('[WEB VITAL] LCP:', metric);
  });

  // First Contentful Paint
  onFCP((metric) => {
    console.info('[WEB VITAL] FCP:', metric);
  });

  // Time to First Byte
  onTTFB((metric) => {
    console.info('[WEB VITAL] TTFB:', metric);
  });
}

