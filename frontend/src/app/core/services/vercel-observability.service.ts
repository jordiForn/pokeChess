import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { inject as injectAnalytics, track } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { onCLS, onINP, onLCP } from 'web-vitals';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ObservabilityEventPayload } from '../../shared/models/observability.model';

@Injectable({ providedIn: 'root' })
export class VercelObservabilityService {
  private static initialized = false;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

  private readonly pendingEvents: ObservabilityEventPayload[] = [];
  private flushTimeout: number | null = null;

  initialize(): void {
    if (VercelObservabilityService.initialized || !environment.production) {
      return;
    }

    VercelObservabilityService.initialized = true;
    injectAnalytics({ mode: 'auto' });
    injectSpeedInsights();
    this.trackSpaNavigation();
    this.trackWebVitals();
  }

  trackEvent(name: string, properties?: Record<string, string | number | boolean>): void {
    if (!environment.production || !VercelObservabilityService.initialized) {
      return;
    }

    track(name, properties);
    this.queueEvent({
      category: 'event',
      name,
      properties,
    });
  }

  private trackSpaNavigation(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const path = event.urlAfterRedirects;
        track('page_view', { path });
        this.queueEvent({
          category: 'page_view',
          name: 'page_view',
          path,
        });
      });
  }

  private trackWebVitals(): void {
    onLCP((metric) => this.recordWebVital('LCP', metric.value));
    onINP((metric) => this.recordWebVital('INP', metric.value));
    onCLS((metric) => this.recordWebVital('CLS', metric.value));
  }

  private recordWebVital(name: 'LCP' | 'INP' | 'CLS', value: number): void {
    this.queueEvent({
      category: 'web_vital',
      name,
      value,
    });
  }

  private queueEvent(event: ObservabilityEventPayload): void {
    this.pendingEvents.push(event);

    if (this.flushTimeout !== null) {
      return;
    }

    this.flushTimeout = window.setTimeout(() => {
      this.flushEvents();
    }, 1200);
  }

  private flushEvents(): void {
    if (this.pendingEvents.length === 0) {
      this.flushTimeout = null;
      return;
    }

    const events = this.pendingEvents.splice(0, 25);

    this.http
      .post(`${environment.apiUrl}/v1/observability/events`, { events })
      .subscribe({ error: () => undefined });

    this.flushTimeout = this.pendingEvents.length > 0 ? window.setTimeout(() => this.flushEvents(), 300) : null;
  }
}
