import { Injectable, signal } from '@angular/core';
import { GameStats } from '../../shared/models/game-stats.model';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private readonly profileSignal = signal<User | null>(null);
  private readonly statsSignal = signal<GameStats | null>(null);

  readonly profile = this.profileSignal.asReadonly();
  readonly stats = this.statsSignal.asReadonly();

  setProfile(user: User | null): void {
    this.profileSignal.set(user);
  }

  setStats(stats: GameStats | null): void {
    this.statsSignal.set(stats);
  }

  clear(): void {
    this.profileSignal.set(null);
    this.statsSignal.set(null);
  }
}
