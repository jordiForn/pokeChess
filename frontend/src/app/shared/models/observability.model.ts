export interface ObservabilityEventPayload {
  category: 'page_view' | 'event' | 'web_vital';
  name: string;
  path?: string;
  value?: number;
  properties?: Record<string, string | number | boolean>;
}

export interface WebVitalSummary {
  p75: number;
  samples: number;
}

export interface ObservabilitySummary {
  period_days: number;
  page_views: number;
  top_paths: Array<{ path: string; count: number }>;
  custom_events: Array<{ name: string; count: number }>;
  web_vitals: {
    LCP: WebVitalSummary | null;
    INP: WebVitalSummary | null;
    CLS: WebVitalSummary | null;
  };
  vercel_dashboard: {
    analytics_url: string | null;
    speed_insights_url: string | null;
  };
}
