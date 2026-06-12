import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { inject as injectAnalytics, track } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VercelObservabilityService {
  private static initialized = false;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  initialize(): void {
    if (VercelObservabilityService.initialized || !environment.production) {
      return;
    }

    VercelObservabilityService.initialized = true;
    injectAnalytics({ mode: 'auto' });
    injectSpeedInsights();
    this.trackSpaNavigation();
  }

  trackEvent(name: string, properties?: Record<string, string | number | boolean>): void {
    if (!environment.production || !VercelObservabilityService.initialized) {
      return;
    }

    track(name, properties);
  }

  private trackSpaNavigation(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        track('page_view', { path: event.urlAfterRedirects });
      });
  }
}
