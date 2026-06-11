import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GameStats } from '../../shared/models/game-stats.model';
import { GameResult } from '../../shared/models/game-result.model';
import { UserStateService } from './user-state.service';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly userState = inject(UserStateService);

  private readonly apiUrl = `${environment.apiUrl}/v1`;

  loadStats(): Observable<GameStats> {
    return this.http.get<{ stats: GameStats }>(`${this.apiUrl}/stats`).pipe(
      map(({ stats }) => stats),
      tap((stats) => this.userState.setStats(stats)),
    );
  }

  recordResult(result: GameResult): Observable<GameStats> {
    return this.http.post<{ stats: GameStats }>(`${this.apiUrl}/stats/record`, { result }).pipe(
      map(({ stats }) => stats),
      tap((stats) => this.userState.setStats(stats)),
    );
  }
}
