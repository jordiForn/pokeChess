import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminObservabilityService } from '../../../../core/services/admin-observability.service';
import { ObservabilitySummary } from '../../../../shared/models/observability.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-observability-panel',
  imports: [DecimalPipe, IconComponent],
  templateUrl: './admin-observability-panel.component.html',
  styleUrl: './admin-observability-panel.component.scss',
})
export class AdminObservabilityPanelComponent implements OnInit {
  private readonly observabilityService = inject(AdminObservabilityService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly summary = signal<ObservabilitySummary | null>(null);

  ngOnInit(): void {
    this.observabilityService.getSummary(7).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las métricas de observabilidad.');
        this.loading.set(false);
      },
    });
  }

  protected formatVital(name: 'LCP' | 'INP' | 'CLS', summary: ObservabilitySummary): string {
    const metric = summary.web_vitals[name];
    if (!metric) {
      return 'Sin datos';
    }

    if (name === 'CLS') {
      return metric.p75.toFixed(3);
    }

    return `${Math.round(metric.p75)} ms`;
  }

  protected vitalSamples(name: 'LCP' | 'INP' | 'CLS', summary: ObservabilitySummary): number {
    return summary.web_vitals[name]?.samples ?? 0;
  }
}
