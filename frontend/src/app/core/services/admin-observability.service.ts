import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ObservabilitySummary } from '../../shared/models/observability.model';

@Injectable({ providedIn: 'root' })
export class AdminObservabilityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/admin/observability`;

  getSummary(days = 7): Observable<ObservabilitySummary> {
    return this.http.get<ObservabilitySummary>(`${this.apiUrl}/summary`, {
      params: { days },
    });
  }
}
